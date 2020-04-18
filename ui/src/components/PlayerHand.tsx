import * as React from 'react';
import {useState} from 'react';
import {Card} from './Card';
import {CardIndex} from '../reducers/board';
import {ActionDialog} from './ActionDialog';

interface PlayerHandProps {
  cards: CardIndex[];
}

export const PlayerHand = (props: PlayerHandProps) => {
  const [chosenCard, chooseCard] = useState<CardIndex>(undefined);
  const [show, setShow] = useState(false);
  return (
    <>
      <div>
        <CardsChooser chooseCard={card => chooseCard(card)} first={props.cards[0]} second={props.cards.length > 1 ? props.cards[1] : undefined}/>
      </div>
      <ActionDialog card={chosenCard} show={show} onHide={() => setShow(false)}/>
    </>
  );
}

interface CardsChooserProps {
  first: CardIndex;
  second: CardIndex | undefined;
  chooseCard: (card: CardIndex) => void;
}

export const CardsChooser = (props: CardsChooserProps) => {
  return (
    <div className="deck">
      <Card card={props.first} onClick={() => props.chooseCard(props.first)}/>
      {props.second && <Card card={props.second} onClick={() => props.chooseCard(props.second)}/>}
    </div>
  );
}