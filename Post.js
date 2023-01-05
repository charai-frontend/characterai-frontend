import axios from 'axios';
import Markdown from 'marked-react';
import React from 'react';
import { useEffect, useState } from 'react';
import { MobileView, isMobile } from 'react-device-detect';
import { BsPinAngleFill } from 'react-icons/bs';
import { MdArrowBackIosNew, MdHighlightOff, MdLink } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Alert } from 'reactstrap';

import { isAnonymousUser } from './App';
import './App.css';
import CharacterLinks from './CharacterLinks';
import './Chat.css';
import ChatAutoPlay from './ChatAutoPlay';
import CommentsButton from './CommentsButton';
import './Common.css';
import * as Constants from './Constants';
import { FEED_TOPIC_ID } from './Feed';
import Header from './Header';
import LoginModal from './LoginModal';
import MoreOptionsButton from './MoreOptionsButton';
import Nav, { getNavStyle, navClassNames } from './Nav';
import RelativeTime from './RelativeTime';
import SocialShareButton from './SocialShareButton';
import StaffIcon from './StaffIcon';
import UpvoteButton from './UpvoteButton';
import EmbeddedImage from './components/EmbeddedImage';
import {
  buildUrlParams,
  getBooleanFromUrlParam,
  getHeaders,
  getShareUrlOrigin,
  renderAvatar,
} from './utils.js';

const textFontSize = '15px';
const AVATAR_SIZE = 40;

/* If props.startWithSharing is true, the sharing modal will be opened when the
  SocialShareButton component mounts.
 */
