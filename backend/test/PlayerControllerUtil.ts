import {PlayerControllerImpl} from '../src/PlayerController';
import {GamesController} from '../src/game/GamesController';
import {CardType} from '../src/game/commonTypes';
import _ = require('lodash');
import Mock = jest.Mock;

export const gameId = 'game-id';

export const userId = 'user-1';
export const user2 = 'user-2';
export const user3 = 'user-3';
export const user4 = 'user-4';

export const name = 'Poruchik';
export const name2 = 'Natasha';
export const name3 = 'Andrey';
export const name4 = 'Pierre';

export class PlayerControllerHelper {
  public readonly send: Mock;
  public readonly controller: PlayerControllerImpl;
  public readonly gamesController: GamesController;

  constructor() {
    this.send = jest.fn();
    this.gamesController = new GamesController();
    this.controller = this.initController(userId, this.send);
  }

  createGame(): void {
    this.dispatch('connection/createGame', {gameId, userId});
  }

  dispatch(type: string, payload: any, c: PlayerControllerImpl = this.controller): void {
    c.onMessage(type, {type, payload});
  }

  initController(userId: string, sender: Mock = this.send): PlayerControllerImpl {
    const c = new PlayerControllerImpl({send: sender}, this.gamesController);
    this.dispatch('connection/initSession', userId, c);
    return c;
  }

  startGame(helper: PlayerControllerHelper, clear: boolean = true): AllControllers {
    const send2 = jest.fn();
    const send3 = jest.fn();
    const send4 = jest.fn();
    const c2 = helper.initController(user2, send2);
    const c3 = helper.initController(user3, send3);
    const c4 = helper.initController(user4, send4);
    helper.createGame();
    helper.dispatch('connection/join', {gameId, userId, name});
    helper.dispatch('connection/join', {gameId, userId: user2, name: name2}, c2);
    helper.dispatch('connection/join', {gameId, userId: user3, name: name3}, c3);
    helper.dispatch('connection/join', {gameId, userId: user4, name: name4}, c4);
    if (clear) {
      this.send.mockClear();
      send2.mockClear();
      send3.mockClear();
      send4.mockClear();
    }
    return {
      send: this.send, send2, send3, send4,
      c: this.controller, c2, c3, c4
    };
  }
}

interface AllControllers {
  send: Mock;
  send2: Mock;
  send3: Mock;
  send4: Mock;
  c: PlayerControllerImpl;
  c2: PlayerControllerImpl;
  c3: PlayerControllerImpl;
  c4: PlayerControllerImpl;
}

export function turnMessage(name: string): any {
  return message('turn', `It's ${name}'s turn`);
}

export function message(type: string, text: string): any {
  return {
    type: 'status/addMessage',
    payload: {text, type}
  };
}

export function feedbackMessage(feedback: any): any {
  return {type: 'feedback/showFeedback', payload: feedback};
}

export function joinMessage(userId: string, name: string): any {
  return {type: 'connection/userJoined', payload: {gameId, userId, name, ready: true}};
}

export function loadCardMessage(card: CardType): any {
  return {type: 'yourTurn/loadCard', payload: {card}};
}

export function startTurnMessage(card: CardType): any {
  return {type: 'yourTurn/startTurn', payload: {card}};
}

export function getMessages(send: Mock, drop: number = 0): Array<any> {
  const args = _.drop(send.mock.calls.map(call => JSON.parse(call[0])), drop);
  return _.sortBy(args, ['type', 'payload.userId']);
}

export function setTableMessage(index: number): any {
  return {
    type: 'board/setTable',
    payload: {
      currentPlayerIndex: index,
      deckLeft: 10,
      players: [
        {
          alive: true,
          index: 0,
          name: name,
          score: 0,
          shield: false
        },
        {
          alive: true,
          index: 1,
          name: name2,
          score: 0,
          shield: false
        },
        {
          alive: true,
          index: 2,
          name: name3,
          score: 0,
          shield: false
        },
        {
          alive: true,
          index: 3,
          name: name4,
          score: 0,
          shield: false
        }
      ],
      turnIndex: 0
    }
  };
}