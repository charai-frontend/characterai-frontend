import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useEffect, useState } from 'react';
import { Switch } from 'react-darkreader';
import { MobileView } from 'react-device-detect';
import { MdArrowBackIosNew, MdDangerous, MdLogout } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Nav } from 'reactstrap';

import { queryClient } from '..';
import '../App.css';
import '../Common.css';
import * as Constants from '../Constants';
import InitialAvatar from '../InitialAvatar';
import { getNavStyle, navClassNames } from '../Nav';
import API from '../api/Api';
import AvatarUpload from '../components/AvatarUpload';
import { buildUrlParams } from '../utils';
import { AccountDeactivateWarningModal } from './AccountDeactivateWarningModal';

type ProfileSettingsProps = {
  token: string;
  logout: () => void;
  getUser: () => Promise<void>;
  isDark: boolean;
  toggleDarkMode: () => void;
  handleServerError: (err: any) => void;
};

export const ProfileSettings = (props: ProfileSettingsProps) => {
  const navigate = useNavigate();

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const { data: user, isLoading: loadingUser } = useQuery(
    ['user'],
    API.fetchUser,
  );

  const [errors, setErrors] = useState({
    username: '',
    avatar_type: '',
    name: '',
  });

  const [serverError, setServerError] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const [formData, setFormData] = useState({
    avatar_type: '',
    name: '',
    acknowledgement: false,
    username: '',
    avatar_rel_path: '',
  });

  const validNameRegex = RegExp(/^[A-Za-z0-9_-][ A-Za-z0-9_-]*$/i);

  const validUsernameRegex = RegExp(/^[A-Za-z0-9_-]+$/i);

  useEffect(() => {
    if (user?.user) {
      setFormData({
        //name: user.user.account.name,
        name: user.name,
        username: user?.user?.username,
        avatar_type: user.user.account.avatar_type,
        avatar_rel_path: user.user.account.avatar_file_name,
        acknowledgement: true,
      });
    }
  }, [user]);

  const submitForm = () => {
    setServerError('');
    if (validateForm()) {
      console.info('Valid Form');
      updateUser();
    } else {
      console.error('Invalid Form : ', errors);
      setShowErrors(true);
    }
  };

  const validateForm = () => {
    for (const [key, value] of Object.entries(formData)) {
      //console.log(key,value)
      if (!validateField(key, value as string)) {
        return false;
      }
    }

    let valid = true;
    Object.values(errors).forEach((val) => val.length > 0 && (valid = false));
    return valid;
  };

  const handleFormEntry = async (event: any) => {
    event.preventDefault();
    const { name, value } = event.target;
    validateField(name, value);
    setFormData((oldDict) => ({ ...oldDict, [name]: value }));
  };

  const validateField = (field_name: string, value: string) => {
    let error = '';
    switch (field_name) {
      case 'name':
        error =
          value.length < Constants.MIN_NAME_LEN ||
          value.length > Constants.MAX_NAME_LEN ||
          !validNameRegex.test(value)
            ? 'Name must be ' +
              Constants.MIN_NAME_LEN +
              ' to ' +
              Constants.MAX_NAME_LEN +
              ' characters and contain only letters, numbers, underscore, dash and space'
            : '';
        break;
      case 'username':
        error =
          value.length < Constants.MIN_USERNAME_LEN ||
          value.length > Constants.MAX_USERNAME_LEN ||
          !validUsernameRegex.test(value)
            ? 'Username must be ' +
              Constants.MIN_USERNAME_LEN +
              ' to ' +
              Constants.MAX_USERNAME_LEN +
              ' characters and contain only letters, numbers, underscore and dash'
            : '';
        break;
      default:
        break;
    }
    setErrors((oldDict) => ({ ...oldDict, [field_name]: error }));
    return error.length === 0;
  };

  const updateUser = async () => {
    setServerError('');
    const response = await API.updateUser({
      username: formData.username.trim(),
      name: formData.name.trim(),
      avatar_type: formData.avatar_type,
      avatar_rel_path: formData.avatar_rel_path,
    });
    if (response.data.status === 'OK') {
      queryClient.invalidateQueries(['user']);
      props.getUser();
      navigate(-1);
    } else {
      const error = response.data.status;
      console.error(error);
      setServerError(error);
      setShowErrors(true);
    }

    setServerError('');
  };

  const handleLogout = () => {
    props.logout();
  };

  const handleBack = () => {
    navigate(`/profile/${buildUrlParams()}`);
  };

  const updateAvatar = (avatarRelPath: string) => {
    setFormData((oldDict) => ({
      ...oldDict,
      ['avatar_rel_path']: avatarRelPath,
      ['avatar_type']: 'UPLOADED',
    }));
  };

  const handleDeactivate = () => {
    setIsDeactivateModalOpen(true);
  };

  const showAvatar = () => {
    if (
      user &&
      user.user.account.avatar_file_name !== '' &&
      !formData.avatar_rel_path
    ) {
      return (
        <InitialAvatar
          name={user.user.account.name}
          size={30}
          avatarFileName={
            user.user.account.avatar_file_name
              ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${user.user.account.avatar_file_name}`
              : ''
          }
        />
      );
    }
    return (
      <InitialAvatar
        name={formData.name}
        size={30}
        avatarFileName={
          formData.avatar_rel_path
            ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${formData.avatar_rel_path}`
            : ''
        }
      />
    );
  };

  return (
    <div style={{ height: '100%' }}>
      <MobileView>
        <div className={navClassNames} style={getNavStyle()}>
          <Nav token={props.token} />
        </div>
      </MobileView>
      <AccountDeactivateWarningModal
        isOpen={isDeactivateModalOpen}
        setIsOpen={setIsDeactivateModalOpen}
        handleLogout={handleLogout}
      />
      {loadingUser ? (
        <div className="d-flex justify-content-center m-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      ) : (
        <div className="container mt-3">
          <div className="col-xs-12 col-md-8 mb-3 ">
            <div className="row align-items-center">
              <div className="col-1 p-0 m-0">
                <button className={'btn'} role="button" onClick={handleBack}>
                  <MdArrowBackIosNew size={24} />
                </button>
              </div>
              <div className="col-11 mt-2">
                <h1>Profile Settings</h1>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="row">
              <div className="col">
                {serverError && (
                  <p className="alert alert-danger">{serverError}</p>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col">
                <form>
                  <div className="row mb-4">
                    <div className="col">
                      <label htmlFor="username">Username</label>
                      <div className="text-muted" style={{ fontSize: 'small' }}>
                        You can change this at any time.
                      </div>

                      <input
                        className="form-control"
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="off"
                        value={formData.username}
                        onChange={handleFormEntry}
                        maxLength={Constants.MAX_USERNAME_LEN}
                      />
                      {showErrors && errors.username && (
                        <p className="alert alert-danger">{errors.username}</p>
                      )}
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col">
                      <label htmlFor="name">Name</label>
                      <div className="text-muted" style={{ fontSize: 'small' }}>
                        {`The name you'll use for chatting.`}
                      </div>

                      <input
                        className="form-control"
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="off"
                        value={formData.name}
                        onChange={handleFormEntry}
                        maxLength={Constants.MAX_NAME_LEN}
                      />
                      {showErrors && errors.name && (
                        <p className="alert alert-danger">{errors.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <AvatarUpload updateAvatarRelPathFn={updateAvatar} />
                    <div
                      className="mt-4 mb-1 text-muted"
                      style={{ fontSize: 'small' }}
                    >
                      How your name and username might appear in chats or next
                      to your Characters.
                    </div>
                    <div className="d-flex justify-content-around">
                      <div className="">
                        {showAvatar()}
                        &nbsp;
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>
                          {formData.name}
                        </span>
                      </div>

                      <div className="py-1">
                        <span style={{ fontSize: '15px' }}>
                          @{formData.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex mt-4">
                    <div className="me-2">Dark Mode</div>
                    <Switch
                      checked={props.isDark}
                      onChange={props.toggleDarkMode}
                    />
                  </div>
                </form>
                <div className="col-md-12 mt-4">
                  <p>
                    <i>
                      Use of Character.AI is bound by our{' '}
                      <Link className="" state="/settings" to="/tos">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link className="" state="/settings" to="/privacy">
                        Privacy Policy
                      </Link>
                      .
                    </i>
                  </p>
                </div>
                <div className="row mb-5 mt-5">
                  <div className="col d-flex justify-content-between ">
                    <button
                      type="button"
                      className="btn border p-1 "
                      onClick={handleLogout}
                    >
                      Logout&nbsp;
                      <MdLogout size={20} />
                    </button>
                    {/* <button
                      type="button"
                      className="btn p-1 border "
                      onClick={handleDeactivate}
                    >
                      Deactivate&nbsp;
                      <MdDangerous size={20} />
                    </button> */}
                    <button
                      type="submit"
                      className="btn p-1 border "
                      onClick={submitForm}
                    >
                      &nbsp;Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-5">
        <span></span>
      </div>
    </div>
  );
};
