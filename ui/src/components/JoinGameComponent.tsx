import React = require('react');
import {GameParams, JoinParams, MaybeJoinedUser} from '../reducers/connection';
import {PLAYERS_NUMBER} from '../model/commonTypes';
import {KeyboardEvent, useState} from 'react';

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
  const join = () => props.joinGame({gameId, userId, name});
  const joinStarted = props.joining || props.joined;
  const disabledButton = joinStarted || !name;
  const loadingClass = joinStarted ? 'loading' : '';

  const onKeyDown = (e: KeyboardEvent) => e.key === 'Enter' && join();

  return (
    <div className={`login-wrapper ${loadingClass}`}>
      {readyUsers.map(user => <JoinedUser key={user.id} name={user.name}/>)}
      <p className="pending-users">Waiting for <b>{waiting}</b> more players.</p>
      <div className="form">
        <div className={`input-name start-page-element`}>
          <input value={name} disabled={joinStarted} placeholder="Your Name" onChange={e => setName(e.target.value)} onKeyDown={onKeyDown}
                 autoFocus={true}/>
        </div>
        <img src="img/jigsaw.svg" alt=""/>
        <div>
          <button className="start-page-element start-page-button back-button" onClick={props.resetGameId}>
            <svg className="bi bi-caret-left-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"
                 xmlns="http://www.w3.org/2000/svg">
              <path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 00-1.659-.753l-5.48 4.796a1 1 0 000 1.506z"/>
            </svg>
          </button>
          <button disabled={disabledButton} className="start-page-element start-page-button" onClick={join}>Join game</button>
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