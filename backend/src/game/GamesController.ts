import {ActionResult, BackyardTailsGame, BackyardTailsGameAction, BackyardTailsGameState, GameId, Player, PlayerId} from './backyardtails';
import {InGamePlayerController, InGamePlayerControllerInfo, PlayerController, ReadyPlayerController,} from '../PlayerController';
import {
  CardAction,
  createGameCreatedMessage,
  createGameNotFoundMessage,
  createGamePreexistedMessage,
  createJoinedMessage,
  createLoadCardMessage,
  createRoundVictoryMessage,
  createSetTableMessage,
  createStartTurnMessage,
  createTextMessage,
  createTradeMessage,
  createUserDisconnectedMessage,
  MO_MORE_SEATS,
  RemoteAction,
} from '../protocol';
import {cardNameMapping, CardType} from './commonTypes';
import {nextKilledText, nextSuicideText} from './Texts';
import {InvalidGameStateError} from '../error/InvalidGameStateError';

const PLAYERS_COUNT = 4; // TODO allow to alter this on game creation

export class GamesController {
  private playerControllers = new Map<PlayerId, PlayerController>();
  private pendingGames = new Map<GameId, InGamePlayerController[]>();
  private games = new Map<GameId, BackyardTailsGame>();

  onCreateGame(controller: PlayerController, gameId: GameId, userId: PlayerId): void {
    if (this.games.has(gameId) || this.pendingGames.has(gameId)) {
      console.log(`Game already exists ${gameId}`);
      controller.dispatch(createGamePreexistedMessage(gameId));
      return;
    }
    controller.setInfo({userId});
    this.pendingGames.set(gameId, []);
    controller.dispatch(createGameCreatedMessage(gameId));
  }

  onJoin(c: PlayerController, info: InGamePlayerControllerInfo): void {
    c.setInfo(info);
    const controller = c as InGamePlayerController;
    const {gameId, userId, name} = info;
    const pending = this.pendingGames.get(gameId);
    const game = this.games.get(gameId);
    if (pending === undefined && game === undefined) {
      console.log(`Game ${gameId} was not found`);
      controller.dispatch(createGameNotFoundMessage(gameId));
      return;
    }
    // TODO refactor: need to create a function to send whole game state to a particular user on reconnect
    // TODO keep a log of messages sent to users, so they can be send again
    if (game !== undefined && name) {
      this.tryJoinExistingGame(game, userId, controller as ReadyPlayerController);
    } else if (pending !== undefined) {
      const readyControllers = getReady(pending);
      if (!readyControllers.find(c => c.getInfo().userId === userId)) {
        if (getReady(readyControllers).length >= PLAYERS_COUNT) {
          console.log('game is full');
          controller.dispatch(MO_MORE_SEATS);
          return;
        }
        this.addToPending(controller);
      } else {
        this.sendJoined(controller, pending);
      }

      const newReady = getReady(pending);
      if (newReady.length === PLAYERS_COUNT) {
        this.pendingGames.delete(gameId);
        const game = new BackyardTailsGame(newReady);
        this.games.set(gameId, game);
        console.log(`Created game ${gameId} with players ${newReady.map(c => c.getInfo().userId)}`);
        game.init();
        newReady.forEach(c => initGameForPlayer(c, game));
      }
    }
  }

  disconnect(controller: PlayerController): void {
    const {gameId, userId} = controller.getInfo();
    if (!userId) {
      return;
    }
    this.playerControllers.delete(userId);
    if (!gameId) {
      return;
    }
    const game = this.games.get(gameId);
    const pending = this.pendingGames.get(gameId);
    controller.setInfo({gameId, userId});
    let otherPlayers: PlayerId[];
    if (game && game.hasPlayer(userId)) {
      otherPlayers = game.state.players.filter(p => p.id !== userId).map(p => p.id);
    } else if (pending) {
      const other = pending.filter(h => h.getInfo().userId !== userId);
      this.pendingGames.set(gameId, other);
      otherPlayers = other.map(h => h.getInfo().userId);
    } else {
      return;
    }

    this.broadcast(otherPlayers, createUserDisconnectedMessage(userId));
  }

  forceGame(controller: PlayerController, info: InGamePlayerControllerInfo) {
    const gameId = info.gameId;
    this.games.delete(gameId);
    this.pendingGames.delete(gameId);
    this.onCreateGame(controller, gameId, info.userId);
    const names = ['Поручик Ржевский', 'Наташа Ростова', 'Андрей Болконский', 'Пьер Безухов'];
    const controllers = Array.from(this.playerControllers.values());
    console.log('keys', Array.from(this.playerControllers.keys()));
    // console.log('controllers', controllers);
    const size = Math.min(names.length, controllers.length);
    for (let i = 0; i < size; i++) {
      const c = controllers[i];
      console.log('forcing', c, names[i]);
      const oldInfo = c.getInfo();
      const info = {gameId, userId: oldInfo.userId || `forced-${i}`, name: names[i]} as InGamePlayerControllerInfo;
      this.onJoin(c, info);
    }
  }

