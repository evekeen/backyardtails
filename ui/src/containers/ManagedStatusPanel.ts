import {connect} from 'react-redux';
import {AppState} from '../components/App';
import {StatusPanel} from '../components/StatusPanel';
import {closeMessage} from '../reducers/status';

const mapStateToProps = (state: AppState) => {
  return state.status;
}

const mapDispatchToProps = {closeMessage}

export default connect(mapStateToProps, mapDispatchToProps)(StatusPanel);