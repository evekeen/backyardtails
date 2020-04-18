import {Hand} from '../model/Hand';
import {Card, HandIndex} from '../reducers/board';
import * as React from 'react';

interface BoardProps {
  deckLeft: number,
  discardPileTop: Card | undefined,
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