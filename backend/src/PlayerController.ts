import {EventEmitter} from 'events';

export class PlayerController extends EventEmitter {
  constructor(private userId: string) {
    super();
  }

  onMessage(type: string, message: any) {
    this.emit(type, message);
  }
}