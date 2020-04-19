import {CardIndex} from '../reducers/board';
import React = require('react');

interface CardProps {
  card?: CardIndex;
  onClick?: () => void;
  selected?: boolean;
}

export const Card = (props: CardProps) => {
  const selected = props.selected ? 'll-card-selected' : '';
  return (
    <div className="ll-card" onClick={() => props.onClick && props.onClick()}>
      <div className={`ll-card__box ${selected}`}>
        <div className={`ll-card__cover`}>
          <CardImg card={props.card}/>
        </div>
      </div>
    </div>
  );
};

export const CardImg = (props: { card?: CardIndex }) => {
  if (!props.card) {
    return (
      <img src='dist/img/cover.jpg' alt='card cover'/>
    )
  }
  const name = cardNameMapping[props.card];
  return (
    <>
      <img src={getCardImg(props.card)} alt={name}/>
      <CardDescription card={props.card} visible={true}/>
    </>
  );
}

interface CardDescriptionProps {
  card: CardIndex;
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

function getCardImg(card: CardIndex): string {
  const name = cardNameMapping[card];
  return `dist/img/${name}.png`;
}

export const cardNameMapping = {
  1: 'Guard',
  2: 'Priest',
  3: 'Baron',
  4: 'Handmaid',
  5: 'Prince',
  6: 'King',
  7: 'Countess',
  8: 'Princess'
}

const cardDescriptionMapping = {
  1: 'Player designates another player and names a type of card. If the guess is right, that player is eliminated from the round.',
  2: 'Player is allowed to see another player\'s hand.',
  3: 'Player will choose another player and privately compare hands. The player with the lower-strength hand is eliminated from the round.',
  4: 'Player cannot be affected by any other player\'s card until the next turn.',
  5: 'Player can choose any player (including themselves) to discard their hand and draw a new one. If the discarded card is the Princess, the discarding player is eliminated.',
  6: 'Player trades hands with any other player.',
  7: 'If a player holds both this card and either the King or Prince card, this card must be played immediately.',
  8: 'If a player plays this card for any reason, they are eliminated from the round.'
}