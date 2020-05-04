import * as React from 'react';
import {connect} from 'react-redux';
import {loadCard, startTurn, TurnData} from '../reducers/yourTurn';
import {BoardState, setPlayerInTurn, setTable} from '../reducers/board';
import {CardType, PlayerIndex} from '../model/commonTypes';
import {addMessage} from '../reducers/status';

interface DebugPanelProps {
  loadCard: (turn: TurnData) => void;
  startTurn: (turn: TurnData) => void;
  setPlayerInTurn: (index: PlayerIndex) => void;
  setTable: (board: BoardState) => void;
  addMessage: (message: string) => void;
}

const DebugPanel = (props: DebugPanelProps) => {
  return (
    <div className="debug-panel">
    </div>
  );
};

function initGame(props: DebugPanelProps) {
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

const mapDispatch = {startTurn, loadCard, setPlayerInTurn, setTable, addMessage};

export default connect(null, mapDispatch)(DebugPanel);
