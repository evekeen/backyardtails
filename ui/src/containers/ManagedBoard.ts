import {connect} from 'react-redux';
import {BoardState, setTable} from '../reducers/board';
import {Board} from '../components/Board';

const mapDispatchToProps = { setTable }

const mapStateToProps = (state: BoardState) => {
  return state;
}

export default connect(mapStateToProps, mapDispatchToProps)(Board);