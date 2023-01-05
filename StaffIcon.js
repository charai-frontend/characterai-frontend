

const StaffIcon = ({comment}) => {
  return (
      <span
        className="rounded py-0 px-1"
        style={{
          marginLeft: 5,
          position: "relative",
          top: "-0.2em",
          backgroundColor: '#3c85f6',
          color: 'white',
          fontWeight: '700',
          fontSize: 10,
        }}
      >
            {'STAFF'}
      </span>
  );
};

export default StaffIcon;
