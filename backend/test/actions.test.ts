import {CardType} from '../src/game/commonTypes';
import {
  ControllersHelper,
  feedbackMessage,
  getMessages,
  loadCardMessage,
  message,
  name2,
  name3,
  setTableMessage,
  startTurnMessage,
  tradeMessage,
  turnMessage
} from './PlayerControllerUtil';
import Mock = jest.Mock;

describe('actions', () => {
  let helper: ControllersHelper;
  let send: Mock;

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.31415);
  });

  afterEach(() => {
    // @ts-ignore
    global.Math.random.mockRestore();
  })

  beforeEach(() => {
    helper = new ControllersHelper();
    send = helper.send;
    expect(send).toBeCalledTimes(0);
  });

  it('guard', () => {
    const [send, send2, send3, send4] = helper.startGame();
    helper.dispatch('cardAction', {card: CardType.Guard, playerIndex: 1, guess: CardType.Countess});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      players[1].alive = false;
      return {...table, payload: {...table.payload, deckLeft: 9, discardPileTop: CardType.Countess, turnIndex: 2, players}};
    }

    expect(getMessages(send)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.Guard, killed: true, opponentIndex: 1}),
      message('info', 'Poruchik played Guard on Natasha - guessed Countess'),
      message('death', 'Natasha was found stabbed in a bathroom'),
      turnMessage(name3)
    ]);
    expect(getMessages(send2)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      message('info', 'Poruchik played Guard on Natasha - guessed Countess'),
      message('death', 'Natasha was found stabbed in a bathroom'),
      turnMessage(name3)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played Guard on Natasha - guessed Countess'),
      message('death', 'Natasha was found stabbed in a bathroom'),
      turnMessage(name3),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send4)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played Guard on Natasha - guessed Countess'),
      message('death', 'Natasha was found stabbed in a bathroom'),
      turnMessage(name3)
    ]);
  }, 1000);

  it('priest', () => {
    const [send, send2, send3, send4] = helper.startGame();
    helper.dispatch('cardAction', {card: CardType.Priest, playerIndex: 1});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      return {...table, payload: {...table.payload, deckLeft: 9, discardPileTop: CardType.Priest, turnIndex: 1, players}};
    }

    expect(getMessages(send)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.Priest, opponentIndex: 1, opponentCard: CardType.Countess}),
      message('info', 'Poruchik played Priest on Natasha'),
      turnMessage(name2)
    ]);
    expect(getMessages(send2)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      message('info', 'Poruchik played Priest on Natasha'),
      turnMessage(name2),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played Priest on Natasha'),
      turnMessage(name2),
    ]);
    expect(getMessages(send4)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played Priest on Natasha'),
      turnMessage(name2)
    ]);
  }, 1000);

  it('baron', () => {
    const [send, send2, send3, send4] = helper.startGame();
    helper.dispatch('cardAction', {card: CardType.Baron, playerIndex: 1});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      players[0].alive = false;
      return {...table, payload: {...table.payload, deckLeft: 9, discardPileTop: CardType.Guard, turnIndex: 1, players}};
    }

    expect(getMessages(send)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.Baron, killed: false, opponentIndex: 1, opponentCard: CardType.Countess}),
      message('info', 'Poruchik played Baron on Natasha'),
      message('death', 'Poruchik was found stabbed in a bathroom'),
      turnMessage(name2)
    ]);
    expect(getMessages(send2)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      message('info', 'Poruchik played Baron on Natasha'),
      message('death', 'Poruchik was found stabbed in a bathroom'),
      turnMessage(name2),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played Baron on Natasha'),
      message('death', 'Poruchik was found stabbed in a bathroom'),
      turnMessage(name2),
    ]);
    expect(getMessages(send4)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played Baron on Natasha'),
      message('death', 'Poruchik was found stabbed in a bathroom'),
      turnMessage(name2)
    ]);
  }, 1000);

  it('handmaid', () => {
    const [send, send2, send3, send4] = helper.startGame();
    helper.dispatch('cardAction', {card: CardType.Handmaid});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      players[0].shield = true;
      return {...table, payload: {...table.payload, deckLeft: 9, discardPileTop: CardType.Handmaid, turnIndex: 1, players}};
    }

    expect(getMessages(send)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.Handmaid, opponentIndex: 0}),
      message('info', 'Poruchik played Handmaid'),
      turnMessage(name2)
    ]);
    expect(getMessages(send2)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      message('info', 'Poruchik played Handmaid'),
      turnMessage(name2),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played Handmaid'),
      turnMessage(name2),
    ]);
    expect(getMessages(send4)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played Handmaid'),
      turnMessage(name2)
    ]);
  }, 1000);

  it('prince', () => {
    const [send, send2, send3, send4] = helper.startGame();
    helper.dispatch('cardAction', {card: CardType.Prince, playerIndex: 1});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      return {...table, payload: {...table.payload, deckLeft: 8, discardPileTop: CardType.Countess, turnIndex: 1, players}};
    }

    expect(getMessages(send)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.Prince, opponentCard: CardType.Countess, opponentIndex: 1, suicide: false}),
      message('info', 'Poruchik played Prince on Natasha'),
      turnMessage(name2)
    ]);
    expect(getMessages(send2)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      message('info', 'Poruchik played Prince on Natasha'),
      turnMessage(name2),
      loadCardMessage(CardType.Handmaid),
      startTurnMessage(CardType.Guard)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played Prince on Natasha'),
      turnMessage(name2),
    ]);
    expect(getMessages(send4)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played Prince on Natasha'),
      turnMessage(name2)
    ]);
  }, 1000);

  it('king', () => {
    const [send, send2, send3, send4] = helper.startGame();
    helper.dispatch('cardAction', {card: CardType.King, playerIndex: 1});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      return {...table, payload: {...table.payload, deckLeft: 9, discardPileTop: CardType.King, turnIndex: 1, players}};
    }

    expect(getMessages(send)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.King, opponentCard: CardType.Countess, opponentIndex: 1}),
      message('info', 'Poruchik played King on Natasha'),
      turnMessage(name2),
      loadCardMessage(CardType.Countess)
    ]);
    expect(getMessages(send2)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      tradeMessage({incoming: CardType.Guard, outgoing: CardType.Countess}),
      message('info', 'Poruchik played King on Natasha'),
      turnMessage(name2),
      loadCardMessage(CardType.Guard),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played King on Natasha'),
      turnMessage(name2),
    ]);
    expect(getMessages(send4)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played King on Natasha'),
      turnMessage(name2)
    ]);
  }, 1000);

  it('countess', () => {
    const [send, send2, send3, send4] = helper.startGame();
    helper.dispatch('cardAction', {card: CardType.Countess});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      return {...table, payload: {...table.payload, deckLeft: 9, discardPileTop: CardType.Countess, turnIndex: 1, players}};
    }

    expect(getMessages(send)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.Countess, opponentIndex: 0}),
      message('info', 'Poruchik played Countess'),
      turnMessage(name2),
    ]);
    expect(getMessages(send2)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      message('info', 'Poruchik played Countess'),
      turnMessage(name2),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played Countess'),
      turnMessage(name2),
    ]);
    expect(getMessages(send4)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played Countess'),
      turnMessage(name2)
    ]);
  }, 1000);

  it('princess', () => {
    const [send, send2, send3, send4] = helper.startGame();
    helper.dispatch('cardAction', {card: CardType.Princess});

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      players[0].alive = false;
      return {...table, payload: {...table.payload, deckLeft: 9, discardPileTop: CardType.Guard, turnIndex: 1, players}};
    }

    expect(getMessages(send)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      feedbackMessage({card: CardType.Princess, opponentIndex: 0, suicide: true}),
      message('info', 'Poruchik played Princess'),
      message('death', 'Poruchik has opened own veins'),
      turnMessage(name2),
    ]);
    expect(getMessages(send2)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      message('info', 'Poruchik played Princess'),
      message('death', 'Poruchik has opened own veins'),
      turnMessage(name2),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      message('info', 'Poruchik played Princess'),
      message('death', 'Poruchik has opened own veins'),
      turnMessage(name2),
    ]);
    expect(getMessages(send4)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      message('info', 'Poruchik played Princess'),
      message('death', 'Poruchik has opened own veins'),
      turnMessage(name2)
    ]);
  }, 1000);
});
