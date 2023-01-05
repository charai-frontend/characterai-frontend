import React from 'react';
import { Spinner } from 'reactstrap';

export default function Loading() {
  return <Spinner style={{ display: 'block', margin: '10px auto' }} />;
}
