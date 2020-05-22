import React = require('react');
import {AppState} from './App';
import {connect} from 'react-redux';
import {EndOfRound, victoryAcknowledgement} from '../reducers/status';
import {CardActionFeedback} from '../reducers/feedback';
import {Button, Modal} from 'react-bootstrap';
import {Card} from './Card';
import {CardType} from '../model/commonTypes';

interface VictoryReportProps {
  endOfRound: EndOfRound | undefined;
  feedback: CardActionFeedback | undefined;
  victoryAcknowledgement: () => void;
}

const VictoryReport = (props: VictoryReportProps) => {
  const show = props.endOfRound && !props.feedback;

  React.useEffect(() => {
    window.addEventListener("beforeunload", () => props.victoryAcknowledgement());
  }, []);

  return (
    <Modal size="lg" show={show} onHide={() => props.victoryAcknowledgement()}>
      <Modal.Header closeButton>
        <Modal.Title>Winner of the round</Modal.Title>
      </Modal.Header>

      <Modal.Body className="ll-winner">
        <img src="img/winner.svg" alt="" width={200}/>
        <p>
          <b>{props.endOfRound?.winnerName}</b> has won the round!
        </p>
        {props.endOfRound?.cards?.map(c => (<PlayerCardInfo card={c.card} name={c.name}/>))}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={() => props.victoryAcknowledgement()}>Continue</Button>
      </Modal.Footer>
    </Modal>
  );
}

const PlayerCardInfo = (props: { name: string; card: CardType }) => {
  return (
    <p className='player-card'>
      <i>{props.name}</i> had <Card card={props.card} showDescription={false}/>
    </p>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    ...state.status,
    feedback: state.feedback.lastAction
  };
}

export default connect(mapStateToProps, {victoryAcknowledgement})(VictoryReport);