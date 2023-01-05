import axios from 'axios';
import React from 'react';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';

import './App.css';
import AppWrapper from './AppWrapper';
import './Chat.css';
import './Common.css';
import TopicCard from './TopicCard';
import CommunityTabs from './community/CommunityTabs';
import Loading from './components/Loading';
import { getHeaders } from './utils.js';

const Topics = (props) => {
  const { token, user } = props;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState([]);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (loaded.includes('topics')) {
      setLoading(false);
    }
  }, [loaded]);

  const loadRooms = async () => {
    axios
      .get('/chat/topics/', getHeaders(props))
      .then((response) => {
        setTopics(response.data.topics);
        setLoaded((oldArray) => [...oldArray, 'topics']);
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const renderTopicsList = () => {
    if (!loading && topics !== undefined) {
      return (
        <div>
          {topics.length === 0 ? (
            <div className="mt-5">
              <span>No topics yet. Check back soon!</span>
            </div>
          ) : (
            <div>
              <div className="row">
                <div className="home-sec-header">Community</div>
              </div>
              {topics.map((topic, index) => (
                <div key={index} className="row">
                  <TopicCard topic={topic} />
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
      <div className="row">
        <div className={isMobile ? 'col-12' : 'col-8'}>
          {loading ? <Loading /> : <>{renderTopicsList()}</>}
        </div>
        <div className={isMobile ? 'col-12 mt-3' : 'col-4'}>
          {loading ? <></> : <CommunityTabs />}
        </div>
      </div>
    </AppWrapper>
  );
};

export default Topics;
