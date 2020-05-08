import React = require('react');
import {useEffect} from 'react';
import {gameUrl, resetGame} from '../reducers/connection';
import {connect} from 'react-redux';

interface GameErrorProps extends WithResetGame{
  text: string;
}

interface WithResetGame {
  resetGame: () => void;
}

const GameErrorComponent = (props: GameErrorProps) => {
  useEffect(() => {
    window.history.pushState(undefined, `Love Letter`, gameUrl());
    setTimeout(props.resetGame, 1000);
  }, []);

  return (
    <div className="login-wrapper">
      <p className="create-game-text">{props.text}</p>
    </div>
  );
}

const GameNotFoundComponent = (props: WithResetGame) => GameErrorComponent({...props, text: 'Game not found'});
const GamePreexistedComponent = (props: WithResetGame) => GameErrorComponent({...props, text: 'Cannot create a game - it already exists'});
const NoMoreSeatsComponent = (props: WithResetGame) => GameErrorComponent({...props, text: 'Cannot join a game - it\'s full'});

export const GameNotFound = connect(() => ({}), {resetGame})(GameNotFoundComponent);
export const GamePreexisted = connect(() => ({}), {resetGame})(GamePreexistedComponent);
export const NoMoreSeats = connect(() => ({}), {resetGame})(NoMoreSeatsComponent);