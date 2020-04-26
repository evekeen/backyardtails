import {CardType} from '../model/commonTypes';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Player} from '../model/Player';
import {BoardState} from './board';
import {submitAction} from './cardActions';
import {CardAction} from '../model/CardAction';

export interface YourTurnState {
  currentPlayerInTurn: boolean;
  oldCard: CardType | undefined;
  newCard: CardType | undefined;

  selectedCard: CardType | undefined;
  selectedPlayer: Player | undefined;
}

export interface TurnData {
  card: CardType | undefined;
}

const yourTurnSlice = createSlice({
  name: 'yourTurn',
  initialState: {
    currentPlayerInTurn: false
  } as YourTurnState,
  reducers: {
    startTurn(state: YourTurnState, action: PayloadAction<TurnData>) {
      state.currentPlayerInTurn = true;
      state.newCard = action.payload.card;
    },
    loadCard(state: YourTurnState, action: PayloadAction<TurnData>) {
      state.oldCard = action.payload.card;
    },
    selectCard(state: YourTurnState, action: PayloadAction<CardType>) {
      state.selectedCard = action.payload;
    },
    selectPlayer(state: YourTurnState, action: PayloadAction<Player>) {
      state.selectedPlayer = action.payload;
    },
    cancelSelection(state: YourTurnState) {
      state.selectedCard = undefined;
      state.selectedPlayer = undefined;
    },
  },
  extraReducers: builder => {
    builder.addCase(submitAction, (state: YourTurnState, action: PayloadAction<CardAction>) => {
      state.oldCard = action.payload.card === state.oldCard ? state.newCard : state.oldCard;
      state.newCard = undefined;
      state.currentPlayerInTurn = false;
    });
  }
});

export const {startTurn, loadCard, selectCard, selectPlayer, cancelSelection} = yourTurnSlice.actions;

export default yourTurnSlice.reducer;