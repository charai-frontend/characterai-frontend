import numeral from 'numeral';

import { Character, TrendingScores } from '../types';

// Function to sort characters by number of received msgs from users.
export const compareCharacters = (
  char1: Character,
  char2: Character,
): number => {
  return ('' + char1.participant__name).localeCompare(char2.participant__name);
};

export const compareCharactersByReceivedMessages = (
  char1: Character,
  char2: Character,
) => {
  return (
    (char2?.participant__num_interactions || 0) -
    (char1?.participant__num_interactions || 0)
  );
};

export const compareCharactersByPriority = (
  char1: Character,
  char2: Character,
) => {
  return (char2?.priority || 0) - (char1?.priority || 0);
};

export const compareCharactersByTrendingScore = (
  char1: Character,
  char2: Character,
  trendingScoresByCharId: TrendingScores,
) => {
  return (
    trendingScoresByCharId[char2.external_id] -
    trendingScoresByCharId[char1.external_id]
  );
};

export const selectCharacterColor = (text: string) => {
  const colors = [
    '#F44E3B',
    '#FE9200',
    '#FCDC00',
    '#DBDF00',
    '#A4DD00',
    '#68CCCA',
    '#73D8FF',
    '#AEA1FF',
    '#FDA1FF',
    '#D33115',
    '#E27300',
    '#FCC400',
    '#B0BC00',
    '#68BC00',
    '#16A5A5',
    '#009CE0',
    '#7B64FF',
    '#FA28FF',
    '#9F0500',
    '#C45100',
    '#FB9E00',
    '#808900',
    '#194D33',
    '#0C797D',
    '#0062B1',
    '#653294',
    '#AB149E',
  ];

  // if no text, default to A
  if (!text) {
    return colors[0];
  }

  const letter = text.toLowerCase().charCodeAt(0);
  if (letter < 97 || letter > 122) {
    return colors[0];
  }
  return colors[letter - 97];
};

export const displayNumInteractions = (numInteractions: number) =>
  numInteractions > 1000
    ? numeral(numInteractions).format('0.0 a')
    : numInteractions;

export const getCharMsg = (character?: Character | null) =>
  character
    ? character.title ||
      character.greeting ||
      `Chat with ${character.participant__name}`
    : '';
