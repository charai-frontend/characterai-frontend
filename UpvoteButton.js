import axios from 'axios';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BsHeart, BsHeartFill } from 'react-icons/bs';

import { INVISIBLE_CHARACTER, getHeaders } from './utils.js';

const UpvoteButton = (props) => {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(null);

  const iconSize = isMobile ? 27 : 24;

  useEffect(() => {
    setIsUpvoted(props.post.is_upvoted);
    setUpvotesCount(props.post.upvotes);
  }, []);

  const upvotePost = () => {
    // server may fail, but setting it here increases responsiveness.
    setIsUpvoted(true);
    setUpvotesCount(upvotesCount + 1);
    axios
      .post(
        '/chat/post/upvote/',
        {
          post_external_id: props.post.external_id,
        },
        getHeaders(props),
      )
      .then((response) => {
        if (!response.data.success) {
          console.error(response);
        }
      })
      .catch((err) => {
        setIsUpvoted(false);
        setUpvotesCount(upvotesCount - 1);
        props.handleServerError(err);
        return false;
      });
  };

  const undoUpvotePost = () => {
    // server may fail, but setting it here increases responsiveness.
    setIsUpvoted(false);
    setUpvotesCount(upvotesCount - 1);
    axios
      .post(
        '/chat/post/undo-upvote/',
        {
          post_external_id: props.post.external_id,
        },
        getHeaders(props),
      )
      .then((response) => {
        if (!response.data.success) {
          console.error(response);
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const handleUpVoteClick = () => {
    if (isUpvoted) {
      undoUpvotePost();
    } else {
      upvotePost();
    }
  };

  const renderUpvoteIcon = () => {
    if (!isUpvoted) {
      return <BsHeart size={iconSize} />;
    }

    if (isUpvoted) {
      return <BsHeartFill size={iconSize} />;
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{ height: 'fit-content', width: 'fit-content' }}
    >
      <button
        className={`btn px-0${props.verticalLayout ? '' : ' px-2'} pb-0`}
        title="Like"
        onClick={() => handleUpVoteClick()}
      >
        {renderUpvoteIcon()}
      </button>
      <div className="postButtonCaption">
        {upvotesCount > 0 ? upvotesCount : INVISIBLE_CHARACTER}
      </div>
    </div>
  );
};

export default UpvoteButton;
