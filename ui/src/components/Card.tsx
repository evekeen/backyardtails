import {cardDescriptionMapping, cardNameMapping, CardType} from '../model/commonTypes';
import React = require('react');

interface CardProps {
  card?: CardType;
  blink?: boolean;
  onClick?: () => void;
  selected?: boolean;
  showDescription?: boolean;
}

export const Card = (props: CardProps) => {
  const selectedClass = props.selected ? 'll-card-selected' : '';
  const blinkClass = props.blink ? 'blink' : '';
  const showDescription = props.showDescription !== false;
  return (
    <div className={`ll-card`} onClick={() => props.onClick && props.onClick()}>
      <div className={`ll-card__box ${selectedClass} ${blinkClass}`}>
        <div className={`ll-card__cover`}>
          <CardImg card={props.card} showDescription={showDescription}/>
        </div>
      </div>
    </div>
  );
};

interface CardImgProps {
  card?: CardType;
  showDescription: boolean;
}

const CardImg = (props: CardImgProps) => {
  if (!props.card) {
    return (
      <img src='img/cover.jpg' alt='card cover'/>
    )
  }
  const name = cardNameMapping[props.card];
  return (
    <>
      <img src={getCardImg(props.card)} alt={name}/>
      {props.showDescription && <CardDescription card={props.card} visible={true}/>}
    </>
  );
}

interface CardDescriptionProps {
  card: CardType;
  visible: boolean;
}

const CardDescription = (props: CardDescriptionProps) => {
  const name = cardNameMapping[props.card];
  const description = cardDescriptionMapping[props.card];
  return (
    <div className="description-box">
      <h4>{name}</h4>
      <p>{description}</p>
    </div>
  );
}

function getCardImg(card: CardType): string {
  const name = cardNameMapping[card].toLowerCase();
  return `img/${name}.png`;
}