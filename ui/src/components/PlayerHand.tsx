import * as React from 'react';
import _ = require('lodash');
import {Card} from './Card';
import {CardIndex} from '../reducers/board';
import {ActionDialog} from './ActionDialog';
import {CardAction} from '../model/CardAction';
import {Player} from '../model/Player';

interface PlayerHandProps {
  active: boolean;
  cards: CardIndex[];
  selectedCard: CardIndex | undefined;
  selectedPlayer: Player | undefined;
  selectCard: (card: CardIndex) => void;
  submitAction: (action: CardAction) => void;
  cancelSelection: () => void;
}

export const PlayerHand = (props: PlayerHandProps) => {
  const selectedCard = props.active ? props.selectedCard : 0 as CardIndex;
  const selectCard = props.active ? props.selectCard : _.noop;
  const disabledClass = props.active ? '' : 'disabled';
  const showDialog = !!selectedCard && !!props.selectedPlayer;
  const submit = props.active ? () => props.submitAction({card: selectedCard, player: props.selectedPlayer}) : _.noop;

  function secondCard() {
    if (props.cards.length <= 1) return undefined;
    const card = props.cards[1];
    return (
      <Card card={card} onClick={() => selectCard(card)} selected={selectedCard === card && props.cards[0] !== card}/>
    );
  }

  return (
    <div className="main-wrapper">
      <div className='player-wrapper'>
        <div className={`player main-player ${disabledClass}`}>
          <h3>You</h3>
          <div className="main-player__cards">
            <Card card={props.cards[0]} onClick={() => selectCard(props.cards[0])} selected={selectedCard === props.cards[0]}/>
            {secondCard()}
          </div>
        </div>
      </div>
      <ActionDialog card={selectedCard} player={props.selectedPlayer} show={showDialog} onHide={() => props.cancelSelection()} onSubmit={submit}/>
    </div>
  );
}