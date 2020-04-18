import {CardIndex} from '../reducers/board';
import React = require('react');

interface CardProps {
  card: CardIndex;
  onClick: () => void;
  selected: boolean;
}

export const Card = (props: CardProps) => {
  const name = `${cardNameMapping[props.card]}`;
  const src = `dist/img/${name}.png`;
  const selected = props.selected ? 'll-card-selected' : '';
  return (
    <div onClick={props.onClick}>
      <div className={`ll-card__box ${selected}`}>
        <div className={`ll-card__cover`}>
          <img src={src} alt={name}/>
        </div>
      </div>
    </div>
  );
};

const cardNameMapping = {
  1: 'guard',
  2: 'priest',
  3: 'baron',
  4: 'handmaid',
  5: 'prince',
  6: 'king',
  7: 'countess',
  8: 'princess'
}