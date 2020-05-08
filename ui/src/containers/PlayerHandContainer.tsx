import {submitAction} from '../reducers/cardActions';
import {cancelSelection, selectCard} from '../reducers/yourTurn';
import {connect} from 'react-redux';
import {PlayerHand} from '../components/PlayerHand';
import {AppState} from '../components/App';

const mapDispatchToProps = {submitAction, selectCard, cancelSelection}

const mapStateToProps = (state: AppState) => {
  return {
    active: state.board.currentPlayerInTurn,
    player: state.board.players[state.board.currentPlayerIndex],
    cards: [state.yourTurn.oldCard, state.yourTurn.newCard],
    selectedPlayer: state.yourTurn.selectedPlayer,
    selectedCard: state.yourTurn.selectedCard,
    hasAvailablePlayers: state.board.players.filter(p => p.alive && !p.shield).length > 1
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerHand);