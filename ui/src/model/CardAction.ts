import {CardType} from '../reducers/board';
import {Player} from './Player';

export interface CardAction {
  card: CardType;
  player: Player;
}