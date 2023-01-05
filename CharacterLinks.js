import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import { buildUrlParams } from './utils.js';

/* Component that lists character chat links given props.history_external_id
 */

const CharacterLinks = (props) => {
  const [history, setHistory] = useState({});
  const MAX_PARTICIPANTS_IN_HEADER = 7;
  const avatarSize = 45;
  const getHeaders = () => {
    return {
      headers: { Authorization: 'Token ' + props.token },
    };
  };

  useEffect(() => {}, []);

  /* just render chattable participants */
  const renderParticipants = (participants) => {
    return (
      participants && (
        <div className="col-auto ">
          <div className="row align-items-center">
            {participants
              .slice(0, MAX_PARTICIPANTS_IN_HEADER)
              .filter((c) => {
                return !c.is_human;
              })
              .map((participant, i) => (
                <div
                  className="col-auto p-2 ms-1 justify-content-start msg-author-name border rounded"
                  style={{ boxShadow: '0 0 2px 0 rgba(0,0,0,0.25)' }}
                >
                  <Link
                    className=""
                    style={{ color: 'inherit', textDecoration: 'inherit' }}
                    role="button"
                    to={{
                      pathname: `/chat${buildUrlParams({
                        char: participant.character__external_id,
                      })}`,
                    }}
                  >
                    <InitialAvatar
                      name={participant.name}
                      size={avatarSize / 2}
                      avatarFileName={
                        participant.character__avatar_file_name
                          ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${participant.character__avatar_file_name}`
                          : ''
                      }
                    />
                    &nbsp;{participant.name}
                  </Link>
                </div>
              ))}
            {participants &&
              participants.length > MAX_PARTICIPANTS_IN_HEADER && (
                <div className="col-auto p-0 ps-1">...</div>
              )}
          </div>
        </div>
      )
    );
  };

  return (
    <div className="row justify-content-start align-items-center">
      <div className="col-auto pl-3 px-0">Start a New Chat With</div>
      {renderParticipants(props.participants)}
    </div>
  );
};

export default CharacterLinks;
