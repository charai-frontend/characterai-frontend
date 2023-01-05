import axios from 'axios';
import classNames from 'classnames';
import React from 'react';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import InfiniteScroll from 'react-infinite-scroll-component';
import { MdCheckCircleOutline, MdOutlineBlock, MdVisibility } from 'react-icons/md';
import { Link } from 'react-router-dom';
import Markdown from 'marked-react';
import Moment from 'moment';

import * as Constants from './Constants';
import './App.css';
import './Chat.css';
import './Common.css';
import { buildUrlParams, dedupPosts, getHeaders, renderAvatar } from './utils.js';
import EmbeddedImage from './components/EmbeddedImage';

const Mythica = (props) => {
  Moment.locale('en');

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState([]);
  const [postsPageNumber, setPostsPageNumber] = useState(2);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const AVATAR_SIZE = 35;

  // Number of posts per pagination page.
  const NUM_POSTS_PER_PAGE = 12;

  const iconSize = 24;

  useEffect(() => {
    loadInitialPosts();
  }, []);

  useEffect(() => {
    if (loaded.includes('posts')) {
      setLoading(false);
    }
  }, [loaded]);

  const loadInitialPosts = async () => {
    // i.e., first page of paginated posts.
    axios
      .get("/chat/mythica/posts/", getHeaders(props))
      .then((response) => {
        setPosts(response.data.posts);
        setPosts((oldArray) => dedupPosts(oldArray));
        setLoaded((oldArray) => [...oldArray, 'posts']);
        setHasMorePosts(response.data.has_more);
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const fetchMorePosts = () => {
    // i.e., second page of paginated posts and beyond.
    axios
      .get(
        `/chat/mythica/posts/?page=${postsPageNumber}&posts_to_load=${NUM_POSTS_PER_PAGE}`,
        getHeaders(props)
      )
      .then((response) => {
        setPosts((oldArray) =>
          dedupPosts([...oldArray, ...response.data.posts]),
        );
        setPostsPageNumber(postsPageNumber + 1);
        setHasMorePosts(response.data.has_more);
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const callApiOnEntity = async (apiUrl, externalId) => {
    return await axios
      .post(
        apiUrl,
        {
          external_id: externalId,
        },
        getHeaders(props),
      )
      .then((response) => {
        if (!response.data.success) {
          console.error(response);
          if (response.data.error) {
            alert(response.error);
          }
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const approvePost = async (post) => {
    return await callApiOnEntity("/chat/post/approve/", post.external_id);
  };

  const removePost = async (post) => {
    // post/delete removes when the user is staff.
    return await callApiOnEntity("/chat/post/delete/", post.external_id);
  };

  const reRenderPosts = () => {
    const postsCopy = [...posts];
    setPosts(postsCopy);
  };

  const approvePostClicked = async (post) => {
    approvePost(post);
    post.is_approved = true; // Show it as removed in the UI.
    post.is_removed = false;
    reRenderPosts();
  }

  const removePostClicked = async (post) => {
    removePost(post);
    post.is_approved = false;
    post.is_removed = true; // Show it as removed in the UI.
    reRenderPosts();
  }

  const renderButtons = (post) => {
    return (
      <div className="row justify-content-start">
        <button
          className="btn w-auto ps-0 px-2"
          title="Approve"
          onClick={() => approvePostClicked(post)}
        >
          <MdCheckCircleOutline
            className="w-auto p-0"
            size={iconSize}
            style={{ color: post.is_approved ? 'green' : null }}
          />
        </button>
        <button
          className="btn w-auto ps-0 px-2"
          title="Remove"
          onClick={() => removePostClicked(post)}
        >
          <MdOutlineBlock
            className="w-auto p-0"
            size={iconSize}
            style={{ color: post.is_removed ? 'red' : null }}
          />
        </button>
        <Link
          className="btn w-auto ps-0 px-2"
          to={`/post${buildUrlParams({
            post: post.external_id
          })}`}
          target="_blank"
          rel="noopener noreferrer"
          title="See original post"
        >
          <MdVisibility className="w-auto p-0" size={iconSize} />
        </Link>
      </div>
    );
  }

  const getChannelName = (post) => {
    const COOL_STUFF_TOPIC = "✨ Share and see cool stuff";
    const topicName = post.topic__name;
    if (topicName === COOL_STUFF_TOPIC) {
      return "Feed";
    }
    return topicName;
  }

  const getModerationStatus = (post) => {
    if (post.moderation_status === "REJECTED") {
      return "REMOVED";
    }
    return post.moderation_status;
  }

  // TODO: dedupe this function with its homonymous counterpart in PostCard.
  const getImagePath = (post) => {
    return post.image_rel_path
      ? `${Constants.CDN_POST_IMAGE_URL}/static/posts/images/${post.image_rel_path}`
      : '';
  }

  const renderPost = (post) => {
    return (
      <div className="col border border-dark px-4" style={{ "fontSize": "12px" }}>
        <div className="row" style={{ "fontSize": "13px", "fontWeight": "bold" }}>
          {`@${post.poster__username}: ${post.title}`}
        </div>
        <div className="row pt-1">
          <Markdown>{post.text}</Markdown>
        </div>
        {
          post.image_rel_path &&
          <div className="d-flex flex-row pt-1">
            <EmbeddedImage
              imageSize="250"
              imagePath={getImagePath(post)}
            />
          </div>
        }
        <div className="row justify-content-start">
          <div className="col-auto p-0">
            {Moment(post.created).fromNow()}
          </div>
          <div className="col-auto p-0 px-1">
            in
          </div>
          <div className="col-auto p-0" style={{ fontWeight: "bold" }}>
            {getChannelName(post)}
          </div>
        </div>
        <div className="row py-2"></div>
        {
          post.moderation_status &&
          <div className="row">
            {`Status: ${getModerationStatus(post)}`}
          </div>
        }
        {
          post.moderation_reason &&
          <div className="row">
            {`Reason: ${post.moderation_reason}`}
          </div>
        }
        {
          post.flags > 0 &&
          <div className="row">
            {`User Reports: ${post.flags}`}
          </div>
        }
        {renderButtons(post)}
      </div>
    );
  }

  const renderPostsList = () => {
    if (!loading && posts !== undefined) {
      return (
        <div>
          {posts.length === 0 ? (
            <div
              className="mt-5"
              style={{ marginLeft: isMobile ? '50px' : '100px' }}
            >
              <span>
                No new posts to moderate
              </span>
              <span></span>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={posts.length}
              next={() => fetchMorePosts()}
              hasMore={hasMorePosts}
              loader={'Loading...'}
              style={{ paddingTop: '1px', overflowX: 'hidden' }}
            >
              {posts.map((post, index) => (
                <div
                  key={post.external_id}
                  className="row justify-content-center"
                  id={`${index}-post-card`}
                >
                  {renderPost(post)}
                </div>
              ))}
            </InfiniteScroll>
          )}
        </div>
      );
    }
  };

  const postsClassNames = classNames({
    row: !isMobile,
    'w-100': !isMobile,
  });

  const contentClassNames = classNames({
    'container-fluid': true,
    'p-0': true,
    col: !isMobile && !loading,
  });

  const postsStyle = {
    paddingLeft: isMobile ? '0px' : '10%',
    paddingRight: isMobile ? '0px' : '10%',
  };

  return (
    <div style={{ height: '100%' }}>
      <div className={contentClassNames}>
        <div className="container-fluid d-flex justify-content-center p-0 m-0">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div
                className="row justify-content-center"
                style={{ "fontSize": "20px", "fontWeight": "bold" }}
              >
                Mythica
              </div>
              <div className="row justify-content-center text-muted pt-0 pb-1">
                Mod Superpowers
              </div>
              <div className="row justify-content-center">
                <img
                  src="https://characterai.io/static/Mythica.png"
                  alt="Mythica"
                  style={{
                    "objectFit": "cover",
                    "width": "100%",
                    "height": "150px",
                    "maxWidth": "512px",
                  }}
                />
              </div>
              <div className="row justify-content-center">
                <audio
                  controls
                  style={{ "maxWidth": "512px" }}
                >
                  <source
                    src="https://characterai.io/static/music/daniel_deluxe_star_eater.mp3"
                    type="audio/mp3"
                  />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div
                className="d-flex flex-row justify-content-center align-items-center py-1"
                style={{ "fontSize": "18px" }}
              >
                <div clasName="d-flex flex-col" style={{ "padding": "5px" }}>
                  Welcome back
                </div>
                <div clasName="d-flex flex-col">
                  {
                    renderAvatar(
                      props.user.user.username,
                      AVATAR_SIZE,
                      props.user.user.account.avatar_file_name,
                    )
                  }
                </div>
                <div clasName="d-flex flex-col" style={{ "padding": "5px" }}>
                  @{props.user.user.username}
                </div>
              </div>
            </div>
            <div className={postsClassNames}>
              {loading ? (
                <div className="d-flex justify-content-center m-5">
                  <div className="spinner-border text-secondary" role="status">
                    <span className="sr-only"></span>
                  </div>
                </div>
              ) : (
                <div
                  className="container-fluid"
                  style={postsStyle}
                >
                  {renderPostsList()}
                  <div className="p-5">
                    <span></span>
                  </div>
                  <div className="p-5">
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mythica;
