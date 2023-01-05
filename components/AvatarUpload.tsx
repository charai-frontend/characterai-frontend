import React from 'react';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Button, Input } from 'reactstrap';

import API from '../api/Api';
import { avatarUrlFromFilename } from '../utils.js';
import EmbeddedImage from './EmbeddedImage';
import UserImageGeneration from './UserImageGeneration';

type AvatarUploadProps = {
  updateAvatarRelPathFn: (avatarPath: string) => void;
  disabled?: boolean;
  defaultDisplayedImage?: string;
};

const AvatarUpload = ({
  updateAvatarRelPathFn,
  disabled = false,
  defaultDisplayedImage = '',
}: AvatarUploadProps) => {
  const [avatarUploadState, setAvatarUploadState] = useState('none');
  const [imageGenerationModalOpen, setImageGenerationModalOpen] =
    useState(false);
  const [userImagePath, setUserImagePath] = useState('');
  const [userImageDescription, setUserImageDescription] = useState('');
  const [displayedImage, setDisplayedImage] = useState(defaultDisplayedImage);

  const uploadGeneratedImage = () => {
    if (!userImagePath) {
      return;
    }
    const fetchData = async () => {
      uploadAvatarFlow(
        async () => await API.uploadGeneratedImageAsAvatar(userImagePath),
      );
      setUserImagePath('');
    };
    fetchData().catch();
  };
  useEffect(uploadGeneratedImage, [userImagePath]);

  const handleAvatarFile = (event: React.SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const avatarFile = target.files[0];
      uploadAvatarFlow(async () => await API.uploadAvatar(avatarFile));
      return;
    }
  };

  const uploadAvatarFlow = async (getAvatarRelPath: () => Promise<string>) => {
    setAvatarUploadState('waiting');
    const avatarRelPath = await getAvatarRelPath();
    updateAvatarRelPathFn(avatarRelPath);
    setDisplayedImage(avatarRelPath);
    setAvatarUploadState('finished');
  };

  const avatarTitleText = () => {
    if (avatarUploadState === 'none') {
      return (
        <div>
          <strong>Avatar</strong>
        </div>
      );
    } else if (avatarUploadState == 'waiting') {
      return (
        <div>
          <strong>Avatar</strong> uploading ...
        </div>
      );
    } else if (avatarUploadState == 'finished') {
      return (
        <div>
          <strong>Avatar</strong> success!
        </div>
      );
    } else {
      throw new Error('Unexpected avatarUploadState: ' + avatarUploadState);
    }
  };

  const showAvatarInput = () => {
    return (
      <div>
        {avatarTitleText()}
        <div className="text-muted" style={{ fontSize: 'small' }}>
          You can either create an image from text or upload an image.
        </div>
        <div
          className="avatar-box"
          style={isMobile ? { display: 'block' } : {}}
        >
          <Button
            onClick={() => {
              setImageGenerationModalOpen(true);
            }}
            color={'primary'}
            disabled={disabled}
          >
            🎨 {'  '}Create Image
          </Button>
          {isMobile && <br />}
          <span style={{ margin: '0 10px' }}>or</span>
          {isMobile && <br />}
          <Input
            type="file"
            name="img"
            disabled={disabled}
            onChange={handleAvatarFile}
            style={{ display: 'inline', width: isMobile ? '100%' : '500px' }}
            color="primary"
          />
        </div>
        <UserImageGeneration.UserImageGeneration
          isOpen={imageGenerationModalOpen}
          setIsOpen={setImageGenerationModalOpen}
          setImagePathFn={setUserImagePath}
          setImageDescriptionFn={setUserImageDescription}
          textMode={UserImageGeneration.TextMode.AVATAR}
        />
        <EmbeddedImage
          imagePath={avatarUrlFromFilename(displayedImage, 'post')}
          imageSize={0}
        />
      </div>
    );
  };

  return showAvatarInput();
};

export default AvatarUpload;
