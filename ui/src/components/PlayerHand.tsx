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
        <CardsChooser chooseCard={card => chooseCard(card)} cards={props.cards}/>
      </div>
      <ActionDialog card={chosenCard} show={show} onHide={() => setShow(false)}/>
    </>
  );
}

interface CardsChooserProps {
  cards: CardIndex[];
  chooseCard: (card: CardIndex) => void;
}

export const CardsChooser = (props: CardsChooserProps) => {
  const [chosenIndex, chooseIndex] = useState<CardInHandsIndex>(undefined);
  const chooseCard = (index: CardInHandsIndex) => {
    const card = props.cards[index];
    chooseIndex(index);
    props.chooseCard(card);
  }
  return (
    <div className="">
      <Card card={props.cards[0]} onClick={() => chooseCard(0)} selected={chosenIndex === 0}/>
      {props.cards.length > 1 && <Card card={props.cards[1]} onClick={() => chooseCard(1)} selected={chosenIndex === 1}/>}
    </div>
  );
}

type CardInHandsIndex = 0 | 1;