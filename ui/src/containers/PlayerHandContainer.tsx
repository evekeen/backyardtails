import {submitAction} from '../reducers/cardActions';
import {selectCard, cancelSelection} from '../reducers/yourTurn';
import {connect} from 'react-redux';
import {PlayerHand} from '../components/PlayerHand';
import {AppState} from '../components/App';

const mapDispatchToProps = {submitAction, selectCard, cancelSelection}

const mapStateToProps = (state: AppState) => {
  return {
    active: state.board.currentPlayerInTurn,
    cards: [state.yourTurn.oldCard, state.yourTurn.newCard],
    selectedPlayer: state.yourTurn.selectedPlayer,
    selectedCard: state.yourTurn.selectedCard
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerHand);