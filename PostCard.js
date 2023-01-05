import classNames from 'classnames';
import Moment from 'moment';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BsPinAngleFill } from 'react-icons/bs';
import { MdLink } from 'react-icons/md';
import { Link } from 'react-router-dom';

import * as Constants from './Constants';
import ChatAutoPlay from './ChatAutoPlay';
import CommentsButton from './CommentsButton.js';
import EmbeddedImage from './components/EmbeddedImage';
import MoreOptionsButton from './MoreOptionsButton';
import SocialShareButton from './SocialShareButton';
import StaffIcon from './StaffIcon';
import UpvoteButton from './UpvoteButton';
import { buildUrlParams, getShareUrlOrigin, renderAvatar } from './utils.js';

/*
props:

post: post object to show.
commentingEnabled: boolean to show/hide the comments button/counter.
pinningEnabled: boolean to show/hide the post pin button.

optional props:

startWithSharing: when the post details is opened (by clicking this PostCard) the
  sharing modal will be automatically opened.

seenPostIndicationEnabled: if true, the post will be greyed out when already seen by
  the user.
*/
const PostCard = (props) => {
  Moment.locale('en');

  const isTallCard = Boolean(props.post.attached_history__external_id);
  const [isPinned, setIsPinned] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(false);
  const handleSpeedClick = props.handleSpeedClick;

  useEffect(() => {
    if (props.post) {
      setIsPinned(props.post.is_pinned);
    }
  }, []);

  useEffect(() => {
    setTypingSpeed(props.typingSpeed);
  }, [props.typingSpeed]);

  const renderPostedBy = () => {
    return (
      <div
        className="d-flex flex-row py-1 text-muted align-items-center"
        style={{ fontSize: '15px' }}
      >
        <div>Posted by</div>
        <div className="ps-1">
          {renderAvatar(
            props.post.poster__username,
            30,
            props.post.poster_avatar_file_name,
          )}
        </div>
        <div className="ps-1">
          {`@${props.post.poster__username}`}
          {!props.post.attached_history__external_id &&
            props.post.poster__is_staff && <StaffIcon />}
        </div>
        <div className="ps-1">{`${Moment(props.post.created).fromNow()}`}</div>
      </div>
    );
  };

  const maybeRenderPinHeader = () => {
    if (!isPinned) {
      return;
    }
    return (
      <div className="d-flex flex-row pt-2 pb-2 align-items-center">
        <div className="d-flex flex-column pe-2">
          <BsPinAngleFill size={22} />
        </div>
        <div className="d-flex flex-column" style={{ fontSize: '12px' }}>
          Pinned by the staff
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div>
        {maybeRenderPinHeader()}
        {renderPostedBy()}
        <div
          className="dflex flex-row pt-1"
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          {props.post.title}{' '}
          {props.post.visibility === 'UNLISTED' && (
            <MdLink size={18} className="mb-1" />
          )}
        </div>
      </div>
    );
  };

  const togglePinClickedCallback = (newIsPinned) => {
    setIsPinned(newIsPinned);
    window.location.reload();
  };

  const renderButtons = () => {
    const buttonsClassNames = classNames({
      'd-flex': true,
      'flex-column': isTallCard,
      'pt-1': isTallCard,
      'ps-2': isTallCard,
      'pe-1': isMobile && isTallCard,
      'justify-content-center': isTallCard,

      'flex-row': !isTallCard,
      'justify-content-end': !isTallCard,
      'pb-2': !isTallCard,
    });
    return (
      <div className={buttonsClassNames}>
        <UpvoteButton
          post={props.post}
          token={props.token}
          verticalLayout={isTallCard}
          handleServerError={props.handleServerError}
        />
        {props.commentingEnabled && (
          <CommentsButton post={props.post} verticalLayout={isTallCard} />
        )}
        <div className={`${isTallCard ? 'px-0' : 'px-2'}`}>
          <SocialShareButton
            link={`${getShareUrlOrigin()}/p/${props.post.external_id}`}
            shareTitle={props.shareTitle}
          />
        </div>
        <MoreOptionsButton
          external_id={props.post.external_id}
          token={props.token}
          verticalLayout={isTallCard}
          handleServerError={props.handleServerError}
          deleteUrl={'/chat/post/delete/'}
          deletingEnabled={props.post.deleting_enabled}
          deleteClickedCallback={props.deleteClickedCallback}
          waitDeleteApiCall={false}
          isRejectInsteadOfDelete={props.post.is_reject_instead_of_delete}
          reportUrl={'/chat/post/report/'}
          pinningEnabled={props.pinningEnabled}
          pinUrl={'/chat/post/pin/'}
          unpinUrl={'/chat/post/unpin/'}
          isPinned={props.post.is_pinned}
          togglePinClickedCallback={(newIsPinned) =>
            togglePinClickedCallback(newIsPinned)
          }
        />
      </div>
    );
  };

  const renderSpeedButtons = () => {
    const buttonStyle = {
      borderRadius: '100%',
      width: '38px',
      height: '38px',
      fontSize: '13.5px',
      fontWeight: 'bold',
      boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.33)',
    };
    const buttonActiveBgColor = '#555555';
    const buttonActiveColor = 'white';
    const buttonHalfXStyle = {
      ...buttonStyle,
      color: typingSpeed < 1 ? buttonActiveColor : 'black',
      backgroundColor: typingSpeed < 1 ? buttonActiveBgColor : 'white',
    };
    const button1XStyle = {
      ...buttonStyle,
      color: typingSpeed === 1 ? buttonActiveColor : 'black',
      backgroundColor: typingSpeed === 1 ? buttonActiveBgColor : 'white',
    };
    const button2XStyle = {
      ...buttonStyle,
      color: typingSpeed === 2 ? buttonActiveColor : 'black',
      backgroundColor: typingSpeed === 2 ? buttonActiveBgColor : 'white',
    };
    const button3XStyle = {
      ...buttonStyle,
      color: typingSpeed === 3 ? buttonActiveColor : 'black',
      backgroundColor: typingSpeed === 3 ? buttonActiveBgColor : 'white',
    };
    return (
      <div className="d-flex flex-row justify-content-end pb-3">
        <button
          className="btn"
          title="0.5X Speed"
          onClick={() => handleSpeedClick(0.5)}
        >
          <div
            className="d-flex flex-row justify-content-center align-items-center"
            style={buttonHalfXStyle}
          >
            0.5x
          </div>
        </button>
        <button
          className="btn"
          title="1X Speed"
          onClick={() => handleSpeedClick(1)}
        >
          <div
            className="d-flex flex-row justify-content-center align-items-center"
            style={button1XStyle}
          >
            1x
          </div>
        </button>
        <button
          className="btn"
          title="2X Speed"
          onClick={() => handleSpeedClick(2)}
        >
          <div
            className="d-flex flex-row justify-content-center align-items-center"
            style={button2XStyle}
          >
            2x
          </div>
        </button>
        <button
          className="btn"
          title="3X Speed"
          onClick={() => handleSpeedClick(3)}
        >
          <div
            className="d-flex flex-row justify-content-center align-items-center"
            style={button3XStyle}
          >
            3x
          </div>
        </button>
      </div>
    );
  };

  const getImagePath = (post) => {
    return post.image_rel_path
      ? `${Constants.CDN_POST_IMAGE_URL}/static/posts/images/${post.image_rel_path}`
      : '';
  }

  return (
    <div
      className="row px-2 pt-1 mb-2 align-items-center"
      style={{
        borderRadius: '10px',
        boxShadow: '0 0 5px 0 rgba(0,0,0,0.2)',
        maxWidth: '640px',
      }}
    >
      <div
        className={
          props.seenPostIndicationEnabled && props.post.seen ? 'text-muted' : ''
        }
      >
        <div className="d-flex flex-column">
          <div className="d-flex flex-row">
            <Link
              className="w-100"
              style={{ color: 'inherit', textDecoration: 'inherit' }}
              role="button"
              to={{
                pathname: `/post${buildUrlParams({
                  post: props.post.external_id,
                })}`,
              }}
            >
              <div className="d-flex flex-column">
                {renderHeader()}
                {
                  !props.post.attached_history__external_id &&
                  props.post.image_rel_path &&
                  <div className="d-flex flex-row justify-content-center">
                      <EmbeddedImage
                        imageSize="40%"
                        imagePath={getImagePath(props.post)}
                      />
                  </div>
                }
                {props.post.attached_history__external_id && (
                  <div className="d-flex flex-col ps-3 w-100">
                    <ChatAutoPlay
                      token={props.token}
                      history_external_id={
                        props.post.attached_history__external_id
                      }
                      post_external_id={props.post.external_id}
                      autoplay={props.autoplay}
                      speed={props.typingSpeed}
                    />
                  </div>
                )}
              </div>
            </Link>
            {isTallCard && renderButtons()}
          </div>
          {props.post.attached_history__external_id && renderSpeedButtons()}
          {!isTallCard && renderButtons()}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
