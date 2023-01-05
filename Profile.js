import { useQuery } from '@tanstack/react-query';
import classnames from 'classnames';
import React from 'react';
import { useEffect, useState } from 'react';
import { MobileView } from 'react-device-detect';
import { isMobile } from 'react-device-detect';
import { CgFeed } from 'react-icons/cg';
import { IoChatbubblesOutline } from 'react-icons/io5';
import {
  MdArrowBackIosNew,
  MdLink,
  MdLock,
  MdMode,
  MdOutlineRemoveRedEye,
} from 'react-icons/md';
import { MdSportsHandball } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import {
  Nav as BootstrapNav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  UncontrolledTooltip,
} from 'reactstrap';

import './App.css';
import CharacterCard from './CharacterCard';
import './Common.css';
import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import Nav from './Nav';
import { getNavStyle, navClassNames } from './Nav';
import Posts from './Posts';
import './Profile.css';
import API from './api/Api';
import { PROFILE_ICON_SIZE } from './profile/ProfileTabs';
import { buildUrlParams } from './utils.js';
import { displayNumInteractions } from './utils/character-utils';

const Profile = (props) => {
  const [activeTab, setActiveTab] = useState(0);

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      // @ts-expect-error ScrollBehavior definition doesn't contain instant option
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const onSwipe = (newIndex) => {
    // @ts-expect-error ScrollBehavior definition doesn't contain instant option
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveTab(newIndex);
  };

  const {
    data: user,
    isLoading: loadingUser,
    isError: userError,
  } = useQuery(['user'], API.fetchUser);

  const { characters, loadingCharacters } = props;

  const {
    data: followingData,
    isLoading: loadingFollowing,
    isError: followingError,
  } = useQuery(['following'], API.fetchFollowing);

  const {
    data: followersData,
    isLoading: loadingFollowers,
    isError: followersError,
  } = useQuery(['followers'], API.fetchFollowers);

  useEffect(() => {
    setProfileData((prev) => ({ ...prev, following: followingData }));
  }, [followingData]);

  useEffect(() => {
    setProfileData((prev) => ({ ...prev, followers: followersData }));
  }, [followersData]);

  const handleBack = () => {
    // Do not change this to navigate(-1) as it will form an "infinite" loop if the user
    // further clicks the pencil button to edit their profile and try to click back,
    // back.
    navigate(`/${buildUrlParams()}`);
  };

  const navigate = useNavigate();

  const [counts, setCounts] = useState({});
  const [profileData, setProfileData] = useState({
    followers: [],
    following: [],
    interactions: 0,
  });

  const [currentFilter, setCurrentFilter] = useState('PUBLIC');

  const [formData, setFormData] = useState({
    avatar_type: '',
    name: '',
    acknowledgement: false,
    username: '',
  });

  const getVisibilityText = (filter) => {
    switch (filter) {
      case 'PUBLIC':
        return (
          <span>
            <b>Public</b> - Anyone can chat
          </span>
        );
      case 'UNLISTED':
        return (
          <span>
            <b>Unlisted</b> - Anyone with a link with can chat
          </span>
        );
      case 'PRIVATE':
        return (
          <span>
            <b>Private</b> - Only you can chat
          </span>
        );
    }
    return <span></span>;
  };

  const showAvatar = (name, size, avatar_file_name) => {
    return (
      <InitialAvatar
        name={name}
        size={size}
        avatarFileName={
          avatar_file_name
            ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${avatar_file_name}`
            : ''
        }
      />
    );
  };

  const visibilityText = {
    PUBLIC: 'Public: Anyone can chat',
    UNLISTED: 'Unlisted: Anyone with a link with can chat',
    PRIVATE: 'Private: Only you can chat',
  };

  const visibilityAlign = {
    PUBLIC: 'justify-content-left',
    UNLISTED: 'justify-content-center',
    PRIVATE: 'justify-content-end',
  };

  const filters = {
    PUBLIC: (value) => value.visibility === 'PUBLIC',
    UNLISTED: (value) => value.visibility === 'UNLISTED',
    PRIVATE: (value) => value.visibility === 'PRIVATE',
  };

  /* Once all these are loaded, loading is complete. */
  useEffect(() => {
    if (!loadingUser) {
      if (counts['PUBLIC'] === 0) {
        if (counts['UNLISTED'] > 0) {
          setCurrentFilter('UNLISTED');
        } else {
          // if nothing exists, just show private
          setCurrentFilter('PRIVATE');
        }
      }
    }
  }, [loadingUser]);

  const loading = loadingUser || loadingFollowers || loadingFollowing;

  useEffect(() => {
    if (characters) {
      let counts = {};
      for (const [key, value] of Object.entries(filters)) {
        counts[key] = characters.filter(filters[key]).length;
      }
      setCounts(counts);
      const interactions = characters
        .filter((character) => character.visibility === 'PUBLIC')
        .reduce((sum, character) => {
          return sum + character.participant__num_interactions;
        }, 0);
      setProfileData((prev) => ({ ...prev, interactions: interactions }));
    } else {
      setCounts({});
    }
  }, [characters]);

  // Function to sort characters by number of received msgs from users.
  const compareCharacters = (char1, char2) => {
    return ('' + char1.participant__name).localeCompare(
      char2.participant__name,
    );
  };

  useEffect(() => {
    if (user?.user) {
      setFormData({
        //name: user.user.account.name,
        name: user.name,
        username: user?.user?.username,
        avatar_type: user?.user?.account.avatar_type,
      });
    }
  }, [user]);

  const editProfile = () => {
    navigate(`/settings/${window.location.search}`);
  };

  const userInfo = (
    <div
      className={
        'col-12 col-md-8 ' +
        ' profile-header' +
        Constants.NOTCH +
        ' profile-header-bg pt-2 px-2'
      }
    >
      <div className="row pb-1 pt-2  ">
        <div>
          <div className="d-flex flex-row justify-content-between align-items-center">
            {/*just to balance*/}
            <button className={'btn p-1'} role="button" onClick={handleBack}>
              <MdArrowBackIosNew size={24} />
            </button>

            <span
              style={{
                fontWeight: '600',
                fontSize: isMobile ? '20px' : '24px',
              }}
            >
              {formData.name}
            </span>

            <button type="button" className="btn  p-2 " onClick={editProfile}>
              <MdMode size={20} />
            </button>
          </div>
          <div className="d-flex flex-row justify-content-center">
            {showAvatar(
              user?.user?.account?.name,
              isMobile ? 64 : 84,
              user?.user?.account?.avatar_file_name,
            )}
          </div>

          <div className="d-flex flex-row justify-content-center align-items-center">
            {/* put a fake element on the left side to balance spacing with between */}

            <span style={{ fontSize: '14px' }}>@{formData.username}</span>
          </div>
        </div>
        <div className="row justify-content-center align-items-center mt-3">
          <div className="col-4 text-center">
            <b>{profileData.following?.length}</b>&nbsp;Following{' '}
          </div>
          <div className="col-4 text-center ">
            <b>{profileData.followers?.length}</b>&nbsp;
            {'Follower' + (profileData.followers?.length == 1 ? '' : 's')}{' '}
          </div>
          <UncontrolledTooltip target={'interactions-count'} placement="top">
            Total of your Public Characters
          </UncontrolledTooltip>
          <div
            className={'col-lg-4 col-md-12 text-center'}
            id="interactions-count"
          >
            <b>
              <IoChatbubblesOutline style={{ marginLeft: 0 }} />
              {displayNumInteractions(profileData.interactions)}
            </b>{' '}
            User&nbsp;Interactions
          </div>
        </div>
      </div>
    </div>
  );

  const characterTab = (
    <>
      <div
        className={
          'col-12 profile-header-bg p-2 ' + ' profile-header' + Constants.NOTCH
        }
      >
        <div className="row pb-1 pt-2  ">
          <div className="container">
            <div
              className="d-flex flex-row justify-content-between align-items-center w-100"
              style={{ marginTop: '-20px' }}
            >
              <button
                type="button"
                className={
                  'btn p-1 mt-2 ' +
                  (currentFilter === 'PUBLIC' ? 'filter-on' : 'filter-off')
                }
                onClick={() => {
                  setCurrentFilter('PUBLIC');
                }}
              >
                <MdOutlineRemoveRedEye className="" size={24} />{' '}
                <span style={{ fontSize: 'small' }}>({counts['PUBLIC']})</span>
              </button>
              <button
                type="button"
                className={
                  'btn p-1 mt-2 ' +
                  (currentFilter === 'UNLISTED' ? 'filter-on' : 'filter-off')
                }
                onClick={() => {
                  setCurrentFilter('UNLISTED');
                }}
              >
                <MdLink className="" size={24} />{' '}
                <span style={{ fontSize: 'small' }}>
                  ({counts['UNLISTED']})
                </span>
              </button>
              <button
                type="button"
                className={
                  'btn p-1 mt-2 ' +
                  (currentFilter === 'PRIVATE' ? 'filter-on' : 'filter-off')
                }
                onClick={() => {
                  setCurrentFilter('PRIVATE');
                }}
              >
                <MdLock className="" size={24} />{' '}
                <span style={{ fontSize: 'small' }}>({counts['PRIVATE']})</span>
              </button>
            </div>

            <div
              className={
                'd-flex flex-row  align-items-center w-100  ' +
                visibilityAlign[currentFilter]
              }
            >
              <div className="" style={{ fontSize: 'small' }}>
                &nbsp;{getVisibilityText(currentFilter)}&nbsp;
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 profile-characters" style={{ height: '100vh' }}>
        <div className="p-5">
          <span></span>
        </div>

        {characters &&
          characters
            .filter(filters[currentFilter])
            .sort(compareCharacters)
            .map((character, index) => (
              <div key={index} className="m-2 profile-row">
                <CharacterCard
                  character={character}
                  username={user?.user?.username}
                  hide={
                    character.visibility === 'PUBLIC'
                      ? ['creator']
                      : ['stats', 'creator']
                  }
                />
                {/*renderCharacter(character, false, true, false)*/}
              </div>
            ))}
        <div className="p-5">
          <span></span>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ height: '100%' }}>
      <MobileView>
        <div className={navClassNames} style={getNavStyle()}>
          <Nav />
        </div>
      </MobileView>

      {loading ? (
        <div className="d-flex justify-content-center m-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center p-0">
          {user ? userInfo : null}
          <div
            className="col-12 col-md-8 profile-characters"
            style={{ marginTop: 207 }}
          >
            <div
              style={{
                position: 'fixed',
                zIndex: 1000,
                background: 'white',
                width: 'inherit',
              }}
            >
              <BootstrapNav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTab === 0,
                    })}
                    onClick={() => {
                      toggle(0);
                    }}
                  >
                    <MdSportsHandball size={PROFILE_ICON_SIZE} />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTab === 1,
                    })}
                    onClick={() => {
                      toggle(1);
                    }}
                  >
                    <CgFeed size={PROFILE_ICON_SIZE} />
                  </NavLink>
                </NavItem>
              </BootstrapNav>
            </div>
            <TabContent
              activeTab={activeTab}
              style={{ marginTop: 60 }}
              id="profile-tabs"
            >
              <SwipeableViews index={activeTab} onChangeIndex={onSwipe}>
                <TabPane tabId={0}>
                  <div className="d-flex flex-row">{characterTab}</div>
                </TabPane>
                <TabPane tabId={1}>
                  <Posts
                    userScope={true}
                    token={props.token}
                    numPostsToLoad={5}
                    handleServerError={undefined}
                    ga={undefined}
                    enablePostCreation={false}
                    shareTitle={
                      'Check out this awesome conversation I had with these Characters!'
                    }
                    pinningEnabled={false}
                  />
                </TabPane>
              </SwipeableViews>
            </TabContent>
          </div>
        </div>
      )}
      <div className="p-5">
        <span></span>
      </div>
    </div>
  );
};

export default Profile;
