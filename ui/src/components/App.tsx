import * as React from 'react';
import {User} from '../model/User';
import {BoardState} from '../reducers/board';
import {CardAction} from '../model/CardAction';
import {StatusState} from '../reducers/status';
import {YourTurnState} from '../reducers/yourTurn';
import {FeedbackState} from '../reducers/feedback';
import DebugPanel from './DebugPanel';
import ManagedBoard from '../containers/ManagedBoard';
import PlayerHandContainer from '../containers/PlayerHandContainer';
import ManagedStatusPanel from '../containers/ManagedStatusPanel';
import ManagedFeedback from '../containers/ManagedFeedback';

export const App = () => {
  return (
    <div className="game-container">
      <DebugPanel/>
      <ManagedStatusPanel/>
      <ManagedBoard/>
      <PlayerHandContainer/>
      <ManagedFeedback/>
    </div>
  );
}

export interface AppState {
  board: BoardState;
  cardActions: CardAction[];
  users: User[];
  status: StatusState;
  yourTurn: YourTurnState;
  feedback: FeedbackState;
}