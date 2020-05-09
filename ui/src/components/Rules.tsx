import * as React from 'react';
import {cardCounts, cardDescriptionMapping, cardNameMapping, CardType} from '../model/commonTypes';
import {Accordion, Card} from 'react-bootstrap';

const CARDS = [CardType.Guard, CardType.Priest, CardType.Baron, CardType.Handmaid, CardType.Prince, CardType.King, CardType.Countess, CardType.Princess];

export const Rules = () => {
  return (
    <div className="rules">
      <Accordion defaultActiveKey="0">
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Card.Header} eventKey="0">
              <h4>Rules</h4>
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <ol>
              {CARDS.map((card, i) => <CardRules key={i} card={card}/>)}
            </ol>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </div>
  );
}

interface CardRulesProps {
  card: CardType;
}

const CardRules = (props: CardRulesProps) => {
  const count = cardCounts[props.card];
  return (
    <li><span>{cardNameMapping[props.card]} {count} card{count > 1 ? 's' : ''}</span>
      &nbsp;{cardDescriptionMapping[props.card]}
    </li>
  );
}