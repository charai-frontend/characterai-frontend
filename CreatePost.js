import axios from 'axios';
import classNames from 'classnames';
import React from 'react';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import './App.css';
import './Chat.css';
import './Common.css';
import Nav from './Nav';
import { getNavStyle, navClassNames } from './Nav';
import CommunityTabs from './community/CommunityTabs';
import { buildUrlParams, getHeaders } from './utils.js';

const CreatePost = (props) => {
  const MIN_TITLE_LENGTH = 1;
  const MAX_TITLE_LENGTH = 300;
  const MAX_TEXT_LENGTH = 40000;

  const [formData, setFormData] = useState({
    title: '',
    text: '',
    image_rel_path: '',
  });
  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    text: '',
    image_rel_path: '',
  });
  const [topicId, setTopicId] = useState(false);
  const [waitForImage, setWaitForImage] = useState(false);
  const [postButtonEnabled, setPostButtonEnabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get('topic');
    if (topic) {
      setTopicId(topic);
    } else {
      console.error('No topic id provided');
    }
  }, []);

  const getMultipartFormDataHeaders = () => {
    return {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Token ' + props.token,
      },
    };
  };

  const uploadImage = async (img) => {
    const imageUploadFormData = new FormData();
    imageUploadFormData.append('img', img);
    return await axios
      .post(
        '/chat/post/img/upload/',
        imageUploadFormData,
        getMultipartFormDataHeaders(),
      )
      .then((response) => {
        if (response.data.status === 'VIOLATES_POLICY') {
          throw 'Image violates policy';
        }
        if (response.data.status !== 'OK') {
          throw 'Failed to upload image';
        }
        setFormData((oldDict) => ({
          ...oldDict,
          ['image_rel_path']: response.data.value,
        }));
      })
      .catch((err) => {
        props.handleServerError(err);
      });
  };

  const handleChange = async (event) => {
    event.preventDefault();

    if (event.target.files && event.target.files[0]) {
      setWaitForImage(true);
      await uploadImage(event.target.files[0]);
      setWaitForImage(false);
      return;
    }

    const { name, value } = event.target;
    validateField(name, value);
    setFormData((oldDict) => ({ ...oldDict, [name]: value }));
  };

  const validateFields = (fields) => {
    let valid = true;
    for (let i = 0; i < fields.length; i++) {
      valid = validateField(fields[i], formData[fields[i]]) && valid;
    }
    setShowErrors(!valid);
    return valid;
  };

  const validateField = (fieldName, value) => {
    let error = '';
    switch (fieldName) {
      case 'title':
        error =
          value.length < MIN_TITLE_LENGTH || value.length > MAX_TITLE_LENGTH
            ? `The post title must be ${MIN_TITLE_LENGTH} to ${MAX_TITLE_LENGTH} characters long`
            : '';
        break;
      case 'text':
        error =
          value.length > MAX_TEXT_LENGTH
            ? `The post text must be at most ${MAX_TEXT_LENGTH} characters long`
            : '';
        break;
      default:
        break;
    }
    setErrors((oldDict) => ({ ...oldDict, [fieldName]: error }));
    return error.length === 0;
  };

  const createNewPost = async () => {
    setPostButtonEnabled(false);
    axios
      .post(
        '/chat/post/create/',
        {
          post_title: formData.title,
          post_text: formData.text,
          image_rel_path: formData.image_rel_path,
          topic_external_id: topicId,
        },
        getHeaders(props),
      )
      .then((response) => {
        if (response.data.post && response.data.post.external_id) {
          window.location.replace(
            `/post${buildUrlParams({ post: response.data.post.external_id })}`,
          );
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const maybeCreatePost = () => {
    if (validateFields(['title', 'text'])) {
      createNewPost();
    } else {
      console.error(errors);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const postCreationClassNames = classNames({
    row: !isMobile,
    'w-100': !isMobile,
  });

  const contentClassNames = classNames({
    container: true,
    'mt-3': true,
    col: !isMobile,
  });

  const headerTextClassNames = classNames({
    'align-items-center': true,
    'home-sec-header': true,
    'col-11': isMobile,
    'pe-5': isMobile,
  });

  const headerTextStyle = {
    fontSize: '17px',
    fontWeight: '650',
    marginTop: '5px',
    paddingLeft: '10px',
  };

  const showImageInput = () => {
    return (
      <div>
        <div>Upload an image (optional):</div>
        <input
          className="img-upload-box"
          type="file"
          name="img"
          onChange={handleChange}
        />
        {waitForImage && <div>uploading image ...</div>}
      </div>
    );
  };

  return (
    <div className={postCreationClassNames}>
      {!isMobile && (
        <div className="col-1">
          <div className={navClassNames} style={getNavStyle()}>
            <Nav />
          </div>
        </div>
      )}
      <div className={contentClassNames}>
        <div className="container">
          <div className="row align-items-center">
            {isMobile && (
              <div className="col-1 p-0 m-0">
                <button className={'btn'} role="button" onClick={handleBack}>
                  <MdArrowBackIosNew size={24} />
                </button>
              </div>
            )}
            <div className={headerTextClassNames} style={headerTextStyle}>
              Create a Post
            </div>
          </div>

          <form className="pt-4">
            <div className="row mb-4">
              <div className="col">
                <input
                  type="text"
                  className="form-control"
                  autoComplete="off"
                  id="post-title"
                  name="title"
                  maxLength={MAX_TITLE_LENGTH}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Add an Interesting Title"
                />
                {showErrors && errors.title && (
                  <p className="alert alert-danger">{errors.title}</p>
                )}
              </div>
            </div>

            <div className="row mb-4">
              <div className="col">
                <textarea
                  className="form-control"
                  rows="5"
                  id="post-text"
                  name="text"
                  value={formData.text}
                  maxLength={MAX_TEXT_LENGTH}
                  onChange={handleChange}
                  placeholder="Text (optional)"
                  autoComplete="off"
                />
                {showErrors && errors.text && (
                  <p className="alert alert-danger">{errors.text}</p>
                )}
              </div>
            </div>
            {showImageInput()}
            <br />
          </form>

          <div className="px-4 d-flex justify-content-end">
            <div className="row mb-2 align-items-center">
              <i>
                Before posting, please click FAQ to see if your question is
                already answered.
              </i>
              <br />
              <br />
              <i>
                Depending on the content of your post and our current moderation
                policies, your post may be held while under review. After
                review, if it meets our Community Guidelines, it will be
                published publicly to Community.
              </i>
            </div>
          </div>

          <div className="p-0 d-flex justify-content-end">
            <div className="row align-items-center">
              <div className="col">
                <button
                  className="btn border btn-primary"
                  onClick={maybeCreatePost}
                  disabled={!postButtonEnabled || waitForImage}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
          <div className="mb-5"></div>
        </div>
      </div>
      <div className={isMobile ? 'col-12 mt-3 px-2' : 'col-4'}>
        <CommunityTabs />
      </div>
    </div>
  );
};

export default CreatePost;
