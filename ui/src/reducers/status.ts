import { now } from 'lodash';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface StatusState {
  log: StatusMessage[];
}

export interface StatusMessage {
  text: string;
  time: number;
  closed?: boolean;
}

const statusSlice = createSlice({
  name: 'status',
  initialState: {
    log: []
  } as StatusState,
  reducers: {
    addMessage(state: StatusState, action: PayloadAction<string>) {
      state.log.unshift({text: action.payload, time: now()});
    },
    closeMessage(state: StatusState, action: PayloadAction<number>) {
      state.log.splice(action.payload, 1);
    }
  }
});

export const {addMessage, closeMessage} = statusSlice.actions;

export default statusSlice.reducer;