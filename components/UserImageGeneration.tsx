import React from 'react';
import { useState } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';

import * as Constants from '../Constants';
import API from '../api/Api';
import EmbeddedImage from './EmbeddedImage';

enum TextMode {
  MESSAGE = 'message',
  AVATAR = 'avatar',
}

type UserImageGenerationProps = {
  isOpen: boolean;
  setIsOpen: (openState: boolean) => void;
  setImagePathFn: (path: string) => void;
  setImageDescriptionFn: (path: string) => void;
  setImageDescriptionTypeFn?: (path: string) => void;
  textMode: TextMode;
};

const UserImageGeneration = ({
  isOpen,
  setIsOpen,
  setImagePathFn,
  setImageDescriptionFn,
  setImageDescriptionTypeFn = undefined,
  textMode,
}: UserImageGenerationProps) => {
  const [innerImagePath, setInnerImagePath] = useState('');
  const [innerImageDescription, setInnerImageDescription] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePathsErrored, setImagePathsErrored] = useState<string[]>([]);
  const [imagePathsLoaded, setImagePathsLoaded] = useState<string[]>([]);

  const generateImage = async () => {
    setIsGeneratingImage(true);
    const response = await API.generateImage(innerImageDescription);
    setInnerImagePath(response?.data.image_rel_path);
    setIsGeneratingImage(false);
  };

  const finish = () => {
    if (imagePathsLoaded.includes(innerImagePath)) {
      setImagePathFn(innerImagePath);
      setImageDescriptionFn(innerImageDescription);
      if (setImageDescriptionTypeFn) {
        setImageDescriptionTypeFn('GENERATION_PROMPT');
      }
    }
    // Fields will be cleared next time the modal is opened.
    setInnerImagePath('');
    setInnerImageDescription('');
    setIsOpen(false);
  };

  const updateImageDescription = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInnerImageDescription(event.target.value);
  };

  const titleText = () => {
    if (textMode === TextMode.MESSAGE) {
      return 'message';
    } else if (textMode === TextMode.AVATAR) {
      return 'avatar';
    }
  };

  const attachButtonText = () => {
    if (textMode === TextMode.MESSAGE) {
      return 'Attach image';
    } else if (textMode === TextMode.AVATAR) {
      return 'Set avatar';
    }
  };

  const stillLoadingImage =
    innerImagePath !== '' &&
    !imagePathsLoaded.includes(innerImagePath) &&
    !imagePathsErrored.includes(innerImagePath);

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => setIsOpen(false)}
      centered={true}
      size={'md'}
    >
      <ModalHeader toggle={() => setIsOpen(false)}>
        🎨 Create an image for your {titleText()} {'  '}
        <a
          href={Constants.CHARACTER_BOOK_IMAGE_GENERATION_STYLE_LINK}
          target="_blank"
          rel="noreferrer"
        >
          <MdInfoOutline size={20} style={{ marginBottom: '4px' }} />
        </a>
      </ModalHeader>
      <ModalBody>
        <textarea
          id="imageDescription"
          name="imageDescription"
          value={innerImageDescription}
          className="form-control"
          autoComplete="off"
          maxLength={Constants.MAX_BASE_PROMPT_LEN}
          onChange={updateImageDescription}
          disabled={isGeneratingImage}
          placeholder="Clearly describe your desired image."
          rows={2}
        />

        {innerImagePath && (
          <div
            className="d-flex justify-content-center"
            style={{ 'padding-top': '15px' } as React.CSSProperties}
          >
            <EmbeddedImage
              imagePath={innerImagePath}
              key={innerImagePath}
              errorImagePaths={imagePathsErrored}
              setErrorImagePaths={setImagePathsErrored}
              loadedImagePaths={imagePathsLoaded}
              setLoadedImagePaths={setImagePathsLoaded}
            />
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <div className="d-flex justify-content-center">
          <div className="px-1">
            <Button
              color="primary"
              disabled={
                isGeneratingImage || !innerImageDescription || stillLoadingImage
              }
              onClick={generateImage}
            >
              {isGeneratingImage || stillLoadingImage ? (
                <Spinner style={{ width: 20, height: 20 }} />
              ) : (
                '🎨  Create'
              )}
            </Button>
          </div>
          <div className="px-1">
            <Button
              color="primary"
              onClick={finish}
              disabled={!imagePathsLoaded.includes(innerImagePath)}
            >
              {attachButtonText()}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

const UserImageGeneration_ = {
  UserImageGeneration,
  TextMode,
};
export default UserImageGeneration_;
