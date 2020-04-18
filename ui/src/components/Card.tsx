import {CardIndex} from '../reducers/board';
import React = require('react');

interface CardProps {
  card: CardIndex;
  onClick: () => void;
}

export const Card = (props: CardProps) => {
  const name = `${cardNameMapping[props.card]}`;
  const src = `dist/img/${name}.png`;
  return (
    <div onClick={props.onClick}>
      <div className="ll-card__box">
        <div className={`ll-card__cover`}>
          <img src={src} alt={name}/>
        </div>
      </div>
    </div>
  );
};

const cardNameMapping = {
  1: 'gard',
  2: 'priest',
  3: 'baron',
  4: 'handmaid',
  5: 'prince',
  6: 'king',
  7: 'countess',
  8: 'princess'
}