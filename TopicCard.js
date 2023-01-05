import Moment from 'moment';
import { Link } from 'react-router-dom';

import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import { buildUrlParams } from './utils.js';

const TopicCard = (props) => {
  Moment.locale('en');

  const maybeRenderUnseenCounter = () => {
    if (props.topic.unseen_posts_count > 0) {
      return (
        <span
          className="badge rounded-pill bg-danger"
          style={{
            position: 'relative',
            top: '-25px',
            left: '150px',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {props.topic.unseen_posts_count}
          <span className="visually-hidden">unread posts</span>
        </span>
      );
    }
  };

  const maybeRenderLastActivityDateTime = () => {
    let lastActivity = '';
    if (props.topic.last_activity_datetime) {
      lastActivity = `· last activity ${Moment(
        props.topic.last_activity_datetime,
      ).fromNow()}`;
    }
    return `${props.topic.posts_count} posts${lastActivity}`;
  };

  let statusTextStyle = {
    fontSize: '13px',
  };
  if (props.topic.unseen_posts_count > 0) {
    statusTextStyle['marginTop'] = '-21px';
  }

  return (
    <Link
      className=""
      style={{ color: 'inherit', textDecoration: 'inherit' }}
      role="button"
      to={{
        pathname: `/posts${buildUrlParams({
          topic: props.topic.external_id,
        })}`,
      }}
    >
      <div className="row px-4 pt-2 align-items-center">
        <div className="col-auto p-0">
          <InitialAvatar
            name={props.topic.name}
            avatarFileName={
              props.topic.avatar_file_name
                ? `${Constants.CDN_THUMBNAIL_URL}/static/topic-pics/${props.topic.avatar_file_name}`
                : ''
            }
          />
        </div>
        <div className="col ps-4">
          <div className="row">{props.topic.name}</div>
          {maybeRenderUnseenCounter()}
          <div className="row">{props.topic.description}</div>
          <div
            className="row py-1 border-bottom align-items-center justify-content-start"
            style={statusTextStyle}
          >
            {/* {maybeRenderLastActivityDateTime()} */}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
