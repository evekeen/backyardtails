import {CardActionFeedback} from '../reducers/feedback';
import {Button, Modal} from 'react-bootstrap';
import * as React from 'react';
import {Card} from './Card';
import {CardType} from '../model/commonTypes';

interface ActionFeedbackProps {
  feedback: CardActionFeedback | undefined;
  hideFeedback: () => void;
}

export const ActionFeedback = (props: ActionFeedbackProps) => {
  const show = !!props.feedback;
  const feedbackComponent = getFeedbackComponent(props);
  return (
    <Modal show={show} onHide={() =>props.hideFeedback()} className="ll-feedback">
      <Modal.Header closeButton>
        <Modal.Title>Your move</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {React.createElement(feedbackComponent, props.feedback)}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={() =>props.hideFeedback()}>Ok</Button>
      </Modal.Footer>
    </Modal>
  );
}

const getFeedbackComponent = (props: ActionFeedbackProps) => {
  if (!props.feedback) return 'span';
  return componentsMap[props.feedback.card];
}

const GuardFeedback = (props: CardActionFeedback) => {
  const status = props.killed ? 'right!' : 'wrong';
  return (
    <>
      <p>You guessed it {status}</p>
      <KillingStatus card={props.card} killed={props.killed} opponentName={props.opponentName}/>
    </>
  );
}

const PriestFeedback = (props: CardActionFeedback) => {
  return (<div>{props.opponentName} has {<Card card={props.opponentCard} showDescription={false}/>}</div>);
}

const BaronFeedback = (props: CardActionFeedback) => {
  const status = props.killed ? 'won' : 'lost';
  return (
    <>
      <p>You've {status} the duel</p>
      <div>{props.opponentName} had {<Card card={props.opponentCard} showDescription={false}/>}</div>
    </>
  );
}

const HandmaidFeedback = () => {
  return (<div>Now you have protection for one round</div>);
}

const PrinceFeedback = (props: CardActionFeedback) => {
  return (
    <>
      <p>You've made {props.opponentName} discard a card</p>
      {props.killed && (<KillingStatus card={props.card} killed={props.killed} opponentName={props.opponentName}/>)}
    </>
  );
}

const KingFeedback = (props: CardActionFeedback) => {
  return (
    <>
      <p>You've traded cards with {props.opponentName}</p>
      <div>Now you have {<Card card={props.opponentCard} showDescription={false}/>}</div>
    </>
  );
}

const CountessFeedback = (props: CardActionFeedback) => {
  return (<p>You've silently discarded the Countess</p>);
}

const PrincessFeedback = (props: CardActionFeedback) => {
  return (<p>You've discarded the Princess and died immediately</p>);
}

interface KillingStatusProps {
  card: CardType;
  killed: boolean;
  opponentName: string;
}

const KillingStatus = (props: KillingStatusProps) => {
  const killingCard = KILLING_CARDS.indexOf(props.card) !== -1;
  const actionText = props.killed ? 'have killed' : 'haven\'t killed';
  return (
    <>
      {killingCard && (<p>You {actionText} {props.opponentName}</p>)}
    </>
  );
}

const KILLING_CARDS = [CardType.Guard, CardType.Baron, CardType.Prince, CardType.King];

const componentsMap = {
  [CardType.Guard]: GuardFeedback,
  [CardType.Priest]: PriestFeedback,
  [CardType.Baron]: BaronFeedback,
  [CardType.Handmaid]: HandmaidFeedback,
  [CardType.Prince]: PrinceFeedback,
  [CardType.King]: KingFeedback,
  [CardType.Countess]: CountessFeedback,
  [CardType.Princess]: PrincessFeedback
};
