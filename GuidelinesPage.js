import React from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import Guidelines from './Guidelines';
import './Common.css';
import Logo from './components/Logo';

const GuidelinesPage = (props) => {
  const location = useLocation();
  let from_location = location.state;

  const navigate = useNavigate();

  const handleBack = () => {
    let address = '/';
    if (props.back) {
      address = `${props.back}`;
    } else if (from_location) {
      address = `${from_location}`;
    }
    navigate(address);
  };

  return (
    <div className="row mt-4 me-3" style={{ maxWidth: '800px' }}>
    <div className="col-1 mb-5">
      <button className={'btn mt-2'} role="button" onClick={handleBack}>
        <MdArrowBackIosNew size={24} />
      </button>
    </div>
    <div className="col container m-2">
      <div className="row mb-5">
        <div className="col text-left">
          <Logo />
        </div>
      </div>
        <Guidelines
          context='page'/>
      </div>
    </div>
  );
};

export default GuidelinesPage;
