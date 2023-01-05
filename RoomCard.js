import Moment from 'moment';
import { MdHighlightOff } from 'react-icons/md';
import { Link } from 'react-router-dom';

import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import ImageGeneratingIcon from './components/ImageGeneratingIcon';
import { buildUrlParams } from './utils.js';

const roomAvatarSize = 30;

const RoomCard = (props) => {
  Moment.locale('en');

  return (
    <div className="p-0 m-1">
      <Link
        className="btn w-100"
        role="button"
        to={
          props.onHide
            ? '#'
            : {
                pathname: `/chat${buildUrlParams({
                  hist: props.room.external_id,
                })}`,
              }
        }
      >
        <div className="d-flex flex-row align-items-center">
          <div className="">
            {props.onHide && (
              <button
                onClick={() => {
                  props.onHide(props.room.external_id);
                }}
                className=" btn  p-1 "
              >
                <MdHighlightOff size={30} />
              </button>
            )}
          </div>
          <div className="">
            {props.room.title && (
              <div className="  p-0 pe-2" style={{ fontWeight: '550' }}>
                <ImageGeneratingIcon
                  imageGenEnabled={props.room.img_gen_enabled}
                  tooltipDescription={'Image Generating Room'}
                />
                {('#' + props.room.title).replace(/ /g, '-')}{' '}
              </div>
            )}
          </div>
          <div className="px-2">
            <div className="row">
              {props.room.participants.map((p) => (
                <div
                  key={p.name}
                  className="p-0 pe-1"
                  style={{ width: 'fit-content' }}
                >
                  <InitialAvatar
                    name={p.name}
                    size={roomAvatarSize}
                    avatarFileName={
                      p.avatar_file_name
                        ? `${Constants.CDN_THUMBNAIL_URL}/static/avatars/${p.avatar_file_name}`
                        : ''
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RoomCard;
