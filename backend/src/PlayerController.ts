import {EventEmitter} from 'events';
import {JoinMessage} from "./protocol";

export class PlayerController extends EventEmitter {
  constructor(public userId: string) {
    super();
  }

  onMessage(type: string, message: any) {
    this.emit(type, message);
  }

  dispatch<T>(type: string, state: T) {
    if (SUPPORTED_ACTIONS.indexOf(type) !== -1) {
      this.emit('stateReady', state);
    }
  }
}

const SUPPORTED_ACTIONS = ['board/setTable', 'yourTurn/loadCard'];