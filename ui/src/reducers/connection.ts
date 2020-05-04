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
  gamePreexisted: boolean;
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

export interface UserJoined {
  gameId: string;
  userId: string;
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

export const joinGame = createAction('connection/join', (params: JoinParams) => {
  return {meta: 'remote', payload: params};
});

export const initSession = createAction('connection/initSession', (userId: string) => {
  return {meta: 'remote', payload: userId};
});

export const forceGame = createAction('connection/forceGame', (params: OpenGameParams) => {
  return {meta: 'remote', payload: params};
});

export const loadUrl = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const gameId = urlParams.get('gameId');
  const userId = urlParams.get('userId') || generateUserId();
  dispatch(setGameParams({gameId, userId}));
  dispatch(rejoin({gameId, userId}));
};

export const createGame = (gameId: string) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const userId = getState().connection.userId!!;
  window.history.pushState(undefined, `Love Letter ${gameId}`, gameUrl(gameId, userId));
  dispatch({type: 'connection/createGame', meta: 'remote', payload: {gameId, userId}});
};

export const iddqd = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const gameId = 'warandpeace';
  dispatch(resetGameId());
  dispatch(forceGame({gameId, userId: getState().connection.userId}));
};

export const wsConnected = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const {gameId, userId} = getState().connection;
  dispatch(connectionSlice.actions.connected());
  dispatch(initSession(userId));
  dispatch(connectionSlice.actions.setGameParams({gameId, userId}));
  dispatch(rejoin({gameId, userId}));
};

const rejoin = (params: MaybeGameParams) => (dispatch: (value: any) => void, getState: () => AppState) => {
  if (!params.gameId) {
    console.log('no gameId');
    return;
  }
  if (!params.userId) {
    console.log('no userId');
    return;
  }
  const name = getState().connection.name;
  console.log('try to rejoin', params, name);
  dispatch(joinGame({...params, name}));
};

const INITIAL_STATE = {
  connecting: true,
  connected: false,
  joining: false,
  joined: false,
  users: [],
  gameNotFound: false,
  gamePreexisted: false
} as ConnectionState;

const connectionSlice = createSlice({
  name: 'connection',
  initialState: INITIAL_STATE,
  reducers: {
    connected(state: ConnectionState) {
      state.connecting = false;
      state.connected = true;
    },
    userJoined(state: ConnectionState, action: PayloadAction<UserJoined>) {
      const {userId, gameId, name, ready} = action.payload;
      if (userId === state.userId) {
        state.gameId = gameId;
        state.joined = ready;
        state.name = state.name || name;
        if (ready) {
          state.joining = false;
        }
      }
      const users = (state.users ?? []).filter(u => u.id !== userId)
        .concat({id: userId, name, ready});
      state.users = _.uniqBy(users, u => u.id);
    },
    userDisconnected(state: ConnectionState, action: PayloadAction<string>) {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    setGameParams(state: ConnectionState, action: PayloadAction<GameParams>) {
      state.gameId = action.payload.gameId;
      state.userId = action.payload.userId;
    },
    gameNotFound(state: ConnectionState) {
      state.gameId = undefined;
      state.gameNotFound = true;
    },
    gamePreexisted(state: ConnectionState) {
      state.gameId = undefined;
      state.gamePreexisted = true;
    },
    resetGameId(state: ConnectionState) {
      state.gameId = undefined;
    },
    gameCreated(state: ConnectionState, action: PayloadAction<string>) {
      state.gameId = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(joinGame, (state: ConnectionState, action: PayloadAction<JoinParams>) => {
      state.joining = !!action.payload.name;
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

export const {resetGameId, setGameParams} = connectionSlice.actions;

export default connectionSlice.reducer;