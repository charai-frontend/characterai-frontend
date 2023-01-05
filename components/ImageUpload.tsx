import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';

import API from '../api/Api';
import { imageUrlFromFilename } from '../utils.js';
import EmbeddedImage from './EmbeddedImage';

type ImageUploadParams = {
  isOpen: boolean;
  setIsOpen: (openState: boolean) => void;
  setImagePathFn: (path: string) => void;
  setImageDescriptionFn: (path: string) => void;
  setImageDescriptionTypeFn: (path: string) => void;
};

const ImageUpload = ({
  isOpen,
  setIsOpen,
  setImagePathFn,
  setImageDescriptionFn,
  setImageDescriptionTypeFn,
}: ImageUploadParams) => {
  const [innerImagePath, setInnerImagePath] = useState('');
  const [innerImageDescription, setInnerImageDescription] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePathsErrored, setImagePathsErrored] = useState<string[]>([]);
  const [imagePathsLoaded, setImagePathsLoaded] = useState<string[]>([]);

  const finish = () => {
    if (imagePathsLoaded.includes(innerImagePath)) {
      setImagePathFn(innerImagePath);
      setImageDescriptionFn(innerImageDescription);
      if (innerImageDescription) {
        setImageDescriptionTypeFn('HUMAN');
      } else {
        setImageDescriptionTypeFn('AUTO_IMAGE_CAPTIONING');
      }
    }
    // Fields will be cleared next time the modal is opened.
    setInnerImagePath('');
    setInnerImageDescription('');
    setIsOpen(false);
  };

  const uploadImageFlow = async (imageData: File | Blob) => {
    setIsUploadingImage(true);
    try {
      const imageRelPath = await API.uploadImage(imageData);
      setInnerImagePath(imageUrlFromFilename(imageRelPath));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const updateImageDescription = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInnerImageDescription(event.target.value);
  };

  const handleImageFile = (event: React.SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      uploadImageFlow(target.files[0]);
      return;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => setIsOpen(false)}
      centered={true}
      size={'md'}
    >
      <ModalHeader toggle={() => setIsOpen(false)}>
        🖼️ Upload an image
      </ModalHeader>
      <ModalBody>
        <Input
          type="file"
          name="img"
          onChange={handleImageFile}
          // style={{ display: 'inline', width: isMobile ? '100%' : '500px' }}
          style={{ display: 'inline' }}
          color="primary"
        />

        {innerImagePath && (
          <div>
            <div
              className="d-flex justify-content-center"
              style={{ 'padding-top': '15px' } as React.CSSProperties}
            >
              {!isUploadingImage && (
                <EmbeddedImage
                  imagePath={innerImagePath}
                  key={innerImagePath}
                  errorImagePaths={imagePathsErrored}
                  setErrorImagePaths={setImagePathsErrored}
                  loadedImagePaths={imagePathsLoaded}
                  setLoadedImagePaths={setImagePathsLoaded}
                />
              )}
            </div>
            <span></span>
            <div
              className="d-flex justify-content-center"
              style={{ 'padding-top': '15px' } as React.CSSProperties}
            >
              <textarea
                id="imageDescription"
                name="imageDescription"
                value={innerImageDescription}
                className="form-control"
                autoComplete="off"
                onChange={updateImageDescription}
                disabled={isUploadingImage}
                placeholder="Optionally describe the image. If you don't provide a description, the Character will try to automatically understand the image."
                rows={4}
              />
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <div className="d-flex justify-content-center">
          <div className="px-1">
            <Button
              color="primary"
              onClick={finish}
              disabled={!imagePathsLoaded.includes(innerImagePath)}
            >
              {isUploadingImage ? (
                <Spinner style={{ width: 20, height: 20 }} />
              ) : (
                'Attach image'
              )}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ImageUpload;
