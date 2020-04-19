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
}

export const Board = (props: BoardProps) => {
  return (
    <div>
      <div className="top-row_wrapper">
        <OtherPlayer player={props.players[2]}/>
      </div>
      <div className="middle-row_wrapper">
        <OtherPlayer player={props.players[1]}/>
        <Decks/>
        <OtherPlayer player={props.players[3]}/>
      </div>
    </div>
  );
}