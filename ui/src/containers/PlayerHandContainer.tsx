import {submitAction} from '../reducers/cardActions';
import {selectCard} from '../reducers/yourTurn';
import {connect} from 'react-redux';
import {PlayerHand} from '../components/PlayerHand';
import {AppState} from '../components/App';

const mapDispatchToProps = {submitAction, selectCard}

const mapStateToProps = (state: AppState) => {
  return {
    active: state.board.currentUserInTurn,
    cards: [state.yourTurn.oldCard, state.yourTurn.newCard],
    selectedUser: state.yourTurn.selectedUser,
    selectedCard: state.yourTurn.selectedCard
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerHand);