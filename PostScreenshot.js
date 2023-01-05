import axios from 'axios';
import Markdown from 'marked-react';
import React from 'react';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BsPinAngleFill } from 'react-icons/bs';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import './App.css';
import './Chat.css';
import ChatAutoPlay from './ChatAutoPlay';
import CommentsButton from './CommentsButton';
import './Common.css';
import InitialAvatar from './InitialAvatar';
import MoreOptionsButton from './MoreOptionsButton';
import RelativeTime from './RelativeTime';
import SocialShareButton from './SocialShareButton';
import UpvoteButton from './UpvoteButton';
import {
  buildUrlParams,
  getBooleanFromUrlParam,
  getHeaders,
  getShareUrlOrigin,
} from './utils.js';

const textFontSize = '15px';
const AVATAR_SIZE = 40;

/* If props.startWithSharing is true, the sharing modal will be opened when the
  SocialShareButton component mounts.
 */
const PostScreenshot = (props) => {
  const navigate = useNavigate();
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState([]);
  const [postId, setPostId] = useState('');
  const [user, setUser] = useState([]);
  const [publicParticipants, setPublicParticipants] = useState([]);
  const [newCommentText, setNewCommentText] = useState([]);
  const [commentButtonEnabled, setCommentButtonEnabled] = useState(false);
  const [waitingNewCommentCreation, setWaitingNewCommentCreation] =
    useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [startsWithSharing, setStartsWithSharing] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setPostId(urlParams.get('post'));
    setStartsWithSharing(getBooleanFromUrlParam(urlParams, 'share'));
    setUser(props.user);
    setLoaded((oldArray) => [...oldArray, 'user']);
  }, []);

  useEffect(() => {
    setUser(props.user);
    setLoaded((oldArray) => [...oldArray, 'user']);
  }, [props]);

  useEffect(() => {
    if (postId) {
      loadPost();
      // markPostAsSeen();
    }
  }, [postId]);

  useEffect(() => {
    if (loaded.includes('post')) {
      loadHistoryInfo();
      setLoading(false);
    }
  }, [loaded]);

  useEffect(() => {
    if (post) {
      setIsPinned(post.is_pinned);
    }
  }, [post]);

  const deleteClickedCallback = () => {
    navigate(`/posts?topic=${post.topic__external_id}`);
  };

  const loadPost = async () => {
    axios
      .get(`/chat/post/?post=${postId}`, getHeaders(props))
      .then((response) => {
        if (response.data.success === false) {
          alert(response.data.error);
        } else {
          setPost(response.data.post);
          setComments(response.data.comments);
          setLoaded((oldArray) => [...oldArray, 'post']);
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const loadHistoryInfo = async () => {
    if (!post.attached_history__external_id) {
      return;
    }
    return await axios
      .post(
        '/chat/history/participants/',
        {
          history_external_id: post.attached_history__external_id,
        },
        getHeaders(props),
      )
      .then((response) => {
        //console.log(response)
        if (response.data?.public_participants) {
          setPublicParticipants(response.data.public_participants);
        } else {
        }
      })
      .catch((err) => {
        props.handleServerError(err);
      });
  };

  const markPostAsSeen = async () => {
    if (props.token) {
      axios
        .post(
          '/chat/post/seen/',
          {
            post_external_id: postId,
          },
          getHeaders(props),
        )
        .then((response) => {})
        .catch((err) => {
          props.handleServerError(err);
          return false;
        });
    }
  };

  const renderButtons = () => {
    return (
      <div
        className="row justify-content-end align-items-start"
        style={{ paddingTop: '15px' }}
      >
        <UpvoteButton
          post={post}
          token={props.token}
          verticalLayout={false}
          handleServerError={props.handleServerError}
        />
        {getIsCommentingEnabled() && (
          <CommentsButton
            post={post}
            verticalLayout={false}
            disableClickThrough={true}
          />
        )}
        <SocialShareButton
          link={`${getShareUrlOrigin()}/p/${post.external_id}`}
          startOpened={startsWithSharing}
        />
        <MoreOptionsButton
          external_id={post.external_id}
          token={props.token}
          verticalLayout={false}
          handleServerError={props.handleServerError}
          deleteUrl={`/chat/post/delete/`}
          deletingEnabled={post.deleting_enabled}
          deleteClickedCallback={() => deleteClickedCallback()}
          waitDeleteApiCall={true}
          isRejectInsteadOfDelete={post.is_reject_instead_of_delete}
          reportUrl={'/chat/post/report/'}
          pinningEnabled={props.pinning_enabled}
          pinUrl={'/chat/post/pin/'}
          unpinUrl={'/chat/post/unpin/'}
          isPinned={post.is_pinned}
          togglePinClickedCallback={(newIsPinned) =>
            togglePinClickedCallback(newIsPinned)
          }
        />
      </div>
    );
  };

  const renderPost = () => {
    return (
      <div className="row">
        {/* {maybeRenderPinHeader()}
        <div className="row p-0 d-flex align-items-center justify-content-between border-bottom">
          <div className="col">
            <div className="row align-items-center justify-content-between">
              <div className="col">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <InitialAvatar
                      name={post.poster_username}
                      size={AVATAR_SIZE}
                    />
                  </div>
                  <div
                    className="col-auto ps-0"
                    style={{ fontSize: '15px', fontWeight: '500' }}
                  >
                    <div className="p-0 m-0" style={{ color: '#888888' }}>
                      {post.poster_username === user.user?.username ? (
                        <Link
                          className={'btn p-0 m-0'}
                          role="button"
                          to={{ pathname: `/profile/` }}
                        >
                          @{post.poster_username}
                        </Link>
                      ) : (
                        <Link
                          className={'btn p-0 m-0'}
                          role="button"
                          to={{
                            pathname: `/public-profile/${buildUrlParams({
                              username: post.poster_username,
                            })}`,
                          }}
                          state={post.poster_username}
                        >
                          @{post.poster_username}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-auto align-items-center">
                {renderButtons()}
              </div>
            </div>
          </div>
        </div>
        {publicParticipants.length > 0 && (
          <div className="row pb-2 pt-2  mb-3 border-bottom align-items-center">
            <CharacterLinks participants={publicParticipants} />
          </div>
        )}
        <div className="col-auto p-0">
          <Link
            className=""
            style={{ color: 'inherit', textDecoration: 'inherit' }}
            role="button"
            to={{
              pathname: `/post${buildUrlParams({
                post: post.external_id,
              })}`,
            }}
          >
            <div
              className="pb-2"
              style={{
                fontWeight: 'bold',
                fontSize: '15px',
                overflowWrap: 'break-word',
              }}
            >
              {post.title}
            </div>
          </Link>
          <div className="pb-2" style={{ fontSize: textFontSize }}>
            <div style={{ marginBottom: '-10px' }}>
              <Markdown>{post.text}</Markdown>
            </div>
          </div>
          <Link
            style={{ color: 'inherit', textDecoration: 'inherit' }}
            to={{
              pathname: `/post${buildUrlParams({
                post: post.external_id,
              })}`,
            }}
          >
            <div className="pb-2">
              <RelativeTime timestamp={post.created} />
            </div>
          </Link>
        </div> */}
        <ChatAutoPlay
          token={props.token}
          history_external_id={post.attached_history__external_id}
          post_external_id={post.external_id}
          autoplay={true}
          showFullConversation={true}
          largerText={true}
          // height="250px"
        />
      </div>
    );
  };

  const renderComment = (comment, index) => {
    return (
      <div
        className="row align-items-start justify-content-start"
        style={{ paddingLeft: '21.5px', paddingTop: '13px' }}
      >
        <div className="col-auto p-0 pe-1">
          <InitialAvatar name={comment.src__name} size={AVATAR_SIZE} />
        </div>
        <div
          className="col p-0"
          style={{ fontSize: textFontSize, marginLeft: '20px' }}
        >
          <div className="row" style={{ fontWeight: 'bold' }}>
            {comment.src__name}
          </div>
          <div className="row pt-1">
            <div style={{ marginLeft: '-11px', marginBottom: '-10px' }}>
              <Markdown>{comment.text}</Markdown>
            </div>
          </div>
          <div className="row" style={{ paddingLeft: '1px' }}>
            <RelativeTime timestamp={comment.created} />
          </div>
        </div>
      </div>
    );
  };

  const handleNewCommentChange = (event) => {
    setNewCommentText(event.target.value);
    setCommentButtonEnabled(event.target.value.length > 0);
  };

  const handleNewCommentKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleNewCommentSubmit();
    }
  };

  const resetNewCommentInputHeight = () => {
    const textArea = document.getElementById('new-comment-input');
    if (textArea) {
      textArea.style.height = '36px';
      return textArea;
    }
  };

  const handleNewCommentKeyUp = (event) => {
    const textArea = resetNewCommentInputHeight();
    if (textArea) {
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  };

  const handleNewCommentSubmit = () => {
    if (!newCommentText && waitingNewCommentCreation) {
      return;
    }
    comments.unshift({
      text: newCommentText,
      src__name: user.name,
    });
    // TODO: if isMobile, scroll to created comment.
    setWaitingNewCommentCreation(true);
    resetNewCommentInputHeight();
    setNewCommentText('');
    axios
      .post(
        '/chat/comment/create/',
        {
          post_external_id: post.external_id,
          text: newCommentText,
        },
        getHeaders(props),
      )
      .then((response) => {
        if (response.data.room && response.data.room.external_id) {
          window.location.replace(
            `/chat${buildUrlParams({ hist: response.data.room.external_id })}`,
          );
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      })
      .finally(() => {
        setWaitingNewCommentCreation(false);
      });
  };

  const renderCommentEntry = () => {
    return (
      <div
        className={`row justify-content-start align-items-center ${
          isMobile ? 'position-fixed bottom-0 w-100 border-top' : ''
        }`}
        style={
          isMobile
            ? {
                paddingTop: '5px',
                paddingBottom: '90px',
                backgroundColor: 'white',
              }
            : {}
        }
      >
        <div className="col-auto pe-0" style={{ paddingLeft: '10px' }}>
          {/* TODO: Should be user.participant.name */}

          <InitialAvatar name={user.name} size={AVATAR_SIZE} />
        </div>
        <div className="col p-0" style={{ fontSize: textFontSize }}>
          <div className="text-muted d-flex justify-content-start align-items-center p-0 mx-0 bg-white">
            <div className="input-group ms-2 my-0">
              {/* The form is to help mobile browsers show a send button instead
                of return */}
              <textarea
                id="new-comment-input"
                value={newCommentText}
                className="bg-white form-control shadow-none"
                style={{ fontSize: '11pt' }}
                onChange={(event) => handleNewCommentChange(event)}
                onKeyDown={(event) => handleNewCommentKeyDown(event)}
                onKeyUp={(event) => handleNewCommentKeyUp(event)}
                enterKeyHint="send"
                rows="1"
                maxLength={10000}
                placeholder="Leave a comment"
              />
              <button
                className="btn btn-primary py-0 ms-1 me-2"
                style={{
                  zIndex: 0, // otherwise it will go over modals.
                  borderRadius: '0px',
                  fontSize: '14px',
                  filter: commentButtonEnabled ? '' : 'grayscale(90%)',
                }}
                type="button"
                onClick={() => handleNewCommentSubmit()}
                disabled={!commentButtonEnabled}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComments = () => {
    if (!loading && comments !== undefined) {
      return (
        <div>
          {comments.length === 0 ? (
            <div className="mt-5">
              <span>No comments yet. You can be the first.</span>
            </div>
          ) : (
            <div className="">
              {comments.map((comment, index) => (
                <div key={index} className="row">
                  {renderComment(comment, index)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  const handleBack = () => {
    if (window.history.state.idx === 0) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const renderBackButton = () => {
    return (
      <div className="p-0">
        {window.history.state.idx !== 0 && (
          <button className={'btn'} role="button" onClick={handleBack}>
            <MdArrowBackIosNew size={24} />
          </button>
        )}
      </div>
    );
  };

  const togglePinClickedCallback = (newIsPinned) => {
    setIsPinned(newIsPinned);
  };

  const maybeRenderPinHeader = () => {
    if (!isPinned) {
      return;
    }
    return (
      <div
        className="d-flex flex-row pt-2 pb-3 align-items-center"
        style={{ marginLeft: '-7px' }}
      >
        <div className="d-flex flex-column pe-2">
          <BsPinAngleFill size={22} />
        </div>
        <div className="d-flex flex-column" style={{ fontSize: '12px' }}>
          Pinned by the staff
        </div>
      </div>
    );
  };

  const getIsCommentingEnabled = () => {
    return post.posting_enabled && !post.is_locked;
  };

  const hideModal = (modalName) => {
    const elem = document.getElementsByClassName(modalName)[0];
    if (elem) {
      elem.style.display = 'none';
    }
  };
  // NOTE(prajit): Gets rid of Cookie and Character modal.
  hideModal('CookieConsent');
  hideModal('modal');
  hideModal('modal-backdrop');

  return (
    <div>
      {/* <MobileView>
        <div className={navClassNames} style={getNavStyle()}>
          <Nav token={props.token} />
        </div>
      </MobileView>
      <LoginModal
        setLoginOpen={props.setLoginOpen}
        login={props.login}
        waitlist={props.waitlist}
        handleServerError={props.handleServerError}
      />
      <Header user={props.user} /> */}
      <div className="container-fluid overflow-auto p-0">
        {/* {!isMobile && <Nav token={props.token} />} */}
        {loading ? (
          <div className="d-flex justify-content-center m-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="sr-only"></span>
            </div>
          </div>
        ) : (
          <div
            className="container d-flex justify-content-left align-items-center"
            // style={{ maxWidth: '750px' }}
            style={{ maxWidth: '1300px' }}
          >
            <div className="w-100 p-0">
              <div className="container-fluid p-0 m-0">
                {/* <div className="row pb-2 border-bottom"> */}
                <div className="row pb-2">
                  {/* <div className="col-1 p-0 pt-2">{renderBackButton()}</div> */}
                  <div
                    className="col"
                    style={{
                      paddingTop: '8px',
                      marginLeft: '10px',
                    }}
                  >
                    {renderPost()}
                  </div>
                </div>
                {/* {getIsCommentingEnabled() && (
                  <div>
                    <div
                      id="post-comments-label"
                      className="py-3"
                      style={{ fontWeight: '700' }}
                    >
                      Comments
                    </div>
                    {!isMobile && renderCommentEntry()}
                    <div className="row">{renderComments()}</div>
                    {isMobile && renderCommentEntry()}
                  </div>
                )}
                <div className="p-5">
                  <span></span>
                </div>
                <div className="p-5">
                  <span></span>
                </div> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostScreenshot;
