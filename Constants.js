import { Capacitor } from '@capacitor/core';
import { isMobile } from 'react-device-detect';

export const IS_LOCAL = ['localhost', '127.0.0.1'].includes(
  window.location.hostname,
);
export const IS_STAGING = window.location.origin.includes('characterai.dev');

export const LOCAL_SERVER_URL = window.location.origin;
export const STAGING_SERVER_URL = window.location.origin;
//export const PROD_SERVER_URL = window.location.origin;
export const PROD_SERVER_URL = 'https://beta.character.ai';

export const CDN_URL = 'https://characterai.io';

// see go/resizing for more details about how this URL works
export const CDN_THUMBNAIL_URL = 'https://characterai.io/i/80';
export const CDN_POST_IMAGE_URL = 'https://characterai.io/i/400';
export const CDN_SLIDER_URL = `https://characterai.io/i/${
  isMobile ? 200 : 400
}`;

export const AUTH0_CAPACITOR_CALLBACK_URI = `ai.character.character://character-ai.us.auth0.com/capacitor/ai.character.character/callback`;

export const AUTH0_CLIENT_ID = IS_LOCAL
  ? '0eZlffrhH6WqEqyfHEJLzWmPijbU9G31'
  : IS_STAGING
  ? 'eQQ4uqAszIZhIBLciqdnF1l3bOoUhnes'
  : 'dyD3gE281MqgISG7FuIXYhL2WEknqZzv';

export const NATIVE = Capacitor.isNativePlatform();
export const PLATFORM = Capacitor.getPlatform();

export const NOTCH = NATIVE && PLATFORM === 'ios' ? '-notch' : '';

// username for default Character.
export const DEFAULT_CHARACTER = 'Gabriel';

// username for default Character.
export const DEFAULT_CHARACTER_ID =
  'J2j78y3-xOHy3l3NhB_NpzAr6I4BvEoVSfoqCojRg44';

// axios timeout for server requests
// TODO: decrease timeout back to 30s once TTS is no longer blocking the completion of
// the axios call.
export const DEFAULT_TIMEOUT = 50000;

// field size limits

export const MAX_BASE_PROMPT_LEN = 100;
export const MIN_NAME_LEN = 3;
export const MAX_NAME_LEN = 20;
export const MIN_TITLE_LEN = 3;
export const MAX_TITLE_LEN = 50;
export const MIN_GREETING_LEN = 3;
export const MAX_GREETING_LEN = 500;
export const MAX_DESCRIPTION_LEN = 500;
export const MAX_DEFINTION_LEN = 3200;

export const MIN_USERNAME_LEN = 3;
export const MAX_USERNAME_LEN = 20;

export const MAX_SWIPES = 30;
export const MAX_SWIPES_ANONYMOUS = 4;

export const CHARACTERS_PER_PAGE = isMobile ? 30 : 80;
export const SEARCH_RESULTS_PER_PAGE = isMobile ? 20 : 40;
export const CATEGORIES_PER_PAGE = Math.floor(
  window.innerHeight / (isMobile ? 200 : 400),
);

export const CHARACTER_SLIDE_WIDTH = isMobile ? 100 : 200;

export const MESSAGES_BEFORE_PAUSING = 5;
export const INITIAL_ROOM_STREAM_DELAY_MS = 2000;

export const VISITED_KEY = 'visited';

export const ENABLE_MIC = true;
export const CHARACTER_TOKEN_KEY = 'char_token';

// From https://stackoverflow.com/a/49328524
export const IS_SAFARI =
  /constructor/i.test(window.HTMLElement) ||
  (function (p) {
    return p.toString() === '[object SafariRemoteNotification]';
  })(
    !window['safari'] ||
      (typeof safari !== 'undefined' && safari.pushNotification),
  );

export const CHARACTER_BOOK_LINK = 'https://book.character.ai';
export const CHARACTER_BOOK_IMAGE_GENERATION_STYLE_LINK =
  'https://book.character.ai/character-book/image-generating-characters/image-styles';
