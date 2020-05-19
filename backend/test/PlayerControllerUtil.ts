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

export class ControllersHelper {
  public readonly send: Mock;
  public readonly gamesController: GamesController;
  private readonly controllers: PlayerControllerImpl[] = [];
  private sockets: Mock[];
  private lastIndex = 0;

  constructor() {
    this.send = jest.fn();
    this.sockets = [this.send];
    this.gamesController = new GamesController();
    this.addController(userId, this.send);
  }

  createGame(): void {
    this.dispatch('connection/createGame', {gameId, userId});
  }

  dispatch(type: string, payload: any, controllerIndex: number = 0): void {
    this.controllers[controllerIndex].onMessage(type, {type, payload});
    this.lastIndex = controllerIndex;
  }

  playCards(card: CardType, iterations: number, startIndex: number = (this.lastIndex + 1) % 4): void {
    if (iterations === 0) return;
    this.dispatch('cardAction', {card}, startIndex);
    this.playCards(card, iterations - 1, (startIndex + 1) % 4);
  }

  addController(userId: string, send: Mock = this.send): PlayerControllerImpl {
    const c = new PlayerControllerImpl({send}, this.gamesController);
    this.controllers.push(c);
    this.dispatch('connection/initSession', userId, this.controllers.length - 1);
    return c;
  }

  startGame(clear: boolean = true): Mock[] {
    this.sockets = [this.send, jest.fn(), jest.fn(), jest.fn()];
    this.addController(user2, this.sockets[1]);
    this.addController(user3, this.sockets[2]);
    this.addController(user4, this.sockets[3]);
    this.createGame();
    this.dispatch('connection/join', {gameId, userId, name}, 0);
    this.dispatch('connection/join', {gameId, userId: user2, name: name2}, 1);
    this.dispatch('connection/join', {gameId, userId: user3, name: name3}, 2);
    this.dispatch('connection/join', {gameId, userId: user4, name: name4}, 3);
    if (clear) {
      this.clearSockets();
    }
    return [...this.sockets];
  }

  clearSockets(): void {
    this.sockets.forEach(s => s.mockClear());
  }
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

export function tradeMessage(trade: any): any {
  return {type: 'feedback/reportTrade', payload: trade};
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

export function getMessages(send: Mock): Array<any> {
  const args = send.mock.calls.map(call => JSON.parse(call[0]));
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