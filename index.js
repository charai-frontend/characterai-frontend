import { Auth0Provider } from '@auth0/auth0-react';
import { Capacitor } from '@capacitor/core';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import React from 'react';
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent';
import { isMobile } from 'react-device-detect';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import App from './App';
import * as Constants from './Constants';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { getAuth0RedirectUri, isUserInEU } from './utils.js';

const initGoogleAnalytics = async () => {
  const userInEU = await isUserInEU();

  if (getCookieConsentValue() || !userInEU) {
    // run Google Analytics in test mode if local, will not send data to Google
    ReactGA.initialize('UA-238452789-1', {
      testMode: Constants.IS_LOCAL || Constants.IS_STAGING,
    });
  }
};

initGoogleAnalytics();

const onCookieAccept = () => {
  initGoogleAnalytics();
  localStorage.setItem(Constants.VISITED_KEY, true);
};

if (!Constants.IS_LOCAL && window.location.protocol === 'http:') {
  const https_url = window.location.href.replace('http:', 'https:'); // only first occurrence.
  window.location.replace(https_url);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show error toasts if we already have data in the cache
      // which indicates a failed background update
      if (Constants.IS_LOCAL && query.state.data !== undefined) {
        toast.error(`Something went wrong: ${error.message}`);
      }
    },
  }),
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastContainer hideProgressBar autoClose={2500} limit={3} />

        <Auth0Provider
          domain="character-ai.us.auth0.com"
          clientId={Constants.AUTH0_CLIENT_ID}
          redirectUri={getAuth0RedirectUri()}
          useRefreshTokens
          cacheLocation="localstorage"
          prompt="select_account"
          audience="https://auth0.character.ai/"
        >
          <App />
        </Auth0Provider>
        {!localStorage.getItem(Constants.VISITED_KEY) && (
          <CookieConsent
            onAccept={onCookieAccept}
            style={
              isMobile
                ? { padding: '20px 0', opacity: 0.85 }
                : {
                    width: 300,
                    padding: '10px 0',
                    opacity: 0.85,
                    borderTopRightRadius: 8,
                  }
            }
            buttonWrapperClasses={
              isMobile ? 'w-100 d-flex justify-content-end' : ''
            }
            buttonClasses="btn btn-primary"
            buttonStyle={{
              backgroundColor: '#138eed',
              borderRadius: '0.25rem',
              color: 'white',
            }}
          >
            We use cookies to enhance the user experience.
          </CookieConsent>
        )}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(//console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
