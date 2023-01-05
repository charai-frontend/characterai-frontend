import React from 'react';
import { useState } from 'react';
import { isMobile } from 'react-device-detect';
import GracefulImage from 'react-graceful-image';

type EmbeddedImagePrompts = {
  imagePath: string;
  imageSize?: number;
  errorImagePaths?: string[];
  setErrorImagePaths?: (path: string[]) => void;
  loadedImagePaths?: string[];
  setLoadedImagePaths?: (path: string[]) => void;
  handleImageLoad?: () => void;
};

const EmbeddedImage = ({
  imagePath,
  imageSize = 250,
  errorImagePaths = undefined,
  setErrorImagePaths = undefined,
  loadedImagePaths = undefined,
  setLoadedImagePaths = undefined,
  handleImageLoad,
}: EmbeddedImagePrompts) => {
  // Track image paths that didn't work
  const [_errorImagePaths, _setErrorImagePaths] = useState<string[]>([]);

  const getErrorImagePaths = () => {
    if (errorImagePaths !== undefined) {
      return errorImagePaths;
    } else {
      return _errorImagePaths;
    }
  };

  const realSetErrorImagePaths = (paths: string[]) => {
    if (errorImagePaths !== undefined && setErrorImagePaths !== undefined) {
      setErrorImagePaths(paths);
    } else {
      _setErrorImagePaths(paths);
    }
  };

  if (!imagePath || getErrorImagePaths().includes(imagePath)) {
    return <></>;
  }

  const onImageError = () => {
    if (!getErrorImagePaths().includes(imagePath)) {
      const updatedPaths = [...getErrorImagePaths(), imagePath];
      realSetErrorImagePaths(updatedPaths);
    }
  };

  const onImageLoad = () => {
    if (
      loadedImagePaths !== undefined &&
      setLoadedImagePaths !== undefined &&
      !loadedImagePaths.includes(imagePath)
    ) {
      const updatedPaths = [...loadedImagePaths, imagePath];
      setLoadedImagePaths(updatedPaths);
      if (handleImageLoad) {
        handleImageLoad();
      }
    }
  };

  let style;
  if (imageSize) {
    const imageSizePx = `${imageSize}px`;
    style = {
      // height: imageSizePx,
      // width: imageSizePx,
      'max-height': imageSizePx,
      'max-width': isMobile ? '100%' : '400px', // TODO(prajit): Maybe don't hard-code this.
      width: 'auto',
    };
  } else {
    style = {};
  }
  return (
    <>
      <GracefulImage
        src={imagePath}
        style={style}
        retry={{ count: 12, delay: 2, accumulate: 'false' }}
        noLazyLoad={true}
        customPlaceholder={(ref: any) => (
          // NOTE(prajit): This is a hack to make the first image not be cut off.
          // It has the unfortunate minor consequence that makes the spinner move
          // from the center to the top left of the image.
          <div
            className="d-flex"
            style={
              {
                'margin-bottom': `${Math.max(imageSize - 30, 0)}px`,
              } as React.CSSProperties
            }
          >
            <div className="spinner-border text-secondary" role="status">
              <span className="sr-only"></span>
            </div>
          </div>
        )}
        onError={onImageError}
        onLoad={onImageLoad}
      />
    </>
  );
};

export default EmbeddedImage;
