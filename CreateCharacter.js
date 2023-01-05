import axios from 'axios';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import {
  MdArrowBackIosNew,
  MdLock,
  MdMenuBook,
  MdSportsHandball,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import './App.css';
import './Chat.css';
import './Common.css';
import * as Constants from './Constants';
import Nav from './Nav';
import { getNavStyle, navClassNames } from './Nav';
import API from './api/Api';
import AvatarUpload from './components/AvatarUpload';

const CreateCharacter = (props) => {
  const [waitForAvatar, setWaitForAvatar] = useState(false);
  const [user, setUser] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState({ name: '', greeting: '' });
  const [formData, setFormData] = useState({
    external_id: null,
    identifier: '',
    name: '',
    copyable: false,
    visibility: 'PUBLIC',
    greeting: '',
    avatar_rel_path: '',
    img_gen_enabled: false,
    base_img_prompt: '',
  });
  const [userModifiedGreeting, setUserModifiedGreeting] = useState(false);
  const [createButtonEnabled, setCreateButtonEnabled] = useState(true);

  const navigate = useNavigate();

  const validNameRegex = RegExp(/^[A-Za-z0-9_-][ A-Za-z0-9_-]*$/i);

  const validateFields = (fields) => {
    let valid = true;
    for (let i = 0; i < fields.length; i++) {
      valid = validateField(fields[i], formData[fields[i]]) && valid;
    }
    setShowErrors(!valid);
    return valid;
  };

  useEffect(() => {
    if (!userModifiedGreeting) {
      const updatedFormData = {
        ...formData,
        greeting: `I am ${formData.name}`,
      };
      setFormData(updatedFormData);
    }
  }, [formData.name]);

  useEffect(() => {
    setUser(props.user);
    newCharacter();
  }, []);

  const getMultipartFormDataHeaders = () => {
    return {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Token ' + props.token,
      },
    };
  };

  const validateField = (field_name, value) => {
    let error = '';
    switch (field_name) {
      case 'name':
        error =
          value.length < Constants.MIN_NAME_LEN ||
          value.length > Constants.MAX_NAME_LEN ||
          !validNameRegex.test(value)
            ? 'Name must be ' +
              Constants.MIN_NAME_LEN +
              ' to ' +
              Constants.MAX_NAME_LEN +
              ' characters and contain only letters, numbers, underscore, dash and space'
            : '';
        break;
      case 'greeting':
        error =
          value.length < Constants.MIN_GREETING_LEN ||
          value.length > Constants.MAX_GREETING_LEN
            ? 'Enter a greeting of at least ' +
              Constants.MIN_GREETING_LEN +
              ' characters'
            : '';
        break;
      default:
        break;
    }
    setErrors((oldDict) => ({ ...oldDict, [field_name]: error }));
    return error.length === 0;
  };

  const maybeSaveAndEdit = () => {
    setCreateButtonEnabled(false);
    // if this definition is already valid, save and open editor
    if (validateFields(['name', 'greeting'])) {
      saveNewCharacter('editing');
    } else {
      navigate(`/editing`, { state: formData });
    }
  };

  const maybeSaveAndChat = () => {
    setCreateButtonEnabled(false);
    if (validateFields(['name', 'greeting'])) {
      saveNewCharacter('chat');
    } else {
      setCreateButtonEnabled(true);
      //console.log(props.errors)
    }
  };

  // start from a new character
  const newCharacter = () => {
    setFormData({
      identifier: '',
      name: '',
      visibility: 'PUBLIC',
      copyable: true,
      greeting: '',
      avatar_rel_path: '',
      img_gen_enabled: false,
      base_img_prompt: '',
    });
  };

  // accumulate errors as data entered
  // could display interactively or at submission
  const handleChange = async (event) => {
    var { name, value } = event.target;

    // Checkbox.
    const isCheckbox = name === 'img_gen_enabled';
    if (isCheckbox) {
      value = event.target.checked;
      // Checkbox needs default event handling in order to show the check immediately.
      // https://stackoverflow.com/a/70030088
    } else {
      event.preventDefault();
    }

    // Only set default greeting if user has not modified it
    if (name === 'greeting') {
      setUserModifiedGreeting(true);
    }

    validateField(name, value);
    setFormData((oldDict) => ({ ...oldDict, [name]: value }));
  };

  const uploadAvatar = async (avatarRelPath) => {
    setFormData((oldDict) => ({
      ...oldDict,
      ['avatar_rel_path']: avatarRelPath,
    }));
  };

  const saveNewCharacter = async (nextURL) => {
    const response = await API.createCharacter({
      title: '',
      name: formData.name,
      identifier: 'id:' + uuidv4(),
      categories: [],
      visibility: formData.visibility,
      copyable: formData.visibility === 'PUBLIC',
      description: '',
      greeting: formData.greeting,
      definition: '',
      avatar_rel_path: formData.avatar_rel_path,
      img_gen_enabled: formData.img_gen_enabled,
      base_img_prompt: formData.base_img_prompt,
    });
    if (response.data.status === 'OK') {
      navigate(`/${nextURL}?char=${response.data.character.external_id}`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const creationBasicsClassNames = classNames({
    row: !isMobile,
    'w-100': !isMobile,
  });

  const contentClassNames = classNames({
    'container-fluid': true,
    'mt-3': true,
    'mx-0': true,
    col: !isMobile,
  });

  const headerTextClassNames = classNames({
    'home-sec-header': true,
    'align-items-center': true,
    'col-11': isMobile,
    'pe-5': isMobile,
  });

  const headerTextStyle = {
    fontSize: '17px',
    fontWeight: '650',
    marginTop: '5px',
    paddingLeft: '10px',
  };

  return (
    <div className={creationBasicsClassNames}>
      {!isMobile && (
        <div className={navClassNames} style={getNavStyle()}>
          <Nav />
        </div>
      )}
      <div
        className={contentClassNames}
        style={
          isMobile
            ? { paddingLeft: '12px', paddingRight: '12px' }
            : { paddingLeft: '100px', paddingRight: '12px' }
        }
      >
        <div className="row align-items-center">
          {isMobile && (
            <div className="col-1 p-0 m-0">
              <button className={'btn'} role="button" onClick={handleBack}>
                <MdArrowBackIosNew size={24} />
              </button>
            </div>
          )}
          <div className={headerTextClassNames} style={headerTextStyle}>
            <div className="p-0 pe-1">
              <MdSportsHandball size={24} />
            </div>
            Create a Character
          </div>
        </div>
        <div className="pt-2">
          For more information about Character creation, see{''}
          <a
            className="btn"
            href={Constants.CHARACTER_BOOK_LINK}
            target="_blank"
          >
            <MdMenuBook size={28} style={{ marginBottom: '5 px' }} />
            <span> Character Book</span>
          </a>
        </div>
        <form className="pt-2">
          <div className="row mb-4">
            <div className="col">
              <label htmlFor="name">
                <b>1. Name</b>
              </label>
              <div className="text-muted" style={{ fontSize: 'small' }}>
                The name can include first and last names.
              </div>
              <input
                type="text"
                className="form-control"
                autoComplete="off"
                id="name"
                name="name"
                maxLength={Constants.MAX_NAME_LEN}
                value={formData.name}
                onChange={handleChange}
              />
              {showErrors && errors.name && (
                <p className="alert alert-danger">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="row mb-4">
            <div className="col">
              <label htmlFor="first_prompt">
                <b>2. Greeting</b>
              </label>
              <div className="text-muted" style={{ fontSize: 'small' }}>
                What would {formData.name || 'they'} say to introduce
                themselves? For example, "Albert Einstein" could say: "Hello I
                am Albert Einstein. I was born in March 14, 1879, and I
                conceived of the theory of special relativity and general
                relativity."
              </div>
              <textarea
                className="form-control"
                rows="5"
                id="first_prompt"
                name="greeting"
                value={formData.greeting}
                maxLength={Constants.MAX_GREETING_LEN}
                onChange={handleChange}
              />
              {showErrors && errors.greeting && (
                <p className="alert alert-danger ">{errors.greeting}</p>
              )}
              {errors.greeting && (
                <div className="row ">
                  <div
                    className="col text-muted d-flex justify-content-end"
                    style={{ fontSize: 'small' }}
                  >
                    You can "Edit Details" to create without a greeting
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="row mb-4">
            <label>
              <b>3. Toggle Image Generation</b>
            </label>
            <div className="text-muted" style={{ fontSize: 'small' }}>
              This Character generates images alongside text.
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.img_gen_enabled}
                name="img_gen_enabled"
                id="img_gen_enabled"
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="img_gen_enabled">
                Enable image generation for this Character.
              </label>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col">
              <div className="form-group">
                <label htmlFor="visibility">
                  <b>4. Visibility</b>
                  <MdLock color="#138eed" className="mb-1" size={20} />
                </label>
                <div className="text-muted" style={{ fontSize: 'small' }}>
                  Who is allowed to talk to {formData.name || 'them'}?
                </div>
                <select
                  size="3"
                  className="form-select"
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                >
                  <option value="PUBLIC">Public: Anyone can chat</option>
                  <option value="UNLISTED">
                    Unlisted: Anyone with the link can chat
                  </option>
                  <option value="PRIVATE">Private: Only you can chat</option>
                </select>
              </div>
            </div>
          </div>

          <AvatarUpload updateAvatarRelPathFn={uploadAvatar} />
        </form>
        <div className="p-0 d-flex justify-content-end ">
          <div className="row mt-4 align-items-center">
            <div className="col ">
              <button
                className="btn border "
                onClick={maybeSaveAndEdit}
                disabled={!createButtonEnabled || waitForAvatar}
              >
                Edit&nbsp;Details&nbsp;(Advanced)
              </button>
            </div>
            <div className="col">
              <button
                className="btn border btn-primary"
                onClick={maybeSaveAndChat}
                disabled={!createButtonEnabled || waitForAvatar}
              >
                Create and Chat!
              </button>
            </div>
          </div>
        </div>
        <div className="mb-5"></div>
      </div>
    </div>
  );
};

export default CreateCharacter;
