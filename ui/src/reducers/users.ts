import {createSlice} from '@reduxjs/toolkit';
import {User} from '../model/User';

const testState = [new User(1, 'Player 1'), new User(2, 'Player 2'), new User(3, 'Player 3'), new User(4, 'Player 4')];

const usersSlice = createSlice({
  name: 'users',
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

export default usersSlice.reducer;