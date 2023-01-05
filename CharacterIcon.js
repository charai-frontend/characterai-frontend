import React, { useRef } from 'react';
import { UncontrolledTooltip } from 'reactstrap';

const CharacterIcon = ({
  msg,
  isCharacter,
  responsibleUser,
  badgeReason = '',
}) => {
  if (!msg) {
    return null;
  }

  const ref = useRef(null);

  var badgeString;
  if (isCharacter) {
    if (responsibleUser) {
      badgeString = `@${responsibleUser} created this Character and this greeting`;
    } else {
      badgeString = 'AI Character';
    }
  } else {
    if (badgeReason === 'image_described_by_human') {
      badgeString = `@${responsibleUser} explicitly described the image to the Character`;
    } else {
      return <></>;
    }
  }

  return (
    <>
      <div
        ref={ref}
        className=" rounded py-0 px-1"
        style={{
          marginLeft: 5,
          backgroundColor: responsibleUser ? 'rgb(141 141 141)' : '#3c85f6',
          color: 'white',
          fontWeight: '600',
          fontSize: 12,
        }}
      >
        <div className="d-flex flex-row">
          <div className="d-flex flex-column">
            {responsibleUser ? `@${responsibleUser}` : 'c.AI'}
          </div>
        </div>
      </div>
      <UncontrolledTooltip target={ref} placement="right">
        {badgeString}
      </UncontrolledTooltip>
    </>
  );
};

export default CharacterIcon;
