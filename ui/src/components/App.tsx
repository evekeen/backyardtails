import * as React from 'react';
import ManagedBoard from '../containers/ManagedBoard';
import {PlayerHand} from './PlayerHand';

export const App = () => {
  return (
    <div>
      <div>Love Letter</div>
      <ManagedBoard/>
      <PlayerHand cards={[1, 2]}/>
    </div>
  );
}