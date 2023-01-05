import Markdown from 'marked-react';
import Moment from 'moment';
import { MdChat } from 'react-icons/md';
import { Link } from 'react-router-dom';

import './Common.css';
import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import { buildUrlParams } from './utils.js';

const preventAutoNumbering = (text) => {
  // text starts with a number followed by period
  if (/^\s*\d+\./.test(text)) {
    return text.replace('.', '\\.');
  } else {
    return text;
  }
};

const avatarSize = 32;
const renderMsgBalloon = (msg, character, user) => {
  const msgClassNames = ['msg'];

  const showUserAvatar = (name, size, avatar_file_name) => {
    return (
      <InitialAvatar
        name={name}
        size={size}
        avatarFileName={
          avatar_file_name
            ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${avatar_file_name}`
            : ''
        }
      />
    );
  };

  return (
    <div className="row p-0 m-0">
      <div className="col-auto p-0">
        {msg.src.is_human
          ? showUserAvatar(
              user.account.name,
              avatarSize,
              user.account.avatar_file_name,
            )
          : showUserAvatar(
              msg.src.name,
              avatarSize,
              character.avatar_file_name,
            )}
      </div>
      <div className="col-10 p-2 pt-0">
        {msg.src.is_human ? (
          <span style={{ fontWeight: '600', fontSize: '15px' }}>
            {user.account.name}
          </span>
        ) : (
          <span style={{ fontWeight: '600', fontSize: '15px' }}>
            {character.participant__name}
          </span>
        )}
        <div>
          <div className="col">
            <div key={msg.id}>
              <div className="markdown-wrapper">
                {/* if candidate.text is a number followed by a period "2012."
                    markdown turns it into a 1. (perhaps interpretting as a number?)
                    adding space makes it a string.*/}
                <Markdown>{preventAutoNumbering(msg.text)}</Markdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//<span className="px-5" style={{ "fontWeight": "600", "fontSize": "18px" }}>⋮</span>

const CharacterHistory = (props) => {
  Moment.locale('en');
  //console.log(props.history.created)
  return (
    <Link
      className=""
      style={{ color: 'inherit', textDecoration: 'inherit' }}
      role="button"
      to={{
        pathname: `/chat${buildUrlParams({
          char: props.character.external_id,
          hist: props.history.external_id,
        })}`,
      }}
    >
      <div className="row justify-content-left">
        <div className="col-12">
          <div className="row justify-content-left">
            <div className="col-12">
              <span style={{ fontWeight: '600', fontSize: '15px' }}>
                {props.history.last_interaction
                  ? Moment(props.history.last_interaction).fromNow()
                  : Moment(props.history.created).fromNow()}{' '}
                · {props.history.msgs.length} messages
              </span>
            </div>
          </div>
          <div className=" mt-2 row justify-content-left">
            <div className="col-12">
              {props.history.msgs.length > 2 && (
                <span
                  className="px-5"
                  style={{ fontWeight: '600', fontSize: '24px' }}
                >
                  ⋮
                </span>
              )}
              {props.history.msgs.length > 1 &&
                renderMsgBalloon(
                  props.history.msgs[props.history.msgs.length - 2],
                  props.character,
                  props.user,
                )}
              {renderMsgBalloon(
                props.history.msgs[props.history.msgs.length - 1],
                props.character,
                props.user,
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CharacterHistory;
