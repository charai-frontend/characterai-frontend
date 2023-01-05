import React, { useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import { IoChatbubblesOutline } from 'react-icons/io5';

// import tinyColor from 'tinycolor2';
import * as Constants from '../Constants';
import { Character } from '../types';
import { selectCharacterColor } from '../utils/character-utils';
import { shiftHexColor } from '../utils/color';
import ImageGeneratingIcon from './ImageGeneratingIcon';
import { displayNumInteractions} from '../utils/character-utils';

interface CharacterImageProps {
  character: Character;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

const CharacterImage = ({ character, numInteractions, ...props }: CharacterImageProps) => {
  const startColor = useMemo(
    () => selectCharacterColor(character.participant__name),
    [character],
  );
  const endColor = useMemo(() => shiftHexColor(startColor, 15), [character]);

  return (
    <div {...props}>
      <div
        style={{
          width: '100%',
          borderRadius: '4px 4px 0 0',
          aspectRatio: '1 / 1',
          backgroundSize: 'cover',
          backgroundImage: `${
            character.avatar_file_name
              ? `linear-gradient(rgba(255,255,255,0.00), 85%, rgba(0,0,0,0.7)), url(${Constants.CDN_SLIDER_URL}/static/avatars/${character.avatar_file_name})`
              : `linear-gradient(-45deg, ${endColor}, ${startColor})`
          } `,
          paddingBottom: 5,
          filter: `saturate(${character.avatar_file_name ? 1 : 0.75})`,
          fontSize: isMobile ? 48 : '4em',
        }}
        className="charater-avatar-image"
      >
        <div></div>
        <div style={{ marginBottom: -5 }}>
          {!character.avatar_file_name &&
            character.participant__name.slice(0, 1).toLocaleUpperCase()}
        </div>

        <div style={{ position: "absolute", alignSelf: "flex-end", paddingRight: "5px", paddingLeft: "7px", paddingBottom: "2px", fontSize:"12px", backgroundColor: "rgba(0, 0, 0, 0.5)", borderBottomLeftRadius: "10px 10px"}}>
          <IoChatbubblesOutline style={{ marginRight: 8 }} />
          {displayNumInteractions(numInteractions)}
        </div>

        <div
          className="character-image-name"
          style={{ alignSelf: 'flex-start', paddingLeft: 5 }}
        >
          <ImageGeneratingIcon
            imageGenEnabled={character.img_gen_enabled}
          />
          {character.participant__name}
        </div>
      </div>
    </div>
  );
};

export default CharacterImage;
