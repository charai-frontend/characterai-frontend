import React from 'react';
import { MdHelpOutline, MdMenuBook, MdPerson, MdSearch } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';

import * as Constants from './Constants';
import Logo from './components/Logo';
import { Participant } from './types';
import { buildUrlParams } from './utils.js';

const HEADER_ICON_SIZE = 28;
// Needs to match constant used in views
// TODO(irwan): Use from App.js
const LAZY_USERNAME_PREFIX = 'Guest-2je9q78';

type HeaderProps = {
  user?: Participant;
};

const Header = ({ user }: HeaderProps) => {
  return (
    <div
      className="d-flex justify-content-between"
      style={{
        borderBottom: '1px solid rgba(238, 238, 238, 0.5)',
        paddingLeft: '14px',
      }}
    >
      <div>
        <Link to="/">
          <Logo />
        </Link>
      </div>
      <div className="d-flex align-items-center">
        <Link
          className={'btn'}
          role="button"
          to={{ pathname: `/search${buildUrlParams()}` }}
        >
          <MdSearch size={HEADER_ICON_SIZE} />
        </Link>
        <a
          className="btn"
          href={Constants.CHARACTER_BOOK_LINK}
          rel="noreferrer"
          target="_blank"
        >
          <MdMenuBook size={HEADER_ICON_SIZE} />
        </a>
        <Link
          className={'btn'}
          role="button"
          to={{ pathname: `/help${buildUrlParams()}` }}
        >
          <MdHelpOutline size={HEADER_ICON_SIZE} />
        </Link>
        {/* NOTE: this isn't super robust */}
        {user?.user?.username === 'ANONYMOUS' ||
        user?.user?.username.startsWith(LAZY_USERNAME_PREFIX) ? (
          <Link to="/login">
            <Button
              size="sm"
              color="primary"
              style={{ marginRight: 10, minWidth: 60, fontSize: '0.7rem' }}
            >
              Sign Up
            </Button>
          </Link>
        ) : (
          <Link
            className={'btn'}
            role="button"
            to={{ pathname: `/profile${buildUrlParams()}` }}
          >
            <MdPerson size={HEADER_ICON_SIZE} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
