import {combineReducers} from 'redux';
import board from './board';
import status from './status';

export default combineReducers({
  board,
  status
});