import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { getCookieConsentValue } from 'react-cookie-consent';

import { queryClient } from '..';
import * as Constants from '../Constants';
import {
  Category,
  Character,
  CharacterDetailed,
  CharactersByCategory,
  Config,
  EditUserFormData,
  FeaturedCharacters,
  Followers,
  Following,
  Post,
  PublicUser,
  ReceivedMessagesCount,
  Room,
  Scope,
  TrendingScores,
  User,
  Voice,
  WaitListInfo,
} from '../types';
import { getLocal, getServerUrl, setLocal } from '../utils';

export const setupAxios = (token?: string) => {
  axios.defaults.baseURL = getServerUrl();
  axios.defaults.timeout = Constants.DEFAULT_TIMEOUT;

  const charToken = token || getLocal(Constants.CHARACTER_TOKEN_KEY);
  axios.defaults.headers.common['Authorization'] = charToken
    ? `Token ${charToken}`
    : '';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
};

const getHeaders = () => {
  return {
    headers: { 'Content-Type': 'application/json' },
  };
};

const JSONbigNative = require('json-bigint')({ useNativeBigInt: true });

setupAxios();

/**
 * USER API
 */

const fetchUser = async (): Promise<User> => {
  const response = await axios.get('/chat/user/');
  return response.data.user;
};

const fetchPublicUser = async (username: string): Promise<PublicUser> => {
  const response = await axios.post('/chat/user/public/', { username });
  return response.data.public_user;
};

const updateUser = async (data: EditUserFormData): Promise<any> => {
  // TODO: where should data validation and modification happen? Probably not here.
  const response = await axios.post('/chat/user/update/', {
    username: data.username.trim(),
    name: data.name.trim(),
    avatar_type: data.avatar_type,
    avatar_rel_path: data.avatar_rel_path,
  });
  return response;
};

const fetchFollowing = async (): Promise<Following> => {
  const response = await axios.get('/chat/user/following/');
  return response.data.following;
};

const deactivateUser = async (): Promise<any> => {
  const response = await axios.post('/chat/user/deactivate/', {});
  return response;
};

const fetchFollowers = async (): Promise<Followers> => {
  const response = await axios.get('/chat/user/followers/');
  return response.data.followers;
};

const followUser = async (username: string): Promise<boolean> => {
  const response = await axios.post('/chat/user/follow/', {
    username,
  });
  queryClient.invalidateQueries(['following']);
  queryClient.invalidateQueries(['profile', username]);
  return response.data.status === 'OK';
};

const unfollowUser = async (username: string): Promise<boolean> => {
  const response = await axios.post('/chat/user/unfollow/', {
    username,
  });
  queryClient.invalidateQueries(['following']);
  queryClient.invalidateQueries(['profile', username]);
  return response.data.status === 'OK';
};

const fetchUnseenPostsCount = async (): Promise<number> => {
  if (!getCookieConsentValue()) {
    console.error('Must enable cookies to view unseen posts count');
    return 0;
  }
  const response = await axios.get('/chat/posts/unseen/count/');
  localStorage.setItem('unseenPostsCount', response.data.count);
  return response.data.count;
};

/**
 * CHARACTERS API
 */

// Should these just return Promise<CharacterDetailed>?
// how to handle status?
const fetchCharacterDetailed = async (external_id: string): Promise<any> => {
  const response = await axios.post('/chat/character/', {
    external_id: external_id,
  });
  return response;
};

const createCharacter = async (data: CharacterDetailed): Promise<any> => {
  const response = await axios.post('/chat/character/create/', JSONbigNative.stringify({
    title: data.title,
    name: data.name,
    identifier: data.identifier,
    categories: data.categories,
    visibility: data.visibility,
    copyable: data.copyable,
    description: data.description,
    greeting: data.greeting,
    definition: data.definition,
    avatar_rel_path: data.avatar_rel_path,
    img_gen_enabled: data.img_gen_enabled,
    base_img_prompt: data.base_img_prompt,
    strip_img_prompt_from_msg: data.strip_img_prompt_from_msg,
    voice_id: data.voice_id,
  }), getHeaders());
  return response;
};

