import Moment from 'moment';

/* Component that shows a relative timestamp, e.g., below a Post or Comment. */
const RelativeTime = (props) => {
  Moment.locale('en');

  return (
    <div
      className="col-auto ps-0"
      style={{ fontSize: '12px', fontWeight: '200' }}
    >
      {Moment(props.timestamp).fromNow()}
    </div>
  );
};

export default RelativeTime;
