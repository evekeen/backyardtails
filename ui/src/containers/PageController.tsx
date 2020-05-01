import * as React from 'react';
import {useEffect} from 'react';
import {loadUrl, MaybeJoinedUser} from '../reducers/connection';
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
  const readyUsers = props.users?.filter(u => u.ready)?.length || 0;

  if (!props.gameId) {
    return (<CreateGame/>);
  } else if (!props.name || readyUsers < PLAYERS_NUMBER || !props.joined) {
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
  name?: string;
  joined: boolean;
  users: MaybeJoinedUser[];
  loadUrl: () => void;
}

const mapStateToProps = (state: AppState) => state.connection

export default connect(mapStateToProps, {loadUrl})(PageController);