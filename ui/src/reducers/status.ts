import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CardType} from '../model/commonTypes';
import _ = require('lodash');

export interface StatusState {
  log: StatusMessage[];
  endOfRound: EndOfRound;
}

export interface EndOfRound {
  winnerName: string;
  cards: PlayerCard[];
}

export interface PlayerCard {
  card: CardType | undefined;
  name: string;
}

export interface StatusMessage {
  text: string;
  type: 'info' | 'turn' | 'victory' | 'death' | 'error' | undefined;
}

export const victoryAcknowledgement = createAction('status/victoryAcknowledgement', () => {
  return {meta: 'remote', payload: undefined};
});

const statusSlice = createSlice({
  name: 'status',
  initialState: {
    log: []
  } as StatusState,
  reducers: {
    addMessage(state: StatusState, action: PayloadAction<StatusMessage>) {
      const log = state.log.concat([action.payload]);
      state.log = filterMessages(log);
    },
    reportRoundVictory(state: StatusState, action: PayloadAction<EndOfRound>) {
      state.endOfRound = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(victoryAcknowledgement, (state: StatusState) => {
      state.endOfRound = undefined;
    });
  }
});

export function filterMessages(log: StatusMessage[]): StatusMessage[] {
  const unique = _.uniqBy(log.reverse(), m => m.type);
  const victoryIndex = unique.findIndex(m => m.type === 'victory');
  const infoIndex = unique.findIndex(m => m.type === 'info');
  if (infoIndex !== -1 && infoIndex < victoryIndex) {
    return unique.slice(0, victoryIndex).reverse();
  }
  return unique.reverse();
}

export const {addMessage} = statusSlice.actions;

export default statusSlice.reducer;