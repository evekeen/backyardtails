import {connect} from 'react-redux';
import {setTable} from '../reducers/board';
import {selectPlayer} from '../reducers/yourTurn';
import {Board} from '../components/Board';
import {AppState} from '../components/App';

const mapDispatchToProps = { setTable, selectPlayer }

const mapStateToProps = (state: AppState) => {
  return state.board;
}

export default connect(mapStateToProps, mapDispatchToProps)(Board);