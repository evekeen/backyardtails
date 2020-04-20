import {CardIndex, HandIndex} from './board';
import {User} from '../model/User';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Player} from '../model/Player';

export interface YourTurnState {
  currentUserInTurn: boolean;
  oldCard: CardIndex | undefined;
  newCard: CardIndex | undefined;

  selectedCard: CardIndex | undefined;
  selectedPlayer: Player | undefined;
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
    },
    selectPlayer(state: YourTurnState, action: PayloadAction<Player>) {
      state.selectedPlayer = action.payload;
    },
    cancelSelection(state: YourTurnState) {
      state.selectedCard = undefined;
      state.selectedPlayer = undefined;
    },
  }
});

export const {startTurn, loadCard, selectCard, selectPlayer, cancelSelection} = yourTurnSlice.actions;

export default yourTurnSlice.reducer;