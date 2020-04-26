import {createSlice} from '@reduxjs/toolkit';

export const joinGame = () => ({
  type: 'join',
  remote: true
});

interface ConnectionState {
  connecting: boolean;
  connected: boolean;
  gameId: string | undefined;
  userId: string | undefined;
}

const connectionSlice = createSlice({
  name: 'connection',
  initialState: {
    connecting: true,
    connected: false
  } as ConnectionState,
  reducers: {
    connected(state: ConnectionState) {
      state.connecting = false;
      state.connected = true;
    }
  }
});

export const {connected} = connectionSlice.actions;

export default connectionSlice.reducer;