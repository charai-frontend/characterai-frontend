import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { MobileView } from 'react-device-detect';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import './App.css';
import './Common.css';
import Nav from './Nav';
import { getNavStyle, navClassNames } from './Nav';
import './Profile.css';
import PublicProfileUser from './PublicProfileUser';
import API from './api/Api';
import ProfileTabs from './profile/ProfileTabs';

type PublicProfileProps = {
  token: string;
};

const PublicProfile = (props: PublicProfileProps) => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const navigate = useNavigate();

  const username = query.get('username') || '';

  if (!username) {
    // no user specified, head home
    navigate(`/${window.location.search}`);
  }

  const { data: publicUser, isLoading: loadingPublicUser } = useQuery(
    ['profile', username],
    () => API.fetchPublicUser(username as string),
  );
  const { data: following, isLoading: loadingFollowing } = useQuery(
    ['following'],
    API.fetchFollowing,
  );

  return (
    <div style={{ height: '100%' }}>
      <MobileView>
        <div className={navClassNames} style={getNavStyle()}>
          <Nav />
        </div>
      </MobileView>

      {!publicUser || loadingPublicUser ? (
        <div className="d-flex justify-content-center m-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center p-0">
          <PublicProfileUser
            publicUser={publicUser}
            following={following}
            username={username}
          />
          <div
            className="col-12 col-md-8 profile-characters"
            style={{ marginTop: 157 }}
          >
            {username && (
              <ProfileTabs
                token={props.token}
                username={username}
                publicUser={publicUser}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
