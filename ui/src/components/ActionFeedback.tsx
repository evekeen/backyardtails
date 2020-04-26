import {CardActionFeedback} from '../reducers/feedback';
import {Button, Modal} from 'react-bootstrap';
import * as React from 'react';
import {Card} from './Card';

interface ActionFeedbackProps {
  feedback: CardActionFeedback | undefined;
  hideFeedback: () => void;
}

export const ActionFeedback = (props: ActionFeedbackProps) => {
  const show = !!props.feedback;
  return (
    <Modal show={show} onHide={props.hideFeedback}>
      <Modal.Header closeButton>
        <Modal.Title>Your move</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Your move {props.feedback?.success ? 'succeeded' : 'failed'}</p>
        {props.feedback?.playerCard && <Card card={props.feedback?.playerCard} showDescription={false}/>}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={props.hideFeedback}>Ok</Button>
      </Modal.Footer>
    </Modal>
  );
}
