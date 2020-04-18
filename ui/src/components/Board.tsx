import {Player} from '../model/Player';
import {CardIndex, HandIndex} from '../reducers/board';
import * as React from 'react';

interface BoardProps {
  deckLeft: number,
  discardPileTop: CardIndex | undefined,
  players: Player[],
  activeIndex: HandIndex
}

export const Board = (props: BoardProps) => {
  return (
    <div>
      {JSON.stringify(props)}
    </div>
  );
}