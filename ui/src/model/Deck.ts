import {Card} from './Hand';
import * as _ from 'lodash';

const deck = [
  1, 1, 1, 1, 1,
  2, 2,
  3, 3,
  4, 4,
  5, 5,
  6,
  7,
  8
];

//TODO support seed
export function shuffleDeck(seed: number): Card[] {
  return _.shuffle(deck).map(v => new Card(v));
}

export function initialHands(deck: Card[]): InitialHands {
  const hands = [];
  for (let i = 0; i < 4; i++) {
    hands.unshift(deck.shift());
  }
  return {deck, hands};
}

interface InitialHands {
  deck: Card[],
  hands: Card[]
}