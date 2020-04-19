import {HandIndex} from '../reducers/board';

export interface Player {
  index: HandIndex;
  alive: boolean;
  shield: boolean;
  name: string;
  score: number;
}