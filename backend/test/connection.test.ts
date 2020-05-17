import {CardType} from '../src/game/commonTypes';
import {
  gameId,
  getMessages,
  joinMessage,
  loadCardMessage,
  name,
  name2,
  name3,
  name4,
  PlayerControllerHelper,
  setTableMessage,
  startTurnMessage,
  turnMessage,
  user2,
  user3,
  user4,
  userId
} from './PlayerControllerUtil';
import Mock = jest.Mock;

describe('connection', () => {
  let helper: PlayerControllerHelper;
  let send: Mock;

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.31415);
  });

  afterEach(() => {
    // @ts-ignore
    global.Math.random.mockRestore();
  })

  beforeEach(() => {
    helper = new PlayerControllerHelper();
    send = helper.send;
    expect(send).toBeCalledTimes(0);
  });

  it('create game', () => {
    helper.createGame();
    expect(send).toBeCalledTimes(1);
    expect(send.mock.calls[0][0]).toBe(JSON.stringify({type: 'connection/gameCreated', payload: gameId}));
  }, 1000);

  it('create duplicated game', () => {
    helper.createGame();
    helper.createGame();
    expect(send).toBeCalledTimes(2);
    expect(send.mock.calls[1][0]).toBe(JSON.stringify({type: 'connection/gamePreexisted', payload: gameId}));
  }, 1000);

  it('join game entering name', () => {
    helper.createGame();
    helper.dispatch('connection/join', {gameId, userId});
    expect(send).toBeCalledTimes(2);
    expect(send.mock.calls[1][0]).toBe(JSON.stringify({type: 'connection/userJoined', payload: {gameId, userId, ready: false}}));

    helper.dispatch('connection/join', {gameId, userId, name});
    expect(send).toBeCalledTimes(3);
    expect(send.mock.calls[2][0]).toBe(JSON.stringify({type: 'connection/userJoined', payload: {gameId, userId, name, ready: true}}));
  }, 1000);

  it('join game immediately', () => {
    helper.createGame();
    helper.dispatch('connection/join', {gameId, userId, name});
    expect(send).toBeCalledTimes(2);
    expect(send.mock.calls[1][0]).toBe(JSON.stringify({type: 'connection/userJoined', payload: {gameId, userId, name, ready: true}}));
  }, 1000);

  it('all joined', () => {
    const {send, send2, send3, send4} = helper.startGame(helper, false);

    expect(getMessages(send)).toStrictEqual([
      setTableMessage(0),
      {type: 'connection/gameCreated', payload: gameId},
      joinMessage(userId, name),
      joinMessage(user2, name2),
      joinMessage(user3, name3),
      joinMessage(user4, name4),
      turnMessage(name),
      loadCardMessage(CardType.Guard),
      startTurnMessage(CardType.Prince),
    ]);
    expect(getMessages(send2)).toStrictEqual([
      setTableMessage(1),
      joinMessage(userId, name),
      joinMessage(user2, name2),
      joinMessage(user3, name3),
      joinMessage(user4, name4),
      turnMessage(name),
      loadCardMessage(CardType.Countess)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      setTableMessage(2),
      joinMessage(userId, name),
      joinMessage(user2, name2),
      joinMessage(user3, name3),
      joinMessage(user4, name4),
      turnMessage(name),
      loadCardMessage(CardType.King)
    ]);
    expect(getMessages(send4)).toStrictEqual([
      setTableMessage(3),
      joinMessage(userId, name),
      joinMessage(user2, name2),
      joinMessage(user3, name3),
      joinMessage(user4, name4),
      turnMessage(name),
      loadCardMessage(CardType.Guard)
    ]);

  }, 1000);
});