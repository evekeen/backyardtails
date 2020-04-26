import * as React from 'react';
import {connect} from 'react-redux';
import {startTurn, loadCard, TurnData} from '../reducers/yourTurn';
import {setPlayerInTurn, setTable, BoardState} from '../reducers/board';
import {CardType, PlayerIndex} from '../model/commonTypes';
import _ = require('lodash');
import {useEffect} from 'react';
import {joinGame} from '../reducers/connection';
import {addMessage} from '../reducers/status';

interface DebugPanelProps {
  loadCard: (turn: TurnData) => void;
  startTurn: (turn: TurnData) => void;
  setPlayerInTurn: (index: PlayerIndex) => void;
  setTable: (board: BoardState) => void;
  joinGame: () => void;
  addMessage: (message: string) => void;
}

const names = ['Vasya', 'Petya', 'Masha', 'Phillip']

const DebugPanel = (props: DebugPanelProps) => {
  useEffect(() => initGame(props));
  return (
    <div className="debug-panel">
    </div>
  );
};

function initGame(props: DebugPanelProps) {
  const indexes: PlayerIndex[] = Array.apply(null, Array(4)).map((x: any, index: number) => index);
  const players = _.shuffle(indexes).map(index => ({
    index,
    name: names[index],
    score: Math.round(Math.random() * 5),
    alive: true,
    shield: Math.random() > 0.7,
  }));

  props.setTable({
    deckLeft: 5,
    discardPileTop: randomCard(),
    players: players,
    turnIndex: 4,
    currentPlayerIndex: 1,
    selectedPlayerIndex: undefined
  });
  props.loadCard({card: randomCard()});
  setTimeout(() => props.startTurn({card: randomCard()}), 2000);
}

function randomCard(): CardType {
  const cards = [
    CardType.Guard, CardType.Guard, CardType.Guard, CardType.Guard, CardType.Guard,
    CardType.Priest, CardType.Priest,
    CardType.Baron, CardType.Baron,
    CardType.Handmaid, CardType.Handmaid,
    CardType.Prince, CardType.Prince,
    CardType.King,
    CardType.Countess,
    CardType.Princess
  ];
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
}

const mapDispatch = {startTurn, loadCard, setPlayerInTurn, setTable, joinGame, addMessage};

export default connect(null, mapDispatch)(DebugPanel);
