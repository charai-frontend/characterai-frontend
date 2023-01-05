import React from 'react';
import Avatar from 'react-avatar';

import { selectCharacterColor } from './utils/character-utils';

const InitialAvatar = (props) => {
  const style = { fontWeight: '600' };

  for (let key in props.avatarStyle) {
    style[key] = props.avatarStyle[key];
  }

  return (
    <Avatar
      initials={props.name[0]}
      name={props.name}
      size={props.size || '55'}
      round={props.roundness || true}
      color={selectCharacterColor(props.name)}
      textSizeRatio={2}
      style={style}
      src={props.avatarFileName}
    />
  );
};

export default InitialAvatar;
