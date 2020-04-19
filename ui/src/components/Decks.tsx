import * as React from 'react';

export const Decks = () => {
  return (
    <div className="deck">
      <div className="played_cards">
        <div className="ll-card__box"></div>
        <div className="ll-card__cover"></div>
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