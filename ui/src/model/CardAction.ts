import {CardType} from './commonTypes';
import {Player} from './Player';

export interface CardAction {
  card: CardType;
  player: Player;
}