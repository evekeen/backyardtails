import _ = require('lodash');
import React = require('react');
import {Toast} from 'react-bootstrap';
import {now} from 'lodash';
import {StatusMessage} from '../reducers/status';

export const StatusPanel = (props: StatusProps) => {
  return (
    <div className="status-messages">
      {_.take(props.log, 3)
        .map((msg, i) => <MessageToast key={i} text={msg.text} time={msg.time} onClose={() => props.closeMessage(i)}/>)
      }
    </div>
  );
}

interface StatusProps {
  log: StatusMessage[];
  closeMessage: (index: number) => void;
}

interface MessageToastProps extends StatusMessage {
  onClose: () => void;
}

const MessageToast = (props: MessageToastProps) => {
  const ago = Math.round((now() - props.time) / 1000);
  return (
    <Toast show={!props.closed} onClose={props.onClose}>
      <Toast.Header>
        <strong className="mr-auto">Love Letter</strong>
        <small>{ago} seconds ago</small>
      </Toast.Header>
      <Toast.Body>{props.text}</Toast.Body>
    </Toast>
  );
}