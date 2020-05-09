import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import _ = require('lodash');

export interface StatusState {
  log: StatusMessage[];
}

export interface StatusMessage {
  text: string;
  type: 'info' | 'victory' | 'death' | 'error' | undefined;
}

const statusSlice = createSlice({
  name: 'status',
  initialState: {
    log: []
  } as StatusState,
  reducers: {
    addMessage(state: StatusState, action: PayloadAction<StatusMessage>) {
      state.log = _.takeRight(state.log.concat([action.payload]), 3);
    }
  }
});

export const {addMessage} = statusSlice.actions;

export default statusSlice.reducer;