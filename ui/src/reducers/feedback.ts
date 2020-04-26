import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CardType} from '../model/commonTypes';

interface FeedbackState {
  lastAction: CardActionFeedback | undefined;
}

interface CardActionFeedback {
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
    }
  }
});

export const {showFeedback} = feedback.actions;

export default feedback.reducer;