import {createSlice} from '@reduxjs/toolkit';
import {Player} from '../model/Player';

const testState = [new Player(1, 'Player 1'), new Player(2, 'Player 2'), new Player(3, 'Player 3'), new Player(4, 'Player 4')];

const playersSlice = createSlice({
  name: 'players',
  initialState: [],
  reducers: {
    addPlayer(state, action) {
      state.push(action.payload);
    },
    removePlayer(state, action) {
      state.splice(state.findIndex(player => player.id === action.payload), 1);
    }
  }
});

export default playersSlice.reducer;