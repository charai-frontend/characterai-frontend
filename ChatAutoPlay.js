import axios from 'axios';
import classNames from 'classnames';
import Markdown from 'marked-react';
import Moment from 'moment';
import React from 'react';
import { useEffect, useState } from 'react';

import CharacterIcon from './CharacterIcon.js';
import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import EmbeddedImage from './components/EmbeddedImage';
import { getHeaders, sleepMilliSecs, stripImagePromptText } from './utils.js';

/* Component that autoplays chat given its props.history_external_id

Mandatory props:
post_external_id

To show full conversation instead of autoplaying, set props.autoPlay to true and
props.showFullConversation to true.

Optional props:

- speed (can be 0.5, 1, 2 or 3)
- It will only autoplay if props.autoplay is true. It will pause if props.autoplay is
false, and it will resume if it becomes true again.
*/
const ChatAutoPlay = (props) => {
  Moment.locale('en');

  const [msgs, setMsgs] = useState([]);
  const [cachedMsgs, setCachedMsgs] = useState([]);
  const [currentCachedMsgIdx, setCurrentCachedMsgIdx] = useState(0);
  const [typing, setTyping] = useState(false);
  const [waitingBetweenMsgs, setWaitingBetweenMsgs] = useState(false);
  const [finalMsgLoaded, setFinalMsgLoaded] = useState(false);

  // All delays are in milliseconds.

  const DEFAULT_MESSAGE_DELAY = 1500;
  const DEFAULT_CHUNK_DELAY = 320;
  const DEFAULT_CHUNK_SIZE = 16;
  const DEFAULT_SENTENCE_DELAY = 1080;

  // Delays for when the typewriter effect is disabled.
  // Time every message stays on for.
  const BASE_MSG_DELAY = 1000;
  // Additional time the message on per character in the displayed message (no
  // typewriter effect though). This gives the user more time to read longer messages.
  const DELAY_PER_CHARACTER = 10;
  // We show a brief typing dots animation before the next message is displayed.
  // This is the delay for that.

  const [disableTypewriterSetting, setDisableTypewriter] = useState(false);
  const [chunkSizeSetting, setChunkSizeSetting] = useState(DEFAULT_CHUNK_SIZE);
  const [messageDelaySetting, setMessageDelay] = useState(
    DEFAULT_MESSAGE_DELAY,
  );
  const [chunkDelaySetting, setChunkDelay] = useState(DEFAULT_CHUNK_DELAY);
  const [sentenceDelaySetting, setSentenceDelay] = useState(
    DEFAULT_SENTENCE_DELAY,
  );

  function get_boolean_param(urlParams, field) {
    const val = urlParams.get(field);
    if (val) {
      return val === 'true';
    } else {
      return false;
    }
  }

  useEffect(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    setDisableTypewriter(get_boolean_param(urlParams, 'disable_typewriter'));
  }, []);

  useEffect(async () => {
    if (props.speed < 1) {
      // See constants above for delays used when the typewriter effect is
      // disabled.
      setDisableTypewriter(true);
    } else if (props.speed == 1) {
      setDisableTypewriter(false);
      setChunkSizeSetting(DEFAULT_CHUNK_SIZE);
      setMessageDelay(DEFAULT_MESSAGE_DELAY);
      setChunkDelay(DEFAULT_CHUNK_DELAY);
      setSentenceDelay(DEFAULT_SENTENCE_DELAY);
    } else if (props.speed == 2) {
      setDisableTypewriter(false);
      setChunkSizeSetting(DEFAULT_CHUNK_SIZE);
      setMessageDelay(DEFAULT_MESSAGE_DELAY / 1.8);
      setChunkDelay(DEFAULT_CHUNK_DELAY / 2);
      setSentenceDelay(DEFAULT_SENTENCE_DELAY / 1.8);
    } else if (props.speed == 3) {
      setDisableTypewriter(false);
      setChunkSizeSetting(1);
      setMessageDelay(DEFAULT_MESSAGE_DELAY / 6);
      setChunkDelay(DEFAULT_CHUNK_DELAY / 2 / 16);
      setSentenceDelay(DEFAULT_SENTENCE_DELAY / 3);
    }
  }, [props.speed]);

  useEffect(async () => {
    if (props.history_external_id) {
      if (props.showFullConversation) {
        await getAllMessages(props.history_external_id);
        setDisableTypewriter(true);
      } else if (props.autoplay) {
        if (currentCachedMsgIdx > 0) {
          addMessage();
        } else {
          await cacheAllMessages(props.history_external_id);
        }
      }
    }
  }, [props.autoplay]);

  const scrollToBottom = () => {
    const msgsContainer = document.getElementById(
      `${props.post_external_id}-msgs`,
    );
    if (!msgsContainer) {
      return;
    }
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
  };

  useEffect(async () => {
    if (msgs.length == 0) return;
    let disableTypewriter = disableTypewriterSetting;
    let chunkSize = chunkSizeSetting;
    let messageDelay = messageDelaySetting;
    let chunkDelay = chunkDelaySetting;
    let sentenceDelay = sentenceDelaySetting;
    let alreadyScrolled = false;

    // A user maybe moving the screen a lot. If so, complete any previously pending typing.
    //
    // TODO(Romal): This did not fully fix the problem. Fix later.
    msgs.map((msg, index) => {
      msg = stripImagePromptText(
        msg,
        msg.src__character__img_gen_enabled,
        msg.src__character__strip_img_prompt_from_msg,
      );

      if (msg.typewriter_text !== msg.text) {
        if (index !== msgs.length - 1) {
          msg.typewriter_text = msg.text;
        } else if (msg.typewriter_text == null) {
          msg.typewriter_text = '';
        }
      }
    });

    if (!props.autoplay) {
      return;
    }
    let last_msg = msgs[msgs.length - 1];
    if (!last_msg) {
      return;
    }
    let second_to_last_msg = null;
    if (msgs.length > 1) {
      second_to_last_msg = msgs[msgs.length - 2];
    }
    if (!disableTypewriter && last_msg.typewriter_text !== last_msg.text) {
      // Welcome! We are in the typewriter mode!!
      if (last_msg.typewriter_text !== '') {
        await sleepMilliSecs(chunkDelay);
        if (['? ', '. ', '! '].includes(last_msg.typewriter_text.slice(-2))) {
          await sleepMilliSecs(sentenceDelay);
        }
      }
      let chunk = last_msg.text.substring(
        last_msg.typewriter_text.length,
        last_msg.typewriter_text.length + chunkSize,
      );
      let indexOfLastSentence = Math.max(
        chunk.lastIndexOf('. '),
        chunk.lastIndexOf('? '),
        chunk.lastIndexOf('! '),
      );
      if (indexOfLastSentence != -1 && last_msg.typewriter_text !== '') {
        last_msg.typewriter_text = last_msg.text.substring(
          0,
          last_msg.typewriter_text.length + indexOfLastSentence + 2,
        );
      } else {
        let indexOfLastWord = chunk.lastIndexOf(' ');
        if (indexOfLastWord != -1 && indexOfLastWord > chunkSize / 2) {
          last_msg.typewriter_text = last_msg.text.substring(
            0,
            last_msg.typewriter_text.length + indexOfLastWord + 1,
          );
        } else {
          last_msg.typewriter_text = last_msg.text.substring(
            0,
            last_msg.typewriter_text.length + chunkSize,
          );
        }
      }
      setMsgs(msgs.slice(0, -1).concat([last_msg]));
    } else {
      // TODO: just fetch all msgs at once when props.showFullConversation is true
      // instead of the following workaround.
      if (!props.showFullConversation) {
        if (!disableTypewriter) {
          setTyping(false);
          await sleepMilliSecs(messageDelay);
        } else {
          setWaitingBetweenMsgs(true);
          if (second_to_last_msg) {
            await sleepMilliSecs(
              BASE_MSG_DELAY +
                second_to_last_msg.text.length * DELAY_PER_CHARACTER,
            );
          }
          setWaitingBetweenMsgs(false);
          setTyping(true);
          scrollToBottom();
          alreadyScrolled = true;
          await sleepMilliSecs(
            1.8 * (BASE_MSG_DELAY + last_msg.text.length * DELAY_PER_CHARACTER),
          );
        }
        setTyping(false);
        setCurrentCachedMsgIdx(currentCachedMsgIdx + 1);
      }
    }
    if (!alreadyScrolled) {
      scrollToBottom();
    }
  }, [msgs]);

  useEffect(() => {
    addMessage();
  }, [currentCachedMsgIdx]);

  const addMessage = () => {
    if (currentCachedMsgIdx == 0) return;
    if (currentCachedMsgIdx > cachedMsgs.length) {
      setFinalMsgLoaded(true);
    } else {
      setMsgs([...new Set([...msgs, cachedMsgs[currentCachedMsgIdx - 1]])]);
    }
  };

  const getMessages = async (historyExternaId, responseHandler) => {
    const url = `/chat/history/external/msgs/?history=${historyExternaId}`;
    axios
      .get(url, getHeaders(props))
      .then(responseHandler)
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const getAllMessages = async (historyExternaId) => {
    getMessages(historyExternaId, (response) => {
      setMsgs(response.data.messages);
      setFinalMsgLoaded(true);
    });
  };

  const cacheAllMessages = async (historyExternaId) => {
    getMessages(historyExternaId, (response) => {
      setCachedMsgs(response.data.messages);
      setCurrentCachedMsgIdx(1);
    });
  };

  const renderMsgText = (key, msg) => {
    const msgsClassNames = ['row', 'msg', 'markdown-wrapper-feed'];
    if (key !== 0 && key === msgs.length - 1) {
      if (!disableTypewriterSetting) {
        msgsClassNames.push('last-msg');
      }
      if (typing) {
        return (
          <React.Fragment>
            <span> </span>
            <span className="typing-dot typing-dot-light-bg"></span>
            <span className="typing-dot typing-dot-light-bg"></span>
            <span className="typing-dot typing-dot-light-bg"></span>
            <span> </span>
          </React.Fragment>
        );
      }
    }
    if (props.largerText) {
      msgsClassNames.push('larger-text');
    }
    if (!disableTypewriterSetting) {
      return (
        <div className={msgsClassNames.join(' ')}>
          <Markdown>{msg.typewriter_text}</Markdown>
        </div>
      );
    }
    return (
      <div className={msgsClassNames.join(' ')}>
        <Markdown>{msg.text}</Markdown>
      </div>
    );
  };

  const renderMsg = (index, msg) => {
    if (index !== 0 && index === msgs.length - 1 && waitingBetweenMsgs) {
      return;
    }

    if (msg.deleted) {
      return;
    }

    const charAvatarFileName = msg.src__character__avatar_file_name;
    const charUserFileName = msg.src__user__account__avatar_file_name;
    // TODO(daniel): create msg card and share it with chat.
    const msgRowClassNames = classNames({
      row: true,
      'pb-3': true,
    });
    return (
      <div key={index} className={msgRowClassNames}>
        <div className="col-auto p-0">
          <InitialAvatar
            name={msg.src__name}
            avatarFileName={
              charAvatarFileName
                ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${charAvatarFileName}`
                : charUserFileName
                ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${charUserFileName}`
                : ''
            }
            size={45}
          />
        </div>
        <div className="col ms-2 pb-2">
          <div
            className={
              props.largerText
                ? 'row msg-author-name larger-text'
                : 'row msg-author-name'
            }
          >
            <div
              className="col-auto p-0"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {msg.src__name}
              <CharacterIcon
                msg={msg}
                isCharacter={!msg.src__is_human}
                responsibleUser={
                  msg.src__is_human
                    ? msg.src__user__username
                    : msg.responsible_user__username
                }
                badgeReason={msg.badge_reason}
              />
            </div>
          </div>
          {renderMsgText(index, msg)}
          <EmbeddedImage imagePath={msg.image_rel_path} />
        </div>
      </div>
    );
  };

  const maybeRenderMsgs = () => {
    let height = 'auto';
    const msgsClassNames = classNames({
      container: true,
      'pt-3': true,
    });
    if (props.history_external_id) {
      if (props.showFullConversation) {
        height = 'auto';
      } else if (props.height) {
        height = props.height;
      } else {
        height = `${window.innerHeight * 0.6}px`;
      }
    }
    return (
      <div
        id={`${props.post_external_id}-msgs`}
        className={msgsClassNames}
        style={{
          height: height,
          overflowY: 'hidden',
        }}
      >
        {msgs.map((msg, index) => (
          <div key={index}>{renderMsg(index, msg)}</div>
        ))}

        {/* Filler row to push text a bit up */}
        <div
          className="row"
          id={finalMsgLoaded ? 'all-posts-loaded' : ''}
          style={{ height: '80px' }}
        ></div>
      </div>
    );
  };

  return <div className="row w-100">{maybeRenderMsgs()}</div>;
};

export default ChatAutoPlay;
