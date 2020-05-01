import React = require('react');
import {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {v4 as uuid4} from 'uuid';
// @ts-ignore
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {GameParams, gameUrl, joinGame, JoinParams, MaybeJoinedUser, openGame, OpenGameParams, openJoinScreen} from '../reducers/connection';
import {PLAYERS_NUMBER} from '../model/commonTypes';
import {AppState} from './App';

const CreateGameComponent = (props: { openJoinScreen: (gameId: string) => void }) => {
  const [gameId, setGameId] = useState<string>(undefined);
  const url = gameId ? gameUrl(gameId) : undefined;
  const [cpUrl, setCpUrl] = useState<string>(undefined);
  const copied = cpUrl && cpUrl === url;
  const copiedClass = copied ? 'copied' : '';
  const disabledClass = !url ? 'disabled' : '';
  const visibility = url ? 'visible' : 'hidden';

  return (
    <div className="login-wrapper">
      <p className="create-game-text">Create a new game and invite your friends via link</p>
      <div className="link-wrapper">
        <button className="start-page-element start-page-button" onClick={() => setGameId(uuid4())}>Create game</button>
        <CopyToClipboard text={url} onCopy={() => url && setCpUrl(url)}>
          <span className={`start-page-element game-link ${copiedClass} ${disabledClass}`}>{url}</span>
        </CopyToClipboard>
        <div className="clipboard-message">{copied && 'Copied'}</div>
      </div>
      <button className="start-page-element start-page-button" style={{visibility}} onClick={() => props.openJoinScreen(gameId)}>
        Join
      </button>
    </div>
  );
}

interface JoinGameProps extends GameParams {
  joining: boolean;
  joined: boolean;
  openGame: (params: OpenGameParams) => void;
  joinGame: (params: JoinParams) => void;
  users: MaybeJoinedUser[];
}

const JoinGameComponent = (props: JoinGameProps) => {
  const {gameId, userId} = props;
  const readyUsers = props.users.filter(u => u.ready);
  const waiting = PLAYERS_NUMBER - readyUsers.length;
  const [name, setName] = useState('');
  const join = () => props.joinGame({gameId, userId, name});
  const joinStarted = props.joining || props.joined;
  const disabledButton = joinStarted || !name;
  const loadingClass = joinStarted ? 'loading' : '';

  useEffect(() => {
    props.openGame({gameId, userId});
  }, []);

  return (
    <div className={`login-wrapper ${loadingClass}`}>
      {readyUsers.map(user => <JoinedUser key={user.id} name={user.name}/>)}
      <p className="pending-users">Waiting for <b>{waiting}</b> more players.</p>
      <div className="form">
        <div className={`input-name start-page-element`}>
          <input value={name} disabled={joinStarted} placeholder="Your Name" onChange={e => setName(e.target.value)}/>
        </div>
        <img src="img/jigsaw.svg" alt=""/>
        <button disabled={disabledButton} className="start-page-element start-page-button" onClick={join}>Join game</button>
      </div>
    </div>
  );
}

const JoinedUser = (props: { name: string }) => {
  return (
    <p className="joined-user"><span className="player-bold">{props.name}</span> already joined the game.</p>
  );
}

const mapStateToProps = (state: AppState) => state.connection

export const CreateGame = connect(mapStateToProps, {openJoinScreen})(CreateGameComponent);
export const JoinGame = connect(mapStateToProps, {openGame, joinGame})(JoinGameComponent);
