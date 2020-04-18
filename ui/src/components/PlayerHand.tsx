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
  const first = props.cards[0];
  const chooser = (card: CardIndex) => {
    chooseCard(card);
    setShow(true);
  }
  return (
    <>
      <div className="">
        <Card card={first} onClick={() => chooser(first)} selected={chosenCard === first}/>
        {props.cards.length > 1 && <Card card={props.cards[1]} onClick={() => chooser(props.cards[1])} selected={chosenCard === props.cards[1]}/>}
      </div>
      <ActionDialog card={chosenCard} show={show} onHide={() => setShow(false)}/>
    </>
  );
}