import _ = require('lodash');
import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {setTable} from './board';
import {Dispatch} from 'react';
import {AppState} from '../components/App';

export interface ConnectionState extends MaybeGameParams {
  connecting: boolean;
  connected: boolean;
  users: MaybeJoinedUser[];
  joined: boolean;
  joining: boolean;
  name: string | undefined;
  gameNotFound: boolean;
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
  return 'client-' + Math.ceil(Math.random() * 100);
}

export const loadUrl = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const gameId = urlParams.get('gameId');
  const userId = urlParams.get('userId') || generateUserId();
  rejoin(dispatch, getState, gameId, userId);
};

export const joinGame = createAction('connection/join', (params: JoinParams) => {
  return {meta: 'remote', payload: params};
});

export const openGame = createAction('connection/openGame', (params: OpenGameParams) => {
  window.history.pushState(undefined, `Love Letter ${params.gameId}`, gameUrl(params.gameId, params.userId));
  return {meta: 'remote', payload: params};
});

export const forceGame = createAction('connection/forceGame', (params: OpenGameParams) => {
  return {meta: 'remote', payload: params};
});

export const iddqd = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const gameId = 'warandpeace';
  dispatch(resetConnection());
  // @ts-ignore
  dispatch(openNewGame(gameId));
  dispatch(forceGame({gameId, userId: getState().connection.userId}));
};

export const wsConnected = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const state = getState();
  dispatch(connectionSlice.actions.connected());
  rejoin(dispatch, getState, state.connection.gameId, state.connection.userId);
};

export const openNewGame = (gameId: string) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const existingGameId = getState().connection.gameId;
  if (existingGameId !== gameId) {
    openGame({gameId});
  }
  dispatch(connectionSlice.actions.openJoinScreen(gameId));
};

function rejoin(dispatch: (value: any) => void, getState: () => AppState, gameId: string | undefined, userId: string | undefined) {
  const name = getState().connection.name;
  console.log('try to rejoin', gameId, userId, name);
  if (gameId && userId && name) {
    dispatch(joinGame({gameId, userId, name}));
  } else if (gameId && userId) {
    dispatch(openGame({gameId, userId}));
  }
}

const INITIAL_STATE = {
  connecting: true,
  connected: false,
  joining: false,
  joined: false,
  users: [],
  gameNotFound: false
} as ConnectionState;

const connectionSlice = createSlice({
  name: 'connection',
  initialState: INITIAL_STATE,
  reducers: {
    connected(state: ConnectionState) {
      state.connecting = false;
      state.connected = true;
    },
    userJoined(state: ConnectionState, action: PayloadAction<MaybeJoinedUser>) {
      if (action.payload.id === state.userId) {
        state.joined = action.payload.ready;
        state.name = state.name || action.payload.name;
        if (action.payload.ready) {
          state.joining = false;
        }
      }
      const users = (state.users ?? []).filter(u => u.id !== action.payload.id).concat(action.payload);
      state.users = _.uniqBy(users, u => u.id);
    },
    userDisconnected(state: ConnectionState, action: PayloadAction<string>) {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    openGame(state: ConnectionState, action: PayloadAction<OpenGameParams>) {
      state.gameId = action.payload.gameId;
      state.userId = action.payload.userId;
      state.name = undefined;
    },
    setUserId(state: ConnectionState, action: PayloadAction<string>) {
      state.userId = action.payload;
    },
    gameNotFound() {
      return {...INITIAL_STATE, gameNotFound: true};
    },
    resetConnection() {
      return {...INITIAL_STATE};
    },
    openJoinScreen(state: ConnectionState, action: PayloadAction<string>) {
      state.gameId = action.payload;
      state.userId = state.userId || generateUserId();
    }
  },
  extraReducers: builder => {
    builder.addCase(joinGame, (state: ConnectionState, action: PayloadAction<JoinParams>) => {
      state.joining = true;
      state.name = action.payload.name;
      Object.assign(state, action.payload);
    }).addCase(setTable, (state: ConnectionState) => {
      state.joining = false;
      state.joined = true;
    });
  }
});

const prod = process.env.NODE_ENV === 'production';
const baseUrl = prod ? 'http://llfront.s3-website-us-east-1.amazonaws.com' : 'http://localhost:8080';

export const gameUrl = (gameId?: string, userId?: string) => {
  if (!gameId) return baseUrl;
  const url = `${baseUrl}?gameId=${gameId}`;
  return userId ? `${url}&userId=${userId}` : url;
}

export const {resetConnection} = connectionSlice.actions;

export default connectionSlice.reducer;