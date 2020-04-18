import * as React from 'react';
import ManagedBoard from '../containers/ManagedBoard';
import PlayerHandContainer from '../containers/PlayerHandContainer';
import {BoardState} from '../reducers/board';
import {CardAction} from '../model/CardAction';
import {StatusState} from '../reducers/status';
import {User} from '../model/User';
import {YourTurnState} from '../reducers/yourTurn';
import DebugPanel from './DebugPanel';

export const App = () => {
  return (
    <div>
      <DebugPanel/>
      <ManagedBoard/>
      <PlayerHandContainer/>
    </div>
  );
}

export interface AppState {
  board: BoardState;
  cardActions: CardAction[],
  users: User[]
  status: StatusState,
  yourTurn: YourTurnState
}