import React from 'react';
import { Link } from 'react-router-dom';

import { Character, User } from '../types';
import { buildUrlParams } from '../utils';

type Props = {
  user?: User;
  character: Character;
  style?: { [key: string]: string | number };
};

const ProfileLink = ({ user, character, style }: Props) => {
  return (
    <Link
      className="p-0 m-0"
      style={{
        color: 'inherit',
        textDecoration: 'none',
        ...style,
      }}
      role="button"
      to={
        character.user__username === user?.user.username
          ? {
              pathname: `/profile/${buildUrlParams({
                char: character.external_id,
              })}`,
            }
          : {
              pathname: `/public-profile/${buildUrlParams({
                username: character.user__username,
              })}`,
            }
      }
    >
      @{character.user__username}
    </Link>
  );
};

export default ProfileLink;
