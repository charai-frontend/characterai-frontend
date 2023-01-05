import React from 'react';
import { BsPlusCircle } from 'react-icons/bs';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';

import DropdownItemWithIcon from '../components/DropdownItemWithIcon';

interface ChatActionsProps {
  open: boolean;
  waiting: boolean;
  toggle: () => void;
  openImageGenerationModal?: () => void;
  regenerateLastMessage?: () => void;
  characterVoiceEnabled: boolean;
  toggleCharacterVoice?: () => void;
  openImageUploadModal?: () => void;
}

const ChatActions = ({
  open,
  toggle,
  openImageGenerationModal,
  openImageUploadModal,
}: ChatActionsProps) => {
  return (
    <Dropdown
      className="col-auto ps-2"
      isOpen={open}
      toggle={toggle}
      direction="up"
      menuRole="listbox"
    >
      <DropdownToggle data-toggle="dropdown" tag="span">
        <div style={{ cursor: 'pointer' }}>
          <BsPlusCircle size={25} style={{ marginRight: 5 }} />
        </div>
      </DropdownToggle>
      <DropdownMenu>
        {openImageGenerationModal && (
          <>
            <DropdownItemWithIcon
              icon={'🎨'}
              title="Create Image"
              onClick={openImageGenerationModal}
            />
          </>
        )}

        {openImageUploadModal && (
          <>
            <DropdownItemWithIcon
              icon={'🖼'}
              title="Upload Image"
              onClick={openImageUploadModal}
            />
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

export default ChatActions;
