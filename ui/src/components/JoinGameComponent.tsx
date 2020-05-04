import React = require('react');
import {GameParams, JoinParams, MaybeJoinedUser} from '../reducers/connection';
import {PLAYERS_NUMBER} from '../model/commonTypes';
import {KeyboardEvent, useState} from 'react';
import {Button} from 'react-bootstrap';

interface JoinGameProps extends GameParams {
  joining: boolean;
  joined: boolean;
  joinGame: (params: JoinParams) => void;
  resetGameId: () => void;
  users: MaybeJoinedUser[];
  name: string | undefined;
}

export const JoinGameComponent = (props: JoinGameProps) => {
  const {gameId, userId} = props;
  const readyUsers = props.users?.filter(u => u.ready) || [];
  const waiting = PLAYERS_NUMBER - readyUsers.length;
  const [name, setName] = useState(props.name || '');
  const join = (name: string) => props.joinGame({gameId, userId, name});
  const joinStarted = props.joining || props.joined;
  const disabledButton = joinStarted || !name;
  const loadingClass = joinStarted ? 'loading' : '';

  const onKeyDown = (e: KeyboardEvent) => e.key === 'Enter' && join(name);

  return (
    <div className={`login-wrapper ${loadingClass}`}>
      {readyUsers.map(user => <JoinedUser key={user.id} name={user.name}/>)}
      <p className="pending-users">Waiting for <b>{waiting}</b> more players.</p>
      <div className="form">
        <div className={`input-name start-page-element`}>
          <input value={name} disabled={joinStarted} placeholder="Your Name" onChange={e => setName(e.target.value)} onKeyDown={onKeyDown}
                 autoFocus={true}/>
        </div>
        <img src="img/jigsaw.svg" alt="" onClick={() => joinStarted && join('')}/>
        <div>
          <Button variant="link" onClick={props.resetGameId}>
            Back
          </Button>
          <button disabled={disabledButton} className="start-page-element start-page-button" onClick={() => join(name)}>Join game</button>
        </div>
      </div>
    </div>
  );
}

const JoinedUser = (props: { name: string }) => {
  return (
    <p className="joined-user"><b>{props.name}</b> joined</p>
  );
}