const Post = (props) => {
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
  const [activeParentComment, setActiveParentComment] = useState(null);

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
      if (!isAnonymousUser(props.user)) {
        markPostAsSeen();
      }
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
    navigate(-1);
  };

  const commentDeleteClickedCallback = (comment) => {
    const newComments = comments.filter((c) => c.id !== comment.id);
    setComments([...newComments]);
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
          pinningEnabled={post.pinning_enabled}
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

  const refreshComments = () => {
    setComments([...comments]);
  };

  const openReplyForm = (comment) => {
    setActiveParentComment(comment);
    comment.showReplyForm = true;
    refreshComments();
  };

  const renderCommentButtons = (comment) => {
    if (isAnonymousUser(props.user)) {
      return null;
    }

    return (
      <div className="row justify-content-end align-items-center">
        {
          // TODO: add like button for comments.
          /* <UpvoteButton
            post={post}
            token={props.token}
            verticalLayout={false}
            handleServerError={props.handleServerError}
          /> */
        }
        <div
          id={`more-options-${props.external_id}`}
          className="d-flex flex-column align-items-center"
          style={{ height: 'fit-content', width: 'fit-content' }}
        >
          <button
            className="btn rounded border-0 py-0 ms-1 me-2"
            style={{
              zIndex: 0, // otherwise it will go over modals.
              borderRadius: '0px',
              fontSize: '12px',
            }}
            type="button"
            onClick={() => openReplyForm(comment)}
          >
            Reply
          </button>
        </div>
        <div className="col-auto p-0 pb-1">
          {/*
            The pb-1 above is just to align the "..." button with the preceding reply
            button.
           */}
          <MoreOptionsButton
            // TODO: replace with real comment external id.
            external_id={comment.id}
            token={props.token}
            verticalLayout={false}
            handleServerError={props.handleServerError}
            deleteUrl={`/chat/comment/delete/`}
            deletingEnabled={comment.deleting_enabled}
            deleteClickedCallback={() => commentDeleteClickedCallback(comment)}
            waitDeleteApiCall={false}
            isRejectInsteadOfDelete={comment.is_reject_instead_of_delete}
            // TODO: support backend for this.
            reportingEnabled={false}
            // TODO: does it make sense to have pinned comments under the post?
            pinningEnabled={false}
            // pinUrl={'/chat/post/pin/'}
            // unpinUrl={'/chat/post/unpin/'}
            // isPinned={post.is_pinned}
            // togglePinClickedCallback={(newIsPinned) =>
            //   togglePinClickedCallback(newIsPinned)
            // }
          />
        </div>
      </div>
    );
  };

  const renderPosterCard = () => {
    return (
      <div className="row align-items-center">
        <div className="col-auto">
          {renderAvatar(
            post.poster_username,
            AVATAR_SIZE,
            post.poster_avatar_file_name,
          )}
        </div>
        <div
          className="col-auto ps-0"
          style={{ fontSize: '15px', fontWeight: '500' }}
        >
          <div className="p-0 m-0" style={{ color: '#888888' }}>
            @{post.poster_username}
            {!post.attached_history__external_id && post.poster__is_staff && (
              <StaffIcon />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderClickableUserTag = (renderUserTagCallback, username) => {
    return (
      <div>
        {username === user.user?.username ? (
          <Link
            className={'btn p-0 m-0'}
            role="button"
            to={{ pathname: `/profile/` }}
          >
            {renderUserTagCallback()}
          </Link>
        ) : (
          <Link
            className={'btn p-0 m-0'}
            role="button"
            to={{
              pathname: `/public-profile/${buildUrlParams({
                username: username,
              })}`,
            }}
            state={username}
          >
            {renderUserTagCallback()}
          </Link>
        )}
      </div>
    );
  };

  const renderPost = () => {
    const imagePath = post.image_rel_path
      ? `${Constants.CDN_POST_IMAGE_URL}/static/posts/images/${post.image_rel_path}`
      : '';

    return (
      <div className="row">
        {maybeRenderPinHeader()}
        <div className="row p-0 d-flex align-items-center justify-content-between border-bottom">
          <div className="col">
            <div className="row align-items-center justify-content-between">
              <div className="col">
                {renderClickableUserTag(renderPosterCard, post.poster_username)}
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
        <div className="col-auto p-0 w-100">
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
              {post.title}{' '}
              {post.visibility === 'UNLISTED' && (
                <MdLink size={18} className="mb-1" />
              )}
            </div>
          </Link>
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
          <div className="pb-2" style={{ fontSize: textFontSize }}>
            <div style={{ marginBottom: '-10px' }}>
              <Markdown>{post.text}</Markdown>
            </div>
          </div>
          {imagePath && (
            <div className="d-flex flex-row justify-content-center">
              <EmbeddedImage imagePath={imagePath} imageSize="40%" />
            </div>
          )}
        </div>
        <ChatAutoPlay
          token={props.token}
          history_external_id={post.attached_history__external_id}
          post_external_id={post.external_id}
          autoplay={true}
          showFullConversation={true}
          height="250px"
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
          {renderClickableUserTag(() => {
            return renderAvatar(
              comment.src__user__username,
              AVATAR_SIZE,
              comment.src__user__account__avatar_file_name,
            );
          }, comment.src__user__username)}
        </div>
        <div
          className="col p-0"
          style={{ fontSize: textFontSize, marginLeft: '20px' }}
        >
          <div className="row">
            <div className="col p-0">
              {renderClickableUserTag(() => {
                return (
                  <div style={{ fontWeight: 'bold' }}>
                    {comment.src__user__username}
                    {!post.attached_history__external_id &&
                      comment.src__user__is_staff && <StaffIcon />}
                  </div>
                );
              }, comment.src__user__username)}
            </div>
          </div>
          <div className="row pt-1">
            <div style={{ marginLeft: '-11px', marginBottom: '-10px' }}>
              <Markdown>{comment.text}</Markdown>
            </div>
          </div>
          <div
            className="row align-items-center"
            style={{ paddingLeft: '1px' }}
          >
            <RelativeTime timestamp={comment.created} />
            <div className="col align-items-center">
              {renderCommentButtons(comment)}
            </div>
          </div>
          {!isMobile && comment.showReplyForm && (
            <div className="row">{renderMsgEntry(comment)}</div>
          )}
          {comment.children && (
            <div className="row">{renderComments(comment.children)}</div>
          )}
        </div>
      </div>
    );
  };

  const handleNewMsgChange = (event, parentComment) => {
    if (parentComment) {
      parentComment.replyDraft = event.target.value;
      parentComment.replyButtonEnabled = event.target.value.length > 0;
      refreshComments();
    } else {
      setNewCommentText(event.target.value);
      setCommentButtonEnabled(event.target.value.length > 0);
    }
  };

  const handleNewMsgKeyDown = (event, parentComment) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleNewMsgSubmit(parentComment);
    }
  };

  const resetNewCommentInputHeight = () => {
    const textArea = document.getElementById('new-comment-input');
    if (textArea) {
      textArea.style.height = '36px';
      return textArea;
    }
  };

  const handleNewCommentKeyUp = (event, parentComment) => {
    if (parentComment) {
      return;
    }
    const textArea = resetNewCommentInputHeight();
    if (textArea) {
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  };

  const handleNewMsgSubmit = (parentComment) => {
    if (!newCommentText && waitingNewCommentCreation) {
      return;
    }
    let msgText = '';
    if (parentComment) {
      msgText = parentComment.replyDraft;
      parentComment.replyDraft = '';
      parentComment.replyButtonEnabled = false;
      refreshComments();
    } else {
      msgText = newCommentText;
      setNewCommentText('');
      setCommentButtonEnabled(false);
    }
    // TODO: if isMobile, scroll to created comment.
    setWaitingNewCommentCreation(true);
    resetNewCommentInputHeight();
    axios
      .post(
        '/chat/comment/create/',
        {
          post_external_id: post.external_id,
          text: msgText,
          parent_id: parentComment ? parentComment.id : null,
        },
        getHeaders(props),
      )
      .then((response) => {
        setActiveParentComment(null);
        if (response.data.room && response.data.room.external_id) {
          window.location.replace(
            `/chat${buildUrlParams({ hist: response.data.room.external_id })}`,
          );
        }
        if (response.data.msg) {
          let localComments = comments;
          if (parentComment) {
            localComments = parentComment.children;
          }
          localComments.unshift({
            id: response.data.msg.id,
            text: msgText,
            src__name: user.name,
            src__user__username: user.user.username,
            src__user__account__avatar_file_name:
              user.user?.account?.avatar_file_name,
            children: [],
          });
          refreshComments();
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      })
      .finally(() => {
        if (parentComment) {
          parentComment.showReplyForm = false;
        }
        setWaitingNewCommentCreation(false);
      });
  };

  const renderMsgEntry = (parentComment = null) => {
    const createMsgButtonEnabled = parentComment
      ? parentComment.replyButtonEnabled
      : commentButtonEnabled;
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
        {isMobile && parentComment && (
          <div className="col-12 py-3 pe-0 d-flex align-items-center">
            <MdHighlightOff
              onClick={() => setActiveParentComment(null)}
              className="me-2"
              size={22}
            />

            <Alert color="primary" style={{ margin: 0, padding: '4px 8px' }}>
              Replying to parent comment
            </Alert>
          </div>
        )}

        {!isAnonymousUser(props.user) && (
          <>
            <div className="col-auto pe-0" style={{ paddingLeft: '10px' }}>
              {/* TODO: Should be user.participant.name */}

              {renderAvatar(
                user.user?.username,
                AVATAR_SIZE,
                user.user?.account?.avatar_file_name,
              )}
            </div>
            <div className="col p-0" style={{ fontSize: textFontSize }}>
              <div className="text-muted d-flex justify-content-start align-items-center p-0 mx-0 bg-white">
                <div className="input-group ms-2 my-0">
                  {/* The form is to help mobile browsers show a send button instead
                of return */}
                  <textarea
                    id={parentComment ? null : 'new-comment-input'}
                    value={
                      parentComment ? parentComment.replyDraft : newCommentText
                    }
                    className="bg-white form-control shadow-none"
                    style={{ fontSize: '11pt' }}
                    onChange={(event) =>
                      handleNewMsgChange(event, parentComment)
                    }
                    onKeyDown={(event) =>
                      handleNewMsgKeyDown(event, parentComment)
                    }
                    onKeyUp={(event) =>
                      handleNewCommentKeyUp(event, parentComment)
                    }
                    enterKeyHint="send"
                    rows="1"
                    maxLength={10000}
                    placeholder={
                      parentComment ? 'Add a reply' : 'Add a comment'
                    }
                  />
                  <button
                    className="btn btn-primary py-0 ms-1 me-2"
                    style={{
                      zIndex: 0, // otherwise it will go over modals.
                      borderRadius: '0px',
                      fontSize: '14px',
                      filter: createMsgButtonEnabled ? '' : 'grayscale(90%)',
                    }}
                    type="button"
                    onClick={() => handleNewMsgSubmit(parentComment)}
                    disabled={!createMsgButtonEnabled}
                  >
                    {parentComment ? 'Reply' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderComments = (comments, areFirstLevelComments = false) => {
    if (!loading && comments !== undefined) {
      return (
        <div>
          {areFirstLevelComments && comments.length === 0 ? (
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
  return (
    <div>
      <MobileView>
        <div className={navClassNames} style={getNavStyle()}>
          <Nav />
        </div>
      </MobileView>
      <LoginModal
        setLoginOpen={props.setLoginOpen}
        login={props.login}
        waitlist={props.waitlist}
        handleServerError={props.handleServerError}
      />
      <Header user={props.user} />
      <div className="container-fluid overflow-auto p-0">
        {!isMobile && <Nav />}
        {loading ? (
          <div className="d-flex justify-content-center m-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="sr-only"></span>
            </div>
          </div>
        ) : (
          <div
            className="container d-flex justify-content-left align-items-center"
            style={{ maxWidth: '750px' }}
          >
            <div className="w-100 p-0">
              <div className="container-fluid p-0 m-0 ">
                <div className="row pb-2 border-bottom">
                  <div className="col-1 p-0 pt-2">{renderBackButton()}</div>
                  <div
                    className="col-10"
                    style={{
                      paddingTop: '8px',
                      marginLeft: '10px',
                    }}
                  >
                    {renderPost()}
                  </div>
                </div>
                {getIsCommentingEnabled() && (
                  <div>
                    <div
                      id="post-comments-label"
                      className="py-3"
                      style={{ fontWeight: '700' }}
                    >
                      Comments
                    </div>
                    {!isMobile && renderMsgEntry()}
                    <div className="row">{renderComments(comments, true)}</div>
                    {isMobile && renderMsgEntry(activeParentComment)}
                  </div>
                )}
                <div className="p-5">
                  <span></span>
                </div>
                <div className="p-5">
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
