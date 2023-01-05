import { useAuth0 } from '@auth0/auth0-react';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { SplashScreen } from '@capacitor/splash-screen';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import utils from 'axios/lib/utils';
import React from 'react';
import { createContext, useEffect, useState } from 'react';
import { useDarkreader } from 'react-darkreader';
import { isIOS, isMobile } from 'react-device-detect';
import { useLocation, useNavigate } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import AnswersPage from './AnswersPage';
import './App.css';
import CharacterChat from './CharacterChat';
import CharacterEditor from './CharacterEditor';
import CharacterHistories from './CharacterHistories';
import CharacterSearch from './CharacterSearch';
import './Chat.css';
import Chats from './Chats';
import './Common.css';
import Community from './Community';
import * as Constants from './Constants';
import CreateCharacter from './CreateCharacter';
import CreatePost from './CreatePost';
import CreateRoom from './CreateRoom';
import Feed from './Feed';
import GuidelinesPage from './GuidelinesPage';
import Help from './Help';
import IntroModal from './IntroModal';
import LoginModal from './LoginModal';
import MessageBanner from './MessageBanner';
import Mythica from './Mythica';
import OnBoarding from './OnBoarding';
import Post from './Post';
import PostScreenshot from './PostScreenshot';
import Posts from './Posts';
import Privacy from './Privacy';
import Profile from './Profile';
import PublicProfile from './PublicProfile';
import Query from './Query';
import Signup from './Signup';
import TOS from './TOS';
import API, { setupAxios } from './api/Api';
import Logo from './components/Logo';
import DiscoverPage from './discover/DiscoverPage';
import usePageTracking from './hooks/usePageTracking';
import Evaluation from './labs/Evaluation';
import { ProfileSettings } from './profile/ProfileSettings';
import {
  getHeaders,
  getLocal,
  getUrlParam,
  removeLocal,
  setLocal,
} from './utils.js';
import { buildUrlParams } from './utils.js';
import { getServerUrl, getSpecialAccessCode } from './utils.js';

const defaultAppContext = {
  unseenPostsCount: 0,
};

export const AppContext = createContext(defaultAppContext);
var JSONbigNative = require('json-bigint')({ useNativeBigInt: true });

axios.defaults.baseURL = getServerUrl();
axios.defaults.timeout = Constants.DEFAULT_TIMEOUT;
axios.defaults.transformResponse = [(data) => {
  if (typeof data === 'string') {
    try {
      data = JSONbigNative.parse(data);
    } catch (e) { /* Ignore */ } // Added this Ignore as it's the same in the Axios
  }
  return data;
}];

const ANONYMOUS_USER = { user: { username: 'ANONYMOUS' } };
const CHARACTER_TOKEN_KEY = 'char_token';

export const LAZY_USERNAME_PREFIX = 'Guest-2je9q78';

export const isAnonymousUser = (user) =>
  user?.user?.username === 'ANONYMOUS' ||
  user?.user?.username?.startsWith(LAZY_USERNAME_PREFIX);

