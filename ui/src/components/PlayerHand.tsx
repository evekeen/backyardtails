import * as React from 'react';
import {Card} from './Card';
import {CardType, needPlayerSelected} from '../model/commonTypes';
import {ActionDialog} from './ActionDialog';
import {CardAction} from '../model/CardAction';
import {Player} from '../model/Player';
import {Score} from './Score';
import _ = require('lodash');

interface PlayerHandProps {
  active: boolean;
  player: Player;
  cards: CardType[];
  selectedCard: CardType | undefined;
  selectedPlayer: Player | undefined;
  selectCard: (card: CardType) => void;
  submitAction: (action: CardAction) => void;
  cancelSelection: () => void;
}

export const PlayerHand = (props: PlayerHandProps) => {
  const selectedCard = props.active ? props.selectedCard : 0 as CardType;
  const selectCard = props.active ? props.selectCard : _.noop;
  const disabledClass = props.active ? '' : 'disabled';
  const activeClass = props.active ? 'player-active' : '';
  const deadClass = !props.player?.alive ? 'player-dead' : '';
  const submitAction = (guess?: CardType) => props.active && props.submitAction({
    card: selectedCard,
    playerIndex: props.selectedPlayer?.index,
    guess: guess
  });
  const submit = (guess?: CardType) => {
    submitAction(guess);
    props.cancelSelection();
  };

  function secondCard() {
    if (props.cards.length <= 1 || !props.cards[1]) return undefined;
    const card = props.cards[1];
    return (
      <Card card={card} onClick={() => selectCard(card)} selected={selectedCard === card && props.cards[0] !== card}/>
    );
  }

  return (
    <div className="main-wrapper">
      <div className='player-wrapper main-player'>
        <h3>{props.player?.name || ''}</h3>
        <div className={`player main-player ${disabledClass} ${activeClass} ${deadClass}`}>
          <div className="main-player__cards">
            <Card card={props.cards[0]} onClick={() => selectCard(props.cards[0])} selected={selectedCard === props.cards[0]}/>
            {secondCard()}
          </div>
          <Score score={props.player?.score || 0}/>
        </div>
      </div>
      <ActionDialog card={selectedCard} player={props.selectedPlayer} show={showDialog(selectedCard, props)}
                    onHide={() => props.cancelSelection()} onSubmit={submit}/>
    </div>
  );
}

function showDialog(selectedCard: CardType, props: PlayerHandProps): boolean {
  if (!selectedCard) return false;
  if (!needPlayerSelected(selectedCard)) return true;
  return !!selectedCard && !!props.selectedPlayer;
}
