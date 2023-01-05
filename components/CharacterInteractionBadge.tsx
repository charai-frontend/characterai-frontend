import React, { useRef } from 'react';
import { IoChatbubblesOutline } from 'react-icons/io5';
import { Badge, UncontrolledTooltip } from 'reactstrap';

import { displayNumInteractions } from '../utils/character-utils';

type Props = {
  interactions: number;
};

const CharacterInteractionBadge = ({ interactions }: Props) => {
  const ref = useRef(null);
  return (
    <>
      <Badge color="secondary" innerRef={ref}>
        {displayNumInteractions(interactions)}
        <IoChatbubblesOutline style={{ marginLeft: 3 }} />
      </Badge>
      <UncontrolledTooltip target={ref} placement="top">
        # User Interactions
      </UncontrolledTooltip>
    </>
  );
};

export default CharacterInteractionBadge;
