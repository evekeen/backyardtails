import _ = require('lodash');
import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BoardState, setTable} from './board';

export interface ConnectionState extends GameParams{
  connecting: boolean;
  connected: boolean;
  users: User[];
  joined: boolean;
  joining: boolean;
}

export interface User {
  id: string;
  name: string;
}

export interface GameParams {
  gameId: string | undefined;
  userId: string | undefined;
}

export const loadUrl = createAction('loadUrl', () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const gameId = urlParams.get('gameId');
  const userId = urlParams.get('userId');

  return {
    type: 'loadUrl',
    payload: {gameId, userId}
  };
});

export const joinGame = createAction('connection/join', (params: GameParams) => {
  return {meta: 'remote', payload: params};
});

const connectionSlice = createSlice({
  name: 'connection',
  initialState: {
    connecting: true,
    connected: false,
    joining: false,
    joined: false,
    users: []
  } as ConnectionState,
  reducers: {
    connected(state: ConnectionState) {
      state.connecting = false;
      state.connected = true;
    },
    userJoined(state: ConnectionState, action: PayloadAction<User>) {
      state.joined = true;
      const users = state.users.concat(action.payload);
      state.users = _.uniqBy(users, u => u.id);
    },
    userDisconnected(state: ConnectionState, action: PayloadAction<string>) {
      state.users.splice(state.users.findIndex(user => user.id === action.payload), 1);
    },
    openGame(state: ConnectionState, action: PayloadAction<string>) {
      state.gameId = action.payload;
      window.history.pushState(undefined, `Love Letter ${action.payload}`, gameUrl(action.payload));
    }
  },
  extraReducers: builder => {
    builder.addCase(loadUrl, (state: ConnectionState, action: PayloadAction<GameParams>) => {
      Object.assign(state, action.payload);
    }).addCase(joinGame, (state: ConnectionState, action: PayloadAction<GameParams>) => {
      state.joining = true;
      Object.assign(state, action.payload);
    }).addCase(setTable, (state: ConnectionState, action: PayloadAction<BoardState>) => {
      state.joining = false;
      state.joined = true;
    });
  }
});

const prod = process.env.NODE_ENV === 'production';
const baseUrl = prod ? 'http://llfront.s3-website-us-east-1.amazonaws.com' : 'http://localhost:8080';

export const gameUrl = (gameId: string) => `${baseUrl}?gameId=${gameId}`;

export const {connected, openGame} = connectionSlice.actions;

export default connectionSlice.reducer;