const updateCharacter = async (data: CharacterDetailed): Promise<any> => {
  const response = await axios.post('/chat/character/update/', JSONbigNative.stringify({
    external_id: data.external_id,
    title: data.title,
    name: data.name,
    categories: data.categories,
    visibility: data.visibility,
    copyable: data.copyable,
    description: data.description,
    greeting: data.greeting,
    definition: data.definition,
    avatar_rel_path: data.avatar_rel_path,
    img_gen_enabled: data.img_gen_enabled,
    base_img_prompt: data.base_img_prompt,
    strip_img_prompt_from_msg: data.strip_img_prompt_from_msg,
    voice_id: data.voice_id,
  }), getHeaders());
  return response;
};

const fetchCharacters = async (scope: Scope = ''): Promise<Character[]> => {
  const response = await axios.get(
    `/chat/characters/${scope ? `?scope=${scope}` : ''}`,
  );
  return response.data.characters;
};

const fetchPublicCharacters = async (): Promise<Character[]> => {
  const response = await axios.get('/chat/characters/public/');
  return response.data.characters;
};

const fetchCharactersByCategory = async (): Promise<CharactersByCategory> => {
  const response = await axios.get(`/chat/categories/characters/`);
  return response.data.characters_by_category;
};

const fetchCharactersByCuratedCategory =
  async (): Promise<CharactersByCategory> => {
    const response = await axios.get(`/chat/curated_categories/characters/`);
    return response.data.characters_by_curated_category;
  };

const fetchCharacterMessageCount = async (
  scope: Scope = '',
): Promise<ReceivedMessagesCount> => {
  const response = await axios.get(
    `/chat/characters/msgs/count/${scope ? `?scope=${scope}` : ''}`,
  );
  return response.data.received_msgs_count_by_char;
};

const fetchTrendingScoreByCharId = async (): Promise<TrendingScores> => {
  const response = await axios.get('/chat/characters/trending/scores/');
  return response.data.trending_scores;
};

const fetchFeaturedCharacters = async (): Promise<string[]> => {
  const response = await axios.get('/chat/characters/featured/');

  // it returns a list of features, in case we want to show sets later
  // for now, lump all together
  const featuredCharacters = response.data.featured_characters.reduce(
    (a: string[], b: FeaturedCharacters) => a.concat(b.characters),
    [],
  );
  return featuredCharacters;
};

const fetchRecommendedCharacters = async (): Promise<string[]> => {
  const response = await axios.get('/chat/characters/recommended/');

  const recommendedCharacters = response.data.recommended_characters;
  return recommendedCharacters;
};

const fetchRecentCharacters = async (): Promise<Character[]> => {
  const response = await axios.get('/chat/characters/recent/');
  return response.data.characters;
};

const fetchRecentRooms = async (): Promise<Room[]> => {
  const response = await axios.get('/chat/rooms/recent/');
  return response.data.rooms;
};

const fetchCategories = async (): Promise<Category[]> => {
  const response = await axios.get('/chat/character/categories/');
  const categoryNames = [];

  for (let i = 0; i < response?.data.categories.length; i++) {
    const name = response?.data.categories[i].name;
    categoryNames.push({ label: name, value: name });
  }

  return categoryNames;
};

/**
 * CHAT API
 */
const deleteMessages = async (
  historyId: string,
  ids: number[],
  regenerating: boolean,
): Promise<boolean> => {
  const response = await axios.post('/chat/history/msgs/delete/', JSONbigNative.stringify({
    history_id: historyId,
    ids_to_delete: ids,
    regenerating,
  }), getHeaders());
  return response.data;
};

/**
 * POSTS API
 */

const fetchPostsByUser = async (username: string): Promise<Post[]> => {
  const response = await axios.get(`/chat/posts/user/?username=${username}`);
  return response.data.posts;
};

/**
 * AUTH API
 */
