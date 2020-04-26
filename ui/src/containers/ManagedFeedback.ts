import {connect} from 'react-redux';
import {AppState} from '../components/App';
import {ActionFeedback} from '../components/ActionFeedback';
import {hideFeedback} from '../reducers/feedback';

const mapDispatchToProps = {hideFeedback}

const mapStateToProps = (state: AppState) => {
  return {
    feedback: state.feedback.lastAction
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionFeedback);