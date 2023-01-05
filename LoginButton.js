import { useAuth0 } from '@auth0/auth0-react';
import { Browser } from '@capacitor/browser';
import React from 'react';

import * as Constants from './Constants';

const LoginButton = (props) => {
  const { loginWithRedirect, buildAuthorizeUrl } = useAuth0();

  const login = async () => {
    if (Constants.NATIVE) {
      const url = await buildAuthorizeUrl();
      Browser.open({ url });
    } else {
      loginWithRedirect(props.config);
    }
  };

  return (
    <button
      className=" btn border"
      style={{}}
      onClick={() => {
        login();
      }}
    >
      Sign Up or Log In
    </button>
  );
};

export default LoginButton;
