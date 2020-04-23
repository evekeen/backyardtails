import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import loggerMiddleware from './middleware/logger'
import reducers from './reducers'
import {WsClient} from './WsClient';

const wsClient = new WsClient();

export default function configureAppStore(preloadedState: any) {
  const store = configureStore({
    reducer: reducers,
    middleware: [loggerMiddleware, wsClient.remoteMiddleware, ...getDefaultMiddleware()],
    preloadedState,
    enhancers: []
  });

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(reducers));
  }

  return store;
}