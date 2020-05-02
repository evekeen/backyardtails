import * as React from 'react';
import {BoardState} from '../reducers/board';
import {StatusState} from '../reducers/status';
import {YourTurnState} from '../reducers/yourTurn';
import {FeedbackState} from '../reducers/feedback';
import {ConnectionState} from '../reducers/connection';
import PageController from '../containers/PageController';

export const App = () => {
  return (
    <div className="game-container">
      <PageController/>
    </div>
  );
}

export interface AppState {
  board: BoardState;
  connection: ConnectionState;
  status: StatusState;
  yourTurn: YourTurnState;
  feedback: FeedbackState;
}