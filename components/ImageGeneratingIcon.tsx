import React, { useRef } from 'react';
import { UncontrolledTooltip } from 'reactstrap';

type Props = {
  imageGenEnabled: boolean | undefined;
  tooltipDescription?: string;
};

const ImageGeneratingIcon = ({
  imageGenEnabled,
  tooltipDescription = 'Image Generating Character',
}: Props) => {
  if (!imageGenEnabled) {
    return <></>;
  }

  const ref = useRef(null);

  return (
    <>
      <span ref={ref}>🎨&nbsp;</span>
      <UncontrolledTooltip placement="top" target={ref}>
        {tooltipDescription}
      </UncontrolledTooltip>
    </>
  );
};

export default ImageGeneratingIcon;
