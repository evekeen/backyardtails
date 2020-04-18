import {CardIndex} from '../reducers/board';
import * as React from 'react';
import {Button, Modal} from 'react-bootstrap';
import {User} from '../model/User';
import {CardImg} from './Card';

interface ActionDialogProps {
  card: CardIndex | undefined;
  user: User | undefined,
  show: boolean;
  onHide: () => void;
  onSubmit: () => void;
}

export const ActionDialog = (props: ActionDialogProps) => {
  const name = props.user?.name;
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Your move</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Use {props.card && (<CardImg card={props.card}/>)} on {name})}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={props.onSubmit}>Ok</Button>
      </Modal.Footer>
    </Modal>
  );
}