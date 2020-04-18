import {CardIndex} from '../reducers/board';
import React = require('react');

interface CardProps {
  card: CardIndex;
  onClick?: () => void;
  selected?: boolean;
}

export const Card = (props: CardProps) => {
  const selected = props.selected ? 'll-card-selected' : '';
  return (
    <div onClick={() => props.onClick && props.onClick()}>
      <div className={`ll-card__box ${selected}`}>
        <div className={`ll-card__cover`}>
          <CardImg card={props.card}/>
        </div>
      </div>
    </div>
  );
};

export const CardImg = (props: {card: CardIndex}) => {
  const name = cardNameMapping[props.card];
  return (
    <img src={getCardImg(props.card)} alt={name}/>
  );
}

function getCardImg(card: CardIndex): string {
  const name = cardNameMapping[card];
  return `dist/img/${name}.png`;
}

export const cardNameMapping = {
  1: 'guard',
  2: 'priest',
  3: 'baron',
  4: 'handmaid',
  5: 'prince',
  6: 'king',
  7: 'countess',
  8: 'princess'
}