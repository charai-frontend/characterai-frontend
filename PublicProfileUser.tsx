import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';

import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import API from './api/Api';
import { Following, PublicUser } from './types';

type Props = {
  publicUser?: PublicUser;
  following?: Following;
  username: string;
};

const PublicProfileUser = ({ publicUser, following, username }: Props) => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };

  const showAvatar = (name: string, size: number, avatar_file_name: string) => {
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

  if (!publicUser) {
    return <Spinner />;
  }
  return (
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
          <div className="d-flex flex-row">
            <button className={'btn p-1'} role="button" onClick={handleBack}>
              <MdArrowBackIosNew size={24} />
            </button>

            <span
              style={{ fontWeight: '600', fontSize: '24px', marginLeft: 30 }}
            >
              @{publicUser.username}
            </span>
          </div>
          <div className="d-flex flex-row justify-content-center align-items-center my-2">
            <div className="col-2" style={{ textAlign: 'center' }}>
              {showAvatar(publicUser.name, 70, publicUser.avatar_file_name)}
              <div style={{ fontSize: '14px' }}>{publicUser.name}</div>
            </div>
            <div className="col-10 ps-5">
              <span className="me-3">
                <b>{publicUser.num_following}</b>&nbsp;Following
              </span>
              <span>
                <b>{publicUser.num_followers}</b>&nbsp;
                {'Follower' + (publicUser.num_followers == 1 ? '' : 's')}
              </span>
              <div>
                {following?.includes(publicUser.username) ? (
                  <button
                    type="button"
                    className="btn border btn-primary px-3 mt-3"
                    onClick={() => username && API.unfollowUser(username)}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn border btn-primary px-3 mt-3"
                    onClick={() => username && API.followUser(username)}
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex flex-row justify-content-center"></div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileUser;
