import Moment from 'moment';
import { isMobile } from 'react-device-detect';
import { IoChatbubblesOutline } from 'react-icons/io5';
import { MdHighlightOff, MdLink, MdLock, MdSettings } from 'react-icons/md';
import { Link } from 'react-router-dom';

import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import ImageGeneratingIcon from './components/ImageGeneratingIcon';
import { buildUrlParams } from './utils.js';
import { displayNumInteractions } from './utils/character-utils';

const CharacterCard = (props) => {
  const shouldRenderCreator = !props.hide.includes('creator');
  const shouldRenderStats = !props.hide.includes('stats');
  const shouldRenderVisibility = !props.hide.includes('visibility');
  const shouldRenderEdit = !props.hide.includes('edit');
  const showBorder = props.border;

  Moment.locale('en');

  const getCharMsg = () => {
    if (props.character.last_msg) {
      return props.character.last_msg;
    }
    if (props.character.title) {
      return props.character.title;
    }
    if (props.character.greeting) {
      return props.character.greeting;
    }
    return '';
  };

  return (
    <div
      className={
        'p-0 m-1 mb-' +
        (shouldRenderCreator || shouldRenderStats ? '3' : '1') +
        (showBorder ? ' border rounded p-2' : '')
      }
      style={{ boxShadow: showBorder ? '0 0 2px 0 rgba(0,0,0,0.25)' : '' }}
    >
      <Link
        className=""
        style={{ color: 'inherit', textDecoration: 'inherit' }}
        role="button"
        to={
          props.onHide
            ? '#'
            : {
                pathname: `/chat${buildUrlParams({
                  char: props.character.external_id,
                })}`,
              }
        }
      >
        <div className="row justify-content-left">
          <div className={props.isWide ? 'col-12' : 'col-10'}>
            <div className="row justify-content-left">
              <div className="col-auto align-items-center justify-content-center">
                {props.onHide && (
                  <button
                    onClick={() => {
                      props.onHide(props.character.external_id);
                    }}
                    className=" btn  p-1 mb"
                  >
                    <MdHighlightOff size={30} />
                  </button>
                )}
                <InitialAvatar
                  name={props.character.participant__name}
                  avatarFileName={
                    props.character.avatar_file_name
                      ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${props.character.avatar_file_name}`
                      : ''
                  }
                />
              </div>
              <div className="col">
                <div
                  className="row align-items-center "
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                  }}
                >
                  <span className="p-0">
                    <ImageGeneratingIcon
                      imageGenEnabled={props.character.img_gen_enabled}
                    />
                    {props.character.participant__name}
                    &nbsp;
                    {shouldRenderVisibility &&
                      props.character.visibility === 'PRIVATE' && (
                        <MdLock size={18} className="mb-1" />
                      )}
                    {shouldRenderVisibility &&
                      props.character.visibility === 'UNLISTED' && (
                        <MdLink size={18} className="mb-1" />
                      )}
                  </span>
                </div>
                <div
                  className="row"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(40, 40, 40, 1.0)',
                  }}
                >
                  <div className={`row ${isMobile ? 'description-short' : ''}`}>
                    {getCharMsg()}
                  </div>
                </div>
                {(shouldRenderCreator || shouldRenderStats) && (
                  <div>
                    <div
                      className="row"
                      style={{
                        fontSize: '12px',
                      }}
                    >
                      {shouldRenderCreator
                        ? '@' + props.character.user__username
                        : ''}
                      {shouldRenderCreator && shouldRenderStats && ' · '}
                      {shouldRenderStats && (
                        <span>
                          <IoChatbubblesOutline />
                          &nbsp;
                          {displayNumInteractions(
                            props.character.participant__num_interactions,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {shouldRenderEdit && (
            <div className="col-auto p-0 m-0">
              {(props.character.user__username === props.username ||
                ((props.character.visibility === 'PUBLIC' ||
                  props.character.visibility === 'UNLISTED') &&
                  props.character.copyable)) && (
                <Link
                  className={'btn p-2 m-0 border'}
                  role="button"
                  to={{
                    pathname: `/editing${buildUrlParams({
                      char: props.character.external_id,
                    })}`,
                  }}
                >
                  <MdSettings size={28} />
                </Link>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default CharacterCard;
