import {CardIndex} from '../reducers/board';
import React = require('react');

interface CardProps {
  card: CardIndex;
  onClick: () => void;
}

export const Card = (props: CardProps) => {
  return (
    <div className="ll-card" onClick={props.onClick}>
      <div className="ll-card__box">
        <div className={`ll-card ll-card_${props.card}`}/>
      </div>
    </div>
  );
};
