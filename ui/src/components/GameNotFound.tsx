import React = require('react');
import {useEffect} from 'react';
import {gameUrl, resetGameId} from '../reducers/connection';
import {connect} from 'react-redux';

const GameNotFound = (props: { resetGameId: () => void }) => {
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

export default connect(() => ({}), {resetGameId})(GameNotFound);