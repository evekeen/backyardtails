import {CardIndex} from '../reducers/board';
import {Player} from './Player';

export interface CardAction {
  card: CardIndex;
  player: Player;
}