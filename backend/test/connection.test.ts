import {PlayerControllerImpl} from '../src/PlayerController';
import {GamesController} from '../src/game/GamesController';
import {CardType} from '../src/game/commonTypes';
import _ = require('lodash');
import Mock = jest.Mock;

const gameId = 'game-id';

const userId = 'user-1';
const user2 = 'user-2';
const user3 = 'user-3';
const user4 = 'user-4';

const name = 'Poruchik';
const name2 = 'Natasha';
const name3 = 'Andrey';
const name4 = 'Pierre';

describe('connection', () => {
  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.31415);
  });

  afterEach(() => {
    // @ts-ignore
    global.Math.random.mockRestore();
  })

  let send: Mock;
  let controller: PlayerControllerImpl;
  let gamesController: GamesController;

  beforeEach(() => {
    send = jest.fn();
    gamesController = new GamesController();
    controller = initController(userId, send);
    expect(send).toBeCalledTimes(0);
  });

  it('create game', () => {
    createGame();
    expect(send).toBeCalledTimes(1);
    expect(send.mock.calls[0][0]).toBe(JSON.stringify({type: 'connection/gameCreated', payload: gameId}));
  }, 1000);

  it('create duplicated game', () => {
    createGame();
    createGame();
    expect(send).toBeCalledTimes(2);
    expect(send.mock.calls[1][0]).toBe(JSON.stringify({type: 'connection/gamePreexisted', payload: gameId}));
  }, 1000);

  it('join game entering name', () => {
    createGame();
    dispatch('connection/join', {gameId, userId});
    expect(send).toBeCalledTimes(2);
    expect(send.mock.calls[1][0]).toBe(JSON.stringify({type: 'connection/userJoined', payload: {gameId, userId, ready: false}}));

    dispatch('connection/join', {gameId, userId, name});
    expect(send).toBeCalledTimes(3);
    expect(send.mock.calls[2][0]).toBe(JSON.stringify({type: 'connection/userJoined', payload: {gameId, userId, name, ready: true}}));
  }, 1000);

  it('join game immediately', () => {
    createGame();
    dispatch('connection/join', {gameId, userId, name});
    expect(send).toBeCalledTimes(2);
    expect(send.mock.calls[1][0]).toBe(JSON.stringify({type: 'connection/userJoined', payload: {gameId, userId, name, ready: true}}));
  }, 1000);

  it('all joined', () => {
    const send2 = jest.fn();
    const send3 = jest.fn();
    const send4 = jest.fn();
    const c2 = initController(user2, send2);
    const c3 = initController(user3, send3);
    const c4 = initController(user4, send4);
    createGame();
    dispatch('connection/join', {gameId, userId, name});
    dispatch('connection/join', {gameId, userId: user2, name: name2}, c2);
    dispatch('connection/join', {gameId, userId: user3, name: name3}, c3);
    dispatch('connection/join', {gameId, userId: user4, name: name4}, c4);
    expect(getMessages(send)).toStrictEqual([
      setTableMessage(0),
      {type: 'connection/gameCreated', payload: gameId},
      joinMessage(userId, name),
      joinMessage(user2, name2),
      joinMessage(user3, name3),
      joinMessage(user4, name4),
      turnMessage('Poruchik'),
      loadCardMessage(CardType.Guard),
      startTurnMessage(CardType.Prince),
    ]);
    expect(getMessages(send2)).toStrictEqual([
      setTableMessage(1),
      joinMessage(userId, name),
      joinMessage(user2, name2),
      joinMessage(user3, name3),
      joinMessage(user4, name4),
      turnMessage('Poruchik'),
      loadCardMessage(CardType.Countess)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      setTableMessage(2),
      joinMessage(userId, name),
      joinMessage(user2, name2),
      joinMessage(user3, name3),
      joinMessage(user4, name4),
      turnMessage('Poruchik'),
      loadCardMessage(CardType.King)
    ]);
    expect(getMessages(send4)).toStrictEqual([
      setTableMessage(3),
      joinMessage(userId, name),
      joinMessage(user2, name2),
      joinMessage(user3, name3),
      joinMessage(user4, name4),
      turnMessage('Poruchik'),
      loadCardMessage(CardType.Guard)
    ]);

  }, 1000);

  function createGame(): void {
    dispatch('connection/createGame', {gameId, userId});
  }

  function dispatch(type: string, payload: any, c: PlayerControllerImpl = controller): void {
    c.onMessage(type, {type, payload});
  }

  function initController(userId: string, sender: Mock = send): PlayerControllerImpl {
    const c = new PlayerControllerImpl({send: sender}, gamesController);
    dispatch('connection/initSession', userId, c);
    return c;
  }
});

function turnMessage(name: string): any {
  return {
    type: 'status/addMessage',
    payload: {
      text: `It's ${name}'s turn`,
      type: 'turn'
    }
  };
}

function joinMessage(userId: string, name: string): any {
  return {type: 'connection/userJoined', payload: {gameId, userId, name, ready: true}};
}

function loadCardMessage(card: CardType): any {
  return {type: 'yourTurn/loadCard', payload: {card}};
}

function startTurnMessage(card: CardType): any {
  return {type: 'yourTurn/startTurn', payload: {card}};
}

function getMessages(send: Mock) {
  const args = send.mock.calls.map(call => JSON.parse(call[0]));
  return _.sortBy(args, ['type', 'payload.userId']);
}

function setTableMessage(index: number): any {
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