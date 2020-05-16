import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CardType} from '../model/commonTypes';
import {BoardState, setTable} from './board';
import {TradeInfo} from '../model/TradeInfo';

export interface FeedbackState {
  lastAction: CardActionFeedback | undefined;
  trade: TradeInfo | undefined;
  playerNames: string[];
}

export interface CardActionFeedback {
  card: CardType;
  killed: boolean;
  opponentName: string;
  opponentCard?: CardType; // for priest and baron
}

interface CardActionFeedbackResponse {
  card: CardType;
  killed: boolean;
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
    },
    reportTrade(state: FeedbackState, action: PayloadAction<TradeInfo>) {
      state.trade = action.payload;
    },
    hideTradeReport(state: FeedbackState) {
      state.trade = undefined;
    }
  },
  extraReducers: builder => {
    builder.addCase(setTable, (state: FeedbackState, action: PayloadAction<BoardState>) => {
      state.playerNames = action.payload.players.map(p => p.name);
    })
  }
});

export const {showFeedback, hideFeedback, hideTradeReport} = feedback.actions;

export default feedback.reducer;