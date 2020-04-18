import {connect} from 'react-redux';
import {setTable} from '../reducers/board';
import {Board} from '../components/Board';
import {AppState} from '../components/App';

const mapDispatchToProps = { setTable }

const mapStateToProps = (state: AppState) => {
  return state.board;
}

export default connect(mapStateToProps, mapDispatchToProps)(Board);