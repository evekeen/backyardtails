import {CardIndex} from '../reducers/board';
import React = require('react');

interface CardProps {
  card: CardIndex;
  onClick: () => void;
}

export const Card = (props: CardProps) => {
  return (
    <div className="card" onClick={props.onClick}>
      <div className="card__box">
        <div className={`card_${props.card}`}/>
      </div>
    </div>
  );
};
