import * as React from 'react';
import {Card} from './Card';

export interface DecksProps {

}

export const Decks = (props: DecksProps) => {
  return (
    <div className="decks">
      <div className="played_cards">
        <Card card={1}/>
        <div className="ll-card__cover"/>
      </div>
      <div className="unplayed_cards">
        <div className="ll-card__box">
          <div className="ll-card__cover">
            <img src="dist/img/cover.jpg" alt=""/>
          </div>
        </div>
      </div>
    </div>
  );
};