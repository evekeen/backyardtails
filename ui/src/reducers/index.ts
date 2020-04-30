import {combineReducers} from 'redux';
import board from './board';
import status from './status';
import yourTurn from './yourTurn';
import feedback from './feedback';
import connection from './connection';

export default combineReducers({
  board,
  status,
  yourTurn,
  feedback,
  connection
});