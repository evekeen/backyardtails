import {Button, Modal} from 'react-bootstrap';
import * as React from 'react';
import {TradeInfo} from '../model/TradeInfo';
import {Card} from './Card';
import {hideTradeReport} from '../reducers/feedback';
import {AppState} from './App';
import {connect} from 'react-redux';

interface TradeReportProps {
  trade: TradeInfo | undefined;
  hideTradeReport: () => void;
}

const TradeReport = (props: TradeReportProps) => {
  const show = !!props.trade;
  return (
    <Modal show={show} onHide={() => props.hideTradeReport()} className="ll-feedback ll-trade-report">
      <Modal.Header closeButton>
        <Modal.Title>Trade</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <TradeInfoComponent trade={props.trade}/>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={() => props.hideTradeReport()}>Ok</Button>
      </Modal.Footer>
    </Modal>
  );
}

interface TradeInfoComponentProps {
  trade: TradeInfo | undefined;
}

const TradeInfoComponent = (props: TradeInfoComponentProps) => {
  return (
    <>
      <div>You've traded {<Card card={props.trade?.outgoing} showDescription={false}/>}</div>
      <div>for {<Card card={props.trade?.incoming} showDescription={false}/>}</div>
    </>
  );
}

const mapDispatchToProps = {hideTradeReport}

const mapStateToProps = (state: AppState) => {
  return {
    trade: state.feedback.trade
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TradeReport);