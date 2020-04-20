import {CardAction} from '../model/CardAction';

export const submitAction = (action: CardAction) => ({
  type: 'cardAction',
  remote: true,
  action
});