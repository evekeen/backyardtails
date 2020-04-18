import {combineReducers} from 'redux';
import board from './board';
import status from './status';
import cardActions from './cardActions';
import yourTurn from './yourTurn';

export default combineReducers({
  board,
  status,
  cardActions,
  yourTurn
});