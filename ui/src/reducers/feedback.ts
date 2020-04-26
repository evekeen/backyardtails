import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CardType} from '../model/commonTypes';

export interface FeedbackState {
  lastAction: CardActionFeedback | undefined;
}

export interface CardActionFeedback {
  card: CardType;
  success: boolean;
  playerCard?: CardType; // for priest and baron
}

const feedback = createSlice({
  name: 'feedback',
  initialState: {} as FeedbackState,
  reducers: {
    showFeedback(state: FeedbackState, action: PayloadAction<CardActionFeedback>) {
      state.lastAction = action.payload;
    },
    hideFeedback(state: FeedbackState) {
      state.lastAction = undefined;
    },
  }
});

export const {showFeedback, hideFeedback} = feedback.actions;

export default feedback.reducer;