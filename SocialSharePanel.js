import Moment from 'moment';
import {
  FacebookIcon,
  FacebookShareButton,
  RedditIcon,
  RedditShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'next-share';
import { MdLink } from 'react-icons/md';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { IS_LOCAL } from './Constants';

/* Component that shows link button and when clicked copies link to clipboard and
notifies user of such with a toast notification.

Link must be passed in as props.link.

Optionally takes the props:

- size: specifies the size of the link icon/button.
- startOpened: when set to true, the share buttons modal will be opened when this
  component mounts. Otherwise, it will only show the modal if the button is clicked.
*/
const SocialSharePanel = (props) => {
  Moment.locale('en');

  const handleCopyLinkClick = () => {
    navigator.clipboard.writeText(props.link);
    closeOptionsModal();
    toast('Link copied to clipboard');
  };

  // Make links on localhost look valid so the websites don't show an error
  const shareURL = IS_LOCAL
    ? `https://beta.character.ai?dummytest=${props.link}`
    : props.link;
  const SHARE_TITLE = props.shareTitle;
  const SHARE_HASHTAG = 'characterai';

  return (
    <div className="d-flex flex-row justify-content-around">
      {!props.hideCopyButton && (
        <button
          title="Copy link to this post"
          className="share-link"
          onClick={() => handleCopyLinkClick()}
        >
          <MdLink size={props.size || 23} />
        </button>
      )}
      <TwitterShareButton
        url={shareURL}
        title={SHARE_TITLE}
        hashtags={[SHARE_HASHTAG]}
        className="socialButton"
      >
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <RedditShareButton
        url={shareURL}
        title={SHARE_TITLE}
        className="socialButton"
      >
        <RedditIcon size={32} round />
      </RedditShareButton>
      <FacebookShareButton
        url={shareURL}
        quote={SHARE_TITLE}
        hashtag={SHARE_HASHTAG}
        className="socialButton"
      >
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <WhatsappShareButton
        url={shareURL}
        title={SHARE_TITLE}
        separator=" "
        className="socialButton"
      >
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
    </div>
  );
};

export default SocialSharePanel;
