import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Player} from '../model/Player';
import * as _ from 'lodash';
import { startTurn, selectPlayer, cancelSelection} from './yourTurn';

export type HandIndex = 1 | 2 | 3 | 4;
export type CardIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface BoardState {
  deckLeft: number;
  discardPileTop: CardIndex | undefined;
  players: Player[];
  activeIndex: HandIndex;
  currentUserInTurn: boolean;
  selectedPlayerIndex: HandIndex | undefined;
}

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    deckLeft: 0,
    players: [],
    activeIndex: 1,
    currentUserInTurn: false,
  } as BoardState,
  reducers: {
    setTable(state: BoardState, action: PayloadAction<BoardState>) {
      _.extend(state, action.payload);
    },
    updateCurrentUser(state: BoardState, action: PayloadAction<HandIndex>) {
      state.activeIndex = action.payload;
      state.currentUserInTurn = state.activeIndex === 1;
    }
  },
  extraReducers: builder => {
    builder.addCase(startTurn, (state: BoardState) => {
      state.activeIndex = 1;
      state.currentUserInTurn = true;
    }).addCase(selectPlayer, (state: BoardState, action: PayloadAction<Player>) => {
      state.selectedPlayerIndex = action.payload.index;
    }).addCase(cancelSelection, (state: BoardState) => {
      state.selectedPlayerIndex = undefined;
    });
  }
});

export const {setTable, updateCurrentUser} = boardSlice.actions;

export default boardSlice.reducer;