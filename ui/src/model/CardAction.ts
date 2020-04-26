import {CardType, PlayerIndex} from './commonTypes';

export interface CardAction {
  card: CardType;
  playerIndex?: PlayerIndex;
}