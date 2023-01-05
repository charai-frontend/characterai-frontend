import classnames from 'classnames';
import React, { useState } from 'react';
import { MdAssignmentTurnedIn, MdInfo } from 'react-icons/md';
import SwipeableViews from 'react-swipeable-views';
import {
  Nav as BootstrapNav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';

import Answers from '../Answers';
import '../Common.css';
import Guidelines from '../Guidelines';

const PROFILE_ICON_SIZE = 32;

type CommunityTabsProps = {
  token: string;
  fixed: boolean;
};

/**
 * Display
 * 1. Guidelines
 * 2. FAQ
 */
const CommunityTabs = ({ token, fixed = false }: CommunityTabsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const toggle = (tab: number) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const onSwipe = (newIndex: number) => {
    setActiveTab(newIndex);
  };

  return (
    <>
      <div
      /*style={{
          position: 'relative',
          zIndex: 1000,
          background: 'white',
          width: 'inherit',
        }}*/
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
              <span style={{ fontWeight: '600', fontSize: '20px' }}>FAQ</span>
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
              <span style={{ fontWeight: '600', fontSize: '20px' }}>Guidelines</span>
            </NavLink>
          </NavItem>
        </BootstrapNav>
      </div>
      <TabContent
        activeTab={activeTab}
        style={{ marginTop: 10 }}
        id="community-tabs"
      >
        <SwipeableViews index={activeTab} onChangeIndex={onSwipe}>
          <TabPane tabId={0}>
            <Answers
              token={token}
              context={'sidebar'}
              handleServerError={undefined}
            />
          </TabPane>
          <TabPane tabId={1}>
            <Guidelines
              token={token}
              context={'sidebar'}
              handleServerError={undefined}
            />
          </TabPane>
        </SwipeableViews>
      </TabContent>
    </>
  );
};

export default CommunityTabs;
