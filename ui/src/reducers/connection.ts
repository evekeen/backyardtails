import _ = require('lodash');
import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {setTable} from './board';
import {Dispatch} from 'react';
import {AppState} from '../components/App';
import {updateUrl} from '../middleware/urlController';
import {resetTurn} from './yourTurn';

export interface ConnectionState extends MaybeGameParams {
  connecting: boolean;
  connected: boolean;
  users: MaybeJoinedUser[];
  joined: boolean;
  joining: boolean;
  name: string | undefined;
  gameNotFound: boolean;
  gamePreexisted: boolean;
  noMoreSeats: boolean;
  createdGameId: string | undefined;
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

export const setGameParams = createAction('connection/setGameParams', (params: MaybeGameParams) => {
  return {meta: 'url', payload: params};
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
  dispatch({type: 'connection/createGame', meta: 'remote', payload: {gameId, userId}});
};

export const resetGame = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const userId = getState().connection.userId!!;
  dispatch(setGameParams({gameId: undefined, userId}));
  dispatch(connectionSlice.actions.resetGameId());
};

export const maybeSetUrl = (params: MaybeGameParams) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const {gameId, userId} = getState().connection;
  if (params.userId && params.userId === userId) {
    updateUrl(params.gameId || gameId, params.userId || userId);
  }
};

export const maybeResetHand = (params: MaybeGameParams) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const {userId} = getState().connection;
  if (params.userId && params.userId === userId) {
    dispatch(resetTurn());
  }
};

export const iddqd = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const gameId = 'warandpeace';
  dispatch(resetGame());
  dispatch(forceGame({gameId, userId: getState().connection.userId}));
};

export const wsConnected = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const {gameId, userId} = getState().connection;
  dispatch(connectionSlice.actions.connected());
  dispatch(initSession(userId));
  dispatch(setGameParams({gameId, userId}));
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
  gamePreexisted: false,
  noMoreSeats: false
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
        state.name = name || state.name;
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
    gameNotFound(state: ConnectionState) {
      state.gameId = undefined;
      state.gameNotFound = true;
    },
    gamePreexisted(state: ConnectionState) {
      state.gameId = undefined;
      state.gamePreexisted = true;
    },
    noMoreSeats(state: ConnectionState) {
      state.gameId = undefined;
      state.noMoreSeats = true;
    },
    resetGameId(state: ConnectionState) {
      state.gameId = undefined;
      state.gameNotFound = false;
      state.gamePreexisted = false;
    },
    gameCreated(state: ConnectionState, action: PayloadAction<string>) {
      state.createdGameId = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(joinGame, (state: ConnectionState, action: PayloadAction<JoinParams>) => {
      state.joining = !!action.payload.name;
      Object.assign(state, action.payload);
    }).addCase(setTable, (state: ConnectionState) => {
      state.joining = false;
      state.joined = true;
    }).addCase(setGameParams, (state: ConnectionState, action: PayloadAction<MaybeGameParams>) => {
      state.gameId = action.payload.gameId;
      state.userId = action.payload.userId;
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

export const {userJoined} = connectionSlice.actions;

export default connectionSlice.reducer;