const App = (props) => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [token, setToken] = useState('');
  const [specialAccessCode] = useState(getSpecialAccessCode());
  const [loading, setLoading] = useState(true);
  const [authDone, setAuthDone] = useState(false);
  const [config, setConfig] = useState({});
  const [characters, setCharacters] = useState([]);
  const [userCharacters, setUserCharacters] = useState([]);
  const [user, setUser] = useState({
    user: { id: null, username: 'ANONYMOUS' },
  });
  const [unseenPostsCount, setUnseenPostsCount] = useState(
    getLocal('unseenPostsCount') || 0,
  );
  const [trendingCharacters, setTrendingCharacters] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loaded, setLoaded] = useState([]);
  const [waitingOnPublic, setWaitingOnPublic] = useState(undefined);
  const [loginOpen, setLoginOpen] = useState(false);
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    ['categories'],
    API.fetchCategories,
  );

  const navigate = useNavigate();
  usePageTracking();

  const [isDark, { toggle }] = useDarkreader(
    JSON.parse(localStorage.getItem('darkMode')),
  );

  const toggleDarkMode = () => {
    localStorage.setItem('darkMode', !isDark);
    toggle();
  };
  const {
    error,
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    handleRedirectCallback,
    buildLogoutUrl,
  } = useAuth0();

  // TODO(irwan): Move it to AppConfig Django model
  const onboardingCharacterUrl =
    '/chat?char=YntB_ZeqRq2l_aVf2gWDCZl4oBttQzDvhj9cXafWcF8';

  useEffect(() => {
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      if (url.startsWith(Constants.AUTH0_CAPACITOR_CALLBACK_URI)) {
        if (
          url.includes('state') &&
          (url.includes('code') || url.includes('error'))
        ) {
          await handleRedirectCallback(url);
          const accessToken = await getAccessTokenSilently();
          await getCharToken(accessToken);
          setAuthDone(true);
        }

        await Browser.close();
        navigate('/');
        window.location.reload();
      }
    });
  }, [handleRedirectCallback]);

  /*
  High-level flow:

  - load config
  - load auth
    - handle redirect if user just verified their email
  (at this point, we know which of 3 states we’re in)
    - authorized
    - un authorized and public
    - un authorized and not public
  if auth or public, load public set of data
  */

  // on mount
  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (!isAnonymousUser(user)) {
      getRecommendedCharacters();
      loadUserCharacters();
      loadUnseenPostsCount();
    }
  }, [user]);

  useEffect(() => {
    if (!categoriesLoading && !loaded.includes('categories')) {
      setLoaded((oldArray) => [...oldArray, 'categories']);
    }
  }, [categoriesLoading]);

  // determine authentication status
  useEffect(() => {
    (async () => {
      // ensure Auth0 is done loading
      if (isLoading) {
        return;
      }
      if (error && error['error']) {
        // alert new user to verify their email address
        logout({ localOnly: true });
        setLoginOpenState(true); // LoginModal displays the message
        setAuthDone(true);
      } else if (getUrlParam('success') === 'true') {
        // either a new user that just verified their email or password reset
        await loginWithRedirect();
        setAuthDone(false); // don't load homepage, wait for redirect
      } else if (isAuthenticated) {
        if (!token) {
          const accessToken = await getAccessTokenSilently();
          await getCharToken(accessToken);
        }
        setAuthDone(true);
      } else {
        if (!token) {
          // Create LazyToken for unauthenticated user
          await getLazyToken();
          await maybeSendDirectlyToChat();
        }
        setAuthDone(true);
      }
    })();
  }, [isLoading]);

  useEffect(() => {
    if (authDone && config.public !== undefined) {
      if (
        config.public ||
        (isAuthenticated && !localStorage.getItem('chat_onboarding'))
      ) {
        loadPublic();
        setWaitingOnPublic(true);
      } else {
        setWaitingOnPublic(false);
      }
    }
  }, [authDone, config]);

  useEffect(() => {
    if (!categoriesLoading && !loaded.includes('categories')) {
      setLoaded((oldArray) => [...oldArray, 'categories']);
    }
  }, [categoriesLoading]);

  useEffect(() => {
    if (
      waitingOnPublic === false ||
      (loaded.includes('user') && loaded.includes('config'))
    ) {
      setLoading(false);
      hideSplashScreen();
    }
  }, [waitingOnPublic, loaded, characters, user]);

  const hideSplashScreen = () => {
    if (isMobile && isIOS) {
      SplashScreen.hide();
    }
  };

  const loadPublic = () => {
    getUser();
    getTrendingCharacters();
    getFeaturedCharacters();
  };

  const loadConfig = async () => {
    axios
      .get('/chat/config/')
      .then((response) => {
        setConfig(response.data.config);
        setLoaded((oldArray) => [...oldArray, 'config']);
      })
      .catch((err) => {
        handleServerError(err);
        return false;
      });
  };

  const loadUnseenPostsCount = async () => {
    const newUnseenPostsCount = await API.fetchUnseenPostsCount();
    setUnseenPostsCount(newUnseenPostsCount);
  };

  const getUser = async () => {
    axios
      .get('/chat/user/', getHeaders(token ? { token: token } : {}))
      .then((response) => {
        setUser(response.data.user);
        setLoaded((oldArray) => [...oldArray, 'user']);
        if (
          !isAnonymousUser(response.data.user) &&
          !response.data.user?.user?.account?.onboarding_complete
        ) {
          navigate('/signup');
        }
      })
      .catch((err) => {
        handleServerError(err);
        return false;
      });
  };

  const getFeaturedCharacters = async () => {
    axios
      .get(
        '/chat/characters/featured_v2/',
        getHeaders(token ? { token: token } : {}),
      )
      .then((response) => {
        setFeatured(response.data.characters);
        setLoaded((oldArray) => [...oldArray, 'featured']);
      });
  };

  const getRecommendedCharacters = async () => {
    axios
      .get(
        '/chat/characters/recommended/',
        getHeaders(token ? { token: token } : {}),
      )
      .then((response) => {
        setRecommended(response.data.recommended_characters);
        setLoaded((oldArray) => [...oldArray, 'recommended']);
      });
  };

  const getTrendingCharacters = async () => {
    axios
      .get(
        '/chat/characters/trending/',
        getHeaders(token ? { token: token } : {}),
      )
      .then((response) => {
        setTrendingCharacters(response.data.trending_characters);

        setLoaded((oldArray) => [...oldArray, 'trending']);
      })
      .catch((err) => {
        handleServerError(err);
        return false;
      });
  };

  const loadUserCharacters = async () => {
    const newUserCharacters = await API.fetchCharacters('user');
    setUserCharacters(newUserCharacters);
  };

  const handleServerError = (err) => {
    if (Constants.IS_LOCAL) {
      // hide errors if this is just a request to login
      toast.error(`An error occurred!`);
    }
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(err.response.data);
      console.error(err.response.status);
      console.error(err.response.headers);
      if (err.response.status === 400) {
        if (err.response.data['non_field_errors'].length === 1) {
          window.alert(err.response.data['non_field_errors'][0]);
          revalidate();
        }
      } else if (err.response.status === 401) {
        // only revalidate if auth error
        if (config.public) {
          setLoginOpen(true);
        } else {
          // any 401 will result in needing to login
          //revalidate();
        }
      } else {
        console.error('There was as a server communication error: \n\n' + err);
      }
    } else if (err.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error(err.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      //console.log("Error", error.message);
    }
    console.error(err.config);
    //window.alert("There was as a server communication error: \n\n"+error)

    // otherwise should do modal to explain what happened?
  };

  const getLazyToken = async () => {
    // Get lazy_uuid from localStorage if it exists, otherwise generate it.
    let lazy_uuid = localStorage.getItem('uuid') || uuidv4();
    await axios
      .post('/chat/auth/lazy/', { lazy_uuid: lazy_uuid }, {})
      .then((response) => {
        setToken(response.data.token);
        setupAxios(response.data.token);
        localStorage.setItem('uuid', response.data.uuid);
        localStorage.setItem('chat_onboarding', response.data.chat_onboarding);
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const maybeSendDirectlyToChat = () => {
    // Do not send directly to chat for mobile app
    // This causes a wonky error on iOS right now
    // TODO: Remove this gate and enable A/B testing of it on mobile :)
    if (Constants.NATIVE) {
      return;
    }

    // True or False if lazy user. Otherwise (authenticated), it is none
    let completed_chat_onboarding =
      localStorage.getItem('completed_chat_onboarding') || 'false';
    if (
      localStorage.getItem('chat_onboarding') == 'true' &&
      completed_chat_onboarding == 'false'
    ) {
      // TODO(irwan): add onboarding?
      navigate(onboardingCharacterUrl);
      // Set it to false so that users can go to Discover later
      localStorage.setItem('completed_chat_onboarding', true);
    }
  };

  async function getCharToken(accessToken) {
    const cachedToken = getLocal(CHARACTER_TOKEN_KEY);
    if (cachedToken && Constants.IS_LOCAL) {
      await axios
        .post('/chat/config/', {}, getHeaders({ token: cachedToken }))
        .then((response) => {
          // token is still valid
          setToken(cachedToken);
        })
        .catch((err) => {
          // cached token is invalid, force reauthentication
          revalidate();
        });
    } else {
      await getFreshCharToken(accessToken);
    }
  }

  async function getFreshCharToken(accessToken) {
    const request = { access_token: accessToken };
    if (specialAccessCode) {
      request.special_access_code = specialAccessCode;
    }
    return await axios
      .post('/dj-rest-auth/auth0/', request)
      .then((response) => {
        const local_token = response.data.key;
        setLocal(CHARACTER_TOKEN_KEY, local_token, 30 * 24 * 60 * 60);
        setupAxios();
        setToken(local_token);
      })
      .catch((err) => {
        handleServerError(err);
        // add message that you aren"t authorized
        //console.error(err);
      });
  }

  const revalidate = () => {
    if (isAuthenticated || token) {
      // log out of Character server
      axios
        .post(
          '/chat/user/logout/',
          {},
          getHeaders(token ? { token: token } : {}),
        )
        .then((response) => {
          //console.log("logout ", response)
        })
        .catch((err) => {
          props.handleServerError(err);
          return false;
        });
      // clear Character server token
      setToken('');
      removeLocal(CHARACTER_TOKEN_KEY);
      setUser(ANONYMOUS_USER);

      // log out of Auth0 and redirect to /
      if (Constants.NATIVE) {
        const doLogout = async () => {
          // Open the browser to perform a logout
          await Browser.open({
            url: buildLogoutUrl({
              returnTo: Constants.AUTH0_CAPACITOR_CALLBACK_URI,
            }),
          });

          // Ask the SDK to log out locally, but not do the redirect
          logout({ localOnly: true });
        };

        doLogout();
      } else {
        logout({ returnTo: window.location.origin });
      }
    }
  };

  // callback to set login modal open/closed state from within components
  const setLoginOpenState = (value) => {
    setLoginOpen(value);
    if (!value) {
      navigate('/');
    }
  };

  try {
    if (loading) {
      return (
        <div className="d-flex justify-content-center m-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      );
    } else if (isAuthenticated) {
      return (
        <AppContext.Provider value={{ unseenPostsCount: unseenPostsCount }}>
          <div className={'apppage' + Constants.NOTCH}>
            <MessageBanner message={config?.banner_message} />
            <Routes>
              <Route
                path="/feed"
                element={
                  <Feed
                    token={token}
                    user={user}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/"
                element={
                  <DiscoverPage
                    token={token}
                    user={user}
                    trendingCharacters={trendingCharacters}
                    featured={featured}
                    recommended={recommended}
                    loaded={loaded}
                    logout={revalidate}
                    handleServerError={handleServerError}
                    categories={categories}
                    trendingCarouselIndex={config.trending_carousel_index}
                  />
                }
              />
              <Route
                exact
                path="/search"
                element={
                  <CharacterSearch
                    token={token}
                    user={user}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/histories"
                element={
                  <CharacterHistories
                    token={token}
                    user={user}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/chat"
                element={
                  <CharacterChat
                    token={token}
                    user={user}
                    userCharacters={userCharacters}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route exact path="/chats" element={<Chats token={token} />} />
              <Route
                exact
                path="/community"
                element={
                  <Community
                    token={token}
                    user={user}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/posts"
                element={
                  <Posts
                    token={token}
                    handleServerError={handleServerError}
                    enableCreatePost={true}
                    navBackUrl={`/community${buildUrlParams()}`}
                    pinningEnabled={true}
                    seenPostIndicationEnabled={true}
                    user={user}
                  />
                }
              />
              <Route
                exact
                path="/labs/evaluation"
                element={
                  <Evaluation
                    token={token}
                    user={user}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/mythica"
                element={
                  <Mythica
                    user={user}
                    token={token}
                    handleServerError={handleServerError}
                    enableCreatePost={true}
                    navBackUrl={`/community${buildUrlParams()}`}
                    pinningEnabled={true}
                    seenPostIndicationEnabled={true}
                  />
                }
              />
              <Route
                exact
                path="/post"
                element={
                  <Post
                    token={token}
                    user={user}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/post/raw"
                element={
                  <PostScreenshot
                    token={token}
                    user={user}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/post/create"
                element={
                  <CreatePost
                    token={token}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/room/create"
                element={
                  <CreateRoom
                    token={token}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/editing"
                element={
                  <CharacterEditor
                    token={token}
                    user={user}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/settings"
                element={
                  <ProfileSettings
                    token={token}
                    logout={revalidate}
                    getUser={getUser}
                    isDark={isDark}
                    toggleDarkMode={toggleDarkMode}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/profile"
                element={<Profile token={token} characters={userCharacters} />}
              />
              <Route
                exact
                path="/public-profile"
                element={<PublicProfile token={token} />}
              />
              <Route
                exact
                path="/help"
                element={
                  <Help token={token} handleServerError={handleServerError} />
                }
              />
              <Route
                exact
                path="/faq"
                element={
                  <AnswersPage
                    token={token}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/guidelines"
                element={
                  <GuidelinesPage
                    token={token}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/tos"
                element={
                  <TOS token={token} handleServerError={handleServerError} />
                }
              />
              <Route
                exact
                path="/privacy"
                element={
                  <Privacy
                    token={token}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                path="/character/create"
                element={
                  <CreateCharacter
                    token={token}
                    user={user}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/signup"
                element={
                  <Signup
                    token={token}
                    user={user}
                    handleServerError={handleServerError}
                    getUser={getUser}
                  />
                }
              />
              <Route
                exact
                path="/onboarding"
                element={
                  <OnBoarding
                    token={token}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                path="/query"
                element={
                  <Query token={token} handleServerError={handleServerError} />
                }
              />
            </Routes>
          </div>
        </AppContext.Provider>
      );
    } else if (config.public) {
      return (
        <AppContext.Provider value={{ unseenPostsCount: unseenPostsCount }}>
          <div className={'apppage' + Constants.NOTCH}>
            <MessageBanner message={config?.banner_message} />
            <Routes>
              <Route
                exact
                path="/feed"
                element={
                  <Feed
                    token={''}
                    user={user}
                    setLoginOpen={setLoginOpenState}
                    login={loginOpen}
                    waitlist={config.waitlist}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/"
                element={
                  <DiscoverPage
                    token={' '}
                    setLoginOpen={setLoginOpenState}
                    login={loginOpen}
                    waitlist={config.waitlist}
                    user={user}
                    trendingCharacters={trendingCharacters}
                    featured={featured}
                    recommended={recommended}
                    loaded={loaded}
                    logout={logout}
                    handleServerError={handleServerError}
                    categories={categories}
                    trendingCarouselIndex={config.trending_carousel_index}
                  />
                }
              />
              <Route
                exact
                path="/post"
                element={
                  <Post
                    token={''}
                    user={user}
                    setLoginOpen={setLoginOpenState}
                    login={loginOpen}
                    waitlist={config.waitlist}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/post/raw"
                element={
                  <PostScreenshot
                    token={token}
                    user={user}
                    setLoginOpen={setLoginOpenState}
                    login={loginOpen}
                    waitlist={config.waitlist}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/community"
                element={
                  <Community
                    token={''}
                    user={user}
                    setLoginOpen={setLoginOpenState}
                    login={loginOpen}
                    waitlist={config.waitlist}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/posts"
                element={
                  <Posts
                    token={token}
                    handleServerError={handleServerError}
                    enableCreatePost={true}
                    navBackUrl={`/community${buildUrlParams()}`}
                    pinningEnabled={true}
                    seenPostIndicationEnabled={true}
                    user={user}
                  />
                }
              />
              <Route
                exact
                path="/help"
                element={<Help handleServerError={handleServerError} />}
              />
              <Route
                exact
                path="/tos"
                element={<TOS handleServerError={handleServerError} />}
              />
              <Route
                exact
                path="/privacy"
                element={<Privacy handleServerError={handleServerError} />}
              />
              <Route
                exact
                path="/chat"
                element={
                  <CharacterChat
                    token={token}
                    characters={characters}
                    userCharacters={[]}
                    user={user}
                    handleServerError={handleServerError}
                  />
                }
              />
              <Route
                exact
                path="/faq"
                element={<AnswersPage handleServerError={handleServerError} />}
              />
              <Route
                path="*"
                element={
                  <DiscoverPage
                    login={true}
                    setLoginOpen={setLoginOpenState}
                    waitlist={config.waitlist}
                    user={user}
                    trendingCharacters={trendingCharacters}
                    featured={featured}
                    recommended={recommended}
                    loaded={loaded}
                    logout={logout}
                    handleServerError={handleServerError}
                    categories={categories}
                    trendingCarouselIndex={config.trending_carousel_index}
                  />
                }
              />
            </Routes>
            <IntroModal />
          </div>
        </AppContext.Provider>
      );
    } else {
      /* not authenticated, not public, only signin/signup/waitlist */
      return (
        <div>
          <LoginModal no_close={true} login={true} waitlist={config.waitlist} />
          <div className="row mt-5">
            <div className="col text-center" style={{ marginTop: '0px' }}>
              <button
                onClick={() => setLoginOpen(!loginOpen)}
                className=" btn border-1"
                style={{}}
              >
                <Logo />
              </button>
            </div>
          </div>
        </div>
      );
    }
  } catch (e) {
    // TODO: Harden exception handling with CapacitorJS
    // For now, just reload the page with a 1s delay
    if (isMobile) {
      setTimeout(() => {
        console.log('Retrying app load');
        window.location.reload(true);
      }, 1000);
    }
  }
};

export default App;
