import { isMobile } from 'react-device-detect';
import { BsChatDots } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

import { INVISIBLE_CHARACTER, buildUrlParams } from './utils.js';

/* Requires props.post.comments_count and props.post.external_id.

Can optionally take:

- a props.disableClickThrough when the button is actually meant to
only act as an icon with a comments count on it, and not as a link to the post.

- a props.verticalLayout boolean that should be used when the button is layout out
vertically next to other buttons.

*/
const CommentsButton = (props) => {
  const iconSize = isMobile ? 27 : 24;
  const navigate = useNavigate();

  const handleClick = () => {
    if (props.disableClickThrough) {
      return;
    }
    navigate(`/post${buildUrlParams({ post: props.post.external_id })}`);
  };

  const renderCommentsIcon = () => {
    return <BsChatDots size={iconSize} />;
  };

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{ height: 'fit-content', width: 'fit-content' }}
    >
      <button
        className={`btn px-0${props.verticalLayout ? '' : ' px-2'} pb-0`}
        title="Comments"
        onClick={() => handleClick()}
        cursor={props.disableClickThrough ? 'default' : 'auto'}
        disabled={props.disableClickThrough}
      >
        {renderCommentsIcon()}
      </button>
      <div className="postButtonCaption">
        {props.post.comments_count > 0
          ? props.post.comments_count
          : INVISIBLE_CHARACTER}
      </div>
    </div>
  );
};

export default CommentsButton;
