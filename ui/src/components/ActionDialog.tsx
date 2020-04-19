import {CardIndex} from '../reducers/board';
import * as React from 'react';
import {Button, Modal} from 'react-bootstrap';
import {User} from '../model/User';
import {Card} from './Card';
import { Player } from '../model/Player';

interface ActionDialogProps {
  card: CardIndex | undefined;
  player: Player | undefined,
  show: boolean;
  onHide: () => void;
  onSubmit: () => void;
}

export const ActionDialog = (props: ActionDialogProps) => {
  const name = props.player?.name;
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Your move</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="move-description">
          Use {props.card && (<Card card={props.card}/>)} on {name}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={props.onSubmit}>Ok</Button>
      </Modal.Footer>
    </Modal>
  );
}