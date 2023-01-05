import axios from 'axios';
import React from 'react';
import { useState } from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';

import './App.css';
import './Common.css';
import Logo from './components/Logo';

const Waitlist = (props) => {
  const validEmailRegex = RegExp(
    /^(([^<>()[\].,;:\s@"]+(.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i,
  );

  const [errors, setErrors] = useState({ email: 'Required' });
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    comments: '',
  });

  const submitForm = () => {
    if (validateForm()) {
      joinWaitlist();
    } else {
      console.error('Invalid Form : ', errors);
      setShowErrors(true);
    }
  };

  const validateForm = () => {
    let valid = true;
    Object.values(errors).forEach((val) => val.length > 0 && (valid = false));
    return valid;
  };

  const handleFormEntry = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    validateField(name, value);
    setFormData({ ...formData, [name]: value });
  };

  const validateField = (field_name, value) => {
    //let value = formData[field_name]
    let error = '';
    switch (field_name) {
      case 'email':
        //value = value.replace("@gmail.com", "") + "@gmail.com";
        error = !validEmailRegex.test(value)
          ? 'Please supply a valid email address.'
          : '';
        break;
      case 'first_name':
        error = '';
        break;
      case 'last_name':
        error = '';
        break;

      default:
        break;
    }
    setErrors({ ...errors, [field_name]: error });
  };

  const joinWaitlist = () => {
    //console.log('joining');
    axios
      .post('/chat/waitlist/', {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        comments: formData.comments,
      })
      .then((response) => {
        if (response.data.status === 'OK') {
          setSubmitted(true);
          // redirect to home page?
        } else {
          alert('Error: ' + response.data.status);
          // alert that it failed
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  return (
    <div>
      {submitted ? (
        <div>
          <div className="row">
            <div className="col text-center" style={{ marginTop: '120px' }}>
              <img className="img-fluid mt-5 w-75 mb-3" src={logo} alt="logo" />
            </div>
          </div>
          <div className="row">
            <div className="col text-center p-5">
              <h5>Thank you!</h5>
              <p className="p-5">
                We will notify you by email when we have a new opportunity for
                you to join.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="container">
            <div className="col-1">
              <div className="row">
                <div className="p-0">
                  <button className={'btn'} role="button" onClick={props.back}>
                    <MdArrowBackIosNew size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col text-center" style={{ marginTop: '80' }}>
                <Logo />
              </div>
            </div>

            <div className="row">
              <div className="col p-3 text-justify">
                <h6>Character is currently in beta</h6>
                <p>
                  We're opening up registrations gradually to make sure nothing
                  breaks. Join our waitlist and we'll let you know as soon as
                  you can use Character!
                </p>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <form>
                  <div className="row mb-2">
                    <div className="col-md-12">
                      <label htmlFor="email">Email Address</label>
                      <div className="row justify-content-start align-items-center">
                        <div className="col">
                          <input
                            className="form-control"
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleFormEntry}
                            style={{ textAlign: 'left' }}
                          />
                        </div>
                      </div>
                      {showErrors && errors.email && (
                        <p className="alert alert-danger">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <label htmlFor="first_name">First Name (optional)</label>
                      <input
                        className="form-control"
                        id="first_name"
                        name="first_name"
                        type="text"
                        value={formData.first_name}
                        onChange={handleFormEntry}
                      />
                      {showErrors && errors.first_name && (
                        <p className="alert alert-danger">
                          {errors.first_name}
                        </p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="last_name">Last Name (optional)</label>
                      <input
                        className="form-control"
                        id="last_name"
                        name="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={handleFormEntry}
                      />
                      {showErrors && errors.last_name && (
                        <p className="alert alert-danger">{errors.last_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label htmlFor="comments">Comments (optional)</label>
                      <div className="text-muted" style={{ fontSize: 'small' }}>
                        Let us know why you're excited to join the Character
                        community!
                      </div>
                      <textarea
                        rows="5"
                        className="form-control"
                        name="comments"
                        id="comments"
                        value={formData.comments}
                        onChange={handleFormEntry}
                      />
                    </div>
                  </div>
                </form>
                <div className="row mb-5 ">
                  <div className="col d-flex justify-content-center">
                    <button
                      type="submit"
                      className="btn p-2 border btn-primary"
                      onClick={submitForm}
                    >
                      Join Waitlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Waitlist;
