import * as React from 'react';

import {storiesOf} from '@storybook/react';
import '../css/main.css';
import {Board} from './Board';
import {Player} from '../model/Player';
import {PlayerHand} from './PlayerHand';
import {CardType} from '../model/commonTypes';
import {StatusPanel} from './StatusPanel';

const players: Player[] = [
  {
    alive: true,
    shield: false,
    name: 'Поручик Ржевский',
    index: 0,
    score: 2
  },
  {
    alive: true,
    shield: true,
    name: 'Наташа Ростова',
    index: 1,
    score: 0
  },
  {
    alive: false,
    shield: false,
    name: 'Андрей Болконский',
    index: 0,
    score: 1
  },
  {
    alive: true,
    shield: false,
    name: 'Пьер Безухов',
    index: 0,
    score: 0
  }
];

storiesOf('Board', module)
  .add('Your turn', () => {
    return (
      <div className="game-container">
        <StatusPanel log={[{type: "info", text: "It's Поручик Ржевский's turn"}]}/>
        <Board discardPileTop={2} deckLeft={2} selectPlayer={() => undefined} currentPlayerIndex={0} currentPlayerInTurn={true}
               players={players} selectedPlayerIndex={undefined} turnIndex={0}/>
        <PlayerHand hasAvailablePlayers={true} player={players[0]} cards={[CardType.King, CardType.Baron]} active={true}
                    cancelSelection={() => undefined} selectCard={() => undefined} selectedCard={undefined} selectedPlayer={undefined}
                    submitAction={() => undefined}/>
      </div>
    );
  })
