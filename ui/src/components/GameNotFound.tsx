import React = require('react');
import {useEffect} from 'react';
import {gameUrl, resetConnection} from '../reducers/connection';
import {connect} from 'react-redux';

const GameNotFound = (props: { resetConnection: () => void }) => {
  useEffect(() => {
    window.history.pushState(undefined, `Love Letter`, gameUrl());
    setTimeout(props.resetConnection, 1000);
  }, []);

  return (
    <div className="login-wrapper">
      <p className="create-game-text">Game not found</p>
    </div>
  );
}

export default connect(() => ({}), {resetConnection})(GameNotFound);