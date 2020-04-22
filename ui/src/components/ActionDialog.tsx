import * as React from 'react';
import {useState} from 'react';
import {CardType} from '../model/commonTypes';
import {Button, Form, Modal} from 'react-bootstrap';
import {Card, cardNameMapping} from './Card';
import {Player} from '../model/Player';
import _ = require('lodash');

interface ActionDialogProps {
  card: CardType | undefined;
  player: Player | undefined,
  show: boolean;
  onHide: () => void;
  onSubmit: () => void;
}

export const ActionDialog = (props: ActionDialogProps) => {
  const name = props.player?.name;
  const guard = props.card === CardType.Guard;
  const [guardChoice, setGuardChoice] = useState<CardType>(undefined);
  const disabled = guard && !guardChoice;
  const submit = disabled ? _.noop : props.onSubmit;
  const buttonType = disabled ? 'light' : 'primary'
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Your move</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="move-description">
          Use {props.card && (<Card card={props.card} showDescription={false}/>)} on {name}
        </div>
        {guard && (<GuardChoice choice={guardChoice} setGuardChoice={setGuardChoice}/>)}
      </Modal.Body>

      <Modal.Footer>
        <Button variant={buttonType} onClick={submit} disabled={disabled}>Apply</Button>
        <Button variant="link" onClick={props.onHide}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

interface GuardChoiceProps {
  choice: CardType | undefined;
  setGuardChoice: (choice: CardType) => void;
}

const GuardChoice = (props: GuardChoiceProps) => {
  const cards = [CardType.Priest, CardType.Baron, CardType.Handmaid, CardType.Prince, CardType.King, CardType.Countess, CardType.Princess];
  return (
    <fieldset>
      <Form.Group>
        <Form.Label as="legend">Guess card</Form.Label>
        {cards.map((card: CardType) => (
          <Form.Check
            checked={card === props.choice}
            type='radio'
            key={`check-${card}`}
            name='guardChoice'
            value={card}
            label={cardNameMapping[card]}
            onChange={(e: any) => {
              const choice = parseInt(e.target.value, 10);
              props.setGuardChoice(choice);
            }}
          />
        ))}
      </Form.Group>
    </fieldset>
  );
}