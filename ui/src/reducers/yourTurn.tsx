import {CardIndex} from './board';
import {User} from '../model/User';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface YourTurnState {
  currentUserInTurn: boolean;
  oldCard: CardIndex | undefined;
  newCard: CardIndex | undefined;

  selectedCard: CardIndex | undefined;
  selectedUser: User | undefined;
}

export interface TurnData {
  card: CardIndex | undefined;
}

const yourTurnSlice = createSlice({
  name: 'yourTurn',
  initialState: {
    currentUserInTurn: false
  } as YourTurnState,
  reducers: {
    startTurn(state: YourTurnState, action: PayloadAction<TurnData>) {
      state.currentUserInTurn = true;
      state.newCard = action.payload.card;
    },
    loadCard(state: YourTurnState, action: PayloadAction<TurnData>) {
      state.oldCard = action.payload.card;
    },
    selectCard(state: YourTurnState, action: PayloadAction<CardIndex>) {
      state.selectedCard = action.payload;
    }
  }
});

export const {startTurn, selectCard, loadCard} = yourTurnSlice.actions;

export default yourTurnSlice.reducer;