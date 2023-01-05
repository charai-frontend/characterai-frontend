import React from 'react';
import { isMobile } from 'react-device-detect';
import { IoChatbubblesOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { Card, CardFooter } from 'reactstrap';

import CharacterImage from '../components/CharacterImage';
import ProfileLink from '../components/ProfileLink';
import { Character, User } from '../types';
import { buildUrlParams } from '../utils';
import { displayNumInteractions, getCharMsg } from '../utils/character-utils';

type CharacterSlideProps = {
  character: Character;
  selectCharacter: (character: Character) => void;
  numInteractions: number;
  user: User;
};

const CharacterSlide = ({
  character,
  selectCharacter,
  user,
  numInteractions,
}: CharacterSlideProps) => {
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (e: any) => {
    if (isMobile) {
      e.stopPropagation();
      selectCharacter(character);
    } else {
      // note: we must use /chat without a trailing slash
      navigate(`/chat${buildUrlParams({ char: character.external_id })}`);
    }
  };
  return (
    <Card
      style={{
        overflow: 'hidden',
        width: 'inherit',
        height: 'inherit',
        boxShadow: '1px 1px 2px 0 rgb(0 0 0 / 10%)',
        border: 0,
        maxWidth: '99%',
      }}
      className="character-slide-card"
    >
      <div className="character-slide-box">
        <div
          className="character-slide-info"
          onClick={handleClick}
          style={{
            padding: 8,
            overflow: 'auto',
            cursor: 'pointer',
            width: '100%',
            aspectRatio: '1 / 1',
            backgroundColor: 'white',
            zIndex: 100,
            opacity: 0.85,
          }}
        >
          {getCharMsg(character)}
        </div>

        <CharacterImage
          className="character-slide-image"
          character={character}
          numInteractions={numInteractions}
          style={{ cursor: 'pointer' }}
          onClick={handleClick}
        />
      </div>
      <CardFooter style={{ padding: 5, fontSize: 12 }}>
        <div className="username-truncated">
          <ProfileLink user={user} character={character} />
        </div>
        {!isMobile && (
          <div className="description-truncated">{getCharMsg(character)}</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default CharacterSlide;
