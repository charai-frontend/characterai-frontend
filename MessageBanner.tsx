import React, { useState } from 'react';
import { Alert } from 'reactstrap';

import './Common.css';
import { getLocal, hashCode, setLocal } from './utils';

type Props = {
  message: string;
};

const MAX_TIMES_TO_VIEW_MSG = 5;

const MessageBanner = ({ message }: Props) => {
  if (!message) {
    return null;
  }

  const messageKey = `banner-${hashCode(message)}`;
  const timesViewed = getLocal(messageKey) || 0;

  // Don't bug the user too many times with the same message
  if (timesViewed >= MAX_TIMES_TO_VIEW_MSG) {
    return null;
  }

  const [visible, setVisible] = useState(true);

  const onDismiss = () => {
    setLocal(messageKey, timesViewed + 1);
    setVisible(false);
  };

  return (
    <Alert
      color="warning"
      isOpen={visible}
      toggle={onDismiss}
      className="message-banner"
    >
      {message}
    </Alert>
  );
};

export default MessageBanner;
