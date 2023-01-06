import axios from 'axios';
import React from 'react';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import './App.css';
import './Common.css';
import * as Constants from './Constants';
import Logo from './components/Logo';

const Signup = (props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    username: '',
    avatar_type: '',
    acknowledgement: '',
  });
  const [serverError, setServerError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    avatar_type: '',
    name: '',
    acknowledgement: false,
    username: '',
  });

  const validUsernameRegex = RegExp(/^[A-Za-z0-9_-]+$/i);

  useEffect(() => {
    setUser(props.user);
  }, []);

  useEffect(() => {
    if (user?.user && loading) {
      setLoading(false);
      setFormData({
        name: '',
        username: '',
        avatar_type: 'DEFAULT',
        acknowledgement: false,
      });
    }
  }, [user]);

  const getHeaders = () => {
    return {
      headers: { Authorization: 'Token ' + props.token },
    };
  };

  const submitForm = () => {
    if (validateForm()) {
      submitAccount();
    } else {
      console.error('Invalid Form : ', errors);
      setShowErrors(true);
    }
  };

  const changeCheckbox = (event) => {
    validateField(event.target.id, event.target.checked);
    setFormData((oldDict) => ({
      ...oldDict,
      [event.target.id]: event.target.checked,
    }));
  };

  const validateForm = () => {
    let valid = true;

    for (const [key, value] of Object.entries(formData)) {
      valid = !validateField(key, value) && valid;
    }
    if (!valid) {
      return false;
    }

    Object.values(errors).forEach((val) => val.length > 0 && (valid = false));
    return valid;
  };

  const handleFormEntry = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    validateField(name, value);
    setFormData((oldDict) => ({ ...oldDict, [name]: value }));
  };

  const validateField = (field_name, value) => {
    let error = '';
    switch (field_name) {
      case 'acknowledgement':
        error = !value
          ? 'You must acknowledge and agree to our policies to continue.'
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

    return error.length > 0;
  };

  const submitAccount = () => {
    completeSignup();
  };

  const completeSignup = () => {
    axios
      .post(
        '/chat/user/signup/',
        {
          username: formData.username,
          name: formData.username,
          avatar_type: formData.avatar_type,
          acknowledgement: formData.acknowledgement,
          lazy_user_uuid: localStorage.getItem('uuid'),
        },
        getHeaders(),
      )
      .then((response) => {
        if (
          response.data.status === 'OK' ||
          response.data.status === 'Error: signup already complete'
        ) {
          props.getUser();
          navigate(`/${window.location.search}`);
        } else {
          let error = response.data.status;
          console.error(error);
          setServerError(error);
          setShowErrors(true);
          // alert that it failed
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  return (
    <div className="m-3">
      <div className="row">
        <div className="col text-center" style={{ marginTop: '30px' }}>
          <Logo />
        </div>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center m-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="row">
            <div className="col p-3">
              <h5>Welcome!</h5>
              <p>
                You are almost ready to begin talking to and creating
                characters.
              </p>
            </div>
          </div>

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
                <div className="row mb-2">
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
                      maxLength="20"
                      size="20"
                      style={{ width: '300px' }}
                    />
                    {showErrors && errors.username && (
                      <p className="alert alert-danger">{errors.username}</p>
                    )}
                  </div>
                </div>

                <div className="col-md-12 mt-5">
                  {/*  "/policies"  */}
                  <p>
                    <i>
                      Use of Character.AI is bound by our{' '}
                      <Link className="" state="/signup" to="/tos">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link className="" state="/signup" to="/privacy">
                        Privacy Policy
                      </Link>
                      .
                    </i>
                  </p>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    id="acknowledgement"
                    name="acknowledgement"
                    type="checkbox"
                    checked={formData.acknowledgement}
                    onChange={(e) => changeCheckbox(e)}
                  />
                  &nbsp;
                  <label htmlFor="acknowledgement">
                    I understand and agree to these policies.
                  </label>
                  {showErrors && errors.acknowledgement && (
                    <p className="alert alert-danger">
                      {errors.acknowledgement}
                    </p>
                  )}
                </div>
              </form>
              <div className="row mt-5 mb-5 ">
                <div className="col d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn p-1 border "
                    onClick={submitForm}
                  >
                    &nbsp;Join Character!
                  </button>
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

export default Signup;
