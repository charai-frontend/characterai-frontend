// TODO: dedupe code between this file and Home.js
import axios from 'axios';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';
import * as Tone from 'tone';

import './App.css';
import CharacterCard from './CharacterCard';
import './Chat.css';
import './Common.css';
import { NATIVE, SEARCH_RESULTS_PER_PAGE } from './Constants';
import API from './api/Api';
import { buildUrlParams } from './utils.js';

// Enables Tone.js/AudioContext as soon as user clicks anywhere.
let toneStarted = false;
document.body.addEventListener(
  'click',
  () => {
    if (!toneStarted) {
      Tone.start();
      toneStarted = true;
    }
  },
  true,
);

const CharacterSearch = (props) => {
  const searchInputRef = useRef(null);

  const filters = {
    all: (value) => true,
    recommended: (value) => false,
    category: (value) => isSelectedCategory(value.categories),
    recent: (value) => false,
    mine: (value) => value.user__id === user.user__id,
  };

  const clearCategoryFilter = () => {
    setCategorySelected(0);
  };

  const isSelectedCategory = (category_list) => {
    for (let i = 0; i < category_list.length; i++) {
      if (category_list[i].name === categorySelected) {
        return true;
      }
    }
    return false;
  };

  const [currentFilter, setCurrentFilter] = useState('all');
  const [categorySelected, setCategorySelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState([]);
  const [pageIdx, setPageIdx] = useState(0);
  const [displayedResultIds, setDisplayedResultIds] = useState([]);
  const [resultIds, setResultIds] = useState([]);
  const [charactersMap, setCharactersMap] = useState({});
  const [characters, setCharacters] = useState([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);

  const { user } = props;

  useEffect(() => {
    if (!loadingCharacters) {
      const newCharactersMap = {};

      characters.forEach((char) => {
        newCharactersMap[char.external_id] = char;
      });

      setCharactersMap(newCharactersMap);
      displayInitialResults();
    }
  }, [loadingCharacters]);

  useEffect(() => {
    if (props.user && !loaded.includes('user')) {
      setLoaded((oldArray) => [...oldArray, 'user']);
    }
  }, [props.user, loaded]);

  /* Once all these are loaded, loading is complete. */
  useEffect(() => {
    if (!loadingCharacters && loaded.includes('user')) {
      setLoading(false);
    }
  }, [loaded, loadingCharacters]);

  useEffect(() => {
    const searchInput = document.getElementById('search-input');
    if (loading === false && searchInput) {
      searchInput.focus();
    }
  }, [loading]);

  const displayInitialResults = () => {
    const newResultIds = characters
      ? characters
          .filter(filters[currentFilter])
          .filter(
            (character) =>
              character.visibility === 'PUBLIC' ||
              character.user__id === user.user.id,
          )
          // .sort(compareCharacters)
          .map((c) => c.external_id)
      : [];

    setResultIds(newResultIds);
    setDisplayedResultIds(newResultIds.slice(0, SEARCH_RESULTS_PER_PAGE));
    setPageIdx(1);
  };

  // const compareCharacters = (char1, char2) => {
  //   return char2.participant__num_interactions - char1.participant__num_interactions;
  // };

  const showMoreResults = () => {
    const startIdx = SEARCH_RESULTS_PER_PAGE * pageIdx;
    const newDisplayedResultsIds = [
      ...displayedResultIds,
      ...resultIds.slice(startIdx, startIdx + SEARCH_RESULTS_PER_PAGE),
    ];
    setPageIdx(pageIdx + 1);
    setDisplayedResultIds(newDisplayedResultsIds);
  };

  const handleSearchSubmit = async () => {
    const query = searchInputRef.current.value;
    if (!query || query.length === 0) {
      return;
    }
    searchInputRef.current.blur();
    searchInputRef.current.disabled = true;
    setLoadingCharacters(true);
    axios
      .get(`/chat/characters/search/?query=${query}`)
      .then((response) => {
        setCharacters(response.data.characters);
        setLoadingCharacters(false);
      })
      .finally(() => {
        setLoadingCharacters(false);
      });
  };

  return (
    <div>
      <div className="container-fluid overflow-auto p-0">
        {loading ? (
          <div className="d-flex justify-content-center m-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="sr-only"></span>
            </div>
          </div>
        ) : (
          <div className="container d-flex justify-content-center align-items-center">
            {/* Container for everything */}
            <div className="container p-0">
              {/* Header w/ search bar and back button */}
              <div
                className={`d-flex ${NATIVE ? '' : 'fixed-top'} p-2`}
                style={{ background: 'white' }}
              >
                <div className="d-flex col-auto align-items-center">
                  <div className="mt-1">
                    <Link
                      className={'btn p-0'}
                      role="button"
                      to={{ pathname: `/${buildUrlParams()}` }}
                      style={{ color: '#138eed' }}
                    >
                      <MdArrowBackIosNew size={24} />
                    </Link>
                  </div>
                </div>

                {/* Search bar */}
                <div className="d-flex col align-items center">
                  <div className="input-group mt-2">
                    <input
                      id="search-input"
                      type="search"
                      className="form-control"
                      placeholder="Search Characters (press enter to search)"
                      aria-label="Search"
                      aria-describedby="search-addon"
                      ref={searchInputRef}
                      onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchSubmit();
                        }
                      }}
                      disabled={loadingCharacters}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => {
                        handleSearchSubmit();
                      }}
                      disabled={loadingCharacters}
                    >
                      Search
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* List of characters */}
              <div
                className="container-fluid p-0"
                style={{ marginTop: '60px' }}
              >
                <InfiniteScroll
                  dataLength={displayedResultIds.length}
                  next={() => showMoreResults()}
                  hasMore={displayedResultIds.length < resultIds.length}
                  loader="Loading..."
                  style={{ paddingTop: '1px', overflowX: 'hidden' }}
                >
                  {displayedResultIds.map((characterId) => (
                    <div key={characterId} className="character-row">
                      <CharacterCard
                        character={charactersMap[characterId]}
                        username={user?.user?.username}
                        hide={['edit']}
                      />
                    </div>
                  ))}
                </InfiniteScroll>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterSearch;
