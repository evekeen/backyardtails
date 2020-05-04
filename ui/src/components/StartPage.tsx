import React = require('react');
import {useState} from 'react';
import {connect} from 'react-redux';
import {v4 as uuid4} from 'uuid';
// @ts-ignore
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {createGame, gameUrl, joinGame, resetGame} from '../reducers/connection';
import {AppState} from './App';
import {JoinGameComponent} from './JoinGameComponent';

interface CreateGameProps {
  createGame: (gameId: string) => void;
}

const CreateGameComponent = (props: CreateGameProps) => {
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
      <button className="start-page-element start-page-button" style={{visibility}} onClick={() => props.createGame(gameId)}>
        Join
      </button>
    </div>
  );
}

const mapStateToProps = (state: AppState) => state.connection

export const CreateGame = connect(mapStateToProps, {createGame})(CreateGameComponent);
export const JoinGame = connect(mapStateToProps, {joinGame, resetGame})(JoinGameComponent);
