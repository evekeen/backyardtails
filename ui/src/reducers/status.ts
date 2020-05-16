import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import _ = require('lodash');

export interface StatusState {
  log: StatusMessage[];
  roundWinnerName: string | undefined;
}

export interface StatusMessage {
  text: string;
  type: 'info' | 'turn' | 'victory' | 'death' | 'error' | undefined;
}

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
    },
    discardVictoryReport(state: StatusState) {
      state.roundWinnerName = undefined;
    },
  }
});

export const {addMessage, discardVictoryReport} = statusSlice.actions;

export default statusSlice.reducer;