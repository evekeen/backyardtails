import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import * as _ from 'lodash';

interface StatusState {
  message: string;
}

const statusSlice = createSlice({
  name: 'status',
  initialState: {
    message: undefined
  } as StatusState,
  reducers: {
    setTable(state: StatusState, action: PayloadAction<StatusState>) {
      _.extend(state, action.payload);
    }
  }
});

export default statusSlice.reducer;