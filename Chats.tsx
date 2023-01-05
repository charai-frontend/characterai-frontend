import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Tone from 'tone';

import './App.css';
import AppWrapper from './AppWrapper';
import CharacterCard from './CharacterCard';
import './Chat.css';
import './Common.css';
import * as Constants from './Constants';
import InitialAvatar from './InitialAvatar';
import RoomCard from './RoomCard';
import API from './api/Api';
import Loading from './components/Loading';
import { queryClient } from './index.js';
import { Character, Room } from './types';
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
type ChatsProps = {
  token: string;
};

const Chats = (props: ChatsProps) => {
  const [loading, setLoading] = useState(true);

  const { data: recentCharacters, isLoading: loadingRecentCharacters } =
    useQuery(['recent-characters'], API.fetchRecentCharacters);

  const { data: recentRooms, isLoading: loadingRecentRooms } = useQuery(
    ['recent-rooms'],
    API.fetchRecentRooms,
  );

  const { data: user, isLoading: loadingUser } = useQuery(
    ['user'],
    API.fetchUser,
  );

  const [showEditChats, setShowEditChats] = useState(false);
  const [showEditRooms, setShowEditRooms] = useState(false);

  const hideCharacters = async (external_id: string) => {
    await API.hideCharacters(external_id);
    queryClient.invalidateQueries(['recent-characters']);
  };

  const hideRooms = async (external_id: string) => {
    await API.hideRooms(external_id);
    queryClient.invalidateQueries(['recent-rooms']);
  };

  const { token } = props;

  /* Once all these are loaded, loading is complete. */
  useEffect(() => {
    if (!loadingUser && !loadingRecentRooms && !loadingRecentCharacters) {
      setLoading(false);
    }
  }, [loadingUser, loadingRecentCharacters, loadingRecentRooms]);

  const buttonStyle = {
    //borderRadius: '100%',
    width: '45px',
    height: '20px',
    fontSize: '12.5px',
    fontWeight: 'bold',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.33)',
  };

  const renderContinueChatting = () => {
    if (!loading && recentCharacters) {
      return (
        <div>
          <div className="row align-items-center">
            <div className="col home-sec-header">
              Continue Chatting&nbsp;&nbsp;
              <button
                className="btn p-0"
                style={buttonStyle}
                onClick={() => {
                  setShowEditChats(!showEditChats);
                  setShowEditRooms(false);
                }}
              >
                {showEditChats ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>
          {recentCharacters.length === 0 ? (
            <div className="my-5">
              <span>No chats yet, try talking to a character!</span>
            </div>
          ) : (
            <div>
              {recentCharacters.map((character: Character) => (
                <div
                  key={character.external_id}
                  className="character-row p-1  "
                >
                  <CharacterCard
                    character={character}
                    onHide={showEditChats ? hideCharacters : undefined}
                    username={user?.user?.username}
                    hide={['edit', 'creator', 'stats']}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  const renderRecentRooms = () => {
    if (!loading && recentRooms) {
      return (
        <div>
          <div className="row align-items-center">
            <div className="col home-sec-header">
              Rooms&nbsp;
              <button
                className="btn p-0"
                style={buttonStyle}
                onClick={() => {
                  setShowEditRooms(!showEditRooms);
                  setShowEditChats(false);
                }}
              >
                {showEditRooms ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>
          {recentRooms.length === 0 ? (
            <div className="mt-5">
              <span>No rooms yet, try creating or joining a room!</span>
            </div>
          ) : (
            <div>
              {recentRooms.map((room: Room) => (
                <div key={room.external_id} className="character-row p-1 ">
                  <RoomCard
                    room={room}
                    onHide={showEditRooms ? hideRooms : undefined}
                    username={user?.user?.username}
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
    <AppWrapper user={user}>
      {loading ? (
        <Loading />
      ) : (
        <>
          {renderContinueChatting()}
          {renderRecentRooms()}
        </>
      )}
    </AppWrapper>
  );
};

export default Chats;
