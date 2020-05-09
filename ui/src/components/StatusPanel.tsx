import React = require('react');
import {Alert} from 'react-bootstrap';
import {StatusMessage} from '../reducers/status';

export const StatusPanel = (props: StatusProps) => {
  return (
    <div className="status-messages">
      {props.log.map((msg, i) => <StatusMessageComponent key={i} type={msg.type} text={msg.text}/>)}
    </div>
  );
}

interface StatusProps {
  log: StatusMessage[];
}

const StatusMessageComponent = (props: StatusMessage) => {
  return (
    <Alert variant={props.type || 'primary'}>
      {props.text}
    </Alert>
  );
}