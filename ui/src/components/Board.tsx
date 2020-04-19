import {Player} from '../model/Player';
import {CardIndex, HandIndex} from '../reducers/board';
import * as React from 'react';
import {OtherPlayer} from './OtherPlayer';
import {Decks} from './Decks';

interface BoardProps {
  deckLeft: number;
  discardPileTop: CardIndex | undefined;
  players: Player[];
  activeIndex: HandIndex;
  selectPlayer: (player: Player) => void;
  selectedPlayerIndex: HandIndex | undefined;
}

export const Board = (props: BoardProps) => {
  return (
    <div>
      <div className="top-row_wrapper">
        {player(props.players[2], props.selectPlayer, props.selectedPlayerIndex)}
      </div>
      <div className="middle-row_wrapper">
        {player(props.players[1], props.selectPlayer, props.selectedPlayerIndex)}
        <Decks/>
        {player(props.players[3], props.selectPlayer, props.selectedPlayerIndex)}
      </div>
    </div>
  );
}

function player(player: Player, selectPlayer: (player: Player) => void, selectedPlayerIndex: HandIndex | undefined) {
  return (
    <OtherPlayer player={player} onClick={selectPlayer} selected={selectedPlayerIndex === player.index}/>
  )
}