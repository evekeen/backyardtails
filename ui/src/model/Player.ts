import {HandIndex} from './commonTypes';

export interface Player {
  index: HandIndex;
  alive: boolean;
  shield: boolean;
  name: string;
  score: number;
}