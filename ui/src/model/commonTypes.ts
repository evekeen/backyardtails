export type PlayerIndex = 0 | 1 | 2 | 3;

export enum CardType {
  Guard = 1,
  Priest = 2,
  Baron = 3,
  Handmaid = 4,
  Prince = 5,
  King = 6,
  Countess = 7,
  Princess = 8
}

export function needPlayerSelected(card: CardType): boolean {
  return NO_PLAYER_CARDS.indexOf(card) === -1;
}

const NO_PLAYER_CARDS = [CardType.Handmaid, CardType.Countess, CardType.Princess];

export const cardNameMapping = {
  [CardType.Guard]: 'Guard',
  [CardType.Priest]: 'Priest',
  [CardType.Baron]: 'Baron',
  [CardType.Handmaid]: 'Handmaid',
  [CardType.Prince]: 'Prince',
  [CardType.King]: 'King',
  [CardType.Countess]: 'Countess',
  [CardType.Princess]: 'Princess'
}

export const cardDescriptionMapping = {
  [CardType.Guard]: 'Player designates another player and names a type of card. If the guess is right, that player is eliminated from the round.',
  [CardType.Priest]: 'Player is allowed to see another player\'s hand.',
  [CardType.Baron]: 'Player will choose another player and privately compare hands. The player with the lower-strength hand is eliminated from the round.',
  [CardType.Handmaid]: 'Player cannot be affected by any other player\'s card until the next turn.',
  [CardType.Prince]: 'Player can choose any player (including themselves) to discard their hand and draw a new one. If the discarded card is the Princess, the discarding player is eliminated.',
  [CardType.King]: 'Player trades hands with any other player.',
  [CardType.Countess]: 'If a player holds both this card and either the King or Prince card, this card must be played immediately.',
  [CardType.Princess]: 'If a player plays this card for any reason, they are eliminated from the round.'
}