  subscribe(c: PlayerController, userId: PlayerId) {
    c.removeAllListeners('cardAction');
    c.setInfo({...c.getInfo(), userId});
    this.playerControllers.set(userId, c);

    // should be in game controller
    c.on('cardAction', (action: CardAction) => {
      const game = this.getGame(c);
      if (!game) {
        return;
      }
      const controller = c as InGamePlayerController;
      const gameAction = createAction(game, userId, action);
      let actionResult: ActionResult;
      try{
        actionResult = game.applyAction(gameAction);
      } catch (e) {
        console.log(e);
        return;
      }

      controller.dispatch({
        type: 'feedback/showFeedback',
        payload: {...actionResult, card: action.payload.card, trade: undefined},
      });

      const targetPlayer = action.payload.playerIndex !== undefined ? game.state.players[action.payload.playerIndex] : undefined;
      const opponentName = targetPlayer?.name;
      const playerSuffix = opponentName ? ` on ${opponentName}` : '';
      const guardGuess = action.payload.card === CardType.Guard && action.payload.guess ? ` - guessed ${cardNameMapping[action.payload.guess]}` : ''
      const cardName = cardNameMapping[action.payload.card];
      const name = controller.getInfo().name;
      this.sendToTheGame(game, () => createTextMessage(`${name} played ${cardName}${playerSuffix}${guardGuess}`, 'info'));
      if (actionResult.killed !== undefined) {
        const text = nextKilledText();
        const victim = actionResult.killed ? opponentName : name;
        this.sendToTheGame(game, () => createTextMessage(`${victim} ${text}`, 'death'));
      } else if (actionResult.suicide) {
        const text = nextSuicideText();
        this.sendToTheGame(game, () => createTextMessage(`${name} ${text}`, 'death'));
      } else if (actionResult.trade && targetPlayer) {
        this.send(targetPlayer.id, createTradeMessage(actionResult.trade));
      }

      if (game.state.winnerId) {
        this.onRoundEnd(game);
        return;
      }

      game.state.players.forEach(p => {
        if (p.updatedCard) {
          this.send(p.id, createLoadCardMessage(p));
          p.updatedCard = false;
        }
      });
      this.sendToTheGame(game, (player, game) => createSetTableMessage(player.id, game.state));
      this.sendToTheGame(game, (player, game) => createNextTurnLogMessage(game));

      const player = game.state.getActivePlayer();
      this.send(player.id, createStartTurnMessage(player.hand.pendingCard!));
    });
  }

  acknowledgeVictory(c: PlayerController): void {
    const game = this.getGame(c);
    if (!game) {
      return;
    }
    const controller = c as InGamePlayerController;
    if (game.state?.acknowledgeVictory(controller.getInfo().userId)) {
      this.nextRound(game);
    }
  }

  private getGame(controller: PlayerController): BackyardTailsGame | undefined {
    const {gameId, userId} = controller.getInfo();
    if (!gameId) {
      console.log(`Game was not found to acknowledge a victory`);
      controller.dispatch(createGameNotFoundMessage(gameId));
      return undefined;
    }
    const game = this.games.get(gameId);
    if (!game) {
      console.log(`Game ${gameId} was not found`);
      controller.setInfo({userId}); // Clear game id and name
      controller.dispatch(createGameNotFoundMessage(gameId));
      return undefined;
    }
    return game;
  }

  private addToPending(controller: InGamePlayerController) {
    const {gameId, userId, name} = controller.getInfo();
    const joinedAs = name ? name : 'spectator';
    const pending = this.pendingGames.get(gameId) || [];
    const index = pending.findIndex(p => p.getInfo().userId === userId);
    if (index === -1) {
      pending.push(controller);
    }
    this.pendingGames.set(gameId, pending);
    console.log(`User ${userId} has joined ${gameId} as ${joinedAs}`);
    this.sendJoined(controller, pending);
  }

  private tryJoinExistingGame(game: BackyardTailsGame, userId: string, controller: ReadyPlayerController) {
    if (game.hasPlayer(userId)) {
      this.joinActiveGame(game, controller);
    } else {
      console.log('game is already started without you');
      controller.setInfo({userId}); // Clear gameId and name
      controller.dispatch(MO_MORE_SEATS);
    }
  }

  private joinActiveGame(game: BackyardTailsGame, controller: ReadyPlayerController) {
    const {userId} = controller.getInfo();
    console.log(`Joining user ${userId} back`);
    const player = game.state.players.find(p => p.id === userId);
    if (!player) {
      console.log(`Could not find player ${userId} to re-join`);
      return;
    }
    player.controller = controller;
    this.sendJoined(controller, game.state.players.map(p => p.controller));
    initGameForPlayer(controller, game);
  }

