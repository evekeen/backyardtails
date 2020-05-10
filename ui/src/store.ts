import _ = require('lodash');
import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit'
import loggerMiddleware from './middleware/logger'
import reducers from './reducers'
import {WsClient} from './ws/WsClient';
import {loadState, saveState} from './localStorage';
import {AppState} from './components/App';
import {loadUrl} from './reducers/connection';
import thunk from 'redux-thunk';
import urlController from './middleware/urlController';

const prod = process.env.NODE_ENV === 'production';
const wsUrl = prod ? 'wss://ll.ivkin.dev:433/ws' : 'ws://localhost:8081';

const wsClient = new WsClient(wsUrl);

export const store = configureAppStore(loadState());

function configureAppStore(preloadedState: any) {
  const store = configureStore({
    reducer: reducers,
    middleware: [loggerMiddleware, wsClient.remoteMiddleware, urlController, thunk, ...getDefaultMiddleware()],
    preloadedState,
    enhancers: []
  });

  if (!prod && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(reducers));
  }

  // @ts-ignore
  store.dispatch(loadUrl());

  store.subscribe(_.throttle(() => {
    saveState(store.getState() as AppState);
  }, 1000));

  return store;
}