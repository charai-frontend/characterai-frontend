import axios from 'axios';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BiDotsHorizontalRounded, BiDotsVerticalRounded } from 'react-icons/bi';
import { BsFlag, BsPinAngle } from 'react-icons/bs';
import { HiOutlineTrash } from 'react-icons/hi';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { TiCancel } from 'react-icons/ti';

import './MoreOptionsButton.css';
import { getHeaders } from './utils.js';

/* Button to show more options (e.g., delete, pin, report) for a post or comment.

Requires

- props.external_id: the external_id of the post or comment.
- props.token
- props.handleServerError
- props.deleteUrl: the url to send the delete request to.

Can optionally take:

- deleteClickedCallback: a function to call when delete is clicked (e.g., to remove the
    deleted entity from the screen).
- verticalLayout boolean that should be used when the button is layout out
    vertically next to other buttons.
- deletingEnabled boolean that is true by default.
- togglePinClickedCallback: a function to call when the pin is clicked (e.g., to show
    a ping at the corner of the post).
*/
const MoreOptionsButton = (props) => {
  const iconSize = isMobile ? 27 : 24;
  const [optionsModalIsOpen, setOptionsModalIsOpen] = useState(false);
  const [deleteConfirmModalIsOpen, setDeleteConfirmModalIsOpen] =
    useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (typeof props.isPinned !== 'undefined') {
      setIsPinned(props.isPinned);
    }
  }, []);

  const callApiOnEntity = async (apiUrl) => {
    return await axios
      .post(
        apiUrl,
        {
          external_id: props.external_id,
        },
        getHeaders(props),
      )
      .then((response) => {
        if (!response.data.success) {
          console.error(response);
          if (response.data.error) {
            alert(response.error);
          }
        }
      })
      .catch((err) => {
        props.handleServerError(err);
        return false;
      });
  };

  const deleteEntity = async () => {
    return await callApiOnEntity(props.deleteUrl);
  };

  const reportEntity = async () => {
    return await callApiOnEntity(props.reportUrl);
  };

  const pinEntity = async () => {
    return await callApiOnEntity(props.pinUrl);
  };

  const unpinEntity = async () => {
    return await callApiOnEntity(props.unpinUrl);
  };

  const closeOptionsModal = () => {
    setOptionsModalIsOpen(false);
  };

  const closeDeleteConfirmModal = () => {
    setDeleteConfirmModalIsOpen(false);
  };

  const handleMoreOptionsClick = () => {
    setOptionsModalIsOpen(true);
  };

  const handleDeleteClick = async () => {
    closeOptionsModal();
    setDeleteConfirmModalIsOpen(true);
  };

  const handleDeleteForRealClick = async () => {
    closeDeleteConfirmModal();
    if (props.waitDeleteApiCall) {
      await deleteEntity();
    } else {
      deleteEntity();
    }
    if (props.deleteClickedCallback) {
      props.deleteClickedCallback();
    }
  };

  const handleReportClick = async () => {
    closeOptionsModal();
    toast('Thanks for reporting this.');
    reportEntity();
  };

  const handlePinToggleClick = async () => {
    closeOptionsModal();
    if (props.togglePinClickedCallback) {
      props.togglePinClickedCallback(!isPinned);
    }
    if (isPinned) {
      unpinEntity();
      setIsPinned(false);
    } else {
      pinEntity();
      setIsPinned(true);
    }
  };

  const renderIcon = () => {
    if (props.verticalLayout) {
      return <BiDotsVerticalRounded size={iconSize} />;
    }
    return <BiDotsHorizontalRounded size={iconSize} />;
  };

  const defaultToTrue = (prop) => {
    return typeof prop === 'undefined' || prop;
  };

  const anyButtonsEnabled = () => {
    return (
      defaultToTrue(props.deletingEnabled) ||
      defaultToTrue(props.reportingEnabled) ||
      defaultToTrue(props.pinningEnabled)
    );
  };

  const getOptionsModalStyle = () => {
    let modalStyle = {
      content: {
        paddingTop: '8px',
        top: '100%',
        left: '50%',
        right: 'auto',
        marginRight: '-50%',
        width: '100%',
        height: '200px',
        transform: 'translate(-50%, -112%)',
        animationName: 'slide-up',
        animationDuration: '0.3s',
        animationTimingFunction: 'ease-in-out',
        boxShadow: '0px 2px 9px rgb(0 0 0 / 5%)',
        borderColor: 'rgb(0 0 0 / 15%)',
        borderRadius: '10px',
      },
    };
    if (!isMobile) {
      const moreOptionsButtonElement = document.getElementById(
        `more-options-${props.external_id}`,
      );
      let top = '50%';
      let left = '50%';
      if (moreOptionsButtonElement) {
        const moreOptionsButtonRect =
          moreOptionsButtonElement.getBoundingClientRect();
        top = `${moreOptionsButtonRect.top + 12}px`;
        left = `${moreOptionsButtonRect.left + 10}px`;
      }
      modalStyle = {
        content: {
          paddingTop: '8px',
          top: top,
          left: left,
          right: 'auto',
          transform: 'translate(-100%, -50%)',
          width: 'fit-content',
          height: 'fit-content',
          boxShadow: '0px 2px 9px rgb(0 0 0 / 5%)',
          borderColor: 'rgb(0 0 0 / 15%)',
          borderRadius: '10px',
        },
      };
    }
    return modalStyle;
  };

  const getDeleteConfirmModalStyle = () => {
    let modalStyle = {
      content: {
        paddingTop: '8px',
        top: '50%',
        left: '50%',
        right: 'auto',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: 'fit-content',
        boxShadow: '0px 2px 9px rgb(0 0 0 / 5%)',
        borderColor: 'rgb(0 0 0 / 15%)',
        borderRadius: '10px',
      },
    };
    if (!isMobile) {
      modalStyle['width'] = '300px';
    }
    return modalStyle;
  };

  const modalOverlayClassNames = classNames({
    'no-overlay-blur': !isMobile,
  });

  const renderPinButton = () => {
    return (
      <button
        className="more-options-button btn"
        title="Pin"
        onClick={() => handlePinToggleClick()}
      >
        <div className="d-flex flex-row jusitfy-content-start align-items-center">
          <div className="d-flex flex-column pe-3">
            <BsPinAngle size={iconSize} />
          </div>
          <div className="d-flex flex-column pe-3">
            {isPinned ? 'Unpin' : 'Pin'}
          </div>
        </div>
      </button>
    );
  };

  const renderOptionButtons = () => {
    return (
      <div
        className="d-flex flex-column justify-content-start"
        style={{ width: 'fit-content', height: 'fit-content' }}
      >
        {defaultToTrue(props.deletingEnabled) && (
          <button
            className="more-options-button btn"
            title={props.isRejectInsteadOfDelete ? "Remove" : "Delete"}
            onClick={() => handleDeleteClick()}
          >
            <div className="d-flex flex-row jusitfy-content-start align-items-center">
              <div className="d-flex flex-column pe-3">
                {
                  props.isRejectInsteadOfDelete ?
                    <TiCancel size={iconSize} />
                    :
                    <HiOutlineTrash size={iconSize} />
                }
              </div>
              <div className="d-flex flex-column pe-3">
                {props.isRejectInsteadOfDelete ? "Remove" : "Delete"}
              </div>
            </div>
          </button>
        )}
        {defaultToTrue(props.reportingEnabled) && (
          <button
            className="more-options-button btn"
            title="Report"
            onClick={() => handleReportClick()}
          >
            <div className="d-flex flex-row jusitfy-content-start align-items-center">
              <div className="d-flex flex-column pe-3">
                <BsFlag size={iconSize} />
              </div>
              <div className="d-flex flex-column pe-3">Report</div>
            </div>
          </button>
        )}
        {defaultToTrue(props.pinningEnabled) && renderPinButton()}
      </div>
    );
  };

  const renderOptionsModal = () => {
    return (
      <Modal
        isOpen={optionsModalIsOpen}
        onRequestClose={() => closeOptionsModal()}
        style={getOptionsModalStyle()}
        overlayClassName={modalOverlayClassNames}
        contentLabel="More Options"
      >
        {renderOptionButtons()}
      </Modal>
    );
  };

  const renderDeleteConfirmModal = () => {
    return (
      <Modal
        isOpen={deleteConfirmModalIsOpen}
        onRequestClose={() => closeDeleteConfirmModal()}
        style={getDeleteConfirmModalStyle()}
        contentLabel="Delete Confirmation"
      >
        <div className="d-flex flex-column">
          <div className="d-flex flex-row pt-2 mb-2 justify-content-center">
            {`Are you sure you want to ${props.isRejectInsteadOfDelete ? "remove" : "delete"} this?`}
          </div>
          <div className="d-flex flex-row justify-content-center">
            <button
              className={`btn border btn-secondary mx-2 px-3"
                            }`}
              title="Cancel Deletion"
              onClick={() => closeDeleteConfirmModal()}
              cursor={props.disableClickThrough ? 'default' : 'auto'}
              disabled={props.disableClickThrough}
            >
              Cancel
            </button>
            <button
              className={`btn border btn-danger mx-2 px-3"
                            }`}
              title={props.isRejectInsteadOfDelete ? "Remove" : "Delete"}
              onClick={() => handleDeleteForRealClick()}
              cursor={props.disableClickThrough ? 'default' : 'auto'}
              disabled={props.disableClickThrough}
            >
              {props.isRejectInsteadOfDelete ? "Remove" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div
      id={`more-options-${props.external_id}`}
      className="d-flex flex-column align-items-center"
      style={{ height: 'fit-content', width: 'fit-content' }}
    >
      {anyButtonsEnabled() && (
        <button
          className={`btn px-0${props.verticalLayout ? '' : ' px-2'} pb-0`}
          title="More Options"
          onClick={() => handleMoreOptionsClick()}
          cursor={props.disableClickThrough ? 'default' : 'auto'}
          disabled={props.disableClickThrough}
        >
          {renderIcon()}
        </button>
      )}
      {renderOptionsModal()}
      {renderDeleteConfirmModal()}
    </div>
  );
};

export default MoreOptionsButton;
