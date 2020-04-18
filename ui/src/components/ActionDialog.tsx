import {CardIndex} from '../reducers/board';
import * as React from 'react';
import {Button, Modal} from 'react-bootstrap';

interface ActionDialogProps {
  card: CardIndex | undefined;
  show: boolean;
  onHide: () => void;
}


export const ActionDialog = (props: ActionDialogProps) => {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Modal title</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Action for card {props.card}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary">Ok</Button>
      </Modal.Footer>
    </Modal>
  );
}