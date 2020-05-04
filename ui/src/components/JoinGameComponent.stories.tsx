import * as React from 'react';

import {storiesOf} from '@storybook/react';
import {JoinGameComponent} from './JoinGameComponent';
import '../css/main.css';
import '../css/login.css';

storiesOf('Join Game', module)
  .add('enter name', () => (<JoinGameComponent gameId='warandpeace' users={[]} name={undefined} joined={false} joining={false} userId='client-10'
                                              joinGame={() => null} resetGameId={() => null}/>))