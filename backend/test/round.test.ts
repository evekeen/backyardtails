import {CardType} from '../src/game/commonTypes';
import {
  ControllersHelper,
  feedbackMessage,
  getMessages,
  loadCardMessage,
  message,
  name2,
  roundVictoryMessage,
  setTableMessage,
  startTurnMessage,
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

  it('end of round', () => {
    const [send, send2, send3, send4] = helper.startGame();
    helper.playCards(CardType.Handmaid, 9, 0);
    helper.clearSockets();
    helper.playCards(CardType.Handmaid, 1);

    function tableOnLastCard(table: any): any {
      const players = table.payload.players.map((p: any) => ({...p, shield: true}));
      players[2].shield = false;
      return {...table, payload: {...table.payload, deckLeft: 0, discardPileTop: CardType.Handmaid, turnIndex: 2, players}};
    }

    expect(getMessages(send)).toContainEqual(tableOnLastCard(setTableMessage(0)));
    helper.clearSockets();
    helper.playCards(CardType.Handmaid, 1);

    expect(getMessages(send)).toStrictEqual([
      message('info', 'Andrey played Handmaid'),
      message('victory', 'Natasha won the round!'),
      roundVictoryMessage(name2),
    ]);
    expect(getMessages(send2)).toStrictEqual([
      message('info', 'Andrey played Handmaid'),
      message('victory', 'Natasha won the round!'),
      roundVictoryMessage(name2),
    ]);
    expect(getMessages(send3)).toStrictEqual([
      feedbackMessage({card: CardType.Handmaid, opponentIndex: 2}),
      message('info', 'Andrey played Handmaid'),
      message('victory', 'Natasha won the round!'),
      roundVictoryMessage(name2),
    ]);
    expect(getMessages(send4)).toStrictEqual([
      message('info', 'Andrey played Handmaid'),
      message('victory', 'Natasha won the round!'),
      roundVictoryMessage(name2),
    ]);

    helper.clearSockets();
    helper.dispatch('status/victoryAcknowledgement', undefined, 0);
    helper.dispatch('status/victoryAcknowledgement', undefined, 1);
    helper.dispatch('status/victoryAcknowledgement', undefined, 2);
    helper.dispatch('status/victoryAcknowledgement', undefined, 3);

    function tableAfter(table: any): any {
      const players = [...table.payload.players];
      players[1].score = 1;
      return {...table, payload: {...table.payload, deckLeft: 10, discardPileTop: CardType.Handmaid, turnIndex: 1, players}};
    }

    expect(getMessages(send)).toStrictEqual([
      tableAfter(setTableMessage(0)),
      turnMessage(name2),
      loadCardMessage(CardType.Guard)
    ]);
    expect(getMessages(send2)).toStrictEqual([
      tableAfter(setTableMessage(1)),
      turnMessage(name2),
      loadCardMessage(CardType.Countess),
      startTurnMessage(CardType.Prince)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      tableAfter(setTableMessage(2)),
      turnMessage(name2),
      loadCardMessage(CardType.King)
    ]);
    expect(getMessages(send4)).toStrictEqual([
      tableAfter(setTableMessage(3)),
      turnMessage(name2),
      loadCardMessage(CardType.Guard)
    ]);
  }, 1000);
});
