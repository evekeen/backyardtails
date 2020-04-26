import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import loggerMiddleware from './middleware/logger'
import reducers from './reducers'
import {WsClient} from './WsClient';

const prod = process.env.NODE_ENV === 'production';
const url = prod ? 'ws://loveletter-dev.us-west-2.elasticbeanstalk.com:8999' : 'ws://localhost:8999';

const wsClient = new WsClient(url);

export default function configureAppStore(preloadedState: any) {
  const store = configureStore({
    reducer: reducers,
    middleware: [loggerMiddleware, wsClient.remoteMiddleware, ...getDefaultMiddleware()],
    preloadedState,
    enhancers: []
  });

  if (!prod && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(reducers));
  }

  return store;
}