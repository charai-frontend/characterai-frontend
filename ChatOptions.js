import React, { useState } from 'react';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { BsFlag } from 'react-icons/bs';
import { HiOutlineTrash } from 'react-icons/hi';
import { IoIosShareAlt } from 'react-icons/io';
import {
  MdArchive,
  MdOutlineSettings,
  MdRecordVoiceOver,
  MdVoiceOverOff,
} from 'react-icons/md';
import { RiChatHistoryLine } from 'react-icons/ri';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';

import DropdownItemWithIcon from './components/DropdownItemWithIcon';

const ChatOptions = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const {
    waiting,
    isRoom,
    initiatePostCreation,
    clearChat,
    viewArchivedChats,
    viewCharacterSettings,
    reportCharacter,
    toggleDeleteMode,
    isAnonymousUser,
    characterVoiceEnabled,
    toggleCharacterVoice,
  } = props;

  if (initiatePostCreation && (isRoom || isAnonymousUser)) {
    return (
      <button
        type="submit"
        onClick={initiatePostCreation}
        className="btn px-0"
        title="Share Chat"
      >
        <IoIosShareAlt size={24} />
      </button>
    );
  }

  return (
    <div className="row align-items-center">
      {initiatePostCreation && (
        <button
          className="btn col-auto px-0"
          title="Share Chat"
          onClick={initiatePostCreation}
        >
          <IoIosShareAlt size={24} />
        </button>
      )}
      <Dropdown
        className="col-auto px-2"
        isOpen={dropdownOpen}
        toggle={toggle}
        direction="down"
        menuRole="listbox"
      >
        <DropdownToggle data-toggle="dropdown" tag="span">
          <BiDotsVerticalRounded size={25} />
        </DropdownToggle>
        <DropdownMenu>
          {toggleCharacterVoice && characterVoiceEnabled ? (
            <>
              <DropdownItemWithIcon
                icon={<MdVoiceOverOff size={24} />}
                title="Disable Character Voice"
                onClick={toggleCharacterVoice}
              />
              <DropdownItem divider />
            </>
          ) : toggleCharacterVoice ? (
            <>
              <DropdownItemWithIcon
                icon={<MdRecordVoiceOver size={24} />}
                title="Enable Character Voice"
                onClick={toggleCharacterVoice}
              />
              <DropdownItem divider />
            </>
          ) : null}
          {clearChat && (
            <DropdownItemWithIcon
              icon={<MdArchive size={24} />}
              title="Save and Start New Chat"
              disabled={waiting}
              onClick={clearChat}
            />
          )}
          {viewArchivedChats && (
            <DropdownItemWithIcon
              icon={<RiChatHistoryLine size={24} />}
              title="View Saved Chats"
              onClick={viewArchivedChats}
            />
          )}
          {toggleDeleteMode && (
            <DropdownItemWithIcon
              icon={<HiOutlineTrash size={24} />}
              title="Remove Messages"
              disabled={waiting}
              onClick={toggleDeleteMode}
            />
          )}

          {(viewCharacterSettings || reportCharacter) && (
            <DropdownItem divider />
          )}

          {viewCharacterSettings && (
            <DropdownItemWithIcon
              icon={<MdOutlineSettings size={24} />}
              title="View Character Settings"
              onClick={viewCharacterSettings}
            />
          )}
          {reportCharacter && (
            <DropdownItemWithIcon
              icon={<BsFlag size={24} />}
              title="Report Character"
              onClick={reportCharacter}
            />
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default ChatOptions;
