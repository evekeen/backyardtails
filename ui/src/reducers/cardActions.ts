import {CardAction} from '../model/CardAction';
import {createAction} from '@reduxjs/toolkit';

export const submitAction = createAction('cardAction', function prepare(action: CardAction) {
  return {
    meta: 'remote',
    payload: action
  }
});