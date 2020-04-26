import {EventEmitter} from 'events';
import {JoinMessage} from "./protocol";

export class PlayerController extends EventEmitter {
  constructor(private userId: string) {
    super();
  }

  onMessage(type: string, message: any) {
    this.emit(type, message);
  }

  dispatch<T>(type: string, state: T) {
    if (type == 'board/setTable') {
      this.on('stateReady', state);
    }
  }
}