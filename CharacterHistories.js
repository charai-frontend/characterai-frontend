import axios from 'axios';
import React from 'react';
import { useEffect, useState } from 'react';
import { MobileView } from 'react-device-detect';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import './App.css';
import CharacterHistory from './CharacterHistory';
import './Chat.css';
import './Common.css';
import * as Constants from './Constants';
import Nav from './Nav';
import { getNavStyle, navClassNames } from './Nav';
import { buildUrlParams } from './utils.js';

const CharacterHistories = (props) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState([]);
  const [user, setUser] = useState({ id: null });
  const [charData, setCharData] = useState({ external_id: null, greeting: '' });

  const [histories, setHistories] = useState([]);

  const [characterId, setCharacterId] = useState(
    props.character_id || Constants.DEFAULT_CHARACTER_ID,
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const charId = urlParams.get('char');
    if (charId) {
      setCharacterId(charId);
    }

    setUser(props.user);
    setLoaded((oldArray) => [...oldArray, 'user']);
  }, []);

  useEffect(() => {
    if (user.user?.id) {
      loadCharacterInfo(characterId);
      loadHistories(characterId);
    }
  }, [user]);

  /* Once all these are loaded, loading is complete. */
  useEffect(() => {
    if (
      loaded.includes('character') &&
      loaded.includes('histories') &&
      loaded.includes('user')
    ) {
      setLoading(false);
    }
  }, [loaded]);

  const handleBack = () => {
    navigate(`/chat/${buildUrlParams({ char: charData.external_id })}`);
  };

  const loadCharacterInfo = async (external_id) => {
    axios
      .post(
        '/chat/character/info/',
        {
          external_id: external_id,
        },
        getHeaders(),
      )
      .then((response) => {
        setCharData(response.data.character);
        setLoaded((oldArray) => [...oldArray, 'character']);
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const loadHistories = async (external_id) => {
    axios
      .post(
        '/chat/character/histories/',
        {
          external_id: external_id,
          number: 50,
        },
        getHeaders(),
      )
      .then((response) => {
        setHistories(response.data.histories);
        setLoaded((oldArray) => [...oldArray, 'histories']);
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const getHeaders = () => {
    return {
      headers: { Authorization: 'Token ' + props.token },
    };
  };

  const renderCharacterHistories = (histories) => {
    if (!loading && charData !== undefined) {
      return (
        <div>
          {histories.length === 0 ? (
            <div className="mt-5">
              <span>No chats with this character yet</span>
            </div>
          ) : (
            <div>
              {histories
                .filter((history, index) => history.msgs.length > 1)
                .map((history, index) => (
                  <div key={index} className="character-row p-1  ">
                    <CharacterHistory
                      history={history}
                      character={charData}
                      user={user.user}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <MobileView>
        <div className={navClassNames} style={getNavStyle()}>
          <Nav />
        </div>
      </MobileView>
      <div className="container-fluid overflow-auto p-0 ">
        {loading ? (
          <div className="d-flex justify-content-center m-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="sr-only"></span>
            </div>
          </div>
        ) : (
          <div className="container mt-3 ">
            <div className="col-xs-12 col-md-8 ">
              <div className="row align-items-center">
                <div className="col-1 p-0 m-0">
                  <button
                    className={'btn '}
                    role="button"
                    onClick={() => navigate(-1)}
                  >
                    <MdArrowBackIosNew size={24} />
                  </button>
                </div>
                <div className="col-11">
                  <div className="home-sec-header">
                    Your Past Conversations with {charData.participant__name}
                  </div>
                </div>
              </div>
              <div className="container d-flex  justify-content-left align-items-center">
                <div className="w-100 p-0">
                  <div className="container-fluid p-0 mt-3 ">
                    {renderCharacterHistories(histories)}
                    <div className="p-5">
                      <span></span>
                    </div>
                    <div className="p-5">
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterHistories;
