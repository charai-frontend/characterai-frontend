import classNames from 'classnames';
import { MobileView, isMobile } from 'react-device-detect';

import './App.css';
import './Chat.css';
import './Common.css';
import * as Constants from './Constants';
import Header from './Header';
import LoginModal from './LoginModal';
import Nav from './Nav';
import { getNavStyle, navClassNames } from './Nav';
import Posts from './Posts';

// Clone Posts function. This force refreshes the page when the user clicks on the
// "Feed" Nav link.
let feedTopicId = 'gLj1MBqU6AgCuf4IwUE-5q4Vz-CKMP5be23HERh0Ekg';
// NOTE[SS]: next line breaks for local server + cloud sql proxy.
if (Constants.IS_LOCAL) {
  feedTopicId = 'QEl2A27o9kUnCtiX4aIpy4QK36K-OfObidpW1k5OEdc';
}

// Never set "overflow-auto": true.
const contentClassNames = classNames({
  'container-fluid': true,
  'p-0': true,
  'm-0': true,
  'd-flex': true,
  'justify-content-start': true,
});

export let FEED_TOPIC_ID = feedTopicId;

const Feed = (props) => {
  return (
    <div className={contentClassNames} style={{ height: '100%' }}>
      <div className="container-fluid d-flex justify-content-center p-0 m-0">
        <div className="container-fluid p-0">
          <Header user={props.user} />
          <LoginModal
            setLoginOpen={props.setLoginOpen}
            login={props.login}
            waitlist={props.waitlist}
            handleServerError={props.handleServerError}
          />

          <MobileView>
            <div className={navClassNames} style={getNavStyle()}>
              <Nav />
            </div>
          </MobileView>
          {!isMobile && <Nav />}
          <Posts
            topic={FEED_TOPIC_ID}
            token={props.token}
            numPostsToLoad={5}
            handleServerError={props.handleServerError}
            ga={props.ga}
            enablePostCreation={false}
            shareTitle={
              'Check out this awesome conversation I had with these Characters!'
            }
            pinningEnabled={false}
            seenPostIndicationEnabled={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Feed;
