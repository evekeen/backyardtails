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
  const selectable = props.activeIndex === 1;
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

function player(player: Player, selectPlayer: (player: Player) => void, selectedPlayerIndex: HandIndex | undefined, selectable: boolean) {
  return (
    <OtherPlayer player={player} onClick={selectPlayer} selected={selectedPlayerIndex === player.index} selectable={selectable}/>
  )
}