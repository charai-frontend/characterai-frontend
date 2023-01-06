import classNames from 'classnames';
import React from 'react';
import { MobileView, isIOS, isMobile } from 'react-device-detect';

import Header from './Header';
import LoginModal from './LoginModal';
import Nav, { getNavStyle, navClassNames } from './Nav';
import { Participant } from './types';

type AppWrapperProps = {
  user?: Participant;
  children: React.ReactNode;
  setLoginOpen?: () => void;
  login?: boolean;
  waitlist?: boolean;
  handleServerError?: () => void;
  style?: { [key: string]: string | number };
};

const AppWrapper = ({
  user,
  children,
  setLoginOpen,
  login,
  waitlist,
  handleServerError,
  style,
}: AppWrapperProps) => {
  return (
    <div>
      <MobileView>
        <div className={navClassNames} style={getNavStyle()}>
          <Nav />
        </div>
      </MobileView>
      <LoginModal
        setLoginOpen={setLoginOpen}
        login={login}
        waitlist={waitlist}
        handleServerError={handleServerError}
      />

      <div className={contentClassNames}>
        <div className="container-fluid d-flex justify-content-center p-0 m-0">
          <div className="container-fluid p-0">
            <Header user={user} />

            <div className={charactersGridClassNames}>
              {!isMobile && <Nav />}
              <div
                style={
                  isMobile
                    ? {
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        paddingBottom: isIOS ? '94px' : '78px',
                        ...style,
                      }
                    : { paddingLeft: '110px', paddingRight: '12px', ...style }
                }
              >
                <div className="w-100 p-0">
                  <div className="container-fluid p-0 m-0">{children}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppWrapper;

const charactersGridClassNames = classNames({
  row: !isMobile,
  'w-100': !isMobile,
});

// Never set "overflow-auto": true.
const contentClassNames = classNames({
  'container-fluid': true,
  'p-0': true,
  'm-0': true,
  'd-flex': true,
  'justify-content-start': true,
  col: !isMobile,
});
