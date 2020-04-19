import * as React from 'react';
import {useState} from 'react';
import {Card} from './Card';
import {CardIndex} from '../reducers/board';
import {ActionDialog} from './ActionDialog';
import {CardAction} from '../model/CardAction';
import {Player} from '../model/Player';
import _ = require('lodash');

interface PlayerHandProps {
  active: boolean;
  cards: CardIndex[];
  selectedCard: CardIndex | undefined;
  selectedPlayer: Player | undefined;
  selectCard: (card: CardIndex) => void;
  submitAction: (action: CardAction) => void;
}

export const PlayerHand = (props: PlayerHandProps) => {
  const selectedCard = props.active ? props.selectedCard : 0 as CardIndex;
  const selectCard = props.active ? props.selectCard : _.noop;
  const disabledClass = props.active ? '' : 'disabled';
  const [show, setShow] = useState(false);
  const submit = props.active ? () => props.submitAction({card: selectedCard, player: props.selectedPlayer}) : _.noop;
  return (
    <div className="main-wrapper">
      <div className='player-wrapper'>
        <div className={`player main-player ${disabledClass}`}>
          <h3>You</h3>
          <div className="main-player__cards">
            <Card card={props.cards[0]} onClick={() => selectCard(props.cards[0])} selected={selectedCard === props.cards[0]}/>
            {props.cards.length > 1 &&
            <Card card={props.cards[1]} onClick={() => selectCard(props.cards[1])}
                  selected={selectedCard === props.cards[1] && props.cards[0] !== props.cards[1]}/>}
          </div>
        </div>
      </div>
      <ActionDialog card={selectedCard} player={props.selectedPlayer} show={show} onHide={() => setShow(false)} onSubmit={submit}/>
    </div>
  );
}