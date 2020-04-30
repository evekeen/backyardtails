import * as React from 'react';
import {useEffect} from 'react';
import {loadUrl, User} from '../reducers/connection';
import {CreateGame, JoinGame} from '../components/StartPage';
import ManagedStatusPanel from '../containers/ManagedStatusPanel';
import PlayerHandContainer from '../containers/PlayerHandContainer';
import ManagedFeedback from '../containers/ManagedFeedback';
import ManagedBoard from '../containers/ManagedBoard';
import {AppState} from '../components/App';
import {connect} from 'react-redux';
import {PLAYERS_NUMBER} from '../model/commonTypes';

const PageController = (props: PageControllerProps) => {
  useEffect(() => props.loadUrl(), []);
  const numberOfUser = props.users?.length || 0;

  if (!props.gameId) {
    return (<CreateGame/>);
  } else if (!props.userId || numberOfUser < PLAYERS_NUMBER || !props.joined) {
    return (<JoinGame/>);
  }
  return (
    <>
      <ManagedStatusPanel/>
      <ManagedBoard/>
      <PlayerHandContainer/>
      <ManagedFeedback/>
    </>
  );
}

interface PageControllerProps {
  gameId?: string;
  userId?: string;
  joined: boolean;
  users: User[];
  loadUrl: () => void;
}

const mapStateToProps = (state: AppState) => state.connection

export default connect(mapStateToProps, {loadUrl})(PageController);