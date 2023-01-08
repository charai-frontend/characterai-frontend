import axios from 'axios';
import classNames from 'classnames';
import JSONbigInt from 'json-bigint';
import Markdown from 'marked-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getCookieConsentValue } from 'react-cookie-consent';
import { isIOS, isMobile } from 'react-device-detect';
import Dropdown, { Option } from 'react-dropdown';
import 'react-dropdown/style.css';
import ReactGA from 'react-ga';
import Hotkeys from 'react-hot-keys';
import { IoChatbubblesOutline } from 'react-icons/io5';
import {
  MdArrowBackIosNew,
  MdHighlightOff,
  MdLink,
  MdLock,
  MdMicOff,
  MdPauseCircleFilled,
  MdPlayCircleFilled,
  MdRestartAlt,
  MdSend,
  MdSettingsVoice,
  MdTranslate,
} from 'react-icons/md';
import InfiniteScroll from 'react-infinite-scroll-component';
import ReactJson from 'react-json-view';
import Modal from 'react-modal';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Alert, Button, Spinner } from 'reactstrap';
import { Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperClass from 'swiper/types/swiper-class';
import * as Tone from 'tone';

import { queryClient } from '.';
import { isAnonymousUser } from './App';
import './App.css';
import CharacterIcon from './CharacterIcon';
import './Chat.css';
import ChatOptions from './ChatOptions';
import './Common.css';
import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import { reportCharacter } from './ReportCharacter';
import SocialSharePanel from './SocialSharePanel';
import API from './api/Api';
import ChatActions from './chat/ChatActions';
import EmbeddedImage from './components/EmbeddedImage';
import ImageGeneratingIcon from './components/ImageGeneratingIcon';
import ImageUpload from './components/ImageUpload';
import UserImageGeneration from './components/UserImageGeneration';
import {
  Character,
  CharacterInfoResponse,
  ChatHistoryCreateContinueResponse,
  ChatHistoryResponse,
  ChatMessage,
  Message,
  Participant,
  SourceCharacter,
} from './types';
import {
  buildUrlParams,
  clearLinkPreviewImage,
  debounce,
  getServerUrl,
  getShareUrlOrigin,
  resetPageDescription,
  resetPageTitle,
  setLinkPreviewImage,
  setPageDescription,
  setPageSubtitle,
  stripImagePromptText,
} from './utils.js';
import { displayNumInteractions } from './utils/character-utils';

const postVisibilityOptions = [
  { value: 'PUBLIC', label: 'Everyone can see' },
  { value: 'UNLISTED', label: 'Only people with the post link can see' },
];

let recognition: SpeechRecognition | null = null;
let speechMatchBeingProcessed = false;

// Initialize as empty audio file - hack for iOS support
// https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari
const initialTtsAudio =
  'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

let ttsAudio: HTMLAudioElement = new Audio(initialTtsAudio);
ttsAudio.autoplay = true;
let songPlayer: Tone.Player | null = null;

const JSONbigNative = JSONbigInt({ useNativeBigInt: true });

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#root');

const filterOutEmptyUserMessages = (msg: ChatViewMessage) => {
  if (
    !msg.isCharTurn &&
    !msg.candidates[0].text &&
    !msg.candidates[0].image_rel_path
  ) {
    return false;
  }
  return true;
};

//#NOTE I have no idea what this does lol
const getFocusableInput = () => {
  const ref = React.createRef<HTMLElement>();
  const focus = () => {
    ref.current && ref.current.focus();
  };
  return { focus, ref };
};

type CharacterChatProps = {
  token: string;
  user: Participant;
  userCharacters: Character[];
  handleServerError: (err: Error) => void;
  mode: string;
  maxLength?: number;
  number?: number;
  minimum?: number;
  character_id?: string;
  randomUser?: number;
  onFinished?: (content: string) => void;
};

interface ChatMessageCandidates {
  id?: number;
  text: string;
  src__user__username?: string;
  image_rel_path?: string;
  image_prompt_text?: string;
  responsible_user__username?: null | string;
  deleted?: null | boolean;
  tgt__user__id?: number;
  display_name?: string;
  badge_reason?: string;
  debug_info?: any;
  annotatable?: boolean;
  username?: string; //#NOTE REFER`
  four_star?: boolean;
  three_star?: boolean;
  two_star?: boolean;
  one_star?: boolean;
  image_one_star?: boolean;
  image_two_star?: boolean;
  image_three_star?: boolean;
  image_four_star?: boolean;
  translation?: string;
  renderText?: string;
  suggested_replies?: string[];
  remove_reasons?: string[];
  score?: number;
  score_type?: string;
  log_prob?: number;
  log_prob_per_token?: string;
  len_tokens?: number;
  classi_probs?: string[];
  continuation?: any;
  query?: string;
}

interface ChatViewMessage {
  isCharTurn: boolean;
  srcChar?: SourceCharacter;
  candidates: ChatMessageCandidates[];
}

export const CharacterChatTyped = (props: CharacterChatProps) => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [dummyCounter, setDummyCounter] = useState(123);
  const [staging, setStaging] = useState(query.get('staging') === 'true');
  const [user, setUser] = useState<Participant>();
  const [charData, setCharData] = useState<Character>();
  const [viewMsgs, setViewMsgs] = useState<ChatViewMessage[]>([]);
  const [lastUpdateLength, setLastUpdateLength] = useState(0);
  const [displayClassiProbs, setDisplayClassiProbs] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [asrEnabled, setAsrEnabled] = useState(false);
  const [titleExpanded, setTitleExpanded] = useState(false);
  const [history, setHistory] = useState<ChatHistoryCreateContinueResponse>();
  const [hasHistories, setHasHistories] = useState(false);
  const [altIndex, setAltIndex] = useState(0);

  // Used to ensure latest value of altIndex is received from within a closure
  const altIndexRef = useRef(0);

  // default to 3 options from Characters (first + two)
  const [numAlternates, setNumAlternates] = useState(1);

  const [text, setText] = useState('');
  const [charTyping, setCharTyping] = useState(false);
  const [charMessageFullyRendered, setCharMessageFullyRendered] =
    useState(true);
  const [devToolsEnabled, setDevToolsEnabled] = useState(
    localStorage.getItem('devToolsEnabled') === 'true',
  );
  const [insertBeginning, setInsertBeginning] = useState<string | null>(null);
  const [overrideModelServerAddress, setOverrideModelServerAddress] = useState<
    string | null
  >(null);
  const [translateCandidates, setTranslateCandidates] = useState<
    boolean | null
  >(false);
  const [translateTap, setTranslateTap] = useState<boolean | null>(false);
  const [translateTapToggle, setTranslateTapToggle] = useState<boolean | null>(
    false,
  );
  const [overrideHistorySet, setOverrideHistorySet] = useState<string | null>(
    null,
  );
  const [overridePrefix, setOverridePrefix] = useState<string | null>(null);
  const [overrideRank, setOverrideRank] = useState<string | null>(null);
  const [rankCandidates, setRankCandidates] = useState<boolean | null>(null);
  const [filterCandidates, setFilterCandidates] = useState<boolean | null>(
    null,
  );
  const [prefixLimit, setPrefixLimit] = useState<string | null>(null);
  const [prefixTokenLimit, setPrefixTokenLimit] = useState<string | null>(null);
  const [livetuneCoeff, setLivetuneCoeff] = useState<string | null>(null);
  const [streamParams, setStreamParams] = useState<string | null>(null);

  // TODO(Bowen, Igor): should we set default to null?
  const defaultStreamEveryNSteps = 16; // If you change here, also change the default in server/chat/views/views.py.
  const defaultStreamChunksToPad = 8; // If you change here, also change the default in server/chat/views/views.py.

  const defaultAnimationChunkSize = 1;
  const defaultAnimationChunkDelay = 18; // ms
  const [streamEveryNSteps, setStreamEveryNSteps] = useState<number | null>(
    defaultStreamEveryNSteps,
  );
  const [streamChunksToPad, setStreamChunksToPad] = useState<number | null>(
    defaultStreamChunksToPad,
  );
  const [streamAnimationChunkSize, setStreamAnimationChunkSize] = useState<
    number | null
  >(defaultAnimationChunkSize);
  const [streamAnimationChunkDelay, setStreamAnimationChunkDelay] = useState<
    number | null
  >(defaultAnimationChunkDelay);
  const [enableTextToImage, setEnableTextToImage] = useState<boolean | null>(
    null,
  );
  const [chatTimeout, setChatTimeout] = useState<number | null>(null);
  const [prefix, setPrefix] = useState('');
  const [externalHistoryId, setExternalHistoryId] = useState<string | null>(
    null,
  );
  const [characterId, setCharacterId] = useState(props.character_id);
  const avatarSize = 45;
  const [currentLength, setCurrentLength] = useState(0);
  const [isProactive, setIsProactive] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postVisibility, setPostVisibility] = useState<Option>(
    postVisibilityOptions[0],
  );
  const [postButtonEnabled, setPostButtonEnabled] = useState(false);

  const [deleteMessageMode, setDeleteMessageMode] = useState(false);
  const [deleteMessagesIds, setDeleteMessagesIds] = useState<number[]>([]);
  const [deletingMessages, setDeletingMessages] = useState(false);

  const [postStartMessageIndex, setPostStartMessageIndex] = useState<
    number | null
  >(null);
  const [postEndMessageIndex, setPostEndMessageIndex] = useState<number | null>(
    null,
  );
  const [hoverPostStartMessageIndex, setHoverPostStartMessageIndex] = useState<
    number | null
  >(null);
  const [lastHoverIndex, setLastHoverIndex] = useState<number | null>(null);
  const [isSelectingPostStartEnd, setIsSelectingPostStartEnd] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [numStreamedMessages, setNumStreamedMessages] = useState(0);
  // The next chat page to load.
  const [chatPageNum, setChatPageNum] = useState<number | null>(null);
  // There are more pages of chat available.
  const [chatHasMore, setChatHasMore] = useState<boolean | undefined>(false);
  const [chatHeight, setChatHeight] = useState(window.innerHeight - 143);
  // Prevents scrolling down when paginating for more chats upwards.
  const [justPaginatedUpwards, setJustPaginatedUpwards] = useState(false);
  const [errorImagePaths, setErrorImagePaths] = useState<string[]>([]);
  const [loadedImagePaths, setLoadedImagePaths] = useState<string[]>([]);
  const [imageGenerationModalOpen, setImageGenerationModalOpen] =
    useState(false);
  const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
  const [userImagePath, setUserImagePath] = useState('');
  const [userImageDescription, setUserImageDescription] = useState('');
  const [userImageDescriptionType, setUserImageDescriptionType] = useState('');
  const [userImageOriginType, setUserImageOriginType] = useState('');
  const [chatDropdownOpen, setChatDropdownOpen] = useState(false);
  const [characterVoiceEnabled, setcharacterVoiceEnabled] = useState(false);
  const [generatingCandidateIndex, setGeneratingCandidateIndex] = useState(0);

  const [generatingCandidate, setGeneratingCandidate] = useState(false);
  const [abortPrevChatRequest, setAbortPrevChatRequest] = useState(false);
  const [primaryCandidate, setPrimaryCandidate] =
    useState<ChatMessageCandidates | null>();
  const [seenCandidateIds, setSeenCandidateIds] = useState<number[]>([]);

  const primaryCandidateRef = useRef<ChatMessageCandidates | null>();
  const seenCandidateIdsRef = useRef<number[] | null>();

  const generatingCandidateRef = useRef(false);
  const abortPrevChatRequestRef = useRef(false);

  // Whether this will be an interactive chat or just view only (based on moderation)
  const [viewOnly, setViewOnly] = useState(false);
  // Whether the calls to history/character were authorized (eg did they access a Character they can't talk to)
  const [authorized, setAuthorized] = useState(true);

  const [swiper, setSwiper] = useState<SwiperClass | null>(null);

  const navigate = useNavigate();
  const proactiveTimer = useRef<NodeJS.Timeout | null | undefined>(null);
  const MAX_PARTICIPANTS_IN_HEADER = 7;
  const MAX_WIDTH = '1224px';

  useEffect(() => {
    ttsAudio = new Audio(initialTtsAudio);
    // Hack to ensure safari plays sounds later
    (window as any).audioContext =
      (window as any).audioContext || (window as any).webkitAudioContext;
    if (window.AudioContext) {
      (window as any).audioContext = new window.AudioContext();

      const source = (window as any).audioContext.createMediaElementSource(
        ttsAudio,
      );
      const gainNode = (window as any).audioContext.createGain();
      gainNode.gain.value = 2;
      source.connect(gainNode);
      gainNode.connect((window as any).audioContext.destination);
    }
  }, []);

  useEffect(() => {
    if (charTyping) {
      scrollToBottom();
    }
  }, [charTyping]);

  useEffect(() => {
    if (generatingCandidateIndex > 0 && generatingCandidateIndex < maxSwipes) {
      generateCandidate();
    } else {
      setGeneratingCandidateIndex(0);
      setGeneratingCandidate(false);
    }
  }, [generatingCandidateIndex]);

  const toggleCharacterVoice = () => {
    if (!characterVoiceEnabled) {
      ReactGA.event({ category: 'User', action: 'Enabled Character Voice' });
      ttsAudio = new Audio(initialTtsAudio);
      ttsAudio.play();
    }

    setcharacterVoiceEnabled(!characterVoiceEnabled);
  };

  const maxSwipes = useMemo(
    () =>
      isAnonymousUser(user)
        ? Constants.MAX_SWIPES_ANONYMOUS
        : Constants.MAX_SWIPES,
    [user],
  );

  const showAvatar = (name: string, size: number, avatar_file_name: string) => {
    return (
      <InitialAvatar
        name={name || ''}
        size={size}
        avatarFileName={
          avatar_file_name
            ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${avatar_file_name}`
            : ''
        }
      />
    );
  };

  function get_boolean_param(urlParams: URLSearchParams, field: string) {
    const val = urlParams.get(field);
    if (val) {
      return val === 'true';
    } else {
      return null;
    }
  }

  function get_int_param(
    urlParams: URLSearchParams,
    field: string,
    default_value: number | null = null,
  ) {
    const val = urlParams.get(field);
    if (val) {
      return parseInt(val);
    } else {
      return default_value;
    }
  }

  const getCharTurnWaitMilliSecs = () => {
    return 5000 + Math.floor(Math.random() * 1000);
  };

  const getProactiveTimer = (initial = false) => {
    if (!isRoom()) {
      return; // disable proactive for non room histories.
    }
    return setTimeout(
      () => setIsProactive(true),
      initial
        ? Constants.INITIAL_ROOM_STREAM_DELAY_MS
        : getCharTurnWaitMilliSecs(),
    );
  };

  useEffect(() => {
    if (numStreamedMessages >= Constants.MESSAGES_BEFORE_PAUSING && !isPaused) {
      setIsPaused(true);
      setNumStreamedMessages(0);
    }
  }, [numStreamedMessages, isPaused]);

  useEffect(() => {
    if (!isPaused) {
      resetProactiveTimer();
      setTranslateTapToggle(false);
    }
  }, [isPaused]);

  useEffect(() => {
    if (isProactive && !isPaused) {
      handleSubmit();
    }
  }, [isProactive, isPaused]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setTranslateCandidates(
      get_boolean_param(urlParams, 'translate_candidates'),
    );
    setTranslateTap(get_boolean_param(urlParams, 'translate_tap'));
    setInsertBeginning(urlParams.get('insert_beginning'));
    setOverrideModelServerAddress(urlParams.get('model_server_address'));
    setOverrideHistorySet(urlParams.get('override_history_set'));
    setOverridePrefix(urlParams.get('override_prefix'));
    setOverrideRank(urlParams.get('override_rank'));
    setRankCandidates(get_boolean_param(urlParams, 'rank_candidates'));
    setFilterCandidates(get_boolean_param(urlParams, 'filter_candidates'));
    setPrefixLimit(urlParams.get('prefix_limit'));
    setPrefixTokenLimit(urlParams.get('prefix_token_limit'));
    setLivetuneCoeff(urlParams.get('livetune_coeff'));
    setStreamParams(urlParams.get('stream_params'));
    setStreamEveryNSteps(
      get_int_param(
        urlParams,
        'stream_every_n_steps',
        defaultStreamEveryNSteps,
      ),
    );
    setStreamChunksToPad(
      get_int_param(urlParams, 'chunks_to_pad', defaultStreamChunksToPad),
    );
    setStreamAnimationChunkSize(
      get_int_param(
        urlParams,
        'stream_animation_chunk_size',
        defaultAnimationChunkSize,
      ),
    );
    setStreamAnimationChunkDelay(
      get_int_param(
        urlParams,
        'stream_animation_chunk_delay',
        defaultAnimationChunkDelay,
      ),
    );
    setEnableTextToImage(get_boolean_param(urlParams, 'enable_tti'));

    const timeoutParam = urlParams.get('timeout_secs');
    let timeout = null;
    if (timeoutParam) {
      timeout = parseFloat(timeoutParam);
    }
    if (timeout) {
      setChatTimeout(timeout);
      axios.defaults.timeout = timeout * 1000;
    } else {
      axios.defaults.timeout = Constants.DEFAULT_TIMEOUT;
    }
    const charId = urlParams.get('char');
    if (charId) {
      setCharacterId(charId);
    }
    const exHistId = urlParams.get('hist');
    if (exHistId) {
      setExternalHistoryId(exHistId);
    }

    return () => {
      queryClient.invalidateQueries(['recent-characters']);
    };
  }, []);

  const resetProactiveTimer = () => {
    if (proactiveTimer.current) {
      //#NEWCODE
      clearTimeout(proactiveTimer.current);
    }
    setIsProactive(false);
    proactiveTimer.current = getProactiveTimer();
  };

  useEffect(() => {
    if (charData?.songs && charData?.songs[0] && !songPlayer) {
      // TODO set volume
      songPlayer = new Tone.Player(
        `${Constants.CDN_URL}/static/music/${charData.songs[0].file_name}`,
      ).toDestination();

      // Play as soon as the buffer is loaded.
      songPlayer.autostart = true;
    }

    if (isRoom() && history?.participants) {
      const roomTitle = `My chat with ${history.participants
        .filter((p) => !p.is_human)
        .map((p) => p.name)
        .join(', ')}`;
      setPostTitle(roomTitle);
    } else {
      setPostTitle(`My chat with ${charData?.name}`);
    }
  }, [charData, history]);

  useEffect(() => {
    const handleResize = () => {
      // TODO: kishan account for Android separately
      setChatHeight(window.innerHeight - (Constants.NATIVE ? 203 : 143));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    altIndexRef.current = altIndex;
  }, [altIndex]);

  useEffect(() => {
    abortPrevChatRequestRef.current = abortPrevChatRequest;
  }, [abortPrevChatRequest]);

  useEffect(() => {
    generatingCandidateRef.current = generatingCandidate;
  }, [generatingCandidate]);

  useEffect(() => {
    primaryCandidateRef.current = primaryCandidate;
  }, [primaryCandidate]);

  useEffect(() => {
    seenCandidateIdsRef.current = seenCandidateIds;
  }, [seenCandidateIds]);

  const updatePrimaryToGeneratedCandidate = (candidate: ChatMessage) => {
    // Mark this message as the seen IF the user is still looking at that message
    if (altIndexRef.current === generatingCandidateIndex) {
      markCandidateAsSeen(candidate);
    }

    setGeneratingCandidateIndex(0);
    setGeneratingCandidate(false);
  };

  // extract just primary messages
  const viewMsgsToDefintion = () => {
    let definition = '';
    // only produce a change to definition if something beyond greeting was said
    // only valid in creation mode
    if (viewMsgs.length > 2 || (charData?.greeting && viewMsgs.length > 1)) {
      for (let i = 0; i < viewMsgs.length; i++) {
        // the last item we need to pick baced on swipable view in front
        const msg = viewMsgs[i];
        let name = '';
        if (props.mode === 'creation') {
          name = msg.isCharTurn
            ? '{{char}}'
            : '{{random_user_' + props.randomUser + '}}';
        } else {
          name = msg.isCharTurn
            ? msg.srcChar?.participant.name ?? ''
            : user?.name ?? '';
        }
        const index = i === viewMsgs.length - 1 ? altIndex : 0;
        definition =
          definition + name + ': ' + msg.candidates[index].text + '\n';
      }
      definition += 'END_OF_DIALOG\n\n';
    }

    return definition;
  };

  axios.defaults.baseURL = getServerUrl();

  const messagesListBottom = useRef<HTMLDivElement>(null);
  const inputFocus = getFocusableInput();

  const forceUpdate = () => {
    setDummyCounter(dummyCounter + 1);
  };

  const saveMessages = () => {
    // if no new messages have been created, just move on
    if (props.onFinished) {
      props.onFinished(viewMsgsToDefintion());
    }

    // make a new chat so that when creator returns to chat, it'll be a new one (rather than example)
    // TODO: consider a flag in model or on messages as "training"
    createNewHistory();
  };

  const [micModalIsOpen, setMicModalIsOpen] = React.useState(false);

  const openMicModal = () => {
    setMicModalIsOpen(true);
  };

  const closeMicModal = () => {
    setMicModalIsOpen(false);
    recognition?.start();
  };

  const [postCreationModalIsOpen, setPostCreationModalIsOpen] =
    React.useState(false);

  const openPostCreationModal = () => {
    setPostCreationModalIsOpen(true);
  };

  const closePostCreationModal = (stopSelectingPostStartEnd = true) => {
    setPostCreationModalIsOpen(false);
    if (stopSelectingPostStartEnd) {
      setIsSelectingPostStartEnd(false);
    }
  };

  const handlePostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostTitle(event.target.value);
  };

  const isInBetweenHoverPostStartEnd = (i: number) => {
    return (
      i == hoverPostStartMessageIndex ||
      i == lastHoverIndex ||
      (hoverPostStartMessageIndex != null &&
        lastHoverIndex != null &&
        // Either start < i < end or end < i < start.
        // Supporting both cases makes other logic easier.
        ((i > hoverPostStartMessageIndex && i < lastHoverIndex) ||
          (i < hoverPostStartMessageIndex && i > lastHoverIndex)))
    );
  };

  const startSelectingPostStartEnd = () => {
    setHoverPostStartMessageIndex(null);
    setLastHoverIndex(null);

    setIsSelectingPostStartEnd(true);

    closePostCreationModal(false);
  };

  const hoverMessageForPostStartAndEnd = (i: number) => {
    if (!isSelectingPostStartEnd) {
      return;
    }
    setLastHoverIndex(i);
  };

  const clickMessage = (i: number) => {
    clickMessageForPostStartAndEnd(i);
    clickMessageForDelete(i);
  };

  const removeDeletedMessagesFromViewMsgs = (deleteMessagesIds: number[]) => {
    const updatedViewMsgs = [...viewMsgs];
    for (let i = 0; i < updatedViewMsgs.length; i++) {
      for (let j = 0; j < updatedViewMsgs[i].candidates.length; j++) {
        const id = updatedViewMsgs[i].candidates[j].id;
        if (
          id !== undefined && //#NOTE NEW CODE
          deleteMessagesIds.includes(id)
        ) {
          updatedViewMsgs[i].candidates[j].deleted = true;
        }
      }
    }

    setViewMsgs(updatedViewMsgs);
  };

  const generateCandidate = async () => {
    sendChatStreaming(isProactive, true);
  };

  const clickMessageForDelete = (i: number) => {
    if (!deleteMessageMode) {
      return;
    }

    // First message to delete must be a user message to avoid users from being able to send multiple messages
    if (viewMsgs[i].isCharTurn) {
      return;
    }

    // Handle case where user unchecks message for deletion
    const minId = Math.min(...deleteMessagesIds);
    if (viewMsgs[i].candidates.map((c) => c.id).includes(minId)) {
      setDeleteMessagesIds([]);
      return;
    }

    // Select current messages + following messages
    let selectedIds: number[] = [];
    for (let idx = i; idx < viewMsgs.length; idx++) {
      selectedIds = [
        ...selectedIds,
        ...(viewMsgs[idx].candidates
          .map((c) => c.id)
          .filter((id) => id !== undefined) as number[]),
      ];
    }

    setDeleteMessagesIds(selectedIds);
  };

  const clickMessageForPostStartAndEnd = (i: number) => {
    if (!isSelectingPostStartEnd) {
      return;
    }
    if (hoverPostStartMessageIndex == null) {
      setHoverPostStartMessageIndex(i);
    } else if (i == hoverPostStartMessageIndex) {
      // Unselect the start.
      setHoverPostStartMessageIndex(null);
    } else {
      const a = Math.min(i, hoverPostStartMessageIndex);
      const b = Math.max(i, hoverPostStartMessageIndex);
      setPostStartMessageIndex(a);
      setPostEndMessageIndex(b);
      setHoverPostStartMessageIndex(null);
      openPostCreationModal();
    }
  };

  useEffect(() => {
    if (postTitle) {
      setPostButtonEnabled(true);
    } else {
      setPostButtonEnabled(false);
    }
  }, [postTitle]);

  // ComponentWillMount handler.
  useEffect(() => {
    setUser(props.user);
    setupSpeechRecognition();
  }, []);

  useEffect(() => {
    setEnableTextToImage(true);
  }, [user]);

  // ComponnetWillUnmount handler.
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
      recognition = null;
      speechMatchBeingProcessed = false;
      if (ttsAudio) {
        ttsAudio.pause();
      }
      //#NOTE ttsAudio is not nullable
      //   ttsAudio = null;
      if (songPlayer) {
        songPlayer.stop();
      }
      songPlayer = null;
    };
  }, []);

  useEffect(() => {
    if (user?.user?.id && characterId) {
      loadCharacterInfo(characterId);
    }
  }, [user]);

  useEffect(() => {
    if (recognition && asrEnabled && speechMatchBeingProcessed) {
      recognition.stop();
      handleSubmit();
    }
  }, [text]);

  useEffect(() => {
    if (!recognition) {
      //console.log("RECOGNITION IS NULL in useEffect asrEnabled")
      return;
    }
    if (asrEnabled) {
      recognition.onend = function () {
        if (!recognition) {
          //console.log("RECOGNITION IS NULL in onend");
          return;
        }
        if (speechMatchBeingProcessed) {
          //console.log("speech match being processed - won't restart");
          return;
        }
        //console.log("restarting ASR");
        recognition.start();
      };
      const asrEnableAttempted = localStorage.getItem('asrEnableAttempted');
      if (!asrEnableAttempted) {
        localStorage.setItem('asrEnableAttempted', 'true');
        openMicModal();
      } else {
        recognition.start();
      }
    } else {
      recognition.onend = null;
      recognition.stop();
    }
  }, [asrEnabled]);

  const loadCharacterInfo = async (external_id: string) => {
    const characterBelongsToUser = props.userCharacters?.find(
      (c) => c.external_id === external_id,
    );

    let response;
    if (characterBelongsToUser) {
      response = await axios.post<CharacterInfoResponse>(
        '/chat/character/info/',
        {
          external_id: external_id,
        },
        getHeaders(),
      );
    } else {
      response = await axios.get<CharacterInfoResponse>(
        `/chat/character/info-cached/${external_id}/`,
        getHeaders(),
      );
    }
    if (response?.data?.status === 'OK') {
      setCharData(response.data.character);
    } else {
      setAuthorized(false);
      setLoading(false);
    }
  };

  // load Character Data first, before continue/create history
  useEffect(() => {
    if (loading && charData?.external_id) {
      if (props.mode === 'creation') {
        createNewHistory();
      } else {
        continueHistory();
      }
    }
    if (charData) {
      if (charData.avatar_file_name) {
        setLinkPreviewImage(
          `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${charData.avatar_file_name}`,
        );
      }
      if (charData?.participant__name) {
        setPageSubtitle(charData.participant__name);
      }
      if (charData.title) {
        setPageDescription(charData.title);
      }
      if (charData?.usage === 'view') {
        setViewOnly(true);
        alert(
          'This Character has either been set Private by the creator or is now in moderation. If you feel this in error, consult the FAQ for how to submit an appeal.\n\nYou will not be able to interact with this Character.',
        );
      }
    }
  }, [charData]);

  useEffect(() => {
    // If characterId is set or externalHistoryId is not set, then we don't need to
    // force load histories here.
    if (characterId || !externalHistoryId) {
      return;
    }
    continueHistory();
  }, [externalHistoryId]);

  useEffect(() => {
    if (devToolsEnabled) {
      setAllViewMsgCandsToNegative();
    }
  }, [devToolsEnabled]);

  useEffect(() => {
    if (viewMsgs.length > 0) {
      scrollToBottom();
      if (viewMsgs.length > lastUpdateLength) {
        updateDefinitionLength();
      }
    }
  }, [viewMsgs]);

  const continueHistory = async () => {
    setWaiting(true);
    return await axios
      .post<ChatHistoryCreateContinueResponse>(
        '/chat/history/continue/',
        {
          character_external_id: charData?.external_id,
          history_external_id: externalHistoryId,
        },
        getHeaders(),
      )
      .then((response) => {
        /* check if there was already a history, if not, create a new one */
        if (response.data?.external_id) {
          setHistory(response.data);
          setHasHistories(true);
          setWaiting(false);
        } else {
          setHasHistories(false);
          createNewHistory();
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        if (user?.user?.is_staff) {
          console.error(err);
        }
        setWaiting(false);
      })
      .finally(() => {
        inputFocus.focus();
      });
  };

  const createNewHistory = async () => {
    if (charData?.external_id) {
      setWaiting(true);
      return await axios
        .post<ChatHistoryCreateContinueResponse>(
          '/chat/history/create/',
          {
            character_external_id: charData.external_id,
            override_history_set: overrideHistorySet,
          },
          getHeaders(),
        )
        .then((response) => {
          if (response?.data.status == 'OK') {
            setViewMsgs([]);
            setHistory({ ...response.data, isNewHistory: true });
            setCurrentLength(0);
            setAltIndex(0);
            if (response.data.speech) {
              restartMusic();
              // playTTS(response.data.speech);
            }
          } else {
            setAuthorized(false);
            setLoading(false);
          }
        })
        .catch((err) => {
          props.handleServerError(err);
          setWaiting(false);
        })
        .finally(() => {
          inputFocus.focus();
        });
    }
  };

  // on some devices, do this last to scroll to right position after everything in place
  useEffect(() => {
    scrollToBottom();
  }, [loading]);

  useEffect(() => {
    if (loading && history?.external_id) {
      loadMessages();
      proactiveTimer.current = getProactiveTimer(true);
    }
  }, [history]);

  /* filter/convert from messages returned to viewMsgs format.
     If clean is true, replaces the current viewMsgs. Otherwise,
     preserves the current messages and prepends the new messages before
  */
  const setupMessages = (msgs: Message[] | undefined, clean: boolean) => {
    const new_viewMsgs: ChatViewMessage[] = [];
    if (!msgs) {
      return;
    }

    for (let i = 0; i < msgs.length; i++) {
      const msg = msgs[i];
      if (!msg.is_alternative) {
        const newMsg: ChatViewMessage = {
          isCharTurn: !msg.src__is_human,
          candidates: [
            {
              id: msg.id,
              text: msg.text,
              image_rel_path: msg.image_rel_path,
              image_prompt_text: msg.image_prompt_text,
              responsible_user__username: msg.responsible_user__username,
              deleted: msg.deleted,
              badge_reason: msg?.badge_reason,
              username: msg?.src__user__username,
            },
          ],
          // add to total length
        };
        if (!msg.src__is_human) {
          newMsg.srcChar = {
            participant: { name: msg.src__name },
            avatar_file_name: msg.src_char.avatar_file_name,
          };
        }
        new_viewMsgs.push(newMsg);
      } else {
        // Handle the alternatives bro!
        // The alternative messages all come from the last message.
        // So we just add it to the candidates of the last message.
        const last_viewMsg = new_viewMsgs[new_viewMsgs.length - 1];
        last_viewMsg.candidates.push({
          id: msg.id,
          text: msg.text,
          image_rel_path: msg.image_rel_path,
          image_prompt_text: msg.image_prompt_text,
          responsible_user__username: msg.responsible_user__username,
          deleted: msg.deleted,
        });
      }
    }
    // Add dummy message
    new_viewMsgs[new_viewMsgs.length - 1]?.candidates.push({
      text: '...',
      debug_info: {},
    });

    if (clean) {
      setViewMsgs(new_viewMsgs);
    } else {
      setViewMsgs([...new_viewMsgs, ...viewMsgs]);
    }
  };

  const setMsgsFromResponseData = (
    messages: Message[] | undefined,
    hasMore: boolean | undefined,
    nextPage: number,
    clean: boolean,
  ) => {
    setJustPaginatedUpwards(true);
    setupMessages(messages, clean);
    setLoading(false);
    setWaiting(false);
    setChatPageNum(nextPage);
    setChatHasMore(hasMore);
  };

  const loadMessages = async (clean = false) => {
    if (history && history.isNewHistory) {
      setMsgsFromResponseData(
        history.messages,
        history.has_more,
        history.next_page,
        clean,
      );
      inputFocus.focus();
      return;
    }
    const pageNumField =
      chatPageNum && !clean ? `&page_num=${chatPageNum}` : '';
    axios
      .get<ChatHistoryResponse>(
        `/chat/history/msgs/user/?history_external_id=${history?.external_id}${pageNumField}`,
        getHeaders(),
      )
      .then((response) => {
        setMsgsFromResponseData(
          response.data.messages,
          response.data.has_more,
          response.data.next_page,
          clean,
        );
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      })
      .finally(() => {
        inputFocus.focus();
      });
  };

  const getHeaders = () => {
    return {
      headers: {
        Authorization: 'Token ' + props.token,
        'Content-Type': 'application/json',
      },
    };
  };

  /* Makes annotation buttons disappear from all msgs. */
  const clearAnnotatables = () => {
    for (const viewMsg of viewMsgs) {
      for (const candidate of viewMsg.candidates) {
        candidate.annotatable = false;
      }
    }
  };

  const updateDefinitionLength = () => {
    const newDefinition = viewMsgsToDefintion();
    setCurrentLength(newDefinition.length);
    setLastUpdateLength(viewMsgs.length);
  };

  /* Update current viewMsgs to account for
    - locking the swiped selection
    - inserting the user response
    */
  const updateViewMsgs = async (text: string) => {
    // swiped, need to lock in current as final
    const userMsg: ChatViewMessage = {
      isCharTurn: false,
      candidates: [
        {
          text: text,
          image_rel_path: userImagePath,
          badge_reason:
            userImageDescriptionType === 'human'
              ? 'image_described_by_human'
              : '',
          username: user?.user?.username || 'guest',
        },
      ],
    };

    if (viewMsgs.length > 1 && altIndex > 0) {
      const newPrimaryCandidate =
        viewMsgs[viewMsgs.length - 1].candidates[altIndex];
      setPrimaryCandidate(newPrimaryCandidate);
    }

    const appendUserMsg = text || userImagePath;

    if (altIndex > 0) {
      const oldViewMsgs = viewMsgs;
      const vmsg = oldViewMsgs.pop();
      const front = [];

      if (!vmsg) {
        return;
      }

      front.push(vmsg.candidates[altIndex]);
      for (let i = 0; i < vmsg.candidates.length; i++) {
        if (i !== altIndex) {
          front.push(vmsg.candidates[i]);
        }
      }

      setAltIndex(0);
      vmsg.candidates = front;
      // also add user text if they entered some
      if (appendUserMsg) {
        setViewMsgs(() => [...oldViewMsgs, vmsg, userMsg]);
        // no user text, just lock in primary change
      } else {
        setViewMsgs(() => [...oldViewMsgs, vmsg]);
      }

      // no swipe to change, just add user text if they entered some
    } else if (appendUserMsg) {
      setViewMsgs((oldArray) => [...oldArray, userMsg]);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit()) {
      return;
    }

    resetTextInputHeight();
    clearAnnotatables();
    if (user?.user?.is_staff) {
      console.time('character_server_response');
    }

    if (isRoom()) {
      resetProactiveTimer();
    }

    if (isRoom() && text) {
      setNumStreamedMessages(0);
    }

    setWaiting(true);
    updateViewMsgs(text).then(() => {
      sendChatStreaming(isProactive);
    });

    setText('');
    setUserImagePath('');
    setUserImageOriginType('');
    setUserImageDescription('');
    setUserImageDescriptionType('');

    if (props.mode === 'creation') {
      updateDefinitionLength();
    }
  };

  const setupSpeechRecognition = () => {
    //#NOTE terrible hack

    if (
      !(window as any).SpeechRecognition &&
      !(window as any).webkitSpeechRecognition
    ) {
      // Speech recognition not supported (e.g., in Firefox).
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRecognition() as SpeechRecognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = function (event: SpeechRecognitionEvent) {
      speechMatchBeingProcessed = true;
      if (ttsAudio) {
        ttsAudio.pause();
      }
      setText(event.results[0][0].transcript);
    };
    //#NOTE unused
    // recognition.onspeechstart = function (event) {
    //   //console.log("Speech has been detected");
    // };
  };

  const handleToggleAsr = () => {
    setAsrEnabled(!asrEnabled);
  };

  const handleNameClick = () => {
    setTitleExpanded(!titleExpanded);
  };

  const playTTS = async (
    audioString: string,
    startRecognitionOnAudioEnd = false,
  ) => {
    if (!characterVoiceEnabled) {
      return;
    }
    setMusicVolumeToLow();
    if (ttsAudio) {
      ttsAudio.pause();
    }

    ttsAudio.src = 'data:audio/wav;base64,' + audioString;

    //#NOTE WHAT DID THIS DO?
    let resolveAudioEnded: any = null;
    const audioEnded = new Promise((resolve) => {
      resolveAudioEnded = resolve;
    });
    ttsAudio.addEventListener(
      'ended',
      () => {
        resolveAudioEnded();
        setMusicVolumeToNormal();
        if (startRecognitionOnAudioEnd && recognition && asrEnabled) {
          speechMatchBeingProcessed = false;
          recognition.start();
        }
      },
      false,
    );
    ttsAudio.play();
    return audioEnded;
  };

  //#NOTE UNUSED
  //   const playAsyncTTS = async (
  //     resolveAudioEnded,
  //     audioString,
  //     startRecognitionOnAudioEnd = false,
  //   ) => {
  //     if (!characterVoiceEnabled) {
  //       return;
  //     }
  //     setMusicVolumeToLow();

  //     ttsAudio.src = 'data:audio/wav;base64,' + audioString;

  //     ttsAudio.addEventListener(
  //       'ended',
  //       () => {
  //         resolveAudioEnded();
  //         setMusicVolumeToNormal();
  //         if (startRecognitionOnAudioEnd && recognition && asrEnabled) {
  //           speechMatchBeingProcessed = false;
  //           recognition.start();
  //         }
  //       },
  //       false,
  //     );
  //     ttsAudio.play();
  //   };

  const restartMusic = () => {
    // TODO
  };

  const setMusicVolumeToLow = () => {
    // TODO
  };

  const setMusicVolumeToNormal = () => {
    // TODO
  };

  const updatePrimary = useCallback(
    async (candidate: ChatMessageCandidates) => {
      if (!candidate || candidate.id === -1 || !candidate.id) {
        return;
      }

      setNegativeLabels(candidate);
      await axios
        .post(
          '/chat/msg/update/primary/',
          JSONbigNative.stringify({
            message_id: candidate.id,
            reason: 'SWIPE',
          }),
          getHeaders(),
        )
        //#UNUSED RESPONSE
        //   .then((response) => {})

        .catch((err) => {
          props.handleServerError(err);
          return false;
        });
    },
    [],
  );

  const updateSwiperHeight = (swiper: SwiperClass) => {
    if (swiper) {
      try {
        swiper.updateAutoHeight(10);
        scrollToBottom();
      } catch {
        if (Constants.IS_LOCAL) {
          console.log('failed to update swiper height');
        }
      }
    }
  };

  const debouncedUpdateSwiperHeight = useRef(debounce(updateSwiperHeight, 200));

  const resetTextInputHeight = () => {
    const textArea = document.getElementById('user-input');
    if (textArea) {
      textArea.style.height = '36px';
      return textArea;
    }
  };

  /* Annotable candidates have annotation buttons (e.g., like, dislike). */
  const markAsAnnotatable = (candidates: ChatMessageCandidates[]) => {
    for (const candidate of candidates) {
      candidate.annotatable = true;
    }
  };

  const handleGenerationCompleted = () => {
    speechMatchBeingProcessed = false;
    recognition?.start();
  };

  const cleanupAfterChatTurn = () => {
    // If either the user or the char turn timer triggers a new submission, then we
    // reset the char turn timer.
    resetProactiveTimer();
    setWaiting(false);
    setTranslateTapToggle(false);
  };

  const allCandidatesHaveIds = (candidates: ChatMessageCandidates[]) => {
    if (!candidates) {
      return false;
    }
    for (const candidate of candidates) {
      if (!candidate.id || candidate.id <= 0) {
        return false;
      }
    }
    return true;
  };

  const displayAuthorizationError = () => {
    if (isRoom()) {
      alert(
        'All Characters have either been set Private by the creator(s) or are now in moderation. If you feel this in error, consult the FAQ for how to submit an appeal.',
      );
    } else {
      alert(
        'This Character has either been set Private by the creator or is now in moderation. If you feel this in error, consult the FAQ for how to submit an appeal.',
      );
    }
  };

  const populateMissingCandidatesIds = (
    candidates: ChatMessageCandidates[],
    fake_id: number,
  ) => {
    for (const candidate of candidates) {
      if (!candidate.id) {
        candidate.id = fake_id;
      }
    }
  };

  const getLastMessageId = () => {
    for (let j = viewMsgs.length - 2; j >= 0; j--) {
      if (!viewMsgs[j].candidates[0].deleted) {
        return viewMsgs[j].candidates[0].id;
      }
    }
  };

  const abortCandidateChatRequest = () => {
    if (generatingCandidateIndex > 0) {
      setAbortPrevChatRequest(true);
    }
  };

  const shouldAbortChatRequest = (generatingCandidates: boolean) =>
    abortPrevChatRequestRef.current &&
    generatingCandidateRef.current &&
    generatingCandidates;

  // add the user message now
  const sendChatStreaming = async (
    isProactive: boolean,
    generatingCandidates = false,
  ) => {
    if (generatingCandidates) {
      setGeneratingCandidate(true);
    }

    // If chat streaming was called while a previous request is still in progress, abort the previous one
    if (generatingCandidateRef.current && !generatingCandidates) {
      abortCandidateChatRequest();
    }

    const rankingMethod = 'random'; // can be "random" or "classifier"n
    const body = JSONbigNative.stringify({
      history_external_id: history?.external_id,
      character_external_id: isRoom() ? '' : charData?.external_id,
      text: isProactive ? null : text,
      tgt: getCharParticipantUserName(),
      ranking_method: rankingMethod,
      staging: staging,
      model_server_address: overrideModelServerAddress,
      override_prefix: overridePrefix,
      override_rank: overrideRank,
      rank_candidates: rankCandidates,
      filter_candidates: filterCandidates,
      prefix_limit: prefixLimit,
      prefix_token_limit: prefixTokenLimit,
      livetune_coeff: livetuneCoeff,
      stream_params: streamParams,
      enable_tti: enableTextToImage,
      initial_timeout: chatTimeout,
      insert_beginning: insertBeginning,
      translate_candidates: translateCandidates,
      stream_every_n_steps: streamEveryNSteps,
      chunks_to_pad: streamChunksToPad,
      is_proactive: isProactive,
      image_rel_path: userImagePath,
      image_description: userImageDescription,
      image_description_type: userImageDescriptionType,
      image_origin_type: userImageOriginType,
      voice_enabled: characterVoiceEnabled,
      parent_msg_id: generatingCandidates ? getLastMessageId() : null,
      primary_msg_id: !generatingCandidates
        ? primaryCandidateRef?.current?.id
        : null,
      seen_msg_ids: !generatingCandidates ? seenCandidateIdsRef?.current : [],
    });

    const t0 = performance.now();
    scrollToBottom();

    if (!generatingCandidates) {
      setCharTyping(true);
      setCharMessageFullyRendered(false);
      setPrimaryCandidate(null);
      setSeenCandidateIds([]);
    }

    const url = axios.defaults.baseURL + '/chat/streaming/';
    //#NOTE WOULD BE NICE TO HAVE A TYPE HERE
    let data: any = null;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Token ' + props.token,
          'content-type': 'application/json',
        },
        body: body,
      });

      setNumStreamedMessages((prev) => prev + 1);
      const reader = response?.body?.getReader();

      let decoded_value = '';
      let first_iteration = true;

      const chunk_size = streamAnimationChunkSize || 128;
      const chunk_delay = streamAnimationChunkDelay || 0;
      const max_iterations = 1000000;
      let iteration = 0;
      let letter_count = 0;
      let audioEnded = null;

      let streamingChatError = false;

      while (true && !!reader) {
        // Abort previous request generating candidate request if a new request was made
        if (shouldAbortChatRequest(generatingCandidates)) {
          // console.log('ABORTING CHAT');
          break;
        }

        // done  - true if the stream has already given you all its data.
        // value - some data. Always undefined when done is true.
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        decoded_value += new TextDecoder().decode(value);

        if (!user?.user?.is_staff && first_iteration) {
          // Check whether the user isn't allowed to chat.
          // Note(irwan): Couldn't get it to work outside of this while loop unfortunately.
          try {
            const first_parsed_value = JSONbigNative.parse(decoded_value);
            if (first_parsed_value?.force_login) {
              // Note(irwan): This should be refactored as it is actually confusing.
              // Lazy users are not authenticated on the front-end (isAuthenticated is false)
              // so they can't navigate to signup. Instead they are shown the login modal.
              navigate(`/signup${buildUrlParams({ force_login: true })}`);
            }
          } catch {
            // try only works when the user is a lazy user + user has maxed out messages quota
            // otherwise this will crash and silently fail
          }
        }
        first_iteration = false;
        let chunk_count = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (++iteration > max_iterations) {
            throw 'Too many iterations';
          }
          const nl_index = decoded_value.indexOf('\n');
          if (nl_index === -1) {
            break;
          }
          const json_string = decoded_value.substring(0, nl_index);
          const dt = performance.now() - t0;

          decoded_value = decoded_value.substring(nl_index + 1);
          data = JSONbigNative.parse(json_string);

          if (data.abort) {
            // If you change the following condition, please also change the duplicated
            // condition below.
            if (
              recognition &&
              asrEnabled &&
              (!data.speech_enabled || (data.speech_enabled && !data.speech))
            ) {
              handleGenerationCompleted();
            }
            cleanupAfterChatTurn();
            setCharTyping(false);
            setCharMessageFullyRendered(true);
            if (data?.error === 'unauthorized') {
              displayAuthorizationError();
              setIsPaused(true);
              setViewOnly(true);
            }

            if (data?.error) {
              streamingChatError = data.error;
              break;
            }

            throw new Error('data.abort');
          }

          if (devToolsEnabled) {
            console.log(
              `Received a json chunk from character server in ${dt}:`,
            );
            console.log(data);
          }
          // Populate candidate missing IDs with fake negative IDs,
          // to help in debugging the problem in logs.
          populateMissingCandidatesIds(data.replies, -1 - chunk_count);
          markAsAnnotatable(data.replies);
          setCharTyping(false);

          const full_reply_text = data.replies[0].text;

          if (data.speech_enabled && data.speech) {
            if (audioEnded) {
              await audioEnded;
            }
            audioEnded = playTTS(data.speech, data.is_final_chunk);
          }

          if (
            data.is_final_chunk &&
            recognition &&
            asrEnabled &&
            (!data.speech_enabled || (data.speech_enabled && !data.speech))
          ) {
            handleGenerationCompleted();
          }

          // Animation of the reply text
          while (letter_count < full_reply_text.length) {
            if (letter_count === 0) {
              if (user?.user?.is_staff) {
                console.timeEnd('character_server_response');
              }
              if (data.prefix) {
                setPrefix(data.prefix);
              }

              if (generatingCandidates) {
                // If we are generating candidates, these should get appended to the last character message
                updateLatestCandidate(data.replies[0]);
                // If we are generating candidates, these should get appended to the last character message
              } else {
                setViewMsgs((oldArray) =>
                  oldArray.concat([
                    {
                      srcChar: data.src_char,
                      isCharTurn: true,
                      candidates: data.replies,
                    },
                  ]),
                );
              }
            }
            letter_count += chunk_size;
            if (letter_count > full_reply_text.length) {
              letter_count = full_reply_text.length;
            }

            const reply_text = full_reply_text.substring(0, letter_count);

            debouncedUpdateSwiperHeight.current(swiper);

            if (generatingCandidates) {
              // If we are generating candidates, these should get appended to the last character message
              setViewMsgs((oldArray) => {
                const updatedViewMsgs = [...oldArray];
                const endIdx = updatedViewMsgs.length - 1;

                if (
                  updatedViewMsgs[endIdx]?.candidates[generatingCandidateIndex]
                ) {
                  // Animate the text of the candidate being generated
                  updatedViewMsgs[endIdx].candidates[
                    generatingCandidateIndex
                  ].text = reply_text;
                }

                return updatedViewMsgs;
              });
            } else {
              data.replies[0].text = reply_text;
              setViewMsgs((oldArray) =>
                oldArray.slice(0, -1).concat([
                  {
                    srcChar: data.src_char,
                    isCharTurn: true,
                    candidates: data.replies,
                  },
                ]),
              );
            }

            chunk_count += 1;

            await new Promise((resolve) => setTimeout(resolve, chunk_delay));
          }
          if (data.is_final_chunk) {
            setCharMessageFullyRendered(true);

            if (!generatingCandidates) {
              // If you weren't generating candidates and only received 1 message (responses got filtered) then you should kick off candidate generation
              // Don't do this for the first message said by a character since its expected to only have 1 reply
              if (
                data.replies.length === 1 &&
                !data.replies[0].responsible_user__username
              ) {
                setGeneratingCandidateIndex(1);
              }
            }
          }
        }
      }

      if (streamingChatError) {
        setAbortPrevChatRequest(true);
        toast.error(streamingChatError || 'Chat Error - Please try again');
        cleanupAfterChatTurn();
        setCharTyping(false);
        setWaiting(true);
        setCharMessageFullyRendered(true);
        loadMessages(true);
        return;
      }

      if (shouldAbortChatRequest(generatingCandidates)) {
        // console.log('ABORTING REST OF CHAT STREAMING FXN (AFTER LOOP)');
        setAbortPrevChatRequest(false);
        setGeneratingCandidate(false);
        setGeneratingCandidateIndex(0);
        return;
      }

      if (generatingCandidates) {
        updatePrimaryToGeneratedCandidate(data.replies[0]);
        updateLatestCandidate(data.replies[0]);
        createDummyMessageForNewCandidate();
      } else {
        // One more update is needed to make sure the candidates are set to the final value.
        // This is needed to cover the case when the alternative candidates contain more chunks than
        // the primary candidate. If this happens, the animation above is skipped, and the candidates
        // are never updated to the final value in the loop.
        setViewMsgs((oldArray) => {
          let updatedMsgs = [...oldArray];
          if (generatingCandidates) {
            const updatedMsgs = [...oldArray];
            const endIdx = updatedMsgs.length - 1;
            updatedMsgs[endIdx].candidates[generatingCandidateIndex] =
              data.replies[0];
          } else {
            updatedMsgs = updatedMsgs.slice(0, -1).concat([
              {
                srcChar: data.src_char,
                isCharTurn: true,
                candidates: [...data.replies, { text: '...', debug_info: {} }],
              },
            ]);
          }

          // Set the ID of the last user message once it's been written to the database
          if (data.last_user_msg_id > 0 && updatedMsgs.length > 1) {
            updatedMsgs[updatedMsgs.length - 2].candidates[0].id =
              data.last_user_msg_id;
          }

          return updatedMsgs;
        });
      }

      cleanupAfterChatTurn();

      if (data?.displayClassiProbs) {
        setDisplayClassiProbs(data.display_classi_probs);
      }
      if (data?.replies && data.replies.length > 0) {
        if (devToolsEnabled) {
          setAllCandsToNegative(data.replies);
        } else {
          setNegativeLabels(data.replies[0]);
        }
      }
    } catch (err: any) {
      if (user?.user?.is_staff) {
        console.error(err);
      }
      setCharTyping(false);
      console.error(err);
      props.handleServerError(err);
    } finally {
      if (
        !shouldAbortChatRequest(generatingCandidates) &&
        (data?.abort ||
          (data?.replies &&
            hasCandidateErrors(data?.replies, generatingCandidates)))
      ) {
        if (user?.user?.is_staff) {
          console.error(`Conversation error, data.abort=${data?.abort}`);
        }
        setWaiting(true);
        loadMessages(true);
      } else {
        cleanupAfterChatTurn();
        inputFocus.focus();
      }
    }
  };

  const hasCandidateErrors = (
    replies: ChatMessageCandidates[],
    generatingCandidates: boolean,
  ) => {
    if (generatingCandidates) {
      return false;
    } else {
      return !allCandidatesHaveIds(replies);
    }
  };

  const updateLatestCandidate = (candidate: ChatMessageCandidates) => {
    // If we are generating candidates, these should get appended to the last character message
    setViewMsgs((oldArray) => {
      const updatedViewMsgs = [...oldArray];
      const endIdx = updatedViewMsgs.length - 1;
      // Overwrite the dummy message with the actual candidate
      updatedViewMsgs[endIdx].candidates[generatingCandidateIndex] = candidate;
      return updatedViewMsgs;
    });
  };

  const edit = () => {
    navigate(`/editing${buildUrlParams({ char: charData?.external_id })}`);
  };

  const clearChat = () => {
    setLoading(true);
    abortCandidateChatRequest();
    createNewHistory();
  };

  const initiatePostCreation = () => {
    openPostCreationModal();
  };

  const otherChats = () => {
    navigate(`/histories${buildUrlParams({ char: charData?.external_id })}`);
  };

  // unique name the server wants to id char participant
  const getCharParticipantUserName = () => {
    // TODO: verify this still works.
    if (charData && charData?.participant__user__username) {
      return charData.participant__user__username;
    } else {
      // In chat rooms this function always returns null.
      return null;
    }
  };

  // name char uses for chat
  const getCharName = (msg: ChatViewMessage) => {
    return msg.srcChar?.participant.name;
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    if (!waiting) {
      resetProactiveTimer();
    }
  };

  const hasAnnotation = (candidate: ChatMessageCandidates) => {
    return (
      typeof candidate.three_star !== 'undefined' ||
      typeof candidate.four_star !== 'undefined' ||
      typeof candidate.two_star !== 'undefined' ||
      typeof candidate.one_star !== 'undefined'
    );
  };

  const setAllCandsToNegative = async (candidates: ChatMessageCandidates[]) => {
    if (candidates && candidates.length > 0) {
      for (const candidate of candidates) {
        // no parallelization to reduce calls.
        // TODO: send all candidate ids to char server in one call.
        await setNegativeLabels(candidate);
      }
    }
  };

  const setAllViewMsgCandsToNegative = async () => {
    if (viewMsgs && viewMsgs.length > 0) {
      const lastMsg = viewMsgs[viewMsgs.length - 1];
      if (lastMsg) {
        setAllCandsToNegative(lastMsg.candidates);
      }
    }
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        swiper?.slidePrev();
      } else if (e.key === 'ArrowRight') {
        swiper?.slideNext();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [swiper]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isMobile && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    } else if (event.key === 'F2') {
      toggleDevTools();
    } else if (event.key === 'ArrowLeft') {
      if (!text.length && swiper) {
        swiper.slidePrev();
      }

      event.stopPropagation();
    } else if (event.key === 'ArrowRight') {
      if (!text.length && swiper) {
        swiper.slideNext();
      }

      event.stopPropagation();
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textArea = resetTextInputHeight();
    if (textArea) {
      textArea.style.height = textArea.scrollHeight + 'px';
    }

    if (event.key === 'ArrowLeft' && text.length) {
      event.stopPropagation();
    } else if (event.key === 'ArrowRight' && text.length) {
      event.stopPropagation();
    }
  };

  const handleTextInputFocus = () => {
    if (charData?.name === 'SamuraiRobot') {
      (document.getElementById('char-background') as HTMLVideoElement)?.play();
    }
    // TODO try to play song here as well.
  };

  // HACK: assumes video loads after charData.
  // TODO: play music together with video, but only after charData is loaded.
  const handleVideoLoaded = () => {
    // TODO: remove.
  };

  const scrollToBottom = () => {
    if (!messagesListBottom) {
      return;
    }
    if (!justPaginatedUpwards) {
      // If we paginated upwards, then we don't want to scroll back down.
      messagesListBottom.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setJustPaginatedUpwards(false);
    }
  };

  const getLabelId = (labelName: string) => {
    if (Constants.IS_LOCAL) {
      switch (labelName) {
        // Text annotations.
        case 'one_star':
          return 39;
        case 'not_one_star':
          return 40;
        case 'two_star':
          return 42;
        case 'not_two_star':
          return 43;
        case 'three_star':
          return 45;
        case 'not_three_star':
          return 46;
        case 'four_star':
          return 48;
        case 'not_four_star':
          return 49;
        case 'five_star':
          return 51;
        case 'not_five_star':
          return 52;
        // Image annotations.
        case 'image_one_star':
          return 54;
        case 'image_not_one_star':
          return 55;
        case 'image_two_star':
          return 57;
        case 'image_not_two_star':
          return 58;
        case 'image_three_star':
          return 60;
        case 'image_not_three_star':
          return 61;
        case 'image_four_star':
          return 63;
        case 'image_not_four_star':
          return 64;
        case 'image_five_star':
          return 66;
        case 'image_not_five_star':
          return 67;
        default:
          return 0;
      }
    } else {
      switch (labelName) {
        case 'one_star':
          return 234;
        case 'not_one_star':
          return 235;
        case 'two_star':
          return 237;
        case 'not_two_star':
          return 238;
        case 'three_star':
          return 240;
        case 'not_three_star':
          return 241;
        case 'four_star':
          return 243;
        case 'not_four_star':
          return 244;
        case 'five_star':
          return 246;
        case 'not_five_star':
          return 247;
        // Image annotations.
        case 'image_one_star':
          return 264;
        case 'image_not_one_star':
          return 265;
        case 'image_two_star':
          return 267;
        case 'image_not_two_star':
          return 268;
        case 'image_three_star':
          return 270;
        case 'image_not_three_star':
          return 271;
        case 'image_four_star':
          return 273;
        case 'image_not_four_star':
          return 274;
        case 'image_five_star':
          return 276;
        case 'image_not_five_star':
          return 277;
        default:
          return 0;
      }
    }
  };

  const updateLabels = async (
    candidate: ChatMessageCandidates,
    labelIds: number[],
    // successCallback, //#NOTE UNUSED
  ) => {
    const request = {
      message_id: candidate.id,
      assignment_id: null,
      label_ids: labelIds,
      admin_override: false,
    };
    await axios
      .put(
        '/chat/annotations/label/',
        JSONbigNative.stringify(request),
        getHeaders(),
      )
      //   .then((_response) => { //#NOTE UNUSED
      //     if (successCallback) {
      //       successCallback();
      //     }
      //   })
      .catch((err) => {
        if (user?.user?.is_staff) {
          console.error(err);
        }
      });
  };

  const setNegativeLabels = async (candidate: ChatMessageCandidates) => {
    if (hasAnnotation(candidate)) {
      return;
    }
    // Note: the following code sets negative labels on the database.
    // Afaik we're not really leveraging these negatives on dataset creation.
    //
    // updateLabels(
    //   candidate,
    //   [
    //     getLabelId('not_four_star'),
    //     getLabelId('not_three_star'),
    //     getLabelId('not_two_star'),
    //     getLabelId('not_one_star'),
    //   ],
    //   () => {
    //     candidate.three_star = false;
    //     candidate.four_star = false;
    //     candidate.two_star = false;
    //     candidate.one_star = false;
    //   },
    // );
    candidate.four_star = false;
    candidate.three_star = false;
    candidate.two_star = false;
    candidate.one_star = false;
    candidate.image_one_star = false;
    candidate.image_two_star = false;
    candidate.image_three_star = false;
    candidate.image_four_star = false;
  };

  const toggleAnnotation = (
    candidate: ChatMessageCandidates,
    annotationType: string,
    prefix: string,
  ) => {
    if (!candidate.id) {
      return;
    }
    annotationType = prefix + annotationType;
    if (!candidate[annotationType as keyof ChatMessageCandidates]) {
      candidate[annotationType as keyof ChatMessageCandidates] = true;
    } else {
      candidate[annotationType as keyof ChatMessageCandidates] =
        !candidate[annotationType as keyof ChatMessageCandidates];
    }

    const allRatings = ['one_star', 'two_star', 'three_star', 'four_star'];

    if (candidate[annotationType as keyof ChatMessageCandidates]) {
      // Turn off the other annotations.
      for (const otherAnnotationType of allRatings) {
        const prefixedOtherAnnotationType = prefix + otherAnnotationType;
        if (prefixedOtherAnnotationType !== annotationType) {
          candidate[
            prefixedOtherAnnotationType as keyof ChatMessageCandidates
          ] = false;
        }
      }
    }
    forceUpdate();

    const labelIds = [];

    // Note: when user clicks/taps one button (e.g., like) it updates the annotations
    // for all three buttons.
    // e.g., if like is clicked, and the other buttons are not,
    // we will update the annotations for the message in case to good!, not_bad,
    // and not_ugly.
    for (const annotationType of allRatings) {
      if (
        candidate[`${prefix}${annotationType}` as keyof ChatMessageCandidates]
      ) {
        labelIds.push(getLabelId(`${prefix}${annotationType}`));
      } else {
        labelIds.push(getLabelId(`${prefix}not_${annotationType}`));
      }
    }

    updateLabels(candidate, labelIds);

    if (
      prefix == '' && // Only livetune for text labels.
      (candidate.one_star ||
        candidate.two_star ||
        candidate.three_star ||
        candidate.four_star)
    ) {
      const msg_request = {
        char_id: charData?.external_id,
        char_name: charData?.name,
      };

      // we dont care about the response to this request
      axios.put('/chat/annotations/livetune/', msg_request, {
        headers: { Authorization: 'Token ' + props.token },
        timeout: 500_000,
      });
    }
  };

  const annotationButtons = (
    candidate: ChatMessageCandidates,
    prefix: string,
  ) => {
    if (!candidate.annotatable) {
      return;
    }
    // Move accent to constants file.
    const charAccent = '#138eed';
    const negativeAnnotationStyle = { filter: 'grayscale(90%)' };

    const labelMap: Record<string, string> = {
      one_star: 'Terrible',
      two_star: 'Bad',
      three_star: 'Good',
      four_star: 'Fantastic',
    };

    const allRatings = ['one', 'two', 'three', 'four'];

    const isRated = (rating: string) => {
      return candidate[
        `${prefix}${rating}_star` as keyof ChatMessageCandidates
      ];
    };

    const makeLabelString = (label: string) => {
      let visibility;
      if (!label) {
        // Create a hidden fake label to prevent the stars from shifting position when the real label causes extra padding on mobile due to text wrapping.
        label = labelMap.four_star;
        visibility = 'hidden';
      } else {
        visibility = 'visible';
      }
      let labelString;
      if (charData?.img_gen_enabled) {
        const modality = prefix == '' ? 'Text' : 'Image';
        labelString = `${modality} was ${label}`;
      } else {
        labelString = label;
      }
      return [labelString, visibility];
    };

    const displayAnnotationLabel = () => {
      let label = '';
      for (const rating of allRatings) {
        if (isRated(rating)) {
          label = labelMap[`${rating}_star`];
          break;
        }
      }
      const [labelString, visibility] = makeLabelString(label);
      return (
        <div
          style={{
            marginLeft: 5,
            visibility: visibility as 'hidden' | 'visible' | 'collapse',
          }}
        >
          {labelString}
        </div>
      );
    };

    const starIsOn = (rating: string) => {
      const ratingIndex = allRatings.indexOf(rating);
      for (let i = ratingIndex; i < allRatings.length; i++) {
        if (isRated(allRatings[i])) {
          return true;
        }
      }
      return false;
    };

    const createButtonForRating = (rating: string) => {
      const label = labelMap[`${rating}_star`];
      return (
        <button
          title={makeLabelString(label)[0]}
          className="btn"
          onClick={() => toggleAnnotation(candidate, `${rating}_star`, prefix)}
        >
          {starIsOn(rating) ? (
            <div>★</div>
          ) : (
            <div style={negativeAnnotationStyle}>☆</div>
          )}
        </button>
      );
    };

    return (
      <div
        className="annotation-buttons-container col mb-3"
        style={
          charMessageFullyRendered && candidate.id !== -1
            ? {}
            : { pointerEvents: 'none', opacity: 0.3 }
        }
      >
        <div className="d-flex align-items-center">
          {createButtonForRating('one')}
          {createButtonForRating('two')}
          {createButtonForRating('three')}
          {createButtonForRating('four')}

          {displayAnnotationLabel()}

          {translateTap && (
            <button
              className="btn mx-2 px-5"
              onClick={() => {
                setTranslateTapToggle(!translateTapToggle);
              }}
            >
              {translateTapToggle ? (
                <MdTranslate size={23} style={{ color: charAccent }} />
              ) : (
                <MdTranslate size={23} style={{ color: 'lightgray' }} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const maybeRemoveImagePrompt = (
    candidate: ChatMessageCandidates,
    isLastMessage: boolean,
  ) => {
    // remove the prompt to the image gen
    // only removes the first, since that's what server is doing now
    // don't remove during creation example chats
    if (props.mode === 'creation') {
      return candidate;
    } else {
      return stripImagePromptText(
        candidate,
        charData?.img_gen_enabled,
        charData?.strip_img_prompt_from_msg,
        waiting,
        isLastMessage,
        charData?.img_prompt_regex,
      );
    }
  };

  const preventAutoNumbering = (candidate: ChatMessageCandidates) => {
    // text starts with a number followed by period
    if (/^\s*\d+\./.test(candidate.text)) {
      candidate.text = candidate.text.replace('.', '\\.');
    }
    return candidate;
  };

  const maybeTranslate = (candidate: ChatMessageCandidates) => {
    if (
      translateCandidates &&
      (translateTapToggle || !translateTap) &&
      candidate.translation &&
      candidate.text.toLowerCase().trim() !==
      candidate.translation.toLowerCase().trim()
    ) {
      const label = translateTap ? '' : 'Translation: ';
      candidate.text = `${candidate.text}\n\n${label}*${candidate.translation}*`;
    }
    return candidate;
  };

  const renderCandidate = (
    candidate: ChatMessageCandidates,
    isChar: boolean,
    isLastMessage = false,
    translate = false,
  ) => {
    if (isChar) {
      candidate = maybeRemoveImagePrompt(candidate, isLastMessage);
      if (translate) {
        candidate = maybeTranslate(candidate);
      }
    }
    candidate = preventAutoNumbering(candidate);
    return (
      <div style={{ overflowWrap: 'break-word' }}>
        <Markdown>
          {candidate?.renderText === undefined
            ? candidate.text
            : candidate.renderText}
        </Markdown>
      </div>
    );
  };

  const maybeRenderSuggestedReplies = (candidate: ChatMessageCandidates) => {
    if (
      !candidate.suggested_replies ||
      candidate.suggested_replies.length === 0
    ) {
      return;
    }
    return (
      <div style={{ marginTop: '18px', fontSize: '12px' }}>
        <Markdown>
          {`*You could say: ${candidate.suggested_replies[0]}*`}
        </Markdown>
      </div>
    );
  };

  const canRenderAnnotations = (user?: Participant) => {
    return !isRoom() && !isAnonymousUser(user);
  };

  const renderImage = (
    candidate: ChatMessageCandidates,
    user?: Participant,
  ) => {
    const imagePath = candidate.image_rel_path;

    const renderImageAnnotations = () => {
      if (errorImagePaths.includes(imagePath ?? '')) {
        return <></>;
      }
      const visibility =
        charMessageFullyRendered && loadedImagePaths.includes(imagePath ?? '')
          ? 'visible'
          : 'hidden';

      if (visibility === 'hidden') {
        return null;
      }

      return (
        <div style={{ visibility: visibility }}>
          {annotationButtons(candidate, 'image_')}
        </div>
      );
    };

    return (
      <>
        <EmbeddedImage
          imagePath={imagePath ?? ''}
          errorImagePaths={errorImagePaths}
          setErrorImagePaths={setErrorImagePaths}
          loadedImagePaths={loadedImagePaths}
          setLoadedImagePaths={setLoadedImagePaths}
          handleImageLoad={() => {
            if (swiper) {
              updateSwiperHeight(swiper);
            }
            scrollToBottom();
          }}
        />
        {canRenderAnnotations(user) && renderImageAnnotations()}
      </>
    );
  };

  const renderMsgBalloon = (
    msg: ChatViewMessage,
    idx: number,
    candidate: ChatMessageCandidates,
    isPrimary: boolean,
    isTyping = false,
    showTranslationIfTap = false,
    isLastMessage = false,
    styleDefaults: React.CSSProperties | null = null,
  ) => {
    const msgClassNames = ['msg'];
    const markdownClassNames = ['markdown-wrapper'];
    if (charData?.name === 'SamuraiRobot') {
      msgClassNames.push('msg-dark-bg');
    }
    const styles: React.CSSProperties = styleDefaults || {};
    //#NOTE ?? 0 because id is nullable
    if (deleteMessageMode && deleteMessagesIds.includes(candidate.id ?? 0)) {
      styles.background = '#f55b53d9';
    }

    if (!msg.isCharTurn) {
      msgClassNames.push('user-msg');
      return (
        <div key={msg.candidates[0].id} className="row p-0 m-0" style={styles}>
          {deleteMessageMode && (
            <div className="col-auto p-0 px-2 msg-select" style={{ width: 40 }}>
              <input
                type="checkbox"
                style={{
                  marginTop: 15,
                  width: 20,
                  height: 20,
                }}
                checked={deleteMessagesIds.includes(
                  msg?.candidates[0]?.id ?? 0,
                )}
                onClick={() => clickMessageForDelete(idx)}
              />
            </div>
          )}
          <div className="col-auto p-0">
            {showAvatar(
              user?.user?.account?.name ?? '',
              avatarSize,
              user?.user?.account?.avatar_file_name ?? '',
            )}
          </div>
          <div className={`${deleteMessageMode ? 'col-8' : 'col-10'} p-2 pt-0`}>
            <div className="justify-content-start">
              <span
                className="msg-author-name"
                style={{
                  fontWeight: '650',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {user?.name}
                {candidate?.badge_reason && (
                  <CharacterIcon
                    msg={msg}
                    isCharacter={false}
                    responsibleUser={candidate.username}
                    badgeReason={candidate.badge_reason}
                  />
                )}
              </span>
            </div>
            <div>
              <div className="col">
                {/* //#NOTE  CHATVIEWMESSAGE DOESNT APPEAR TO HAVE AN EVER ASSIGNED*/}
                {/* <div key={msg.id} className={msgClassNames.join(' ')}> */}
                <div className={msgClassNames.join(' ')}>
                  <div className={markdownClassNames.join(' ')}>
                    {/* if candidate.text is a number followed by a period "2012."
                        markdown turns it into a 1. (perhaps interpretting as a number?)
                        adding space makes it a string.*/}
                    {renderCandidate(candidate, false)}
                    {renderImage(candidate, user)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    msgClassNames.push('char-msg');
    if (!isPrimary) {
      msgClassNames.push('not-primary-msg');
    }
    if (isLastMessage) {
      markdownClassNames.push('markdown-wrapper-last-msg');
      if (!isMobile) {
        markdownClassNames.push('swiper-no-swiping');
      }
    }

    const stuff: Record<string, any> = {};
    if (!candidate) {
      return null;
    }
    if (candidate.debug_info) {
      for (const property in candidate.debug_info) {
        stuff[property] = candidate.debug_info[property];
      }
    }
    if (candidate.remove_reasons && candidate.remove_reasons.length > 0) {
      msgClassNames.push('removed-msg');
      // Seting remove_reasons before other attributes so it shows first.
      stuff['remove_reasons'] = candidate['remove_reasons'];
    }
    if (candidate.score) {
      stuff['score_type'] = candidate.score_type;
      stuff['final_score'] = candidate.score;
    }
    if (candidate.log_prob) {
      stuff['log_prob'] = candidate.log_prob;
    }
    if (candidate.log_prob_per_token) {
      stuff['log_prob_per_token'] = candidate.log_prob_per_token;
    }
    if (candidate.len_tokens) {
      stuff['len_tokens'] = candidate.len_tokens;
    }
    const classi_probs = candidate.classi_probs;
    if (classi_probs != null) {
      for (const key of displayClassiProbs) {
        stuff[key] = classi_probs[key];
      }
    }
    if (candidate.continuation) {
      stuff['continuation'] = candidate.continuation;
    }
    if (candidate.query) {
      stuff['query'] = candidate.query;
    }

    if (candidate.image_prompt_text) {
      stuff['image_prompt_text'] = candidate.image_prompt_text;
    }
    if (candidate.image_rel_path) {
      stuff['image_rel_path'] = candidate.image_rel_path;
    }

    // TODO(daniel): make sure marked-react is safe
    // https://github.com/character-tech/character-tech/issues/396
    const shouldCollapse = function (_field: any) {
      return true;
    };
    const typyingDotClassNames = classNames({
      'typing-dot': true,
      'typing-dot-dark-bg': charData?.name === 'SamuraiRobot',
      'typing-dot-light-bg': charData?.name !== 'SamuraiRobot',
    });
    return (
      <div className="row p-0 m-0" style={styles}>
        {deleteMessageMode && (
          <div className="col-auto p-0 msg-select" style={{ width: 40 }}></div>
        )}

        <div className="col-auto p-0">
          {isPrimary &&
            (msg.srcChar?.participant.name ||
              msg.srcChar?.avatar_file_name) && (
              <div className="justify-content-start">
                <InitialAvatar
                  name={msg.srcChar?.participant.name}
                  size={avatarSize}
                  avatarFileName={
                    msg.srcChar?.avatar_file_name
                      ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${msg.srcChar.avatar_file_name}`
                      : ''
                  }
                />
              </div>
            )}
        </div>
        <div className={`${deleteMessageMode ? 'col-8' : 'col-10'} p-2 pt-0`}>
          {isPrimary && (
            <div className="justify-content-start">
              <span
                style={{
                  fontWeight: '650',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {getCharName(msg)}
                {/* Don't show the character icon on the last message if it's still loading */}
                {charTyping && isLastMessage && isTyping ? null : (
                  <CharacterIcon
                    msg={msg}
                    isCharacter={true}
                    responsibleUser={
                      msg.candidates[0].responsible_user__username
                    }
                  />
                )}
              </span>
            </div>
          )}
          <div>
            <div className="col">
              {/* //#NOTE  CHATVIEWMESSAGE DOESNT APPEAR TO HAVE AN EVER ASSIGNED*/}
              <div className={msgClassNames.join(' ')}>
                {/* <div key={msg.id} className={msgClassNames.join(' ')}> */}
                {isTyping ? (
                  <React.Fragment>
                    <span />
                    <span className={typyingDotClassNames}></span>
                    <span className={typyingDotClassNames}></span>
                    <span className={typyingDotClassNames}></span>
                    <span />
                  </React.Fragment>
                ) : (
                  <div style={{ maxWidth: '100%' }}>
                    <div className={markdownClassNames.join(' ')}>
                      {/* if candidate.text is a number followed by a period "2012."
                          markdown turns it into a 1. (perhaps interpretting as a number?)
                          adding space makes it a string.*/}
                      {renderCandidate(
                        candidate,
                        true,
                        isLastMessage,
                        !!translateTap && !showTranslationIfTap,
                      )}
                    </div>
                    {/* Rooms has the livetune buttons disappearing and moving around.
                        Do not render them for now.*/}
                    {canRenderAnnotations(user) &&
                      annotationButtons(candidate, '')}
                    {renderImage(candidate, user)}
                    {maybeRenderSuggestedReplies(candidate)}
                  </div>
                )}
                {devToolsEnabled && Object.keys(stuff).length > 0 ? (
                  <div className="react-json-wrapper">
                    <ReactJson
                      name={null}
                      src={stuff}
                      displayDataTypes={false}
                      shouldCollapse={shouldCollapse}
                      collapseStringsAfterLength={50}
                      iconStyle={'circle'}
                    />
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleBack = () => {
    clearLinkPreviewImage();
    resetPageTitle();
    resetPageDescription();
    if (window.history.state.idx === 0) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const createDummyMessageForNewCandidate = () => {
    const updatedViewMsgs = [...viewMsgs];

    //#NOTE ANOTHER ONE OF THESE DUMMY MESSAGES WHAT
    updatedViewMsgs[updatedViewMsgs.length - 1].candidates.push({
      text: '...',
      debug_info: {},
    });
    setViewMsgs(updatedViewMsgs);
  };

  const renderSlides = (
    msg: ChatViewMessage,
    i: number,
    isLastMessage: boolean,
  ) => {
    const slides = [];

    // Don't render additional slides until first one is fully rendered
    const max = charMessageFullyRendered ? msg.candidates.length : 1;

    for (let index = 0; index < max; index++) {
      let renderedMsg;
      const c = msg.candidates[index];
      if (isSelectingPostStartEnd && isInBetweenHoverPostStartEnd(i)) {
        renderedMsg = renderMsgBalloon(
          msg,
          i,
          c,
          true,
          false,
          true,
          isLastMessage,
          { background: '#c9fffd' },
        );
      } else {
        renderedMsg = renderMsgBalloon(
          msg,
          i,
          c,
          true,
          false,
          true,
          isLastMessage,
        );
      }
      slides.push(<SwiperSlide key={index}>{renderedMsg}</SwiperSlide>);
    }

    return slides;
  };

  const markCandidateAsSeen = (candidate: ChatMessageCandidates) => {
    if (
      (candidate && candidate.id && seenCandidateIds.includes(candidate.id)) ||
      !candidate.id ||
      candidate.id < 1
    ) {
      return;
    }

    const { id } = candidate;
    if (id) {
      setSeenCandidateIds((prev) => [...prev, id]);
    }
  };

  const renderCandidates = (
    msg: ChatViewMessage,
    i: number,
    isLastMessage: boolean,
  ) => {
    function changePrimary(index: number) {
      setAltIndex(index);
      if (index >= 0 && index < msg.candidates.length) {
        const c = msg.candidates[index];
        // debouncedUpdatePrimary.current(c);
        // updatePrimary(c);
        markCandidateAsSeen(c);

        // Start generating new candidate when the user is on the last one
        if (
          index == msg.candidates.length - 1 &&
          generatingCandidateIndex === 0 &&
          !generatingCandidate
        ) {
          setGeneratingCandidateIndex(index);
        }
      } else if (index == msg.candidates.length && !generatingCandidate) {
        // If the index is out of range, then we need to make a call to generate a new message, display a loading indicator, and populate that message in the right place
        setGeneratingCandidateIndex(index);
      }
    }

    if (
      !msg.isCharTurn ||
      i === 0 ||
      i < viewMsgs.length - 1 ||
      msg.candidates[0]?.responsible_user__username
    ) {
      if (msg.candidates.length === 0) {
        return;
      }
      if (isSelectingPostStartEnd && isInBetweenHoverPostStartEnd(i)) {
        return renderMsgBalloon(
          msg,
          i,
          msg.candidates[0],
          true,
          false,
          false,
          isLastMessage,
          { background: '#c9fffd' },
        );
      } else {
        return renderMsgBalloon(
          msg,
          i,
          msg.candidates[0],
          true,
          false,
          false,
          isLastMessage,
        );
      }
    }
    if (devToolsEnabled) {
      return msg.candidates.map((c, index) =>
        renderMsgBalloon(msg, index, c, index === 0),
      );
    }

    return (
      <Swiper
        onSwiper={(swiper: SwiperClass) => setSwiper(swiper)}
        // index property does not exist on Swiper
        // index={altIndex}
        onSlideChange={(s) => changePrimary(s.activeIndex)}
        slidesPerView={1}
        autoHeight
        style={{ minHeight: 250 }}
        navigation={!isMobile && charMessageFullyRendered}
        slidesPerGroup={1}
        modules={isMobile ? [] : [Navigation]}
        className="message-slider"
      >
        {renderSlides(msg, i, isLastMessage)}
      </Swiper>
    );
  };

  const toggleDevTools = () => {
    if (!getCookieConsentValue()) {
      if (user?.user?.is_staff) {
        console.error('Must consent to cookies in order to toggle dev tools');
      }
      return;
    }
    const newDevToolsEnabled = !!(user?.user?.is_staff && !devToolsEnabled);
    setDevToolsEnabled(newDevToolsEnabled);
    localStorage.setItem('devToolsEnabled', '' + newDevToolsEnabled);
    if (newDevToolsEnabled) {
      //console.log(viewMsgsToDefintion())
    }
  };

  const handlePostVisibilityChange = (selectedItem: Option) => {
    setPostVisibility(selectedItem);
  };

  const enableDeleteMessageMode = () => {
    setDeleteMessageMode(true);
  };

  const cancelDeleteMessageMode = () => {
    setDeleteMessageMode(false);
    setDeleteMessagesIds([]);
  };

  const deleteMessages = async () => {
    if (!deleteMessageMode || !deleteMessagesIds.length) {
      return;
    }

    abortCandidateChatRequest();

    setDeletingMessages(true);
    const response = await API.deleteMessages(
      history?.external_id ?? '',
      deleteMessagesIds,
      false,
    );

    if (response.status === 'OK') {
      removeDeletedMessagesFromViewMsgs(deleteMessagesIds);
      setDeleteMessageMode(false);
      setDeleteMessagesIds([]);
      setDeletingMessages(false);
    } else {
      toast.error('Failed to delete messages');
    }
  };

  const updatePrimaryToCorrectCandidate = async () => {
    if (altIndex) {
      const newPrimary = viewMsgs[viewMsgs.length - 1].candidates[altIndex];
      if (newPrimary) {
        await updatePrimary(newPrimary);
      }
    }
  };

  const createPost = async (_keepPrivate = true) => {
    await updatePrimaryToCorrectCandidate();
    return axios
      .post(
        '/chat/chat-post/create/',
        {
          post_title: postTitle,
          post_visibility: postVisibility.value,
          subject_external_id: history?.external_id,
          post_message_start: postStartMessageIndex,
          post_message_end: postEndMessageIndex,
          post_num_messages_loaded: viewMsgs.length,
        },
        getHeaders(),
      )
      .then((response) => {
        if (response.data.post && response.data.post.external_id) {
          // TODO: Fix post sharing video
          // if (response.data.post.create_sharing_video) {
          //   createSharingVideo(response.data.post.external_id);
          // }
          navigate(
            `/post${buildUrlParams({
              post: response.data.post.external_id,
              share: true,
            })}`,
          );
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  // const createSharingVideo = async (externalId: string) => {
  //   return axios
  //     .post('/chat/chat-post/video/create/', {
  //       external_id: externalId,
  //     })
  //     .catch((err) => {
  //       props.handleServerError(err);
  //       return false;
  //     });
  // };

  const handleCreatePost = async () => {
    closePostCreationModal();
    await createPost();
    setPostStartMessageIndex(null);
    setPostEndMessageIndex(null);
  };

  const renderTitle = (
    history?: ChatHistoryCreateContinueResponse,
    charData?: Character,
  ) => {
    return (
      <button
        className="col-auto btn p-0"
        type="button"
        onClick={() => handleNameClick()}
        style={{
          fontSize: '12pt',
        }}
      >
        {
          <div className="chattitle p-0 pe-1 m-0">
            <ImageGeneratingIcon
              imageGenEnabled={
                history?.room_img_gen_enabled || charData?.img_gen_enabled
              }
            />
            {history?.title ? '#' : ''}
            {history?.title || charData?.participant__name}
            {!isRoom() && (
              <>
                {charData?.visibility === 'PRIVATE' && (
                  <MdLock size={18} className="mb-1" />
                )}
                {charData?.visibility === 'UNLISTED' && (
                  <MdLink size={18} className="mb-1" />
                )}
                {!loading && charData?.visibility === 'PUBLIC' && (
                  <span
                    className="text-secondary"
                    style={{ fontWeight: 400, fontSize: 12 }}
                  >
                    {'  '}
                    <IoChatbubblesOutline style={{ marginLeft: 0 }} />{' '}
                    {displayNumInteractions(
                      charData?.participant__num_interactions,
                    )}
                  </span>
                )}
              </>
            )}
          </div>
        }
      </button>
    );
  };

  const renderParticipants = (history: ChatHistoryCreateContinueResponse) => {
    return (
      history.avatars && (
        <div className="col-auto">
          <div className="row align-items-center">
            {history.avatars
              .slice(0, MAX_PARTICIPANTS_IN_HEADER)
              .map((avatar, i) => (
                <div
                  className="col-auto p-0 justify-content-left"
                  key={avatar.name}
                >
                  {avatar.character__avatar_file_name
                    ? showAvatar(
                      avatar.name,
                      avatarSize / 2,
                      avatar.character__avatar_file_name,
                    )
                    : showAvatar(
                      avatar.name,
                      avatarSize / 2,
                      avatar.user__account__avatar_file_name ?? '',
                    )}
                </div>
              ))}
            {history.avatars &&
              history.avatars.length > MAX_PARTICIPANTS_IN_HEADER && (
                <div className="col-auto p-0 ps-1">...</div>
              )}
          </div>
        </div>
      )
    );
  };

  // const canViewCharacterSettings = () =>
  //   charData?.user__username === user.user.username || charData.copyable;
  const canViewCharacterSettings = () => {
    return (
      charData &&
      ((user?.user?.username &&
        charData?.user__username === user.user.username) ||
        charData.copyable) &&
      !viewOnly
    );
  };

  const isRoom = () => history?.type === 'ROOM';

  const pauseConversation = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    setIsPaused(true);
  };

  const resumeConversation = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    setIsPaused(false);
  };

  const renderRoomControls = () => {
    if (!isRoom()) {
      return null;
    }

    return isPaused ? (
      <button
        className="btn border btn-primary align-items-center"
        onClick={resumeConversation}
      >
        <MdPlayCircleFilled size={24} />
      </button>
    ) : (
      <button
        className="btn border btn-primary align-items-center"
        onClick={pauseConversation}
      >
        <MdPauseCircleFilled size={24} />
      </button>
    );
  };

  const renderTitleAndParticipants = (
    history?: ChatHistoryCreateContinueResponse,
    charData?: Character,
  ) => {
    if (isRoom() && history?.avatars) {
      return (
        <div className="row">
          {renderTitle(history, charData)}
          {renderParticipants(history)}
        </div>
      );
    }
    return renderTitle(history, charData);
  };

  const typingMessage = {
    key: 100000,
    isCharTurn: true,
    text: '...',
    candidates: [{ text: '...' }],
  };
  const msgRowClassNames = classNames({
    'msg-row': true,
    'msg-row-light-bg': charData?.name !== 'SamuraiRobot',
    'msg-row-dark-bg': charData?.name === 'SamuraiRobot',
  });
  const warningClassNames = classNames({
    'text-danger': true,
    row: true,
    'pb-1': false,
    'pt-2': false,
    'justify-content-between': false,
    'chatheaderbg-immersive': charData?.name === 'SamuraiRobot',
    'chatheaderbg-normal': charData?.name !== 'SamuraiRobot',
  });
  const headerClassNames = classNames({
    row: true,
    'pb-1': true,
    'pt-2': true,
    'justify-content-between': true,
    'chatheaderbg-immersive': charData?.name === 'SamuraiRobot',
    'chatheaderbg-normal': charData?.name !== 'SamuraiRobot',
    'align-items-center': true,
  });
  const footerClassNames = classNames({
    row: true,
    'chatfooterbg-immersive': charData?.name === 'SamuraiRobot',
    'chatfooterbg-normal': charData?.name !== 'SamuraiRobot',
  });

  const renderChatTop = () => {
    return (
      <div
        className={'container-fluid ' + ' chattop' + Constants.NOTCH}
        style={{ maxWidth: MAX_WIDTH }}
      >
        {devToolsEnabled ? (
          <div className="dev-tools-enabled-banner">
            Dev tools enabled (F2 disables it)
          </div>
        ) : (
          <div></div>
        )}
        <div
          style={{
            fontSize: 'small',
            overflowWrap: 'anywhere',
            backgroundColor: 'white',
          }}
        >
          <div>
            {insertBeginning ? `- model server @ ${insertBeginning}` : ''}
          </div>
          <div>
            {overrideModelServerAddress
              ? `- model server @ ${overrideModelServerAddress}`
              : ''}
          </div>
          <div>
            {overrideHistorySet ? `- history set = ${overrideHistorySet}` : ''}
          </div>
          {devToolsEnabled && !overridePrefix && prefix ? (
            <ReactJson
              name={null}
              src={{ prefix: prefix }}
              shouldCollapse={false}
              displayDataTypes={false}
              collapseStringsAfterLength={50}
              iconStyle={'circle'}
            />
          ) : (
            <div></div>
          )}
          <div>
            {overridePrefix ? `- override prefix = '${overridePrefix}'` : ''}
          </div>
          <div>{overrideRank ? `- override rank = '${overrideRank}'` : ''}</div>
          <div>
            {rankCandidates !== null
              ? `- rank_candidates = '${rankCandidates}'`
              : ''}
          </div>
          <div>
            {filterCandidates !== null
              ? `- filter_candidates = '${filterCandidates}'`
              : ''}
          </div>
          <div>
            {prefixLimit !== null ? `- prefix_limit = '${prefixLimit}'` : ''}
          </div>
          <div>
            {prefixTokenLimit !== null
              ? `- prefix_token_limit = '${prefixTokenLimit}'`
              : ''}
          </div>
          <div>
            {livetuneCoeff !== null
              ? `- livetune_coeff = '${livetuneCoeff}'`
              : ''}
          </div>
          <div>
            {streamParams !== null ? `- stream_params = '${streamParams}'` : ''}
          </div>
          <div>
            {streamEveryNSteps !== defaultStreamEveryNSteps
              ? `- stream_every_n_steps = ${streamEveryNSteps}`
              : ''}
          </div>
          <div>
            {streamChunksToPad !== defaultStreamChunksToPad
              ? `- chunks_to_pad = ${streamChunksToPad}`
              : ''}
          </div>
          <div>{chatTimeout ? `- timeout is ${chatTimeout} secs` : ''}</div>
        </div>
        {props.mode === 'creation' ? (
          <div className="col-xs-12 col-md-8 offset-md-2">
            <div className={headerClassNames}>
              <div className="row pb-1 pt-2 justify-content-between">
                <div className="col-6 mt-2">
                  <p>Example Chat #{props.number}...</p>
                </div>
                <div className="col-3">
                  <button className="btn" onClick={clearChat}>
                    <MdRestartAlt size={24} />
                  </button>
                </div>

                <div className="col-3">
                  <button
                    className={
                      (!charData?.greeting && viewMsgs.length > 1) ||
                        viewMsgs.length > 2
                        ? 'btn border btn-primary'
                        : 'btn border'
                    }
                    disabled={!charMessageFullyRendered}
                    onClick={saveMessages}
                  >
                    Next
                  </button>
                </div>
              </div>
              {((!charData?.greeting && viewMsgs.length > 1) ||
                viewMsgs.length > 2) && (
                  <div>
                    <p className="text-muted" style={{ fontSize: '11pt' }}>
                      {`Choose other responses by swiping ${charData?.name}'s last
                    message.`}
                    </p>
                    <p className="text-muted" style={{ fontSize: '11pt' }}>
                      <MdRestartAlt size={24} /> if you want to restart this chat
                      to try again.
                    </p>
                    {!props.maxLength || currentLength <= props.maxLength ? (
                      <span>
                        {viewMsgs.length >= (props.minimum || 0) && (
                          <p className="" style={{ fontSize: '11pt' }}>
                            {`You can move on any time you're ready.`}
                          </p>
                        )}
                      </span>
                    ) : (
                      <span>
                        <p className="" style={{ fontSize: '11pt' }}>
                          {`You've reached the limit for this example chat.`}
                        </p>
                      </span>
                    )}
                  </div>
                )}
            </div>
          </div>
        ) : (
          <div className="col-xs-12 col-md-8 offset-md-2">
            <div className={headerClassNames}>
              <div className="col-1 col-md-1 ">
                <div className="row">
                  <div className="p-0">
                    <button
                      className={'btn'}
                      role="button"
                      onClick={handleBack}
                    >
                      <MdArrowBackIosNew size={24} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-9 col-md-9 ps-4">
                <div className="p-0">
                  <div className="row justify-content-start p-0 align-items-center">
                    <div className="col p-0">
                      {renderTitleAndParticipants(history, charData)}
                      {titleExpanded && (
                        <div
                          className="p-0 chatsubtitle"
                          style={{
                            color: '#555555',
                            fontSize: '12px',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          <span>
                            {history?.description
                              ? 'Talking about ' +
                              history.description.slice(0, 30)
                              : charData?.title}
                          </span>
                        </div>
                      )}

                      {charData?.external_id && (
                        <div className="p-0 m-0" style={{ fontSize: '13px' }}>
                          <span style={{ color: '#777777' }}>created by </span>
                          <Link
                            className="p-0 m-0"
                            style={{
                              color: 'inherit',
                              textDecoration: 'inherit',
                            }}
                            role="button"
                            to={
                              charData?.user__username === user?.user?.username
                                ? {
                                  pathname: `/profile/${buildUrlParams({
                                    char: charData?.external_id,
                                  })}`,
                                }
                                : {
                                  pathname: `/public-profile/${buildUrlParams(
                                    {
                                      char: charData?.external_id,
                                      username: charData?.user__username,
                                    },
                                  )}`,
                                }
                            }
                          >
                            @{charData?.user__username}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-2 col-md-2">
                <div className="row align-items-center justify-content-end">
                  <div className="col-auto p-0 pe-2">
                    <ChatOptions
                      waiting={!charMessageFullyRendered}
                      isAnonymousUser={isAnonymousUser(user)}
                      isRoom={isRoom()}
                      initiatePostCreation={!viewOnly && initiatePostCreation}
                      clearChat={
                        charData?.external_id && !viewOnly && clearChat
                      }
                      viewArchivedChats={
                        charData?.external_id && hasHistories && otherChats
                      }
                      viewCharacterSettings={canViewCharacterSettings() && edit}
                      reportCharacter={
                        !isRoom()
                          ? () => reportCharacter(charData, getHeaders())
                          : null
                      }
                      toggleDeleteMode={!viewOnly && enableDeleteMessageMode}
                      characterVoiceEnabled={characterVoiceEnabled}
                      toggleCharacterVoice={
                        !viewOnly &&
                        !!(window as any).audioContext &&
                        toggleCharacterVoice
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={warningClassNames}>
              <span className="text-center" style={{ fontSize: '9pt' }}>
                Remember: Everything Characters say is made up!
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOptionalModals = () => {
    return (
      <>
        <UserImageGeneration.UserImageGeneration
          isOpen={imageGenerationModalOpen}
          setIsOpen={setImageGenerationModalOpen}
          setImagePathFn={(path) => {
            setUserImagePath(path);
            setUserImageOriginType('GENERATED');
          }}
          setImageDescriptionFn={setUserImageDescription}
          setImageDescriptionTypeFn={setUserImageDescriptionType}
          textMode={UserImageGeneration.TextMode.MESSAGE}
        />
        <ImageUpload
          isOpen={imageUploadModalOpen}
          setIsOpen={setImageUploadModalOpen}
          setImagePathFn={(path) => {
            setUserImagePath(path);
            setUserImageOriginType('UPLOADED');
          }}
          setImageDescriptionFn={setUserImageDescription}
          setImageDescriptionTypeFn={setUserImageDescriptionType}
        />
      </>
    );
  };

  const asrEnabledIconStyle = { color: '#5fa6bbff' };

  // TODO: Need to turn speechMatchBeingProcessed into a state variable.
  // if (speechMatchBeingProcessed) {
  //   asrEnabledIconStyle['filter'] = 'grayscale(90%)';
  // }

  const canSubmit = () => {
    if (generatingCandidate && altIndex === generatingCandidateIndex) {
      return false;
    }

    return charMessageFullyRendered && !postCreationModalIsOpen && !waiting;
  };

  const renderChatBottom = () => {
    if (!props.maxLength || currentLength <= props.maxLength) {
      return (
        <div
          className="container-fluid chatbottom"
          style={{ maxWidth: MAX_WIDTH }}
        >
          <div className="col-xs-12 col-md-8 offset-md-2">
            <div className={footerClassNames}>
              <form action="#" className="m-0 chatform">
                <div
                  className="col-12 p-0 mt-2 mx-2 chatfooter align-self-center"
                  style={{ marginBottom: '30px' }}
                >
                  {deleteMessageMode ? (
                    <div className="w-100 d-flex flex-row align-items-center">
                      <div className="px-3">
                        Select the start message to remove. All following
                        messages will be removed.
                      </div>

                      <Button
                        onClick={cancelDeleteMessageMode}
                        style={{ justifySelf: 'flex-end' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        color="danger"
                        onClick={deleteMessages}
                        style={{
                          justifySelf: 'flex-end',
                          marginLeft: 10,
                          alignItems: 'center',
                        }}
                      >
                        {deletingMessages ? (
                          <Spinner style={{ width: 20, height: 20 }} />
                        ) : (
                          'Remove'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`chatbox text-muted d-flex justify-content-start align-items-center p-0 bg-white ${isMobile ? 'mx-1' : 'mx-3'
                          }`}
                        style={isMobile ? { flex: 'auto' } : {}}
                      >
                        <ChatActions
                          characterVoiceEnabled={false}
                          open={chatDropdownOpen}
                          toggle={() => setChatDropdownOpen(!chatDropdownOpen)}
                          openImageGenerationModal={() =>
                            setImageGenerationModalOpen(true)
                          }
                          openImageUploadModal={() =>
                            setImageUploadModalOpen(true)
                          }
                          waiting={waiting}
                        />
                        {userImagePath && (
                          <div style={{ paddingLeft: '5px' }}>
                            <EmbeddedImage
                              imagePath={userImagePath}
                              imageSize={30}
                            />
                          </div>
                        )}
                        <div className="input-group me-3 my-0">
                          {/* The form is to help mobile browsers show a send button instead
                    of return */}
                          <textarea
                            id="user-input"
                            value={text}
                            className="bg-white form-control border-0 shadow-none"
                            style={{ fontSize: '11pt', paddingLeft: 4 }}
                            onChange={(event) => handleChange(event)}
                            onKeyDown={(event) => handleKeyDown(event)}
                            onKeyUp={handleKeyUp}
                            onFocus={handleTextInputFocus}
                            rows={1}
                            placeholder="Type a message"
                          />
                          <button
                            className="btn py-0"
                            type="button"
                            disabled={!canSubmit()}
                            onClick={() => handleSubmit()}
                          >
                            {canSubmit() ? (
                              <MdSend
                                size={25}
                                style={{
                                  color: '#3c85f6',
                                }}
                              />
                            ) : (
                              <Spinner
                                style={{
                                  display: 'flex',
                                  width: 25,
                                  height: 25,
                                  color: '#3c85f6',
                                }}
                              />
                            )}
                          </button>
                          {Constants.ENABLE_MIC && !isIOS && (
                            <button
                              className="btn py-0"
                              type="button"
                              onClick={() => handleToggleAsr()}
                            >
                              {(window.SpeechRecognition ||
                                window.webkitSpeechRecognition) &&
                                (asrEnabled ? (
                                  <MdSettingsVoice
                                    size={25}
                                    style={asrEnabledIconStyle}
                                  />
                                ) : (
                                  <MdMicOff
                                    size={25}
                                    style={{ color: '#e66464' }}
                                  />
                                ))}
                            </button>
                          )}
                        </div>
                      </div>
                      {renderRoomControls()}
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }
  };

  const handleCopyLinkClick = () => {
    navigator.clipboard.writeText(
      `${getShareUrlOrigin()}/c/${charData?.external_id}`,
    );
    toast('Link copied to clipboard');
  };

  const renderMsgs = () => {
    const displayMessageForPost = (isStart: boolean, textCrop = 60) => {
      if (viewMsgs.length == 0) {
        return '';
      }
      const i = isStart
        ? postStartMessageIndex || 0
        : postEndMessageIndex || -1;
      const iOffset = i >= 0 ? i : viewMsgs.length + i;
      const msg = viewMsgs[iOffset];
      const msgAuthor = msg.isCharTurn ? getCharName(msg) : user?.name;
      const index = iOffset === viewMsgs.length - 1 ? altIndex : 0;
      const msgLabel = msg.candidates[index].text;
      const textLabel =
        msgLabel.length < textCrop
          ? msgLabel
          : msgLabel.substring(0, textCrop - 3) + '...';
      const prefix = isStart ? 'Sharing from' : 'To';
      const label = msgAuthor + ': ' + textLabel;
      return (
        <div
          style={{
            marginTop: '10px',
            marginBottom: '5px',
            fontSize: '13px',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
            }}
          >
            {prefix}:
          </div>
          <div>{label}</div>
        </div>
      );
    };

    const viewMsgsReversed = [...viewMsgs].filter(filterOutEmptyUserMessages);
    viewMsgsReversed.reverse();

    return (
      <div
        className="container-fluid p-0 justify-content-center"
        style={{ maxWidth: MAX_WIDTH, overflowY: 'hidden' }}
      >
        {loading ? (
          <div
            className="d-flex justify-content-center"
            style={{ marginTop: 100 }}
          >
            <div className="spinner-border text-secondary" role="status">
              <span className="sr-only"></span>
            </div>
          </div>
        ) : (
          <Hotkeys keyName={'f2'} onKeyDown={() => toggleDevTools()}>
            <div>
              {charData?.name === 'SamuraiRobot' && (
                <video
                  id="char-background"
                  //   autostart={true} //#NOTE this type does not exist on video
                  loop
                  muted
                  playsInline
                  autoPlay
                  src={`${Constants.CDN_URL}/static/videos/robot-samurai.mp4`}
                  //   type="video/mp4" //#NOTE this type does not exist on video
                  onLoadedData={() => handleVideoLoaded()}
                />
              )}

              <div
                className="container-fluid chatdisplay"
                style={{ marginTop: 76 }}
              >
                <div className="col-xs-12 col-md-8 offset-md-2">
                  <div className="row chatdisplay2" id="content">
                    <div
                      id="scrollBar"
                      style={{
                        height: chatHeight,
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column-reverse',
                      }}
                    >
                      <InfiniteScroll
                        dataLength={viewMsgs.length}
                        next={loadMessages}
                        hasMore={!!chatHasMore}
                        loader={<h4>Loading...</h4>}
                        scrollableTarget="scrollBar"
                        style={{
                          display: 'flex',
                          flexDirection: 'column-reverse',
                        }}
                        inverse={true}
                      >
                        {/* Need to render the messages in reversed order due to the column-reverse (i.e., we reverse the reverse), which seems to be necessary for the InfiniteScroll to work.*/}
                        <div className="" ref={messagesListBottom}></div>
                        {viewMsgsReversed.map((msg, i) => {
                          const iOriginalOrder =
                            viewMsgsReversed.length - 1 - i;

                          const deleted = msg.candidates[0].deleted;
                          if (deleted) {
                            return null;
                          }

                          return (
                            <div
                              key={i}
                              className={msgRowClassNames}
                              onClick={() => clickMessage(iOriginalOrder)}
                              onMouseOver={() =>
                                hoverMessageForPostStartAndEnd(iOriginalOrder)
                              }
                              style={{ zIndex: 0 }}
                            >
                              {renderCandidates(
                                msg,
                                iOriginalOrder,
                                iOriginalOrder === viewMsgs.length - 1,
                              )}
                            </div>
                          );
                        })}
                      </InfiniteScroll>
                    </div>
                    {charTyping && (
                      <div className={msgRowClassNames}>
                        {renderMsgBalloon(
                          typingMessage,
                          -1,
                          typingMessage.candidates[0],
                          true,
                          true,
                          false,
                          true,
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-0" style={{ height: 60 }}>
                    <span></span>
                  </div>
                </div>
              </div>

              <Modal
                isOpen={micModalIsOpen}
                onRequestClose={closeMicModal}
                style={customStyles}
                contentLabel="First time speech recognition setup"
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ padding: '20px' }}>
                    {`You're about to be prompted for access to your microphone.
                    Chatting with characters using your voice will only work, if
                    you allow access to your microphone. If access is granted,
                    the microphone will start listening continuously. Tap the
                    microphone button ${(
                        <MdSettingsVoice
                          size={25}
                          style={{ color: '#5fa6bbff' }}
                        />
                      )} again to make it stop listening.`}
                  </div>
                  <button
                    onClick={closeMicModal}
                    style={{ backgroundColor: '#f7f7f7' }}
                  >
                    Got it
                  </button>
                </div>
              </Modal>

              <Modal
                isOpen={postCreationModalIsOpen}
                onRequestClose={() => closePostCreationModal()}
                style={{
                  content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '10px',
                    boxShadow: '0 0 10px 0 rgba(0,0,0,0.2)',
                    width: isMobile ? '100%' : '650px',
                  },
                }}
                contentLabel="Create a Post"
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMobile ? 'center' : 'left',
                  }}
                >
                  <div>
                    {!isRoom() && (
                      <>
                        <div className="w-100 d-flex justify-content-between">
                          <div className="sec-header pb-2">Share Character</div>
                          <MdHighlightOff
                            style={{ height: 24, width: 24, cursor: 'pointer' }}
                            onClick={() => closePostCreationModal()}
                          />
                        </div>
                        {charData?.visibility === 'PRIVATE' ? (
                          <div className="row justify-content-center align-items-center mt-4 mx-2">
                            <Alert color="primary">
                              This Character is private so sharing by link is
                              not available
                            </Alert>
                          </div>
                        ) : (
                          <div className="row justify-content-center align-items-center">
                            <div
                              className="w-100 text-muted pb-3 justify-content-start"
                              style={{ fontSize: '14px' }}
                            >
                              This <b>will not </b> share your converation with
                              others
                            </div>
                            <div className="row mb-2 d-flex align-items-center justify-content-center">
                              <input
                                type="text"
                                maxLength={40}
                                value={`${getShareUrlOrigin()}/c/${charData?.external_id
                                  }`}
                                style={{
                                  fontSize: '16px',
                                  borderWidth: '0 0 1px 0',
                                  width: isMobile ? '68%' : '400px',
                                }}
                              />
                              <Button
                                onClick={() => handleCopyLinkClick()}
                                className="d-flex justify-content-center align-items-center"
                                color="primary"
                                style={{ width: 90, height: 38, fontSize: 14 }}
                              >
                                Copy Link
                              </Button>
                            </div>
                            <div
                              className={`mt-2 row ${isMobile ? 'w-100' : 'w-50'
                                }`}
                            >
                              <SocialSharePanel
                                link={`${getShareUrlOrigin()}/c/${charData?.external_id
                                  }`}
                                shareTitle={
                                  'This AI will BLOW YOUR MIND 🤯 #characterai'
                                }
                                hideCopyButton
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {!isAnonymousUser(user) && (
                      <>
                        {!isRoom() && (
                          <div style={{ margin: `${isMobile ? 10 : 30}px 0` }}>
                            <hr />
                          </div>
                        )}

                        <div className="sec-header pb-2">
                          {isRoom() ? '' : 'or'} Share this Conversation
                        </div>
                        <div className="row justify-content-start align-items-center">
                          <div className="col-auto pe-0">
                            {/* Lazy user has no name */}
                            {user &&
                              showAvatar(
                                user.user?.account?.name ?? '',
                                avatarSize,
                                user.user?.account?.avatar_file_name ?? '',
                              )}
                          </div>
                          <div
                            className={`${isMobile ? 'col' : 'col-auto'
                              } align-items-center`}
                          >
                            <Dropdown
                              options={postVisibilityOptions}
                              onChange={(selItem) =>
                                handlePostVisibilityChange(selItem)
                              }
                              value={postVisibility}
                              placeholder="Select an option"
                            //#NOTE REACT-DROPDOWN DOES NOT SUPPORT STYLE
                            //   style={{
                            //     width: isMobile ? '100%' : '200px',
                            //   }}
                            />
                          </div>
                        </div>

                        <div className="sec-header mt-3">
                          Post Title (Optional)
                        </div>
                        <div
                          className={`row mb-2 w-100 ${isMobile
                            ? 'justify-content-center'
                            : 'justify-content-start'
                            }`}
                        >
                          <input
                            type="text"
                            className="form-control"
                            autoComplete="off"
                            id="post-title"
                            name="post-title"
                            placeholder="Add an Interesting Title"
                            autoFocus
                            maxLength={100}
                            value={postTitle}
                            onChange={handlePostChange}
                            style={{
                              fontSize: '16px',
                              borderWidth: '0 0 1px 0',
                              width: isMobile ? '100%' : '500px',
                              marginLeft: isMobile ? '0' : '12px',
                            }}
                          />
                        </div>
                        <div
                          className="w-100 text-muted pb-3 justify-content-start"
                          style={{ fontSize: '14px' }}
                        >
                          The post will contain a frozen snapshot of the present
                          state of this chat.
                        </div>
                        {postStartMessageIndex == null ? (
                          <div
                            className="col-auto ps-0 pb-1"
                            style={{ fontSize: '14px', fontWeight: 200 }}
                          >
                            By default the <b>whole</b> conversation is posted
                          </div>
                        ) : (
                          <div></div>
                        )}

                        <div className="pb-2">
                          <button
                            onClick={startSelectingPostStartEnd}
                            className="btn border btn-light"
                            style={{
                              fontSize: '14px',
                              width: isMobile ? '100%' : 'fit-content',
                            }}
                          >
                            Select Only Part of the Conversation
                          </button>
                        </div>

                        {postStartMessageIndex == null ? (
                          <></>
                        ) : (
                          <div className="row justify-content-start">
                            {displayMessageForPost(true)}

                            {/* TODO: delete conditional rendering of empty div */}
                            {viewMsgs.length > 2 &&
                              (postStartMessageIndex == null ||
                                postEndMessageIndex == null ||
                                postEndMessageIndex - postStartMessageIndex >
                                1) ? (
                              <div></div>
                            ) : (
                              <div></div>
                            )}

                            {displayMessageForPost(false)}
                          </div>
                        )}

                        <div
                          className={`${isMobile ? '' : 'row w-100 pt-4 justify-content-end'
                            }`}
                        >
                          <button
                            onClick={handleCreatePost}
                            className={'btn border btn-primary'}
                            style={{
                              width: isMobile ? '100%' : '200px',
                              filter: postButtonEnabled ? '' : 'grayscale(90%)',
                            }}
                            disabled={!postButtonEnabled}
                          >
                            Post Conversation!
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Modal>
            </div>
          </Hotkeys>
        )}
      </div>
    );
  };

  const renderUnauthorized = () => {
    return (
      <div className=" justify-content-center">
        <div className="row mb-3">
          This Character is not available to chat.{' '}
        </div>

        <div className="row justify-content-end">
          <div className="col-auto p-0">
            <button
              className="btn btn-primary border p-1"
              onClick={() => {
                navigate('/');
              }}
            >
              Go To Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="d-flex flex-row justify-content-center align-items-center"
      style={{ height: '100%' }}
    >
      {loading ? (
        <div
          className="d-flex justify-content-center"
          style={{ marginTop: 100 }}
        >
          <div className="spinner-border text-secondary" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      ) : authorized ? (
        <>
          {renderChatTop()}
          {renderMsgs()}
          {renderOptionalModals()}
          {!viewOnly && renderChatBottom()}
        </>
      ) : (
        renderUnauthorized()
      )}
    </div>
  );
};
