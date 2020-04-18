import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CardAction} from '../model/CardAction';

const cardActions = createSlice({
  name: 'cardActions',
  initialState: [] as CardAction[],
  reducers: {
    submitAction(state: CardAction[], action: PayloadAction<CardAction>) {
      state.push(action.payload);
      console.log('Sending action through WS: ' + JSON.stringify(action));
    },
    loadAction(state: CardAction[], action: PayloadAction<CardAction>) {
      state.push(action.payload);
      console.log('Loaded action from the server: ' + JSON.stringify(action));
    }
  }
});

export const {submitAction, loadAction} = cardActions.actions;

export default cardActions.reducer;