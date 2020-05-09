import React = require('react');
import {AppState} from './App';
import {connect} from 'react-redux';
import {discardVictoryReport} from '../reducers/status';
import {CardActionFeedback} from '../reducers/feedback';
import {Button, Modal} from 'react-bootstrap';

interface VictoryReportProps {
  roundWinnerName: string;
  feedback: CardActionFeedback | undefined;
  discardVictoryReport: () => void;
}

const VictoryReport = (props: VictoryReportProps) => {
  const show = props.roundWinnerName && !props.feedback;
  return (
    <Modal show={show} onHide={() => props.discardVictoryReport()}>
      <Modal.Header closeButton>
        <Modal.Title>Winner of the round</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <img src="img/princess.png"/>
        <p>{props.roundWinnerName} has won the round!</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={() => props.discardVictoryReport()}>Continue</Button>
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

export default connect(mapStateToProps, {discardVictoryReport})(VictoryReport);