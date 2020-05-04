import {EventEmitter} from 'events';
import {RemoteAction} from './protocol';
import {GameId, PlayerId} from './game/loveletter';
import _ = require('lodash');

export class PlayerControllerImpl extends EventEmitter implements PlayerController {
  constructor(public userId?: string, public gameId?: string, public name?: string) {
    super();
  }

  getInfo(): PlayerControllerInfo {
    return _.pick(this, 'gameId', 'userId', 'name');
  }

  setInfo(info: PlayerControllerInfo): void {
    this.gameId = info.gameId;
    this.userId = info.userId;
    this.name = info.name;
  }

  isReady(): boolean {
    return !!this.name;
  }

  onMessage(type: string, message: any) {
    this.emit(type, message);
  }

  dispatch<T extends RemoteAction>(state: T) {
    this.emit('stateReady', state);
  }
}

export interface PlayerController extends EventEmitter {
  getInfo(): PlayerControllerInfo;
  setInfo(info: PlayerControllerInfo): void;
  onMessage(type: string, message: any): void;
  dispatch<T extends RemoteAction>(state: T): void;
  isReady(): boolean;
}

export interface InGamePlayerController extends  PlayerController{
  getInfo(): InGamePlayerControllerInfo;
}

export interface ReadyPlayerController extends  PlayerController{
  getInfo(): ReadyPlayerControllerInfo;
}

export interface PlayerControllerInfo {
  gameId?: GameId;
  userId?: PlayerId;
  name?: string | undefined;
}

export interface InGamePlayerControllerInfo {
  gameId: GameId;
  userId: PlayerId;
  name?: string;
}

export interface ReadyPlayerControllerInfo {
  gameId: GameId;
  userId: PlayerId;
  name: string;
}