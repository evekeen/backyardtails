import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Hand} from '../model/Hand';
import * as _ from 'lodash';

export type HandIndex = 1 | 2 | 3 | 4;
export type Card = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface BoardState {
  deckLeft: number,
  discardPileTop: Card | undefined,
  hands: Hand[],
  active: HandIndex
}

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    deckLeft: 0,
    discardPileTop: undefined,
    hands: [],
    active: 1
  } as BoardState,
  reducers: {
    setTable(state: BoardState, action: PayloadAction<BoardState>) {
      _.extend(state, action.payload);
    }
  }
});

export const {setTable} = boardSlice.actions;

export default boardSlice.reducer;