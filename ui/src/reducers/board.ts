import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Player} from '../model/Player';
import * as _ from 'lodash';
import {startTurn, selectPlayer, cancelSelection} from './yourTurn';
import {CardType, PlayerIndex} from '../model/commonTypes';
import {submitAction} from './cardActions';

export interface BoardState extends ActivePlayerContext {
  deckLeft: number;
  discardPileTop: CardType | undefined;
  players: Player[];
  currentPlayerInTurn?: boolean;
  selectedPlayerIndex: PlayerIndex | undefined;
}

interface ActivePlayerContext {
  turnIndex: PlayerIndex | undefined;
  currentPlayerIndex: PlayerIndex | undefined
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
    }).addCase(submitAction, (state: BoardState) => {
      state.currentPlayerInTurn = false;
    });
  }
});

function isCurrentPlayerInTurn(state: ActivePlayerContext) {
  return state.turnIndex !== undefined && state.turnIndex === state.currentPlayerIndex;
}

export const {setTable, setPlayerInTurn} = boardSlice.actions;

export default boardSlice.reducer;