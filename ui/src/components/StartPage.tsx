import React = require('react');
import {useState} from 'react';
import {connect} from 'react-redux';
import {v4 as uuid4} from 'uuid';
// @ts-ignore
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {GameParams, gameUrl, joinGame, openGame, User} from '../reducers/connection';
import {PLAYERS_NUMBER} from '../model/commonTypes';
import {AppState} from './App';

const CreateGameComponent = (props: { openGame: (gameId?: string) => void }) => {
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
      <button className="start-page-element start-page-button" style={{visibility}} onClick={() => props.openGame(gameId)}>Join</button>
    </div>
  );
}

interface JoinGameProps extends GameParams {
  joining: boolean;
  joined: boolean;
  joinGame: (params: GameParams) => void;
  users: User[];
}

const JoinGameComponent = (props: JoinGameProps) => {
  const users = props.users || [];
  const waiting = PLAYERS_NUMBER - users.length;
  const [name, setName] = useState('');
  const join = () => props.joinGame({gameId: props.gameId, userId: name});
  const joinStarted = props.joining || props.joined;
  const disabledButton = joinStarted || !name;
  const loadingClass = joinStarted ? 'loading' : '';
  return (
    <div className={`login-wrapper ${loadingClass}`}>
      {users.map(user => <JoinedUser key={user.id} name={user.name}/>)}
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

export const JoinGame = connect(mapStateToProps, {joinGame})(JoinGameComponent);
export const CreateGame = connect(mapStateToProps, {openGame})(CreateGameComponent);