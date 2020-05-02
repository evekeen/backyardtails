import _ = require('lodash');
import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit'
import loggerMiddleware from './middleware/logger'
import reducers from './reducers'
import {WsClient} from './WsClient';
import {loadState, saveState} from './localStorage';
import {AppState} from './components/App';
import {loadUrl} from './reducers/connection';

const prod = process.env.NODE_ENV === 'production';
const wsUrl = prod ? 'wss://ll-backend.us-east-1.elasticbeanstalk.com:8443' : 'ws://localhost:8081';

const wsClient = new WsClient(wsUrl);

export const store = configureAppStore(loadState());

function configureAppStore(preloadedState: any) {
  const store = configureStore({
    reducer: reducers,
    middleware: [loggerMiddleware, wsClient.remoteMiddleware, ...getDefaultMiddleware()],
    preloadedState,
    enhancers: []
  });

  if (!prod && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(reducers));
  }

  loadUrl(store.dispatch, store.getState);

  store.subscribe(_.throttle(() => {
    saveState(store.getState() as AppState);
  }, 1000));

  return store;
}