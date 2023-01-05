import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';

function getDebugUrlParams() {
  if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const paramsToRemove = [
      'char',
      'hist',
      'topic',
      'post',
      'share',
      'username',
    ];
    for (let param of paramsToRemove) {
      params.delete(param);
    }
    return params;
  }
  return null;
}

export function buildUrlParams(extraParams = {}) {
  let params = getDebugUrlParams();
  if (!params) {
    params = new URLSearchParams(window.location.search);
  }
  for (const [key, value] of Object.entries(extraParams)) {
    params.append(key, value);
  }
  return `?${params.toString()}`;
}

export function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export function getSpecialAccessCode() {
  return getUrlParam('sac');
}

export function getAuth0RedirectUri() {
  if (Constants.NATIVE) {
    return Constants.AUTH0_CAPACITOR_CALLBACK_URI;
  }

  const specialAccessCode = getSpecialAccessCode();
  if (specialAccessCode) {
    return window.location.origin + '?sac=' + specialAccessCode;
  } else {
    return window.location.origin;
  }
}

export function getServerUrl() {
  const server_url = getUrlParam('server_url');
  if (server_url) {
    return server_url;
  } else if (Constants.IS_LOCAL) {
    return Constants.LOCAL_SERVER_URL;
  } else if (Constants.IS_STAGING) {
    return Constants.STAGING_SERVER_URL;
  } else {
    return Constants.PROD_SERVER_URL;
  }
}

export function getShareUrlOrigin() {
  // Mostly the same as getServerUrl, except in prod.
  const server_url = getUrlParam('server_url');
  if (server_url) {
    return server_url;
  } else if (Constants.IS_LOCAL) {
    return Constants.LOCAL_SERVER_URL;
  } else if (Constants.IS_STAGING) {
    return Constants.STAGING_SERVER_URL;
  } else {
    return Constants.PROD_SERVER_URL;
  }
}

export function clearLinkPreviewImage(imagePath) {
  const currOgImage = document.querySelector("[property='og:image']");
  if (currOgImage) {
    currOgImage.remove();
  }
}

export function setLinkPreviewImage(imagePath) {
  clearLinkPreviewImage();
  const meta = document.createElement('meta');
  meta.setAttribute('property', 'og:image');
  meta.content = imagePath;
  document.getElementsByTagName('head')[0].appendChild(meta);
  //console.log("Added", meta);
}

const baseTitle = 'Character.AI';

export function resetPageTitle() {
  // TODO: call this from index.js to avoid the index.html title from going out of
  // sync with this.
  document.title = baseTitle;
}

export function setPageSubtitle(subtitle) {
  document.title = `${baseTitle} - ${subtitle}`;
}

export function setPageDescription(description) {
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', description);
  }
}

export function resetPageDescription() {
  // TODO: call this from index.js to avoid the index.html title from going out of
  // sync with this.
  setPageDescription('Where intelligent agents live!');
}

export const getHeaders = (props) => {
  if (props.token) {
    return {
      headers: { Authorization: 'Token ' + props.token },
    };
  } else {
    {
    }
  }
};

export const sleepMilliSecs = (ms) => new Promise((r) => setTimeout(r, ms));

export const INVISIBLE_CHARACTER = '\u200B';

export const getLocal = (keyName) => {
  const itemStr = localStorage.getItem(keyName);
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    // const now = new Date();
    // if (now.getTime() > item.ttl) {
    //   localStorage.removeItem(keyName);
    //   return null;
    // }
    return item.value;
  } catch (e) {
    return null;
  }
};

export const setLocal = (keyName, keyValue, ttl) => {
  const data = {
    value: keyValue, // store the value within this object
    ttl: Date.now() + ttl * 1000, // store the TTL (time to live)
  };

  localStorage.setItem(keyName, JSON.stringify(data));
};

export const removeLocal = (keyName) => {
  localStorage.removeItem(keyName);
};

const IN_EU_KEY = 'in_eu';
/**
 * Check if from EU based on IP
 * @param {string} [ip] - IP, default is current
 * @returns {string} - true/false if IP is from EU (https://ipapi.co/api/#complete-location)
 */
export async function isUserInEU() {
  if (IN_EU_KEY in localStorage) {
    const cachedValue = getLocal(IN_EU_KEY);
    return cachedValue;
  }

  let url = 'https://ipapi.co/in_eu';
  const response = await fetch(url);
  const text = await response.text();
  const userInEU = text === 'True';
  setLocal(IN_EU_KEY, userInEU, 7 * 24 * 60 * 60);
}

export function getBooleanFromUrlParam(urlParams, field) {
  const val = urlParams.get(field);
  if (val) {
    return val === 'true';
  } else {
    return null;
  }
}

export function avatarUrlFromFilename(avatarFilename, size = 'thumbnail') {
  const baseUrl =
    size === 'thumbnail'
      ? Constants.CDN_THUMBNAIL_URL
      : Constants.CDN_POST_IMAGE_URL;
  return avatarFilename ? `${baseUrl}/static/avatars/${avatarFilename}` : '';
}

export function imageUrlFromFilename(avatarFilename) {
  const baseUrl = Constants.CDN_POST_IMAGE_URL;
  return avatarFilename ? `${baseUrl}/static/user/${avatarFilename}` : '';
}

export function renderAvatar(name, size, avatar_file_name) {
  return (
    <InitialAvatar
      name={name}
      size={size}
      avatarFileName={avatarUrlFromFilename(avatar_file_name)}
    />
  );
}

export function dedupPosts(posts) {
  const postsCopy = [];
  const externalIds = {};
  for (const idx in posts) {
    let post = posts[idx];
    if (!(post.external_id in externalIds)) {
      postsCopy.push(post);
      externalIds[post.external_id] = post;
    }
  }
  return postsCopy;
}

export const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

export const stripImagePromptText = (
  candidate,
  img_gen_enabled,
  strip_img_prompt_from_msg,
  waiting = false,
  isLastMessage = false,
  img_prompt_regex = '',
) => {
  if (img_gen_enabled && strip_img_prompt_from_msg) {
    if (img_prompt_regex) {
      let pattern = new RegExp(img_prompt_regex);
      candidate.text = candidate.text.replace(pattern, '');
    } else {
      // use default regexes
      const complete_pattern = new RegExp('\\*(.*?)\\*');
      var originalText = undefined;
      while (candidate.text !== originalText) {
        originalText = candidate.text;
        candidate.text = candidate.text.replace(complete_pattern, '');
      }
      candidate.renderText = undefined;

      const partial_pattern = new RegExp('\\*[^\\*]*');
      if (waiting && isLastMessage && candidate.text.match(partial_pattern)) {
        // don't show prompt text, but don't replace yet
        candidate.renderText = candidate.text.replace(partial_pattern, '');
      }
    }
  }
  return candidate;
};

export const hashCode = (s) =>
  s &&
  s.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
