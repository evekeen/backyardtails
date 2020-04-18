import * as React from 'react';
import {connect} from 'react-redux';
import {startTurn, loadCard, TurnData} from '../reducers/yourTurn';
import {updateCurrentUser} from '../reducers/board';
import {Button} from 'react-bootstrap';
import {HandIndex} from '../reducers/board';

interface DebugPanelProps {
  loadCard: (turn: TurnData) => void;
  startTurn: (turn: TurnData) => void;
  updateCurrentUser: (index: HandIndex) => void;
}

const DebugPanel = (props: DebugPanelProps) => {
  props.loadCard({card: 3});
  return (
    <Button variant="secondary" onClick={() => props.startTurn({card: 5})}>Start turn</Button>
  );
};

const mapDispatch = {startTurn, loadCard, updateCurrentUser};

export default connect(null, mapDispatch)(DebugPanel);