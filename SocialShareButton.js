import classNames from 'classnames';
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
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { IoIosShareAlt } from 'react-icons/io';
import { MdLink } from 'react-icons/md';
import Modal from 'react-modal';
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
const SocialShareButton = (props) => {
  Moment.locale('en');

  useEffect(() => {
    if (props.startOpened) {
      handleShareClick();
    }
  }, []);

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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const iconSize = isMobile ? 27 : 24;

  const closeOptionsModal = () => {
    setModalIsOpen(false);
  };

  const handleShareClick = () => {
    setModalIsOpen(true);
  };

  let modalStyle = {
    content: {
      paddingTop: '8px',
      top: '100%',
      left: '50%',
      right: 'auto',
      marginRight: '-50%',
      width: '100%',
      height: '200px',
      transform: 'translate(-50%, -100%)',
      animationName: 'slide-up',
      animationDuration: '0.3s',
      animationTimingFunction: 'ease-in-out',
      boxShadow: '0px 2px 9px rgb(0 0 0 / 5%)',
      borderColor: 'rgb(0 0 0 / 15%)',
      borderRadius: '10px',
    },
  };
  if (!isMobile) {
    const shareButtonElement = document.getElementById(
      `share-button-${shareURL}`,
    );
    let top = '50%';
    let left = '50%';
    if (shareButtonElement) {
      const shareButtonRect = shareButtonElement.getBoundingClientRect();
      top = `${shareButtonRect.top + 12}px`;
      left = `${shareButtonRect.left}px`;
    }
    modalStyle = {
      content: {
        paddingTop: '8px',
        top: top,
        left: left,
        right: 'auto',
        transform: 'translate(-100%, -50%)',
        width: '50%',
        maxWidth: '400px',
        height: '100px',
        boxShadow: '0px 2px 9px rgb(0 0 0 / 5%)',
        borderColor: 'rgb(0 0 0 / 15%)',
        borderRadius: '10px',
      },
    };
  }

  const modalOverlayClassNames = classNames({
    'no-overlay-blur': !isMobile,
  });

  return (
    <div id={`share-button-${shareURL}`} style={{ width: 'fit-content' }}>
      <button
        className="btn px-0"
        title="Share"
        onClick={() => handleShareClick()}
      >
        <IoIosShareAlt size={iconSize} />
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => closeOptionsModal()}
        style={modalStyle}
        overlayClassName={modalOverlayClassNames}
        contentLabel="Share Post"
      >
        <div
          className="d-flex flex-row justify-content-center pb-3"
          style={{ fontSize: '14px', fontWeight: '600' }}
        >
          Share to
        </div>
        <div className="d-flex flex-row justify-content-around">
          <button
            title="Copy link to this post"
            className="share-link"
            onClick={() => handleCopyLinkClick()}
          >
            <MdLink size={props.size || 23} />
          </button>
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
      </Modal>
    </div>
  );
};

export default SocialShareButton;
