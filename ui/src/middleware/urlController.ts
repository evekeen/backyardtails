import {Store} from 'redux';
import {gameUrl} from '../reducers/connection';

export default (store: Store<any, any>) => (next: any) => (action: any) => {
  if (action.meta === 'url') {
    const {gameId, userId} = action.payload;
    updateUrl(gameId, userId);
  }

  return next(action);
}

export function updateUrl(gameId: string | undefined, userId: string) {
  window.history.pushState(undefined, `Love Letter ${gameId}`, gameUrl(gameId, userId));
}