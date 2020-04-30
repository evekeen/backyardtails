import {CardAction} from '../model/CardAction';
import {createAction} from '@reduxjs/toolkit';

export const submitAction = createAction('cardAction', (action: CardAction) => ({
    meta: 'remote',
    payload: action
  })
);