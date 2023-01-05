import React from 'react';
import { IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { Button } from 'reactstrap';

// import CharacterImage from '../components/CharacterImage';
import CharacterInteractionBadge from '../components/CharacterInteractionBadge';
import ImageGeneratingIcon from '../components/ImageGeneratingIcon';
import { Character } from '../types';
import { buildUrlParams } from '../utils';
import { getCharMsg } from '../utils/character-utils';
import './DiscoverPage.css';

type Props = {
  character?: Character | null;
  selectCharacter: (character: Character | null) => void;
  numInteractions?: number | null;
};

const CharacterPeek = ({
  character,
  selectCharacter,
  numInteractions,
}: Props) => {
  const navigate = useNavigate();

  const startChat = () => {
    navigate(`/chat/${buildUrlParams({ char: character?.external_id })}`);
  };

  return (
    <div
      className={`d-flex flex-column character-peek ${
        character ? '' : 'close'
      }`}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div style={{ fontSize: 20, marginRight: 12, fontWeight: 'bold' }}>
            <ImageGeneratingIcon
              imageGenEnabled={character?.img_gen_enabled}
            />
            {character?.participant__name}
          </div>
          <CharacterInteractionBadge interactions={numInteractions || 0} />
        </div>

        <div>
          <IoClose onClick={() => selectCharacter(null)} size={30} />
        </div>
      </div>
      <div>
        <div style={{ fontStyle: 'italic' }}>@{character?.user__username}</div>
      </div>
      <div className="d-flex py-2 mt-2" style={{ flex: 1 }}>
        {/* <div className="d-flex flex-column">
          {character && (
            <CharacterImage
              character={character}
              style={{ width: 100, height: 100, marginRight: 12 }}
              onClick={startChat}
            />
          )}
        </div> */}

        <div className="description-long">{getCharMsg(character)}</div>
      </div>
      <div
        style={{
          alignSelf: 'flex-end',
          justifySelf: 'flex-end',
          marginRight: 8,
        }}
      >
        {character?.copyable && (
          <Button
            color="secondary"
            style={{ marginRight: 12 }}
            onClick={() => {
              navigate(
                `/editing/${buildUrlParams({ char: character?.external_id })}`,
              );
              // @ts-expect-error ScrollBehavior definition doesn't contain instant option
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          >
            More Info
          </Button>
        )}

        <Button color="primary" onClick={startChat}>
          Chat
        </Button>
      </div>
    </div>
  );
};

export default CharacterPeek;