  private sendJoined(controller: InGamePlayerController, controllers: InGamePlayerController[]) {
    controllers.filter(c => c.getInfo().userId !== controller.getInfo().userId).forEach(c => c.dispatch(createJoinedMessage(controller)));
    controllers.forEach(c => controller.dispatch(createJoinedMessage(c)));
  }

  private sendToTheGame(idOrGame: GameId | BackyardTailsGame, messageCreator: (player: Player, game: BackyardTailsGame) => RemoteAction): void {
    let game: BackyardTailsGame;
    if (typeof idOrGame === 'string') {
      if (!this.games.get(idOrGame)) {
        return;
      }
      game = this.games.get(idOrGame)!!;
    } else {
      game = idOrGame;
    }
    game.state.players.forEach((player: Player) => {
      const controller = this.playerControllers.get(player.id);
      if (!controller) {
        console.log(`Cannot find player controller ${player.id}`);
        return;
      }
      controller.dispatch(messageCreator(player, game));
    });
  }

  private broadcast(ids: Array<PlayerId>, message: RemoteAction): void {
    ids.forEach(id => this.send(id, message));
  }

  private send(playerId: PlayerId, message: RemoteAction): void {
    const controller = this.playerControllers.get(playerId);
    if (!controller) {
      console.log(`Cannot find player controller ${playerId}`);
      return;
    }
    controller.dispatch(message);
  }

  private onRoundEnd(game: BackyardTailsGame) {
    const winnerController = this.playerControllers.get(game.state.winnerId!!)!!;
    const winnerName = winnerController.getInfo().name!!;
    const cards = game.state.players.filter(p => p.alive).map(p => ({name: p.name, card: p.hand.card}));
    const endOfRound = {winnerName, cards};
    this.sendToTheGame(game, () => createRoundVictoryMessage(endOfRound));
    this.sendToTheGame(game, () => createTextMessage(`${winnerName} won the round!`, 'victory'));
  }

  private nextRound(game: BackyardTailsGame): void {
    const winnerController = this.playerControllers.get(game.state.winnerId!!)!!;
    const winnerName = winnerController.getInfo().name!!;
    if (!winnerController.isReady()) {
      console.log('Winner is not ready. Cannot start next round');
      this.sendToTheGame(game, () => createTextMessage(`${winnerName} is not ready. Cannot start next round`, 'error'));
      return;
    }
    game.state.start(winnerController as ReadyPlayerController);
    game.state.players.forEach(c => initGameForPlayer(c.controller, game));
  }
}

// Those things \/ Should be in a separate class responsible for the game. Probably BackyardTailsGame

function createAction(game: BackyardTailsGame, player: PlayerId, action: CardAction): BackyardTailsGameAction {
  const gameAction = game.getActionForCard(action);
  return actionFunc(action, player, gameAction);
}

function actionFunc(cardAction: CardAction, playerId: PlayerId,
  action: (me: Player, target: Player, s: BackyardTailsGameState) => ActionResult): BackyardTailsGameAction {
  const playerIndex = cardAction.payload.playerIndex;
  const playedCard = cardAction.payload.card;
  return {
    playerId: playerId,
    apply: (s: BackyardTailsGameState): ActionResult => {
      const me = s.getPlayer(playerId);
      const hand = me.hand;
      if (playedCard === hand.card) {
        hand.card = hand.pendingCard;
      }

      const targetPlayer = playerIndex !== undefined ? s.players[playerIndex] : me;
      if (targetPlayer.id !== me.id && targetPlayer.hand.immune) {
        //Should be blocked on fe side.
        throw new InvalidGameStateError('applying card to immune player');
      }

      return action(me, targetPlayer, s);
    },
  };
}

function createNextTurnLogMessage(game: BackyardTailsGame) {
  return createTextMessage(`It's ${game.state.getActivePlayer().name}'s turn`, 'turn');
}

function initGameForPlayer(controller: ReadyPlayerController, game: BackyardTailsGame) {
  const {userId} = controller.getInfo();
  controller.dispatch(createSetTableMessage(userId, game.state));
  controller.dispatch(createLoadCardMessage(game.state.getPlayer(userId)));
  const activePlayer = game.state.getActivePlayer();
  if (activePlayer.id === userId) {
    controller.dispatch(createStartTurnMessage(activePlayer.hand.pendingCard!));
  }
  controller.dispatch(createNextTurnLogMessage(game));
}

function getReady(controllers: PlayerController[]): ReadyPlayerController[] {
  return controllers.filter(c => c.isReady()) as ReadyPlayerController[];
}