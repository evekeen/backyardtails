import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CardType} from '../model/commonTypes';
import {BoardState, setTable} from './board';

export interface FeedbackState {
  lastAction: CardActionFeedback | undefined;
  playerNames: string[];
}

export interface CardActionFeedback {
  card: CardType;
  success: boolean;
  opponentName: string;
  opponentCard?: CardType; // for priest and baron
}

interface CardActionFeedbackResponse {
  card: CardType;
  success: boolean;
  opponentIndex: number;
  opponentCard?: CardType;
}

const feedback = createSlice({
  name: 'feedback',
  initialState: {
    playerNames: []
  } as FeedbackState,
  reducers: {
    showFeedback(state: FeedbackState, action: PayloadAction<CardActionFeedbackResponse>) {
      const opponentName = state.playerNames[action.payload.opponentIndex];
      state.lastAction = {...action.payload, opponentName};
    },
    hideFeedback(state: FeedbackState) {
      state.lastAction = undefined;
    }
  },
  extraReducers: builder => {
    builder.addCase(setTable, (state: FeedbackState, action: PayloadAction<BoardState>) => {
      state.playerNames = action.payload.players.map(p => p.name);
    })
  }
});

export const {showFeedback, hideFeedback} = feedback.actions;

export default feedback.reducer;