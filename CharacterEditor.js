import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
  MdAdd,
  MdArrowBackIosNew,
  MdCancel,
  MdCode,
  MdInfoOutline,
  MdLock,
  MdMenuBook,
  MdSaveAlt,
} from 'react-icons/md';
import Modal from 'react-modal';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { v4 as uuidv4 } from 'uuid';

import './App.css';
import CharacterCard from './CharacterCard';
import { CharacterChatTyped } from './CharacterChatTyped';
import './Chat.css';
import './Common.css';
import * as Constants from './Constants';
import './Creation.css';
import API from './api/Api';
import AvatarUpload from './components/AvatarUpload';
import VoiceSelect from './components/VoiceSelect';

const CharacterEditor = (props) => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [numDialogs, setNumDialogs] = useState(0);
  const [numMessages, setNumMessages] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ name: '', greeting: '', title: '' });
  const [autoSave, setAutoSave] = useState(false);
  const [changed, setChanged] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [addingChat, setAddingChat] = useState(false);
  const [randomUser, setRandomUser] = useState(1);
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    external_id: null,
    identifier: '',
    title: '',
    name: '',
    visibility: 'PUBLIC',
    definition_visibility: 'PUBLIC',
    copyable: true,
    categories: [],
    definition: '',
    description: '',
    greeting: '',
    avatar_file_name: '',
    avatar_rel_path: '',
    img_gen_enabled: false,
    base_img_prompt: '',
    strip_img_prompt_from_msg: false,
    voice_id: '',
  });
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    ['categories'],
    API.fetchCategories,
  );

  const location = useLocation();

  useEffect(() => {
    setUser(props.user);
    const urlParams = new URLSearchParams(window.location.search);
    const charId = urlParams.get('char');
    if (charId) {
      loadCharacter(charId);
    } else {
      // load state from quick create
      if (location.state) {
        const fields = [
          'name',
          'greeting',
          'visibility',
          'img_gen_enabled',
          'avatar_rel_path',
        ];
        for (const field of fields) {
          setFormData((oldDict) => ({
            ...oldDict,
            [field]: location.state[field],
          }));
        }
        setChanged(true);
      }
      setLoading(false);
      setEditing(true);
    }
  }, []);

  useEffect(() => {
    if (loading && formData.external_id != null && user.user) {
      setEditing(user.user?.username === formData.user__username);
      setLoading(false);
    }
  }, [formData, user]);

  const saveNewCharacter = async () => {
    const response = await API.createCharacter({
      title: formData.title,
      name: formData.name,
      identifier: 'id:' + uuidv4(),
      categories: optionsToList(formData.categories),
      visibility: formData.visibility,
      copyable: formData.copyable,
      description: formData.description,
      greeting: formData.greeting,
      definition: formData.definition,
      avatar_rel_path: formData.avatar_rel_path,
      img_gen_enabled: formData.img_gen_enabled,
      base_img_prompt: formData.base_img_prompt,
      strip_img_prompt_from_msg: formData.strip_img_prompt_from_msg,
      voice_id: formData.voice_id,
    });
    if (response.data.status === 'OK') {
      setFormData(updateResponse(response.data.character));
      parseDefinition(response.data.character.definition);
    } else {
      let error = response.data.status;
      console.error(error);
    }
  };

  const updateExistingCharacter = async () => {
    const response = await API.updateCharacter({
      external_id: formData.external_id,
      title: formData.title,
      name: formData.name,
      categories: optionsToList(formData.categories),
      visibility: formData.visibility,
      copyable: formData.copyable,
      description: formData.description,
      greeting: formData.greeting,
      definition: formData.definition,
      avatar_rel_path: formData.avatar_rel_path,
      img_gen_enabled: formData.img_gen_enabled,
      base_img_prompt: formData.base_img_prompt,
      strip_img_prompt_from_msg: formData.strip_img_prompt_from_msg,
      voice_id: formData.voice_id,
    });
    if (response.data.status === 'OK') {
      setFormData(updateResponse(response.data.character));

      // temporary, this should be defined by associated histories
      // maybe a second call to server for details
      parseDefinition(response.data.character.definition);
    } else {
      let error = response.data.status;
      console.error(error);
    }
  };

  const saveCharacter = () => {
    if (validateFields(['name', 'greeting', 'title'])) {
      if (formData.external_id) {
        updateExistingCharacter();
      } else {
        saveNewCharacter();
      }
      setChanged(false);
      setShowErrors(false);
    } else {
      console.error('Invalid Form : ', errors);
      setShowErrors(true);
    }
  };

  const executeAutoSave = () => {
    if (autoSave) {
      saveCharacter();
    }
    setAutoSave(false);
  };
  useEffect(executeAutoSave, [autoSave]);

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-40%',
      transform: 'translate(-50%, -50%)',
    },
  };

  // exit out of editing, cancel changes, reload or fresh slate
  const cancelEditing = () => {
    if (editing && formData.external_id != null) {
      loadCharacter(formData.external_id);
      setChanged(false);
      setShowErrors(false);
    }
  };

  // convert a list from server format name: description: to value: label:
  const optionsToList = (category_options) => {
    let category_list = [];
    if (category_options) {
      for (let i = 0; i < category_options.length; i++) {
        category_list.push(category_options[i].value);
      }
    }
    return category_list;
  };

  // convert the selectedoptions list used during editting to format needed at server
  const responseToOptions = (category_list) => {
    let category_options = [];
    if (category_list) {
      for (let i = 0; i < category_list.length; i++) {
        let value = category_list[i].name;
        // should consider descriptions as full names? or optional info about
        category_options.push({ value: value, label: value });
      }
    }
    return category_options;
  };

  const addChat = () => {
    // save other changes first if any
    if (changed) {
      saveCharacter();
    }
    setRandomUser(getNextRandomUser(formData.definition));
    setAddingChat(true);
  };

  // find the next unused random_user number
  const getNextRandomUser = (definition) => {
    const regexp = /{{random_user_(\d+)}}/g;
    const matches = definition.matchAll(regexp);
    var maxUser = 0;
    for (const match of matches) {
      if (parseInt(match[1]) > maxUser) {
        maxUser = parseInt(match[1]);
      }
    }
    return maxUser + 1;
  };

  const parseDefinition = (definition) => {
    if (definition) {
      setNumDialogs((definition.match(/\nEND_OF_DIALOG/g) || []).length);
      setNumMessages((definition.match(/[^:]+:.*\n/g) || []).length);
    } else {
      setNumDialogs(0);
      setNumMessages(0);
    }
  };

  // convert the response from the API to the format
  // needed by this form
  const updateResponse = (character) => {
    character.categories = responseToOptions(character.categories);

    // should not be returned if not copyable and not users
    if (character.copyable) {
      character.definition_visibility = 'PUBLIC';
    } else {
      character.definition_visibility = 'PRIVATE';
    }

    return character;
  };

  const loadCharacter = async (external_id) => {
    const response = await API.fetchCharacterDetailed(external_id);
    if (response?.data?.character) {
      setFormData(updateResponse(response.data.character));

      parseDefinition(response.data.character.definition);
    } else {
      let error = response.data.status;
      console.error(error);
    }
  };

  const updateAvatar = (avatarRelPath) => {
    setFormData((oldDict) => ({
      ...oldDict,
      ['avatar_rel_path']: avatarRelPath,
    }));
    setChanged(true);
    setAutoSave(true);
  };

  const validNameRegex = RegExp(/^[A-Za-z0-9_-][ A-Za-z0-9_-]*$/i);

  const hasGreeting = () => {
    return (
      formData.greeting.length >= Constants.MIN_GREETING_LEN &&
      formData.greeting.length <= Constants.MAX_GREETING_LEN
    );
  };

  const hasShortDescription = () => {
    return (
      formData.title.length >= Constants.MIN_TITLE_LEN &&
      formData.title.length <= Constants.MAX_TITLE_LEN
    );
  };

  const greetingError =
    'Enter a Greeting of at least ' +
    Constants.MIN_GREETING_LEN +
    ' characters (or enter a Short Description)';

  const shortDescriptionError =
    'Enter a Short Description of at least ' +
    Constants.MIN_TITLE_LEN +
    ' characters (or enter a Greeting)';

  const nameError =
    'Name must be ' +
    Constants.MIN_NAME_LEN +
    ' to ' +
    Constants.MAX_NAME_LEN +
    ' characters and contain only letters, numbers, underscore, dash and space';

  const validateFields = (fields) => {
    let valid = true;
    for (const field of fields) {
      valid = validateField(field, formData[field]) && valid;
    }
    setShowErrors(!valid);
    return valid;
  };

  const validateField = (field_name, value) => {
    switch (field_name) {
      case 'name':
        if (
          value.length < Constants.MIN_NAME_LEN ||
          value.length > Constants.MAX_NAME_LEN ||
          !validNameRegex.test(value)
        ) {
          setErrors((oldDict) => ({ ...oldDict, ['name']: nameError }));
          return false;
        } else {
          setErrors((oldDict) => ({ ...oldDict, ['name']: '' }));
          return true;
        }
        break;

      // ensure either a Greeting or Short Description is in place
      case 'greeting':
        if (
          (value.length < Constants.MIN_GREETING_LEN ||
            value.length > Constants.MAX_GREETING_LEN) &&
          !hasShortDescription()
        ) {
          setErrors((oldDict) => ({
            ...oldDict,
            ['greeting']: greetingError,
            ['title']: shortDescriptionError,
          }));
          return false;
        } else {
          setErrors((oldDict) => ({
            ...oldDict,
            ['greeting']: '',
            ['title']: '',
          }));
          return true;
        }
        break;

      // ensure either a Greeting or Short Description is in place
      case 'title':
        if (
          (value.length < Constants.MIN_TITLE_LEN ||
            value.length > Constants.MAX_TITLE_LEN) &&
          !hasGreeting()
        ) {
          setErrors((oldDict) => ({
            ...oldDict,
            ['greeting']: greetingError,
            ['title']: shortDescriptionError,
          }));
          return false;
        } else {
          setErrors((oldDict) => ({
            ...oldDict,
            ['greeting']: '',
            ['title']: '',
          }));
          return true;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleCategoryChange = (selectedOptions) => {
    setFormData({ ...formData, categories: selectedOptions });
    setChanged(true);
  };

  const handleVoiceIdChange = (newVoiceId) => {
    setFormData({ ...formData, voice_id: newVoiceId });
    setChanged(true);
  };

  const imageTemplate =
    '{{char}}: *insert image description here* and normal text here.\n';

  const insertImageTemplate = () => {
    appendDefinition(imageTemplate);
  };

  const messageTemplate =
    "{{char}}: Hi {{user}}, I'm {{char}}.\n{{user}}: Hello!\n";

  const insertMessageTemplate = () => {
    appendDefinition(messageTemplate);
  };

  const appendDefinition = (new_content) => {
    let new_definition = formData.definition + '\n' + new_content;

    setFormData((oldDict) => ({ ...oldDict, definition: new_definition }));
    setChanged(true);
    parseDefinition(new_definition);
  };

  // accumulate errors as data entered
  // could display interactively or at submission
  const handleChange = async (event) => {
    var { name, value } = event.target;

    // Checkbox.
    const isCheckbox =
      name === 'img_gen_enabled' || name === 'strip_img_prompt_from_msg';
    if (isCheckbox) {
      value = event.target.checked;
      // Checkbox needs default event handling in order to show the check immediately.
      // https://stackoverflow.com/a/70030088
    } else {
      event.preventDefault();
    }

    setChanged(true);

    validateField(name, value);
    setFormData((oldDict) => ({ ...oldDict, [name]: value }));

    // if they changed character visibilty to Private, make defintion visibility Private as well
    if (name === 'visibility' && value === 'PRIVATE') {
      setFormData((oldDict) => ({
        ...oldDict,
        definition_visibility: 'PRIVATE',
        copyable: false,
      }));
    } else if (name === 'definition') {
      // update chat/message counts
      parseDefinition(value);
    } else if (name === 'definition_visibility') {
      // also convert visibility to two booleans
      switch (value) {
        case 'PUBLIC':
          setFormData((oldDict) => ({ ...oldDict, copyable: true }));
          break;
        case 'PRIVATE':
          setFormData((oldDict) => ({ ...oldDict, copyable: false }));
          break;
        default:
          break;
      }
    }
  };

  const handleBack = () => {
    updateExistingCharacter();
    navigate(-1);
  };

  const openModal = (e) => {
    e.preventDefault();
    setShowInfo(true);
  };

  const closeModal = (e) => {
    setShowInfo(false);
  };

  const saveChat = (new_dialog) => {
    if (new_dialog) {
      appendDefinition(new_dialog);
    }
    setAddingChat(false);
  };

  // extract just primary messages
  // temporary until structured editing

  return (
    <div className="">
      {loading ? (
        <div className="d-flex justify-content-center m-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      ) : (
        <div>
          {addingChat ? (
            <div>
              <CharacterChatTyped
                token={props.token}
                user={props.user}
                mode="creation"
                number={numDialogs + 1}
                formData={formData}
                character_id={formData.external_id}
                minimum={0}
                onFinished={saveChat}
                handleServerError={props.handleServerError}
                randomUser={randomUser}
                maxLength={
                  Constants.MAX_DEFINTION_LEN - formData.definition.length
                }
              />
            </div>
          ) : (
            <div className="container">
              <div>
                <Modal
                  isOpen={showInfo}
                  onRequestClose={closeModal}
                  style={customStyles}
                  contentLabel="Information"
                  ariaHideApp={false}
                >
                  <button
                    style={{
                      background: 'none',
                      color: 'inherit',
                      border: 'none',
                      padding: '0',
                      outline: 'inherit',
                      font: 'inherit',
                      textAlign: 'left',
                    }}
                    onClick={closeModal}
                  >
                    <div>
                      <p>
                        <b>Tips on Defining a Character</b>
                      </p>
                      <div className="row">
                        <div className="col">
                          <div className="info-narrative">
                            Getting started defining a character is easy, but
                            there are some hints as you try to refine the
                            experience.
                          </div>
                          <div className="info-text pt-3">
                            You can use the placeholders {'{{user}}'} and{' '}
                            {'{{char}}'} as placeholders
                          </div>
                          <div className="info-example">
                            {'{{user}}'}: What's your favorite game? <br />
                            {'{{char}}'}: Hi {'{{user}}'}! I've been playing a
                            lot of Zelda: Breath of the Wild.
                          </div>
                          <div className="info-text pt-3">
                            You can also introduce additional people in your
                            examples
                          </div>
                          <div className="info-example">
                            narrator: You two will be playing a game together
                            <br />
                            {'{{char}}'}: Ok, what are the rules?
                            <br />
                            narrator: First, one of you will think of a word
                          </div>
                          {
                            <div className="info-text pt-3">
                              You can include image generation in your
                              characters.
                            </div>
                          }
                          {
                            <div className="info-example">
                              {'{{char}}'}: *dark underground cave* You look
                              around the cave.
                              <br />
                              {'{{user}}'}: I run away!
                              <br />
                              {'{{char}}'}: *large bear with big teeth* A bear
                              runs after you!
                            </div>
                          }
                          <div className="info-text pt-3">
                            Keep in mind words said by {'{{user}}'} in examples
                            will be as if the user has said those things, even
                            though they won't appear in the chat. You can also
                            use something like {'{{random_user_1}}'} or actual
                            names in definitions to provide examples.
                          </div>
                          <div className="info-example">
                            Bob: I'm from Maine, tell me about my state
                            <br />
                            {'{{char}}'}: Maine is great place in the fall!
                          </div>
                          <div className="info-narrative pt-3">
                            Importantly, keep experimenting by cycling between
                            definition and talking to your character!
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col">
                          {/*<button className="btn border" onClick={closeModal}>Close</button>*/}
                        </div>
                      </div>
                    </div>
                  </button>
                </Modal>
              </div>
              <div className="container mt-3">
                <div className="col-xs-12 col-md-12 mb-3 ">
                  <div className="row align-items-center">
                    <div className="col-1 p-0 m-0">
                      <button
                        className={'btn'}
                        role="button"
                        onClick={handleBack}
                      >
                        <MdArrowBackIosNew size={24} />
                      </button>
                    </div>
                    <div className="col-6 mt-2">
                      <h1>
                        {formData.external_id
                          ? 'Character Editor'
                          : 'Create Character'}
                      </h1>
                    </div>

                    <div className="col-5 mt-3">
                      <a
                        className="btn"
                        href={Constants.CHARACTER_BOOK_LINK}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MdMenuBook size={32} style={{ marginBottom: '9px' }} />
                        <span style={{ fontSize: '20px' }}>
                          &nbsp;&nbsp;Character&nbsp;Book
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Character in Discovery */}
                {formData.external_id && (
                  <div>
                    <hr></hr>
                    <div className="row px-3">
                      <div className="col-xl-6 col-lg-6 col-md-8 col-sm-12 p-1">
                        <CharacterCard
                          character={formData}
                          username={user?.user?.username}
                          border={true}
                          hide={['stats', 'edit']}
                        />
                      </div>
                    </div>

                    <hr></hr>
                  </div>
                )}

                <form>
                  {/* Name */}
                  <div className="row mb-3">
                    <div className="col">
                      <label htmlFor="name">
                        <strong>Name</strong>
                      </label>
                      <div className="text-muted" style={{ fontSize: 'small' }}>
                        This will be the name your Character uses in chat.
                      </div>

                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        maxLength={Constants.MAX_NAME_LEN}
                        value={formData.name}
                        disabled={!editing}
                        onChange={handleChange}
                      />
                      {showErrors && errors.name && (
                        <p className="alert alert-danger">{errors.name}</p>
                      )}
                    </div>
                  </div>

                  <AvatarUpload
                    disabled={!editing}
                    updateAvatarRelPathFn={updateAvatar}
                    defaultDisplayedImage={
                      formData.avatar_file_name || formData.avatar_rel_path
                    }
                  />

                  {/* Greeting */}
                  <div className="row mb-3">
                    <div className="col">
                      <label htmlFor="first_prompt">
                        <strong>Greeting</strong>
                      </label>
                      <div className="text-muted" style={{ fontSize: 'small' }}>
                        What would {formData.name} say to start a conversation?
                      </div>
                      <textarea
                        className="form-control"
                        rows="2"
                        id="first_prompt"
                        name="greeting"
                        disabled={!editing}
                        value={formData.greeting}
                        maxLength={Constants.MAX_GREETING_LEN}
                        onChange={handleChange}
                      />

                      {showErrors && errors.greeting && (
                        <p className="alert alert-danger">{errors.greeting}</p>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="row mb-3">
                    <div className="col">
                      <label htmlFor="title_name">
                        <strong>Short Description</strong>
                      </label>
                      <div className="text-muted" style={{ fontSize: 'small' }}>
                        In just a few words, how would {formData.name} describe
                        themselves?
                      </div>

                      <input
                        type="text"
                        className="form-control"
                        id="title_name"
                        name="title"
                        disabled={!editing}
                        value={formData.title}
                        maxLength={Constants.MAX_TITLE_LEN}
                        onChange={handleChange}
                      />
                      {showErrors && errors.title && (
                        <p className="alert alert-danger ">{errors.title}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label htmlFor="short_description">
                      <strong>Long Description</strong>
                    </label>
                    <div className="text-muted" style={{ fontSize: 'small' }}>
                      In a few sentences, how would {formData.name + ' '}{' '}
                      describe themselves?
                    </div>
                    <textarea
                      className="form-control"
                      rows="5"
                      id="short_description"
                      name="description"
                      value={formData.description}
                      maxLength={Constants.MAX_DESCRIPTION_LEN}
                      disabled={!editing}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Categories */}
                  <div className="row mb-3 mt-3">
                    <div className="col">
                      <label htmlFor="categories">
                        <strong>Categories</strong>
                      </label>
                      <div className="text-muted" style={{ fontSize: 'small' }}>
                        Select a few relevant tags or keywords.
                      </div>
                      <Select
                        id="categories"
                        name="categories"
                        options={categories.sort((a, b) =>
                          a.value.localeCompare(b.value),
                        )} // Options to display in the dropdown
                        isMulti={true}
                        isDisabled={!editing}
                        value={formData.categories}
                        onChange={handleCategoryChange}
                      />
                    </div>
                  </div>

                  {/* Character Voice */}
                  <div className="row mb-3">
                    <label>
                      <strong>Character Voice</strong>
                    </label>
                    <div className="text-muted" style={{ fontSize: 'small' }}>
                      Select a default voice for your character. Click play to
                      preview the voice saying their greeting
                    </div>
                    <VoiceSelect
                      selectedVoiceId={formData.voice_id}
                      onChange={handleVoiceIdChange}
                      sampleText={formData.greeting}
                    />
                  </div>

                  {/* Image Enabled */}
                  {
                    <div className="row mb-3">
                      <label>
                        <strong>Image Generation</strong>
                      </label>
                      <div className="text-muted" style={{ fontSize: 'small' }}>
                        Characters can generate images.
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.img_gen_enabled}
                          name="img_gen_enabled"
                          id="img_gen_enabled"
                          disabled={!editing}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="img_gen_enabled"
                        >
                          Enable image generation for this Character.
                        </label>
                      </div>
                    </div>
                  }

                  {/* Image Base Prompt */}
                  {formData.img_gen_enabled && (
                    <div className="row mb-3" style={{ paddingLeft: '40px' }}>
                      <div className="col">
                        <label htmlFor="base_img_prompt">
                          <strong>Image style</strong>
                        </label>
                        <div
                          className="text-muted"
                          style={{ fontSize: 'small' }}
                        >
                          Image style that will be added to every image
                          generation description.
                        </div>

                        <input
                          type="text"
                          className="form-control"
                          id="base_img_prompt"
                          name="base_img_prompt"
                          disabled={!editing}
                          value={formData.base_img_prompt}
                          maxLength={Constants.MAX_BASE_PROMPT_LEN}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Strip Regex */}
                  {formData.img_gen_enabled && (
                    <div className="row mb-3" style={{ paddingLeft: '40px' }}>
                      <label>
                        <strong>
                          Hide direct image descriptions in Character replies
                        </strong>
                      </label>
                      <div className="text-muted" style={{ fontSize: 'small' }}>
                        Some Characters require hidden image descriptions (e.g.,
                        a Character that plays 'guess this picture').{' '}
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.strip_img_prompt_from_msg}
                          name="strip_img_prompt_from_msg"
                          id="strip_img_prompt_from_msg"
                          disabled={!editing}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="strip_img_prompt_from_msg"
                        >
                          Hide image descriptions for this Character's replies
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Character Visibility */}
                  <div className="row mb-3">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="visibility">
                          <strong>Visibility </strong>
                          <MdLock color="#138eed" className="mb-1" size={20} />
                        </label>
                        <div
                          className="text-muted"
                          style={{ fontSize: 'small' }}
                        >
                          Who is allowed to talk to {formData.name}?
                        </div>

                        <select
                          className="form-select"
                          size="3"
                          id="visibility"
                          name="visibility"
                          disabled={!editing}
                          value={formData.visibility}
                          onChange={handleChange}
                        >
                          <option value="PUBLIC">
                            Public: Anyone can chat
                          </option>
                          <option value="UNLISTED">
                            Unlisted: Anyone with a link can chat
                          </option>
                          <option value="PRIVATE">
                            Private: Only you can chat
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Definition Visibiliity */}
                  <div className="row mb-3">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="definition_visibility">
                          <strong>Definition Visibility </strong>
                          <MdLock color="#138eed" className="mb-1" size={20} />
                        </label>
                        <div
                          className="text-muted"
                          style={{ fontSize: 'small' }}
                        >
                          Who is allowed view the Definition of {formData.name}?
                        </div>

                        <select
                          className="form-select"
                          size="2"
                          id="definition_visibility"
                          name="definition_visibility"
                          disabled={
                            !editing || formData.visibility === 'PRIVATE'
                          }
                          value={formData.definition_visibility}
                          onChange={handleChange}
                        >
                          <option value="PUBLIC">
                            Public: Anyone that can chat can view
                          </option>
                          <option value="PRIVATE">
                            Private: Only you can view Definition
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Definition */}
                  <div className="form-row mb-2 ">
                    <label htmlFor="definiton">
                      <strong>
                        <MdCode size={24} style={{ marginTop: '-3px' }} />{' '}
                        Definition
                      </strong>{' '}
                      (Advanced)
                    </label>
                    <div
                      className="text-muted"
                      style={{ fontSize: 'small', marginTop: '-10px' }}
                    >
                      Example conversations and information to define your
                      Character
                      <button
                        type="submit"
                        onClick={openModal}
                        style={{ marginLeft: '-10px', marginBottom: '5px' }}
                        className="btn"
                      >
                        <MdInfoOutline size={24} />
                      </button>
                    </div>
                    <div>
                      {/* Example Dialogs */}
                      {/* This will be structured edting of dialogs in the future
               for now, calculate rough stats, give option to add another */}
                      <div className="row mb-0">
                        <div className="col">
                          {formData.definition.length + 100 >=
                          Constants.MAX_DEFINTION_LEN ? (
                            <span className="text-muted">
                              The definition is full, you can't add more dialogs
                            </span>
                          ) : (
                            <div className="row mb-2 px-2 justify-content-left">
                              <div className="col-auto p-1">
                                <button
                                  type="button"
                                  className="btn p-1 px-2 border"
                                  disabled={
                                    !editing ||
                                    formData.definition.length + 100 >=
                                      Constants.MAX_DEFINTION_LEN
                                  }
                                  onClick={addChat}
                                >
                                  <MdAdd size={20} />
                                  Insert a chat with {formData.name}
                                </button>
                              </div>
                              <div className="col-auto p-1">
                                <button
                                  type="button"
                                  className="btn p-1 px-2 border"
                                  disabled={
                                    !editing ||
                                    formData.definition.length + 100 >=
                                      Constants.MAX_DEFINTION_LEN
                                  }
                                  onClick={insertMessageTemplate}
                                >
                                  <MdAdd size={20} />
                                  Insert example messages
                                </button>
                              </div>
                              {formData.img_gen_enabled && (
                                <div className="col-auto p-1">
                                  <button
                                    type="button"
                                    className="btn p-1 px-2 border"
                                    disabled={
                                      !editing ||
                                      formData.definition.length + 100 >=
                                        Constants.MAX_DEFINTION_LEN
                                    }
                                    onClick={insertImageTemplate}
                                  >
                                    {' '}
                                    <MdAdd size={20} />
                                    Insert example image description
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-muted">
                        <span
                          className={
                            formData.definition.length >
                            Constants.MAX_DEFINTION_LEN
                              ? 'alert-danger'
                              : ''
                          }
                        >
                          {formData.definition.length}
                        </span>
                        /{Constants.MAX_DEFINTION_LEN} characters,
                      </span>
                      <span className="text-muted">
                        {' '}
                        recognized {numMessages} example message
                        {numMessages === 1 ? '' : 's'}
                      </span>
                      <textarea
                        className="form-control"
                        id="definition"
                        name="definition"
                        disabled={!editing}
                        rows="15"
                        value={formData.definition}
                        maxLength={Constants.MAX_DEFINTION_LEN}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>
                </form>

                {/* save bar */}
                <div className="save-bar d-grid gap-3 d-flex">
                  {editing && changed && (
                    <button
                      type="submit"
                      className="btn p-1 border "
                      onClick={cancelEditing}
                    >
                      &nbsp;Cancel <MdCancel size={24} />
                    </button>
                  )}
                  {editing && changed && (
                    <button
                      type="submit"
                      className="btn p-1 border "
                      onClick={saveCharacter}
                    >
                      &nbsp;Save <MdSaveAlt size={24} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterEditor;
