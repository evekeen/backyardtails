import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit';
import _ = require('lodash');

export interface StatusState {
  log: StatusMessage[];
  roundWinnerName: string | undefined;
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
      const log = state.log.concat([action.payload]).reverse();
      const filtered = _.uniqBy(log, m => m.type);
      state.log = filtered.reverse();
    },
    reportRoundVictory(state: StatusState, action: PayloadAction<string>) {
      state.roundWinnerName = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(victoryAcknowledgement, (state: StatusState) => {
      state.roundWinnerName = undefined;
    });
  }
});

export const {addMessage} = statusSlice.actions;

export default statusSlice.reducer;