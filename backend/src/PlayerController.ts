import {EventEmitter} from 'events';
import {RemoteAction} from './protocol';

export class PlayerController extends EventEmitter {
  constructor(public userId: string) {
    super();
  }

  onMessage(type: string, message: any) {
    this.emit(type, message);
  }

  dispatch<T extends RemoteAction>(state: T) {
    this.emit('stateReady', state);
  }
}