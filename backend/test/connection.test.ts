import {PlayerControllerImpl} from '../src/PlayerController';
import {GamesController} from '../src/game/GamesController';
import Mock = jest.Mock;

const gameId = 'game-id';
const userId = 'user-id';
const name = 'Poruchik';

describe('connection', () => {
  let send: Mock;
  let controller: PlayerControllerImpl;
  let gamesController: GamesController;

  beforeEach(() => {
    send = jest.fn();
    gamesController = new GamesController();
    controller = new PlayerControllerImpl({send}, gamesController);
    controller.onMessage('connection/initSession', {
      type: 'connection/initSession',
      payload: userId
    });
    expect(send).toBeCalledTimes(0);
  });

  it('create game', () => {
    createGame(controller);
    expect(send).toBeCalledTimes(1);
    expect(send.mock.calls[0][0]).toBe(JSON.stringify({type: 'connection/gameCreated', payload: gameId}));
  }, 1000);

  it('create duplicated game', () => {
    createGame(controller);
    createGame(controller);
    expect(send).toBeCalledTimes(2);
    expect(send.mock.calls[1][0]).toBe(JSON.stringify({type: 'connection/gamePreexisted', payload: gameId}));
  }, 1000);

  it('join game', () => {
    createGame(controller);
    controller.onMessage('connection/join', {
      type: 'connection/join',
      payload: {gameId, userId}
    });
    expect(send).toBeCalledTimes(2);
    expect(send.mock.calls[1][0]).toBe(JSON.stringify({type: 'connection/userJoined', payload: {gameId, userId, ready: false}}));

    controller.onMessage('connection/join', {
      type: 'connection/join',
      payload: {gameId, userId, name}
    });
    expect(send).toBeCalledTimes(3);
    expect(send.mock.calls[2][0]).toBe(JSON.stringify({type: 'connection/userJoined', payload: {gameId, userId, name, ready: true}}));
  }, 1000);
});

function createGame(controller: PlayerControllerImpl): void {
  controller.onMessage('connection/createGame', {
    type: 'connection/createGame',
    payload: {gameId, userId}
  });
}
