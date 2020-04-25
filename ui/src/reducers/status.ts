import { now } from 'lodash';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface StatusState {
  log: StatusMessage[];
}

export interface StatusMessage {
  text: string;
  time: number;
}

const statusSlice = createSlice({
  name: 'status',
  initialState: {
    log: []
  } as StatusState,
  reducers: {
    addMessage(state: StatusState, action: PayloadAction<string>) {
      state.log.unshift({text: action.payload, time: now()});
    }
  }
});

export const {addMessage} = statusSlice.actions;

export default statusSlice.reducer;