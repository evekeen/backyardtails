import {EventEmitter} from 'events';
import {CreateGameMessage, ForceGame, InitSession, JoinMessage, RemoteAction, VictoryAcknowledgement} from './protocol';
import {GameId, PlayerId} from './game/loveletter';
import {GamesController} from './game/GamesController';
import {pipe} from 'fp-ts/lib/pipeable';
import {fold} from 'fp-ts/lib/Either';
import _ = require('lodash');

interface OutWebSocket {
  send(data: any, cb?: (err?: Error) => void): void;
}

export class PlayerControllerImpl extends EventEmitter implements PlayerController {
  public kaTimer?: any = undefined;
  constructor(
    private readonly ws: OutWebSocket,
    gamesController: GamesController,
    public userId?: string,
    public gameId?: string,
    public name?: string
  ) {
    super();

    // All controller listeners should be configured in it's constructor!
    // Games controller should have access to player controller
    // Player controller should be able to communicate with game or games controller.
    this.on('connection/initSession', msg => {
      pipe(InitSession.decode(msg), fold(() => console.log('Failed to parse: ' + JSON.stringify(msg)),
        (request: { payload: any; }) => {
          console.log(`Init session for ${request.payload}`);
          gamesController.subscribe(this, request.payload);
        }));
    });

    this.on('connection/createGame', msg => {
      pipe(CreateGameMessage.decode(msg), fold(() => console.log('Failed to parse: ' + JSON.stringify(msg)),
        request => {
          const {gameId, userId} = request.payload;
          console.log(`Creating a game ${gameId} by user ${userId}...`);
          gamesController.onCreateGame(this, gameId, userId);
        }));
    });

    this.on('connection/join', msg => {
      pipe(JoinMessage.decode(msg), fold(() => console.log('Failed to parse: ' + JSON.stringify(msg)),
        request => {
          console.log(`Joining user ${request.payload.userId} to a game...`);
          gamesController.onJoin(this, request.payload);
        }));
    });

    this.on('connection/forceGame', msg => {
      pipe(ForceGame.decode(msg), fold(() => console.log('Failed to parse: ' + JSON.stringify(msg)),
        request => gamesController.forceGame(this, request.payload)));
    });

    this.on('status/victoryAcknowledgement', msg => {
      pipe(VictoryAcknowledgement.decode(msg), fold(() => console.log('Failed to parse: ' + JSON.stringify(msg)),
        () => gamesController.acknowledgeVictory(this)));
    });
    
    this.on('stateReady', state => {
      const userId = state.payload?.userId ? ` about ${state.payload.userId}` : '';
      console.log(`Sending ${state.type}${userId} to ${this.userId}`);
      this.ws.send(JSON.stringify(state));
    });

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

export interface InGamePlayerController extends PlayerController {
  getInfo(): InGamePlayerControllerInfo;
}

export interface ReadyPlayerController extends InGamePlayerController {
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