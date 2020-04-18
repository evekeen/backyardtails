export class Hand {
  constructor(readonly alive: boolean, readonly card: Card | undefined, readonly shield: boolean) {}
}

export function deadHand(): Hand {
  return new Hand(false, undefined, false);
}

export function hand(card: Card, shield: boolean = false): Hand {
  return new Hand(true, card, shield);
}

export class Card {
  constructor(readonly value: number) {}
}
