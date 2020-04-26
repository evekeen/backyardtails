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
  return (
    <div>
      <div className="top-row_wrapper">
        {player(props.players[2], props)}
      </div>
      <div className="middle-row_wrapper">
        {player(props.players[1], props)}
        <Decks deckLeft={props.deckLeft} discardPileTop={props.discardPileTop}/>
        {player(props.players[3], props)}
      </div>
    </div>
  );
}

function player(player: Player, props: BoardProps) {
  return (
    <OtherPlayer player={player}
                 selected={player && props.selectedPlayerIndex === player?.index}
                 selectable={props.currentPlayerInTurn}
                 active={props.turnIndex === player?.index}
                 onClick={props.selectPlayer}/>
  )
}