const fetchCharacterToken = async (): Promise<void> => {
  const response = await axios.post('/dj-rest-auth/auth0/');
  const token = response.data.key;

  // TODO @kishan: Use React Query for caching user token?
  setLocal(Constants.CHARACTER_TOKEN_KEY, token, 30 * 24 * 60 * 60);
  return token;
};

const logoutUser = async (): Promise<AxiosResponse | undefined> => {
  const response = await axios.post('/chat/user/logout/');
  return response;
};

/**
 * IMAGE GEN API
 */
const generateImage = async (
  imageDescription: string,
): Promise<AxiosResponse | undefined> => {
  const response = await axios.post('/chat/generate-image/', {
    image_description: imageDescription,
  });
  return response;
};

/**
 * MISC API REQUESTS
 */
const fetchConfig = async (): Promise<Config> => {
  const response = await axios.get('/chat/config/');
  return response.data.config;
};

const hideRooms = async (data: string): Promise<boolean> => {
  const response = await axios.post('/chat/history/hide/', {
    room_external_id: data,
  });
  return response?.data.status === 'OK';
};

const hideCharacters = async (data: string): Promise<boolean> => {
  const response = await axios.post('/chat/history/hide/', {
    character_external_id: data,
  });
  return response?.data.status === 'OK';
};

const joinWaitlist = async (data: WaitListInfo): Promise<boolean> => {
  const response = await axios.post('/chat/waitlist/', {
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    comments: data.comments,
  });
  return response?.data.status === 'OK';
};

const _uploadImage = async (url: string, imageData: File | Blob) => {
  const imageFormData = new FormData();
  imageFormData.append('image', imageData);

  const response = await axios.post(url, imageFormData, {
    'Content-Type': 'multipart/form-data',
  } as AxiosRequestHeaders);
  if (response.data.status === 'VIOLATES_POLICY') {
    throw 'Image violates policy';
  }
  if (response.data.status !== 'OK') {
    throw 'Failed to upload avatar';
  }
  const avatarRelPath = response.data.value;
  return avatarRelPath;
};

const uploadAvatar = async (avatarData: File | Blob) => {
  return _uploadImage('/chat/avatar/upload/', avatarData);
};

const uploadImage = async (imageData: File | Blob) => {
  return _uploadImage('/chat/upload-image/', imageData);
};

const uploadGeneratedImageAsAvatar = async (imageUrl: string) => {
  const response = await axios.post('/chat/upload-avatar-generated-image/', {
    url: imageUrl,
  });
  if (response.data.status !== 'OK') {
    throw 'Failed to upload avatar';
  }
  const avatarRelPath = response.data.value;
  return avatarRelPath;
};

const fetchVoices = async (): Promise<Voice[]> => {
  const response = await axios.get('/chat/character/voices/');
  return response.data.voices;
};

const previewVoice = async (voiceId: number, msg: string): Promise<string> => {
  const response = await axios.get(
    `/chat/character/preview-voice/?voice_id=${voiceId}&to_speak=${msg}`,
  );
  return response.data.speech;
};

const API = {
  fetchUser,
  fetchPublicUser,
  updateUser,
  fetchFollowing,
  fetchFollowers,
  followUser,
  unfollowUser,
  fetchUnseenPostsCount,
  fetchCharacterDetailed,
  updateCharacter,
  createCharacter,
  fetchCharacters,
  fetchPublicCharacters,
  hideCharacters,
  hideRooms,
  fetchCharactersByCategory,
  fetchCharactersByCuratedCategory,
  fetchFeaturedCharacters,
  fetchRecommendedCharacters,
  fetchRecentCharacters,
  fetchRecentRooms,
  fetchCategories,
  fetchCharacterMessageCount,
  fetchTrendingScoreByCharId,
  fetchPostsByUser,
  fetchCharacterToken,
  fetchConfig,
  logoutUser,
  joinWaitlist,
  generateImage,
  deleteMessages,
  uploadAvatar,
  uploadImage,
  uploadGeneratedImageAsAvatar,
  fetchVoices,
  previewVoice,
  deactivateUser,
};

export default API;
