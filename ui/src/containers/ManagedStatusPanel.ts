import {connect} from 'react-redux';
import {AppState} from '../components/App';
import {StatusPanel} from '../components/StatusPanel';

const mapStateToProps = (state: AppState) => {
  return state.status;
}

export default connect(mapStateToProps)(StatusPanel);