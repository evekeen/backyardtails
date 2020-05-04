import React = require('react');
import {useEffect} from 'react';
import {gameUrl, resetGame} from '../reducers/connection';
import {connect} from 'react-redux';

const GameNotFoundComponent = (props: { resetGame: () => void }) => {
  useEffect(() => {
    window.history.pushState(undefined, `Love Letter`, gameUrl());
    setTimeout(props.resetGame, 1000);
  }, []);

  return (
    <div className="login-wrapper">
      <p className="create-game-text">Game not found</p>
    </div>
  );
}

const GamePreexistedComponent = (props: { resetGame: () => void }) => {
  useEffect(() => {
    window.history.pushState(undefined, `Love Letter`, gameUrl());
    setTimeout(props.resetGame, 1000);
  }, []);

  return (
    <div className="login-wrapper">
      <p className="create-game-text">Cannot create a game - it already exists</p>
    </div>
  );
}

export const GameNotFound = connect(() => ({}), {resetGame})(GameNotFoundComponent);
export const GamePreexisted = connect(() => ({}), {resetGame})(GamePreexistedComponent);