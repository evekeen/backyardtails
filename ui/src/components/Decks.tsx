import * as React from 'react';
import {Card} from './Card';
import {CardIndex} from '../reducers/board';

export interface DecksProps {
  deckLeft: number;
  discardPileTop: CardIndex | undefined;
}

export const Decks = (props: DecksProps) => {
  return (
    <div className="decks">
      <div className="played_cards">
        <Card card={props.discardPileTop}/>
        <div className="ll-card__cover"/>
      </div>
      <div className="unplayed_cards">
        {props.deckLeft > 0 ? (<Card/>) : []}
      </div>
    </div>
  );
};