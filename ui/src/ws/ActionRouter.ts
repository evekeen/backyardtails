import {Dispatch} from 'redux';
import {maybeSetUrl, wsConnected} from '../reducers/connection';

export class ActionRouter {
  constructor(private readonly dispatch: Dispatch<any>) {}

  onServerAction(data: any) {
    if (data.type === 'connection/userJoined') {
      this.dispatch(maybeSetUrl(data.payload));
    }
    this.dispatch(data);
  }

  reportConnected = () => this.dispatch(wsConnected());
}