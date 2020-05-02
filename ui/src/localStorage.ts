import {AppState} from './components/App';

const prod = process.env.NODE_ENV === 'production';
const storage = prod ? localStorage : sessionStorage;

export function loadState(): SavedState | undefined {
  try {
    const serializedState = storage.getItem('love-letter');
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

export const saveState = (state: AppState) => {
  try {
    const toSave: SavedState = {
      connection: {
        name: state.connection.name
      }
    };
    const serializedState = JSON.stringify(toSave);
    storage.setItem('love-letter', serializedState);
  } catch (err) {
    console.log(err);
  }
};

export interface SavedState {
  connection: {
    name: string | undefined;
  }
}