import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import Modal from 'react-modal';
import styled from 'styled-components';

import API from '../api/Api';

const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
`;

const mobileContentStyle = {
  top: '100%',
  left: '50%',
  width: '100%',
  animationName: 'slide-up',
  animationDuration: '0.3s',
  animationTimingFunction: 'ease-in-out',
  transform: 'translate(-50%, -100%)',
  paddingTop: '8px',
  right: 'auto',
  height: '250px',
  boxShadow: '0px 2px 9px rgb(0 0 0 / 5%)',
  borderColor: 'rgb(0 0 0 / 15%)',
  borderRadius: '10px',
  padding: '16px',
};

const webContentStyle = {
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  paddingTop: '8px',
  right: 'auto',
  height: '250px',
  boxShadow: '0px 2px 9px rgb(0 0 0 / 5%)',
  borderColor: 'rgb(0 0 0 / 15%)',
  borderRadius: '10px',
  padding: '16px',
};

export const AccountDeactivateWarningModal = ({
  isOpen,
  setIsOpen,
  handleLogout,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleLogout: () => void;
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      style={{
        content: isMobile ? mobileContentStyle : webContentStyle,
      }}
    >
      <Container
        style={{
          padding: 12,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Row style={{ justifyContent: 'center', flexGrow: 0 }}>
          <h3>{deactivating ? 'Please wait...' : 'Are you sure?'}</h3>
        </Row>
        {deactivating ? (
          <div>
            <Row style={{ alignItems: 'center' }}>
              <div style={{ userSelect: 'none' }}>
                We are deactivating your account. You will be automatically
                logged out once completed.
              </div>
            </Row>
            <Row style={{ justifyContent: 'center' }}>
              <div className="d-flex justify-content-center m-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="sr-only"></span>
                </div>
              </div>
            </Row>
          </div>
        ) : (
          <div>
            <Row
              style={{ alignItems: 'center', cursor: 'pointer' }}
              onClick={() => {
                setAcknowledged(!acknowledged);
              }}
            >
              <input
                type="checkbox"
                style={{
                  height: '1.5em',
                  width: '1.5em',
                  marginRight: 12,
                }}
                checked={acknowledged}
                onChange={(event) => {
                  setAcknowledged(event.target.checked);
                }}
              />

              <div style={{ userSelect: 'none' }}>
                I understand deactivated accounts are not recoverable
              </div>
            </Row>
            <Row style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="btn p-2 m-2 border"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="btn p-2 m-2 border alert alert-danger"
                disabled={!acknowledged}
                color="warning"
                onClick={() => {
                  setDeactivating(true);
                  API.deactivateUser();
                  handleLogout();
                }}
              >
                DEACTIVATE ACCOUNT
              </button>
            </Row>
          </div>
        )}
      </Container>
    </Modal>
  );
};
