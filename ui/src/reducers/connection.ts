import _ = require('lodash');
import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {setTable} from './board';

export interface ConnectionState extends MaybeGameParams {
  connecting: boolean;
  connected: boolean;
  users: MaybeJoinedUser[];
  joined: boolean;
  joining: boolean;
}

export interface User {
  id: string;
  name: string;
}

export interface MaybeJoinedUser {
  id: string;
  name: string | undefined;
  ready: boolean;
}

export interface MaybeGameParams {
  gameId: string | undefined;
  userId: string | undefined;
}

export interface GameParams {
  gameId: string;
  userId: string;
}

export interface OpenGameParams {
  gameId: string;
  userId?: string;
}

export interface JoinParams extends GameParams {
  name: string;
}

function generateUserId(): string {
  return "client-" + Math.ceil(Math.random() * 100);
}

export const loadUrl = createAction('loadUrl', () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const gameId = urlParams.get('gameId');
  const userId = urlParams.get('userId') || generateUserId();
  setUserId(userId);
  return {
    type: 'loadUrl',
    payload: {gameId, userId}
  };
});

export const joinGame = createAction('connection/join', (params: JoinParams) => {
  return {meta: 'remote', payload: params};
});

export const openGame = createAction('connection/openGame', (params: OpenGameParams) => {
  window.history.pushState(undefined, `Love Letter ${params.gameId}`, gameUrl(params.gameId, params.userId));
  return {meta: 'remote', payload: params};
})

export const openJoinScreen = createAction('connection/openJoinScreen', (gameId: string) => {
  openGame({gameId});
  return {payload: gameId};
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
    userJoined(state: ConnectionState, action: PayloadAction<MaybeJoinedUser>) {
      if (action.payload.id === state.userId) {
        state.joined = action.payload.ready;
        if (action.payload.ready) {
          state.joining = false;
        }
      }
      const users = state.users.filter(u => u.id !== action.payload.id).concat(action.payload);
      state.users = _.uniqBy(users, u => u.id);
    },
    userDisconnected(state: ConnectionState, action: PayloadAction<string>) {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    openGame(state: ConnectionState, action: PayloadAction<OpenGameParams>) {
      state.gameId = action.payload.gameId;
      state.userId = action.payload.userId;
    },
    setUserId(state: ConnectionState, action: PayloadAction<string>) {
      state.userId = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(loadUrl, (state: ConnectionState, action: PayloadAction<MaybeGameParams>) => {
      Object.assign(state, action.payload);
    }).addCase(openJoinScreen, (state: ConnectionState, action: PayloadAction<string>) => {
      state.gameId = action.payload;
    }).addCase(openGame, (state: ConnectionState, action: PayloadAction<OpenGameParams>) => {
      Object.assign(state, action.payload);
    }).addCase(joinGame, (state: ConnectionState, action: PayloadAction<JoinParams>) => {
      state.joining = true;
      Object.assign(state, action.payload);
    }).addCase(setTable, (state: ConnectionState) => {
      state.joining = false;
      state.joined = true;
    });
  }
});

const prod = process.env.NODE_ENV === 'production';
const baseUrl = prod ? 'http://llfront.s3-website-us-east-1.amazonaws.com' : 'http://localhost:8080';

export const gameUrl = (gameId: string, userId?: string) => {
  const url = `${baseUrl}?gameId=${gameId}`;
  return userId ? `${url}&userId=${userId}` : url;
}

export const {connected, setUserId} = connectionSlice.actions;

export default connectionSlice.reducer;