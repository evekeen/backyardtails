import {PlayerIndex} from './commonTypes';

export interface Player {
  index: PlayerIndex;
  alive: boolean;
  shield: boolean;
  name: string;
  score: number;
}