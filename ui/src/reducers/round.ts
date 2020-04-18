import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Card, hand, Hand} from '../model/Hand';
import {initialHands, shuffleDeck} from '../model/Deck';

type HandIndex = 1 | 2 | 3 | 4;

interface RoundState {
  deck: Card[],
  discardPile: Card[],
  hands: Hand[],
  activeHand: {
    index: HandIndex,
    newCard: Card
  }
}

const roundSlice = createSlice({
  name: 'round',
  initialState: {
    deck: [],
    discardPile: [],
    hands: [],
    activeHand: {
      index: 4,
      newCard: undefined
    }
  },
  reducers: {
    initRound(state: RoundState, action: PayloadAction<number>) {
      const initialDeck = shuffleDeck(action.payload);
      const {deck, hands} = initialHands(initialDeck);
      state.deck = deck;
      state.discardPile = [];
      state.hands = hands.map(card => hand(card));
      state.activeHand = {
        index: 4,
        newCard: undefined
      }
    },
    nextTurn(state: RoundState) {
      const currentIndex = state.activeHand.index;
      const index = currentIndex === 4 ? 1 : currentIndex + 1 as HandIndex;
      const newCard = state.deck.shift();
      state.activeHand = {
        index,
        newCard
      };
    },
  }
});

export default roundSlice.reducer;