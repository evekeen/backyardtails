import {CardType} from '../src/game/commonTypes';
import {
  ControllersHelper,
  feedbackMessage,
  getMessages,
  message,
  name2,
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
      feedbackMessage({card: CardType.Princess, opponentIndex: 0, suicide: true}),
      message('info', 'Poruchik played Princess'),
      message('death', 'Poruchik has opened own veins'),
      turnMessage(name2),
    ]);
    expect(getMessages(send2)).toStrictEqual([
      message('info', 'Poruchik played Princess'),
      message('death', 'Poruchik has opened own veins'),
      turnMessage(name2),
      startTurnMessage(CardType.Handmaid)
    ]);
    expect(getMessages(send3)).toStrictEqual([
      message('info', 'Poruchik played Princess'),
      message('death', 'Poruchik has opened own veins'),
      turnMessage(name2),
    ]);
    expect(getMessages(send4)).toStrictEqual([
      message('info', 'Poruchik played Princess'),
      message('death', 'Poruchik has opened own veins'),
      turnMessage(name2)
    ]);
  }, 1000);
});
