import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { useEffect, useState } from 'react';
import { Modal, ModalBody } from 'reactstrap';

import * as Constants from './Constants';
import LoginButton from './LoginButton';
import Waitlist from './Waitlist';
import Logo from './components/Logo';

const LoginModal = (props) => {
  const { error } = useAuth0();
  const [loginOpen, setLoginOpen] = useState(false);

  const [showWaitList, setShowWaitList] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const forceLogin = urlParams.get('force_login');

  const closeLogin = () => {
    setShowWaitList(false);
    setLoginOpen(false);
    props.setLoginOpen(false);
  };

  useEffect(() => {
    setLoginOpen(false);
  }, []);

  useEffect(() => {
    setLoginOpen(props.login);
  }, [props]);

  let logoDiv = (
    <div className="row">
      <div className="col text-center" style={{ marginTop: '0px' }}>
        <Logo />
      </div>
    </div>
  );

  let messageDiv = (
    <div className="row justify-content-center">
      <div className="col-8 d-flex justify-content-center mt-3 mb-2 text-center">
        {props.waitlist ? (
          <h6>Registration is currently closed</h6>
        ) : (
          <div>
            {forceLogin ? (
              <h6>
                You've hit the limit of messages you can send without signing
                up!
              </h6>
            ) : (
              <h6>Registration is currently open</h6>
            )}
            <div className="mt-4 mb-1">
              Log&nbsp;in or Sign&nbsp;up to talk to Characters and much more!
            </div>
          </div>
        )}
        <span></span>
      </div>
    </div>
  );

  let loginProps = {};
  if (error && error['error']) {
    messageDiv = (
      <div className="row justify-content-center">
        <div className="col-8 d-flex justify-content-center text-center text-danger">
          {error['error_description']}
        </div>
      </div>
    );
    loginProps = { max_age: 0 };
  }

  let waitlistDiv = props.waitlist ? (
    <div>
      <div className="row mt-2 justify-content-center">
        <div className="col-8 justify-content-center text-center text-muted">
          If you would like to become a member...
        </div>
      </div>
      <div className="row ">
        <div className="col d-flex justify-content-center text-muted">
          <button
            className="btn btn-primary p-2 mt-3 mb-1"
            style={{ width: '150px' }}
            onClick={() => setShowWaitList(!showWaitList)}
          >
            Join Waitlist...
          </button>
        </div>
      </div>
    </div>
  ) : (
    ''
  );

  let preLoginDiv = (
    <div className="row justify-content-center mt-4">
      <div className="col-8 d-flex justify-content-center text-center">
        {props.waitlist ? (
          <span className="text-muted">
            If you are a current member (or have received an invitation from us)
            <br />
          </span>
        ) : null}
      </div>
    </div>
  );

  let feedUpsell = (
    <div className="row">
      <div className="col mb-4 d-flex justify-content-center align-items-center">
        <span className="text-muted">
          (Pro tip:{' '}
          <a href="/feed" style={{ textDecoration: 'inherit' }}>
            Character Feed
          </a>{' '}
          is open to everyone)
        </span>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={loginOpen}
      backdrop
      toggle={!props.no_close && closeLogin}
      style={{ marginTop: Constants.NOTCH ? 50 : 0 }}
    >
      <ModalBody>
        {showWaitList ? (
          <Waitlist
            back={() => setShowWaitList(!showWaitList)}
            handleServerError={props.handleServerError}
          />
        ) : (
          <div className="container justify-content-center">
            {logoDiv}
            {messageDiv}
            {waitlistDiv}
            {props.waitlist && preLoginDiv}
            <div className="row">
              <div className="col mt-3 mb-5 d-flex justify-content-center align-items-center">
                <LoginButton config={loginProps} />
              </div>
            </div>
            {props.waitlist && feedUpsell}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default LoginModal;
