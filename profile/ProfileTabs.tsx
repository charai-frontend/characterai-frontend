import classnames from 'classnames';
import React, { useState } from 'react';
import { CgFeed } from 'react-icons/cg';
import { MdHouseboat, MdSportsHandball } from 'react-icons/md';
import SwipeableViews from 'react-swipeable-views';
import {
  Nav as BootstrapNav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';

import CharacterCard from '../CharacterCard';
import '../Common.css';
import Posts from '../Posts';
import { PublicUser } from '../types';
import { compareCharacters } from '../utils/character-utils';

export const PROFILE_ICON_SIZE = 32;

type ProfileTabsProps = {
  token: string;
  username: string;
  publicUser: PublicUser;
};

/**
 * Display
 * 1. Users Posts
 * 2. Users Characters
 * 3. Users Rooms
 */
const ProfileTabs = ({ username, publicUser, token }: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const toggle = (tab: number) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      // @ts-expect-error ScrollBehavior definition doesn't contain instant option
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const onSwipe = (newIndex: number) => {
    // @ts-expect-error ScrollBehavior definition doesn't contain instant option
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveTab(newIndex);
  };

  return (
    <>
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
          {/* <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === 2,
              })}
              onClick={() => {
                toggle(2);
              }}
            >
              <MdHouseboat size={PROFILE_ICON_SIZE} />
            </NavLink>
          </NavItem> */}
        </BootstrapNav>
      </div>
      <TabContent
        activeTab={activeTab}
        style={{ marginTop: 60 }}
        id="profile-tabs"
      >
        <SwipeableViews index={activeTab} onChangeIndex={onSwipe}>
          <TabPane tabId={0}>
            {publicUser.characters.sort(compareCharacters).map((character) => (
              <div key={character.external_id} className="m-2 profile-row">
                <CharacterCard
                  character={character}
                  username={''}
                  hide={['stats','creator', 'visibility']}
                />
                {/* {renderCharacter(character, publicUser.username, false, false, false, false)} */}
              </div>
            ))}
          </TabPane>
          <TabPane tabId={1}>
            <Posts
              username={username}
              token={token}
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

          {/* <TabPane tabId={2}>Users Rooms</TabPane> */}
        </SwipeableViews>
      </TabContent>
    </>
  );
};

export default ProfileTabs;
