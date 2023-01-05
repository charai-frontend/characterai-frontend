import axios from 'axios';
import classNames from 'classnames';
import React from 'react';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BsHeart } from 'react-icons/bs';
import { HiOutlineFire } from 'react-icons/hi';
import { IoCreateOutline } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';
import { MdArrowBackIosNew } from 'react-icons/md';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { isAnonymousUser } from './App';
import './App.css';
import './Chat.css';
import './Common.css';
import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import PostCard from './PostCard';
import CommunityTabs from './community/CommunityTabs';
import { buildUrlParams, dedupPosts, getHeaders } from './utils.js';

/*
Optional props:

- navBackUrl: url to go back to when the back button is clicked. Defaults to -1
  (previous in browser history).
- seenPostIndicationEnabled: if true, the post will be greyed out when already seen by
  the user.
*/
const Posts = (props) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState([]);
  const [topicId, setTopicId] = useState('');
  const [topicAvatarFileName, setTopicAvatarFileName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [postingEnabled, setPostingEnabled] = useState(false);
  const [autoPlayPostIndex, setAutoPlayPostIndex] = useState(0);
  const [windowPageYOffset, setWindowPageYOffset] = useState(0);
  const [postsPageNumber, setPostsPageNumber] = useState(2);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [typingSpeed, setTypingSpeed] = useState(1);
  const [sortBy, setSortBy] = useState('created');
  const navigate = useNavigate();
  const [inFeed, setInFeed] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get('topic');
    const cachedTypingSpeed = Number(localStorage.getItem('auto-play-speed'));
    if (cachedTypingSpeed) {
      setTypingSpeed(cachedTypingSpeed);
    }

    // used to check if we're in feed
    let feedTopicId = 'gLj1MBqU6AgCuf4IwUE-5q4Vz-CKMP5be23HERh0Ekg';
    if (Constants.IS_LOCAL) {
      feedTopicId = 'QEl2A27o9kUnCtiX4aIpy4QK36K-OfObidpW1k5OEdc';
    }

    if (topic) {
      setTopicId(topic);
      setInFeed(topic === feedTopicId);
    } else if (props.topic) {
      setTopicId(props.topic);
      setInFeed(props.topic === feedTopicId);
    }

    // const localSortBy = localStorage.getItem('community-sort-by');
    // Temporarily sort by top by default to see if it helps with engagement
    const localSortBy = 'created';
    if (localSortBy) {
      setSortBy(localSortBy);
    }

    const scrollHandler = () => setWindowPageYOffset(window.pageYOffset);

    window.removeEventListener('scroll', scrollHandler);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  useEffect(() => {
    for (let i = 0; i < posts.length; ++i) {
      const postCardElement = document.getElementById(`${i}-post-card`);
      if (postCardElement) {
        const top = postCardElement.getBoundingClientRect().top;
        const thirdOfWindowHeight = window.innerHeight / 2;
        if (-thirdOfWindowHeight <= top && top < thirdOfWindowHeight) {
          setAutoPlayPostIndex(i);
        }
      }
    }
  }, [windowPageYOffset]);

  useEffect(() => {
    if (topicId || props.username || props.userScope) {
      loadInitialPosts();
    }
  }, [topicId, props.username, props.userScope]);

  useEffect(() => {
    if (loaded.includes('posts')) {
      setLoading(false);
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded && (topicId || props.username || props.userScope)) {
      loadInitialPosts();
    }
  }, [sortBy]);

  const registerPostImpression = async (postExternalId) => {
    if (isAnonymousUser(props.user)) {
      return;
    }
    return axios
      .post(
        '/chat/post/status/',
        {
          post_external_id: postExternalId,
        },
        getHeaders(props),
      )
      .then((response) => {})
      .catch((err) => {
        // Here props.handleServerError(err) is not called because this function is
        // called a lot and there's a greater chance it will fail, causing
        // handleServerError to bring up a confusing error toast/pop-up.
        return false;
      });
  };

  useEffect(() => {
    if (posts && autoPlayPostIndex < posts.length) {
      // Post starts auto-playing = impression.
      registerPostImpression(posts[autoPlayPostIndex].external_id);
    }
  }, [autoPlayPostIndex]);

  useEffect(() => {
    if (posts && posts.length > 0) {
      // Post starts auto-playing = impression.
      registerPostImpression(posts[0].external_id);
    }
  }, [posts]);

  const handleBack = () => {
    if (props.navBackUrl) {
      navigate(props.navBackUrl);
    } else {
      navigate(-1);
    }
  };

  const handleSpeedClick = (speedCoeff) => {
    setTypingSpeed(speedCoeff);
    localStorage.setItem('auto-play-speed', speedCoeff);
  };

  const postLoadingUrl = (pageNum) => {
    const postsToLoad = props.numPostsToLoad
      ? '&posts_to_load=' + props.numPostsToLoad
      : '';

    if (props.username) {
      return `/chat/posts/user/?username=${props.username}&page=${pageNum}${postsToLoad}`;
    } else if (props.userScope) {
      return `/chat/posts/user/?scope=user&page=${pageNum}${postsToLoad}`;
    } else {
      return `/chat/posts/?topic=${topicId}&page=${pageNum}${postsToLoad}&sort=${sortBy}`;
    }
  };

  const loadInitialPosts = async () => {
    // i.e., first page of paginated posts.
    axios
      .get(postLoadingUrl(1), getHeaders(props))
      .then((response) => {
        setPosts(response.data.posts);
        setPosts((oldArray) => dedupPosts(oldArray));
        setLoaded((oldArray) => [...oldArray, 'posts']);
        setTopicAvatarFileName(response.data.topic?.avatar_file_name);
        setTopicName(response.data.topic?.name);
        setPostingEnabled(
          response.data.topic?.posting_enabled ||
            props.username ||
            props.userScope,
        );
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
      .get(postLoadingUrl(postsPageNumber), getHeaders(props))
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

  /* Delete post from posts if it has postExternaId as external_id. */
  const deleteClickedCallback = (postExternalId) => {
    const postsCopy = [...posts];
    setPosts(postsCopy.filter((p) => p.external_id !== postExternalId));
  };

  const defaultToTrue = (prop) => {
    return typeof prop === 'undefined' || prop;
  };

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
                {`No new posts yet. ${
                  props.enableCreatePost
                    ? 'You can be the first!'
                    : 'Check back soon!'
                }`}
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
                  <PostCard
                    key={post.external_id}
                    post={post}
                    token={props.token}
                    autoplay={index === autoPlayPostIndex}
                    shareTitle={props.shareTitle || ''}
                    deleteClickedCallback={() =>
                      deleteClickedCallback(post.external_id)
                    }
                    handleServerError={props.handleServerError}
                    commentingEnabled={!post.is_locked && postingEnabled}
                    pinningEnabled={defaultToTrue(
                      props.pinningEnabled && post.pinning_enabled,
                    )}
                    typingSpeed={typingSpeed}
                    handleSpeedClick={(speedCoeff) =>
                      handleSpeedClick(speedCoeff)
                    }
                    seenPostIndicationEnabled={props.seenPostIndicationEnabled}
                  />
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

  const sortButtonStyle = { height: '40px' };

  const updateSortBy = (newSortBy) => {
    setSortBy(newSortBy);
    localStorage.setItem('community-sort-by', newSortBy);
  };

  return (
    <div style={{ height: '100%' }}>
      <div className={contentClassNames}>
        <div className="container-fluid d-flex justify-content-center p-0 m-0">
          <div className="container-fluid p-0">
            <div className={postsClassNames}>
              {loading ? (
                <div className="d-flex justify-content-center m-5">
                  <div className="spinner-border text-secondary" role="status">
                    <span className="sr-only"></span>
                  </div>
                </div>
              ) : (
                <div
                  className="container d-flex p-0 "
                  style={
                    isMobile
                      ? { paddingLeft: '12px', paddingRight: '12px' }
                      : { paddingLeft: '100px', paddingRight: '12px' }
                  }
                >
                  <div className="w-100 p-0">
                    {props.enableCreatePost && (
                      <div
                        className="row w-100 justify-content-between align-items-center pt-2 pb-1"
                        style={{ paddingLeft: isMobile ? '' : '100px' }}
                      >
                        {
                          <div className="col-auto p-0 ps-2 m-0">
                            <button
                              className={'btn'}
                              role="button"
                              onClick={handleBack}
                            >
                              <MdArrowBackIosNew size={24} />
                            </button>
                          </div>
                        }
                        <div className="col">
                          <div className="d-flex flex-row align-items-center">
                            <InitialAvatar
                              name=""
                              avatarFileName={
                                topicAvatarFileName
                                  ? `${Constants.CDN_THUMBNAIL_URL}/static/topic-pics/${topicAvatarFileName}`
                                  : ''
                              }
                              size={30}
                            />
                            <div
                              className={'ps-2'}
                              style={{ fontSize: 'small', fontWeight: '600' }}
                            >
                              {topicName}
                            </div>
                          </div>
                        </div>
                        {postingEnabled && (
                          <div className="col-auto p-0 m-0">
                            <Link
                              className={
                                'btn' + (isMobile ? '' : ' btn-primary')
                              }
                              role="button"
                              to={{
                                pathname: `/post/create${buildUrlParams({
                                  topic: topicId,
                                })}`,
                              }}
                              state={{
                                handleServerError: props.handleServerError,
                              }}
                            >
                              <div className="d-flex flex-row justify-content-end align-items-center">
                                <div
                                  className="pe-1"
                                  style={{ color: isMobile ? '' : 'white' }}
                                >
                                  Create Post
                                </div>
                                <IoCreateOutline
                                  size={25}
                                  style={{ color: isMobile ? '' : 'white' }}
                                />
                              </div>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="row m-0">
                      <div
                        className={
                          isMobile ||
                          props.userScope ||
                          props.username ||
                          inFeed
                            ? 'col-12'
                            : 'col-8'
                        }
                        style={{ padding: 0 }}
                      >
                        {props.enableCreatePost && (
                          <div className="row py-2 w-100">
                            <div className="d-flex flex-row justify-content-center align-items-center">
                              <div className="me-0 pe-0 align-items-center">
                                Sort By
                              </div>
                              <div
                                className={'ps-1'}
                                style={{ fontSize: 'small', fontWeight: '600' }}
                              >
                                <button
                                  className={
                                    'btn border ' +
                                    (sortBy === 'top' ? 'btn-primary' : '')
                                  }
                                  style={sortButtonStyle}
                                  role="button"
                                  onClick={() => {
                                    updateSortBy('top');
                                  }}
                                  title="Top first"
                                >
                                  <HiOutlineFire size={25} />
                                </button>
                                <button
                                  className={
                                    'btn border ' +
                                    (sortBy === 'votes' ? 'btn-primary' : '')
                                  }
                                  style={sortButtonStyle}
                                  role="button"
                                  onClick={() => {
                                    updateSortBy('votes');
                                  }}
                                  title="Most liked first"
                                >
                                  <BsHeart size={20} />
                                </button>
                                <button
                                  className={
                                    'btn border ' +
                                    (sortBy === 'created' ? 'btn-primary' : '')
                                  }
                                  style={sortButtonStyle}
                                  role="button"
                                  onClick={() => {
                                    updateSortBy('created');
                                  }}
                                  title="Newest first"
                                >
                                  <MdAccessTime size={24} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="container-fluid p-0">
                          {renderPostsList()}
                          <div className="p-5">
                            <span></span>
                          </div>
                          <div className="p-5">
                            <span></span>
                          </div>
                        </div>
                      </div>
                      {!isMobile &&
                        !props.userScope &&
                        !props.username &&
                        !inFeed && (
                          <div className="col-4">
                            <CommunityTabs />
                          </div>
                        )}
                    </div>
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

export default Posts;
