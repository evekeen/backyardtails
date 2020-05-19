import React = require('react');
import {AppState} from './App';
import {connect} from 'react-redux';
import {victoryAcknowledgement} from '../reducers/status';
import {CardActionFeedback} from '../reducers/feedback';
import {Button, Modal} from 'react-bootstrap';

interface VictoryReportProps {
  roundWinnerName: string;
  feedback: CardActionFeedback | undefined;
  victoryAcknowledgement: () => void;
}

const VictoryReport = (props: VictoryReportProps) => {
  const show = props.roundWinnerName && !props.feedback;
  return (
    <Modal size="lg" show={show} onHide={() => props.victoryAcknowledgement()}>
      <Modal.Header closeButton>
        <Modal.Title>Winner of the round</Modal.Title>
      </Modal.Header>

      <Modal.Body className="ll-winner">
        <img src="img/winner.svg" alt=""/>
        <p><b>{props.roundWinnerName}</b> has won the round!</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={() => props.victoryAcknowledgement()}>Continue</Button>
      </Modal.Footer>
    </Modal>
  );
}

const mapStateToProps = (state: AppState) => {
  return {
    ...state.status,
    feedback: state.feedback.lastAction
  };
}

export default connect(mapStateToProps, {victoryAcknowledgement})(VictoryReport);