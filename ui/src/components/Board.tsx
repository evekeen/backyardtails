import {Player} from '../model/Player';
import {CardType, PlayerIndex} from '../model/commonTypes';
import * as React from 'react';
import {OtherPlayer} from './OtherPlayer';
import {Decks} from './Decks';

interface BoardProps {
  deckLeft: number;
  discardPileTop: CardType | undefined;
  players: Player[];
  turnIndex: PlayerIndex;
  currentPlayerInTurn: boolean;
  currentPlayerIndex: PlayerIndex | undefined;
  selectPlayer: (player: Player) => void;
  selectedPlayerIndex: PlayerIndex | undefined;
}

export const Board = (props: BoardProps) => {
  const selectable = props.currentPlayerInTurn;
  return (
    <div>
      <div className="top-row_wrapper">
        {player(props.players[2], props.selectPlayer, props.selectedPlayerIndex, selectable)}
      </div>
      <div className="middle-row_wrapper">
        {player(props.players[1], props.selectPlayer, props.selectedPlayerIndex, selectable)}
        <Spring/>
        <Decks deckLeft={props.deckLeft} discardPileTop={props.discardPileTop}/>
        <Spring/>
        {player(props.players[3], props.selectPlayer, props.selectedPlayerIndex, selectable)}
      </div>
    </div>
  );
}

const Spring = () => {
  return (
    <div className="ll-spring"/>
  );
}

function player(player: Player, selectPlayer: (player: Player) => void, selectedPlayerIndex: PlayerIndex | undefined, selectable: boolean) {
  return (
    <OtherPlayer player={player} onClick={selectPlayer} selected={player && selectedPlayerIndex === player.index} selectable={selectable}/>
  )
}