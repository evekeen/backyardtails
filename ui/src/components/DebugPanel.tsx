import * as React from 'react';
import {connect} from 'react-redux';
import {startTurn, loadCard, TurnData} from '../reducers/yourTurn';
import {updateCurrentUser, setTable, BoardState} from '../reducers/board';
import {Button} from 'react-bootstrap';
import {HandIndex} from '../reducers/board';
import {Player} from '../model/Player';

interface DebugPanelProps {
  loadCard: (turn: TurnData) => void;
  startTurn: (turn: TurnData) => void;
  updateCurrentUser: (index: HandIndex) => void;
  setTable: (board: BoardState) => void;
}

function player(name: string, score: number): Player {
  return {
    index: 1,
    name: name,
    score: score,
    alive: true,
    shield: false,
  };
}

const DebugPanel = (props: DebugPanelProps) => {
  props.setTable({
    deckLeft: 5,
    discardPileTop: 1,
    players: [player('Vasya', 1), player('Petya', 0), player('Masha', 3), player('Phillip', 2)],
    activeIndex: 4,
    currentUserInTurn: false
  });
  props.loadCard({card: 3});
  return (
    <Button variant="secondary" onClick={() => props.startTurn({card: 5})}>Start turn</Button>
  );
};

const mapDispatch = {startTurn, loadCard, updateCurrentUser, setTable};

export default connect(null, mapDispatch)(DebugPanel);