import axios from 'axios';
import classNames from 'classnames';
import Markdown from 'marked-react';
import { useEffect, useState } from 'react';

import CharacterIcon from '../CharacterIcon.js';
import InitialAvatar from '../InitialAvatar';

var JSONbigNative = require('json-bigint')({ useNativeBigInt: true });

const renderMsgText = (key, msg) => {
  const msgsClassNames = ['row', 'msg', 'markdown-wrapper-feed'];

  return (
    <div className={msgsClassNames.join(' ')}>
      <Markdown>{msg.text}</Markdown>
    </div>
  );
};
const msgRowClassNames = classNames({
  row: true,
  'pb-3': true,
});

const Evaluation = (props) => {
  const [taskTypeName, setTaskTypeName] = useState('');
  const [done, setDone] = useState(false);
  const [assignment, setAssignment] = useState({});
  const [choiceGroups, setChoiceGroups] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.get('task_type_name'));
    if (!urlParams.get('task_type_name')) {
      console.log('no params');
      setDone(true);
    }
    setTaskTypeName(urlParams.get('task_type_name'));

    //loadAssignment();
    //getInternalAssignments();
  }, []);

  useEffect(() => {
    if (taskTypeName) {
      loadAssignment();
    }
  }, [taskTypeName]);

  const loadAssignment = () => {
    loadInternalAssignment();
  };

  useEffect(() => {
    if (assignment?.assignment) {
      setupAssignment();
    }
  }, [assignment]);

  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  // assign all the choices to groups
  // maybe this is done serverside
  const setupAssignment = () => {
    // divide messages into context and prompts
    let new_context = [];
    let groups_by_properties = {};
    for (let i = 0; i < assignment.messages.length; i++) {
      if (
        assignment.message_ids_to_annotate.includes(assignment.messages[i].id)
      ) {
        if (
          !(assignment.messages[i].model_properties in groups_by_properties)
        ) {
          groups_by_properties[assignment.messages[i].model_properties] = [];
        }
        groups_by_properties[assignment.messages[i].model_properties].push(
          assignment.messages[i],
        );
      } else {
        new_context.push(assignment.messages[i]);
      }
    }

    let properties = Object.keys(groups_by_properties);
    let groups = [];
    let total_groups = groups_by_properties[properties[0]].length;

    for (let i = 0; i < total_groups; i++) {
      groups.push([]);
      let random_properties = shuffle(properties);
      for (let j = 0; j < random_properties.length; j++) {
        let msg = groups_by_properties[random_properties[j]].splice(
          Math.floor(
            Math.random() * groups_by_properties[random_properties[j]].length,
          ),
          1,
        );
        groups[i].push(msg[0]);
      }
    }
    setContext(new_context);
    setChoiceGroups(groups);
    setCurrentGroup(0);
  };

  const nextGroupOrAssignment = () => {
    document.activeElement?.blur();
    if (currentGroup < choiceGroups.length - 1) {
      setCurrentGroup(currentGroup + 1);
    } else {
      setAssignmentDone();
    }
  };

  /*]
  //TODO add a list of things to
  const getInternalAssignments = () => {
    return axios
      .put(
        '/chat/tasks/get/',
        {
          task_type_name: taskTypeName,
          platform: 'LABS',
          mode: 'SELECT_FROM_ALTERNATIVES',
        },
        getHeaders(),
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        props.handleServerError(err);
      });
  };
  */

  const loadInternalAssignment = () => {
    console.log(taskTypeName);
    return axios
      .put(
        '/chat/assignment/internal/',
        {
          task_type_name: taskTypeName,
        },
        getHeaders(),
      )
      .then((response) => {
        console.log(response.data);
        if (response.data.assignment) {
          setAssignment(response.data);
        } else {
          setDone(true);
        }
      })
      .catch((err) => {
        props.handleServerError(err);
      });
  };

  const getGroupIds = () => {
    let ids = [];
    for (let i = 0; i < choiceGroups[currentGroup].length; i++) {
      ids.push(choiceGroups[currentGroup][i].id);
    }
    return ids;
  };

  const annotateChoice = (msgId) => {
    const request = {
      message_id: msgId,
      assignment_id: assignment.assignment.id,
      shown_msg_ids: getGroupIds(),
      selected_msg_ids: [msgId],
    };
    console.log('sending: ', request);
    axios
      .put('/chat/annotations/group/label/', JSONbigNative.stringify(request), getHeaders())
      .then(() => {
        nextGroupOrAssignment();
      })
      .catch((err) => {
        props.handleServerError(err);
      });
  };

  const setAssignmentDone = () => {
    // done, update remote chat db
    axios
      .put(
        '/chat/assignment/done/',
        JSONbigNative.stringify({ assignment_id: assignment.assignment.id }),
        getHeaders(),
      )

      .then(() => {
        loadInternalAssignment();
      })
      .catch((err) => {
        props.handleServerError(err);
      });
  };

  const getHeaders = () => {
    return {
      headers: { Authorization: 'Token ' + props.token, 'Content-Type': 'application/json' },
    };
  };

  // move this to SimpleMessage once we update the serializer call
  // to include avatar etc
  const renderMsg = (msg, index) => {
    return (
      <div key={index} className={msgRowClassNames}>
        <div className="col-auto p-0">
          <InitialAvatar
            name={msg.display_name || msg.src.name}
            avatarFileName={''}
            size={45}
          />
        </div>
        <div className="col ms-2 pb-2">
          <div
            className={
              props.largerText
                ? 'row msg-author-name larger-text'
                : 'row msg-author-name'
            }
          >
            <div
              className="col-auto p-0"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {msg.display_name || msg.src.name}
              <CharacterIcon
                msg={msg}
                isCharacter={!msg.src.is_human}
                responsibleUser={''}
              />
            </div>
          </div>
          {renderMsgText(index, msg)}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      {!done && assignment?.assignment?.id && (
        <div className="row justify-content-center mx-3">
          <div className="col-auto">
            <div className="row justify-content-center mb-3 mt-3">
              <div className="col-auto">
                <span>
                  <h4>
                    Choose the <b>better</b> next message...
                  </h4>
                </span>
              </div>
            </div>

            {context && (
              <>
                <div
                  className="row px-2 pt-1 mb-2 align-items-center"
                  style={{
                    borderRadius: '10px',
                    boxShadow: '0 0 5px 0 rgba(0,0,0,0.2)',
                    maxWidth: '640px',
                  }}
                >
                  <div className="row justify-content-center px-2 pt-1 mb-2 align-items-center">
                    {context.map((msg, index) => renderMsg(msg, index))}
                  </div>
                </div>

                {choiceGroups &&
                  choiceGroups[currentGroup].map((msg, index) => (
                    <div
                      key={index}
                      className="row px-2 pt-1 mb-2 align-items-center"
                      style={{
                        borderRadius: '10px',
                        boxShadow: '0 0 5px 0 rgba(0,0,0,0.2)',
                        maxWidth: '640px',
                      }}
                    >
                      <button
                        className="btn p-3"
                        onClick={() => annotateChoice(msg.id)}
                      >
                        {renderMsg(msg, index)}
                      </button>
                    </div>
                  ))}
                {choiceGroups && (
                  <div
                    key={'equal'}
                    className="row px-2 pt-1 mb-2 align-items-center"
                    style={{
                      borderRadius: '10px',
                      boxShadow: '0 0 5px 0 rgba(0,0,0,0.2)',
                      maxWidth: '640px',
                    }}
                  >
                    <button
                      className="btn p-3"
                      onClick={() => annotateChoice(null)}
                    >
                      <i>About the same</i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {done && <div>All done with this set</div>}
    </div>
  );
};

export default Evaluation;
