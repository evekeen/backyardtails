import {CardIndex} from '../reducers/board';

export interface CardAction {
  card: CardIndex;
  userId: number;
}