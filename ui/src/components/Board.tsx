import {Hand} from '../model/Hand';
import {CardIndex, HandIndex} from '../reducers/board';
import * as React from 'react';

interface BoardProps {
  deckLeft: number,
  discardPileTop: CardIndex | undefined,
  hands: Hand[],
  active: HandIndex
}

export const Board = (props: BoardProps) => {
  return (
    <div>
      {JSON.stringify(props)}
    </div>
  );
}