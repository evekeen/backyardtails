import {CardType} from '../src/game/commonTypes';
import {
  feedbackMessage,
  getMessages,
  message,
  name2,
  name3,
  PlayerControllerHelper,
  setTableMessage,
  startTurnMessage,
  turnMessage
} from './PlayerControllerUtil';
import Mock = jest.Mock;

describe('actions', () => {
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

  it('guard', () => {
    const {send, send2, send3, send4} = helper.startGame(helper);
    helper.dispatch('cardAction', {card: CardType.Guard, playerIndex: 1, guess: CardType.Countess});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      players[1].alive = false;
      return {...table, payload: {...table.payload, deckLeft: 9, discardPileTop: CardType.Countess, turnIndex: 2, players}};
    }

    expect(getMessages(send, 9)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.Guard, killed: true, opponentIndex: 1}),
      message('info', 'Poruchik played Guard on Natasha - guessed Countess'),
      message('death', 'Natasha was found stabbed in a bathroom'),
      turnMessage(name3)
    ]);
    expect(getMessages(send2, 7)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      message('info', 'Poruchik played Guard on Natasha - guessed Countess'),
      message('death', 'Natasha was found stabbed in a bathroom'),
      turnMessage(name3)
    ]);
    expect(getMessages(send3, 7)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played Guard on Natasha - guessed Countess'),
      message('death', 'Natasha was found stabbed in a bathroom'),
      turnMessage(name3),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send4, 7)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played Guard on Natasha - guessed Countess'),
      message('death', 'Natasha was found stabbed in a bathroom'),
      turnMessage(name3)
    ]);

  }, 1000);

  it('priest', () => {
    const {send, send2, send3, send4} = helper.startGame(helper);
    helper.dispatch('cardAction', {card: CardType.Priest, playerIndex: 1});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      return {...table, payload: {...table.payload, deckLeft: 9, discardPileTop: CardType.Priest, turnIndex: 1, players}};
    }

    expect(getMessages(send, 9)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.Priest, opponentIndex: 1, opponentCard: CardType.Countess}),
      message('info', 'Poruchik played Priest on Natasha'),
      turnMessage(name2)
    ]);
    expect(getMessages(send2, 7)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      message('info', 'Poruchik played Priest on Natasha'),
      turnMessage(name2),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send3, 7)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played Priest on Natasha'),
      turnMessage(name2),
    ]);
    expect(getMessages(send4, 7)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played Priest on Natasha'),
      turnMessage(name2)
    ]);

  }, 1000);

  it('baron', () => {
    const {send, send2, send3, send4} = helper.startGame(helper);
    helper.dispatch('cardAction', {card: CardType.Baron, playerIndex: 1});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      players[0].alive = false;
      return {...table, payload: {...table.payload, deckLeft: 9, discardPileTop: CardType.Guard, turnIndex: 1, players}};
    }

    expect(getMessages(send, 9)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.Baron, killed: false, opponentIndex: 1, opponentCard: CardType.Countess}),
      message('info', 'Poruchik played Baron on Natasha'),
      turnMessage(name2)
    ]);
    expect(getMessages(send2, 7)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      message('info', 'Poruchik played Baron on Natasha'),
      turnMessage(name2),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send3, 7)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played Baron on Natasha'),
      turnMessage(name2),
    ]);
    expect(getMessages(send4, 7)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played Baron on Natasha'),
      turnMessage(name2)
    ]);

  }, 1000);
});
