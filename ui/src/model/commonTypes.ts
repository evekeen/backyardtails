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