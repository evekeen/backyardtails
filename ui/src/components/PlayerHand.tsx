import * as React from 'react';
import {useState} from 'react';
import {Card} from './Card';
import {CardIndex} from '../reducers/board';
import {ActionDialog} from './ActionDialog';
import {CardAction} from '../model/CardAction';
import {User} from '../model/User';

interface PlayerHandProps {
  active: boolean;
  cards: CardIndex[];
  selectedCard: CardIndex | undefined;
  selectedUser: User | undefined;
  selectCard: (card: CardIndex) => void;
  submitAction: (action: CardAction) => void;
}

export const PlayerHand = (props: PlayerHandProps) => {
  const selectedCard = props.selectedCard
  const [show, setShow] = useState(false);
  const submit = () => props.submitAction({card: selectedCard, userId: props.selectedUser.id});
  if (!props.active) {
    return (
      <Card card={props.cards[0]}/>
    );
  }
  return (
    <>
      <Card card={props.cards[0]} onClick={() => props.selectCard(props.cards[0])} selected={selectedCard === props.cards[0]}/>
      {props.cards.length > 1 &&
      <Card card={props.cards[1]} onClick={() => props.selectCard(props.cards[1])} selected={selectedCard === props.cards[1]}/>}
      <ActionDialog card={selectedCard} user={props.selectedUser} show={show} onHide={() => setShow(false)} onSubmit={submit}/>
    </>
  );
}