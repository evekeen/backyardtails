import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Player} from '../model/Player';
import * as _ from 'lodash';
import {startTurn, selectPlayer, cancelSelection} from './yourTurn';
import {CardType, PlayerIndex} from '../model/commonTypes';

export interface BoardState {
  deckLeft: number;
  discardPileTop: CardType | undefined;
  players: Player[];
  turnIndex: PlayerIndex | undefined;
  currentPlayerInTurn?: boolean;
  currentPlayerIndex: PlayerIndex | undefined;
  selectedPlayerIndex: PlayerIndex | undefined;
}

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    deckLeft: 0,
    players: [],
    turnIndex: undefined,
    currentPlayerIndex: undefined,
    currentPlayerInTurn: false,
  } as BoardState,
  reducers: {
    setTable(state: BoardState, action: PayloadAction<BoardState>) {
      _.extend(state, action.payload, {
        currentPlayerInTurn: isCurrentPlayerInTurn(action.payload)
      });
    },
    setCurrentPlayer(state: BoardState, action: PayloadAction<PlayerIndex>) {
      state.currentPlayerIndex = action.payload;
    },
    setPlayerInTurn(state: BoardState, action: PayloadAction<PlayerIndex>) {
      state.turnIndex = action.payload;
      state.currentPlayerInTurn = isCurrentPlayerInTurn(state);
    }
  },
  extraReducers: builder => {
    builder.addCase(startTurn, (state: BoardState) => {
      state.turnIndex = state.currentPlayerIndex;
      state.currentPlayerInTurn = true;
    }).addCase(selectPlayer, (state: BoardState, action: PayloadAction<Player>) => {
      state.selectedPlayerIndex = action.payload.index;
    }).addCase(cancelSelection, (state: BoardState) => {
      state.selectedPlayerIndex = undefined;
    });
  }
});

function isCurrentPlayerInTurn(state: { turnIndex: PlayerIndex | undefined; currentPlayerIndex: PlayerIndex | undefined}) {
  return !!state.turnIndex && state.turnIndex === state.currentPlayerIndex;
}

export const {setTable, setPlayerInTurn} = boardSlice.actions;

export default boardSlice.reducer;