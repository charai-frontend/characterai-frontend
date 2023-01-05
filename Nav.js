import classNames from 'classnames';
import React, { useContext, useState } from 'react';
import { isIOS, isMobile } from 'react-device-detect';
import { CgFeed } from 'react-icons/cg';
import {
  MdAdd,
  MdForum,
  MdGroups,
  MdHome,
  MdHouseboat,
  MdSportsHandball,
} from 'react-icons/md';
import Modal from 'react-modal';
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { AppContext } from './App';
import { FEED_TOPIC_ID } from './Feed';
import './Nav.css';
import { buildUrlParams } from './utils.js';

export function getNavStyle(paddingTop = '106px') {
  // TODO: delete this function and all its references.
  return {};
}

export const navClassNames = classNames({
  'col-auto': !isMobile,
});

const Nav = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const appContext = useContext(AppContext);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const isSupportNavLinkActive = () => {
    if (
      window.location.pathname.includes('topics') ||
      (!window.location.search.includes(FEED_TOPIC_ID) &&
        window.location.pathname.includes('/posts'))
    ) {
      return 'active';
    }
    return undefined;
  };

  const getUnseenPostsCount = () => {
    const { unseenPostsCount } = appContext;
    return unseenPostsCount > 99 ? '99' : unseenPostsCount;
  };

  const navBarClassNames = classNames({
    navbar: true,

    'navbar-mobile': isMobile,
    'navbar-expand': isMobile,
    'nav-fill': isMobile,
    'fixed-bottom': isMobile,

    // Needed to avoid navbar overlapping with the iOS bottom bar.
    // See https://github.com/character-tech/character-tech/pull/3652
    'pb-4': isIOS,

    'navbar-desktop': !isMobile,
    'navbar-expand-lg': !isMobile,
  });
  const navBarNavClassNames = classNames({
    'navbar-nav': true,
    'w-100': true,
    'align-items-center': !isMobile,
  });
  const navIconContainerClassNames = classNames({
    'nav-icon-container-mobile': isMobile,
    'nav-icon-container-desktop': !isMobile,
  });
  const navIconTextClassNames = classNames({
    'nav-icon-text-mobile': isMobile,
    'nav-icon-text-desktop': !isMobile,
    'text-wrap': true,
  });
  let navIconSize = isMobile ? 32 : 24;
  let creationModalStyle = {
    content: {
      top: '100%',
      left: '50%',
      right: 'auto',
      marginRight: '-50%',
      width: '100%',
      height: 'fit-content',
      transform: 'translate(-50%, -145%)',
      animationName: 'slide-up',
      animationDuration: '0.3s',
      animationTimingFunction: 'ease-in-out',
      boxShadow: '0px 2px 9px rgb(0 0 0 / 5%)',
      borderColor: 'rgb(0 0 0 / 15%)',
    },
  };
  if (!isMobile) {
    const createNavButton = document.getElementById('create-nav-button');
    if (createNavButton) {
      const createNavButtonRect = createNavButton.getBoundingClientRect();
      creationModalStyle = {
        content: {
          top: createNavButtonRect.top - createNavButtonRect.height * 0.7,
          left: 2.65 * createNavButtonRect.width,
          right: 'auto',
          transform: 'translate(0%, -50%)',
          width: 'fit-content',
          height: 'fit-content',
          borderRadius: '0 8px 8px 0',
          boxShadow: '0px 2px 9px rgb(0 0 0 / 5%)',
          borderColor: 'rgb(0 0 0 / 15%)',
        },
      };
    }
  }
  const creationModalOverlayClassNames = classNames({
    'no-overlay-blur': !isMobile,
  });
  const unseenPostsBadgeClasses = classNames({
    badge: true,
    'rounded-pill': true,
    'bg-danger': getUnseenPostsCount() > 0,
    'opacity-0': getUnseenPostsCount() === 0,
  });
  return (
    <nav className={navBarClassNames}>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={creationModalStyle}
        overlayClassName={creationModalOverlayClassNames}
        contentLabel="Create"
      >
        <div>
          <div className="sec-header mb-3">Create</div>
          <div className="mb-3">
            <Link
              className={'btn p-0'}
              role="button"
              to={{ pathname: `/character/create${buildUrlParams()}` }}
              onClick={closeModal}
            >
              <MdSportsHandball size={24} /> Create a Character
            </Link>
          </div>
          <div className="mb-3">
            <Link
              className={'btn p-0'}
              role="button"
              to={{ pathname: `/room/create${buildUrlParams()}` }}
              onClick={closeModal}
            >
              <MdHouseboat size={24} /> Create a Room
            </Link>
          </div>
        </div>
      </Modal>
      <div className="collapse navbar-collapse p-0" id="navbarSupportedContent">
        <ul className={navBarNavClassNames}>
          <li className="nav-item">
            <NavLink to={`/${buildUrlParams()}`}>
              <div className={navIconContainerClassNames}>
                <span className="nav-icon">
                  <MdHome size={navIconSize} />
                </span>
                <span className={navIconTextClassNames}>Home</span>
              </div>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={`/feed${buildUrlParams()}`}>
              <div className={navIconContainerClassNames}>
                <span className="nav-icon">
                  <CgFeed size={navIconSize} />
                </span>
                <span className={navIconTextClassNames}>Feed</span>
              </div>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to=" " onClick={openModal}>
              <div className={navIconContainerClassNames}>
                <span className="nav-icon">
                  <MdAdd size={navIconSize} />
                </span>
                <span id="create-nav-button" className={navIconTextClassNames}>
                  Create
                </span>
              </div>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={`/chats${buildUrlParams()}`}>
              <div className={navIconContainerClassNames}>
                <span className="nav-icon">
                  <MdForum size={navIconSize} />
                </span>
                <span className={navIconTextClassNames}>Chats</span>
              </div>
            </NavLink>
          </li>
          <li className="nav-item">
            <div style={{ marginLeft: '-22px' }}>
              <span
                className={unseenPostsBadgeClasses}
                style={{
                  position: 'relative',
                  top: '-20px',
                  left: '90px',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {getUnseenPostsCount()}
                <span className="visually-hidden">Unread posts</span>
              </span>

              <NavLink to={`/community${buildUrlParams()}`}>
                <div className={navIconContainerClassNames}>
                  <span className="nav-icon">
                    <MdGroups size={navIconSize} />
                  </span>
                  <span className={navIconTextClassNames}>Community</span>
                </div>
              </NavLink>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
