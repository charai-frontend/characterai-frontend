import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import classNames from 'classnames';
import React from 'react';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { MdArrowBackIosNew, MdHouseboat } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import './App.css';
import './Chat.css';
import './Common.css';
import * as Constants from './Constants';
import Nav from './Nav';
import { getNavStyle, navClassNames } from './Nav';
import API from './api/Api';
import CharacterSelect from './components/CharacterSelect';
import { queryClient } from './index.js';
import { buildUrlParams, getHeaders } from './utils.js';

const CreateRoom = (props) => {
  const MIN_CHARACTERS_LEN = 1;
  const MAX_CHARACTERS_LEN = 10;
  const validNameRegex = RegExp(/^[A-Za-z0-9_-][ A-Za-z0-9_-]*$/i);
  const [formData, setFormData] = useState({
    name: '',
    visibility: 'PRIVATE',
    characters: [],
    topic: '',
  });
  const [showErrors, setShowErrors] = useState(false);
  const [createButtonEnabled, setCreateButtonEnabled] = useState(true);

  const { data: recentCharacters, isLoading: loadingRecentCharacters } =
    useQuery(['recent-characters'], API.fetchRecentCharacters);

  const { data: userCharacters, isLoading: loadingUserCharacters } = useQuery(
    ['user-characters'],
    () => API.fetchCharacters('user'),
  );

  const [errors, setErrors] = useState({
    name: '',
    characters: '',
    topic: '',
  });
  const [charOptions, setCharOptions] = useState([]);
  const navigate = useNavigate();

  const { data: characters, isLoading: loadingCharacters } = useQuery(
    ['all-characters'],
    API.fetchPublicCharacters,
  );

  const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
  };

  useEffect(() => {
    queryClient.invalidateQueries(['recent-characters']);
  }, []);

  useEffect(() => {
    if (
      characters?.length &&
      !loadingCharacters &&
      !loadingUserCharacters &&
      !loadingRecentCharacters
    ) {
      const top_characters = characters.slice(0, 5000);
      const newCharOptions = [
        ...userCharacters,
        ...recentCharacters,
        ...top_characters,
      ];

      // Dedupe
      let uniqueCharOptions = newCharOptions.filter(
        (v, i, a) =>
          a.findIndex((v2) => v2.external_id === v.external_id) === i,
      );

      uniqueCharOptions = uniqueCharOptions
        .filter((c) => c.participant__name.length)
        .map((char) => ({
          value: char.external_id,
          label: char.participant__name + ' (@' + char.user__username + ')',
        }));
      setCharOptions(uniqueCharOptions);
    }
  }, [loadingCharacters, loadingRecentCharacters, loadingUserCharacters]);

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    validateField(name, value);
    setFormData((oldDict) => ({ ...oldDict, [name]: value }));
  };

  const handleCharsChange = (selectedChars) => {
    const fieldName = 'characters';
    validateField(fieldName, selectedChars);
    setFormData((oldDict) => ({ ...oldDict, [fieldName]: selectedChars }));
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
      case 'name':
        error =
          value.length < Constants.MIN_NAME_LEN ||
          value.length > Constants.MAX_NAME_LEN ||
          !validNameRegex.test(value)
            ? `Name must be ${Constants.MIN_NAME_LEN} to ${Constants.MAX_NAME_LEN} characters long and contain only letters, numbers, underscore, dash and space`
            : '';
        break;
      case 'characters':
        error =
          value.length < MIN_CHARACTERS_LEN || value.length > MAX_CHARACTERS_LEN
            ? `Add at least ${MIN_CHARACTERS_LEN} and at most ${MAX_CHARACTERS_LEN} Character(s) to your room`
            : '';
        break;
      case 'topic':
        error =
          value.length > Constants.MAX_DESCRIPTION_LEN
            ? `Room Topic must be at most ${Constants.MAX_DESCRIPTION_LEN} characters long`
            : '';
        break;
      default:
        break;
    }
    setErrors((oldDict) => ({ ...oldDict, [fieldName]: error }));
    return error.length === 0;
  };

  const saveNewRoom = async (keepPrivate = true) => {
    axios
      .post(
        '/chat/room/create/',
        {
          characters: formData.characters,
          name: formData.name,
          topic: formData.topic,
          visibility: formData.visibility,
        },
        getHeaders(props),
      )
      .then((response) => {
        if (response.data.room && response.data.room.external_id) {
          window.location.replace(
            `/chat${buildUrlParams({ hist: response.data.room.external_id })}`,
          );
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const maybeSave = () => {
    setCreateButtonEnabled(false);
    if (validateFields(['characters', 'name', 'topic'])) {
      saveNewRoom();
    } else {
      setCreateButtonEnabled(true);
      console.error(errors);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const roomCreationClassNames = classNames({
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

  return (
    <div className={roomCreationClassNames}>
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
              <MdHouseboat size={24} />
            </div>
            Create a Room
          </div>
        </div>

        <form className="pt-4">
          <div className="row mb-4">
            <div className="col">
              <label htmlFor="name">
                <b>1. Room Name</b>
              </label>
              <div className="text-muted" style={{ fontSize: 'small' }}>
                examples: Lincoln-Einstein, Music Lovers, Sci-Fi discuss.
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
              <label htmlFor="characters">
                <b>2. Add Characters</b>
              </label>
              <div className="text-muted" style={{ fontSize: 'small' }}>
                Please enter the names or ids of the characters you want to add
                to this room. Note: Only the top 5000 public characters are
                available for now.
              </div>

              <CharacterSelect
                options={charOptions}
                onChange={handleCharsChange}
                isLoading={loadingCharacters || loadingUserCharacters}
              />

              {showErrors && errors.characters && (
                <p className="alert alert-danger ">{errors.characters}</p>
              )}
              {errors.characters && (
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
            <div className="col">
              <label htmlFor="topic">
                <b>3. Room Topic (optional) </b>
              </label>
              <div className="text-muted" style={{ fontSize: 'small' }}>
                What should happen in this room. Characters will try to follow
                it. Examples: Play by play superhero battle, Discuss the latest
                episode of Game of Thrones.
              </div>
              <textarea
                className="form-control"
                rows="2"
                id="topic"
                name="topic"
                value={formData.topic}
                maxLength={Constants.MAX_DESCRIPTION_LEN}
                onChange={handleChange}
              />
              {showErrors && errors.topic && (
                <p className="alert alert-danger ">{errors.topic}</p>
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

          {/* <div className="row mb-4">
              <div className="col">
                <div className="form-group">
                  <label htmlFor="visibility"><b>4. Visibility</b><MdLock color="#138eed" className="mb-1" size={20} /></label>
                  <div className="text-muted" style={{ "fontSize": "small" }}>Who is allowed to join {formData.name || "this room"}?</div>
                  <select
                    size="3"
                    className="form-select"
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    defaultValue="PUBLIC"
                  >
                    <option value="PUBLIC">Public: Anyone can join</option>
                    <option value="UNLISTED">Unlisted: Anyone with the link with can join</option>
                    <option value="PRIVATE">Private: Only you can join</option>
                  </select>
                </div>
              </div>
            </div> */}
        </form>
        <div className="p-0 d-flex justify-content-end ">
          <div className="row mt-4 align-items-center">
            <div className="col">
              <button
                className="btn border btn-primary"
                onClick={maybeSave}
                disabled={!createButtonEnabled}
              >
                Create It!
              </button>
            </div>
          </div>
        </div>
        <div className="mb-5"></div>
      </div>
    </div>
  );
};

export default CreateRoom;
