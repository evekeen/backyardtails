import React = require('react');
import {useEffect} from 'react';
import {gameUrl, resetGameId} from '../reducers/connection';
import {connect} from 'react-redux';

const GameNotFoundComponent = (props: { resetGameId: () => void }) => {
  useEffect(() => {
    window.history.pushState(undefined, `Love Letter`, gameUrl());
    setTimeout(props.resetGameId, 1000);
  }, []);

  return (
    <div className="login-wrapper">
      <p className="create-game-text">Game not found</p>
    </div>
  );
}

const GamePreexistedComponent = (props: { resetGameId: () => void }) => {
  useEffect(() => {
    window.history.pushState(undefined, `Love Letter`, gameUrl());
    setTimeout(props.resetGameId, 1000);
  }, []);

  return (
    <div className="login-wrapper">
      <p className="create-game-text">Cannot create a game - it already exists</p>
    </div>
  );
}

export const GameNotFound = connect(() => ({}), {resetGameId})(GameNotFoundComponent);
export const GamePreexisted = connect(() => ({}), {resetGameId})(GamePreexistedComponent);