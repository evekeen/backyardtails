import {ActionResult, GameAction, GameId, LoveLetterGame, LoveLetterGameState, Player, PlayerId} from './loveletter';
import {InGamePlayerController, InGamePlayerControllerInfo, PlayerController, ReadyPlayerController,} from '../PlayerController';
import {
  CardAction,
  createGameCreatedMessage,
  createGameNotFoundMessage,
  createGamePreexistedMessage,
  createJoinedMessage,
  createLoadCardMessage,
  createSetTableMessage,
  createStartTurnMessage,
  createTextMessage,
  createUserDisconnectedMessage,
  MO_MORE_SEATS,
  RemoteAction,
} from '../protocol';
import {cardNameMapping} from './commonTypes';
import {nextKilledText, nextSuicideText} from './Texts';

const PLAYERS_COUNT = 4; // TODO allow to alter this on game creation

export class GamesController {
  private playerControllers = new Map<PlayerId, PlayerController>();
  private pendingGames = new Map<GameId, InGamePlayerController[]>();
  private games = new Map<GameId, LoveLetterGame>();

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

      if (getReady(readyControllers).length >= PLAYERS_COUNT) {
        console.log('game is full');
        controller.dispatch(MO_MORE_SEATS);
        return;
      }
      this.addToPending(controller);

      const newReady = getReady(pending);
      if (newReady.length === PLAYERS_COUNT) {
        this.pendingGames.delete(gameId);
        const game = new LoveLetterGame(newReady);
        this.games.set(gameId, game);
        console.log(`Created game ${gameId} with players ${newReady}`);
        game.init();
        newReady.forEach(c => GamesController.initGameForPlayer(c, game));
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

    let otherPlayers: PlayerId[];
    if (game && game.hasPlayer(userId)) {
      otherPlayers = game.state.players.filter(p => p.id !== userId).map(p => p.id);
      controller.setInfo({gameId, userId});
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

  private tryJoinExistingGame(game: LoveLetterGame, userId: string, controller: ReadyPlayerController) {
    if (game.hasPlayer(userId)) {
      this.joinActiveGame(game, controller);
    } else {
      console.log('game is already started without you');
      controller.setInfo({userId}); // Clear gameId and name
      controller.dispatch(MO_MORE_SEATS);
    }
  }

  private joinActiveGame(game: LoveLetterGame, controller: ReadyPlayerController) {
    const {userId} = controller.getInfo();
    console.log(`Joining user ${userId} back`);
    const player = game.state.players.find(p => p.id === userId);
    if (!player) {
      console.log(`Could not find player ${userId} to re-join`);
      return;
    }
    player.controller = controller;
    this.sendJoined(controller, game.state.players.map(p => p.controller));
    GamesController.initGameForPlayer(controller, game);
  }

  subscribe(c: PlayerController, userId: PlayerId) {
    c.removeAllListeners('cardAction');
    c.setInfo({...c.getInfo(), userId});
    this.playerControllers.set(userId, c);

    c.on('cardAction', (action: CardAction) => {
      const {gameId} = c.getInfo();
      if (!gameId) {
        console.error(`game-id was not set for ${userId}`);
        c.dispatch(createGameNotFoundMessage(gameId));
        return;
      }
      const controller = c as InGamePlayerController;
      const game = this.games.get(gameId);
      if (!game) {
        console.log(`Game ${gameId} was not found`);
        controller.setInfo({userId}); // Clear game id and name
        controller.dispatch(createGameNotFoundMessage(gameId));
        return;
      }
      const gameAction = this.createAction(game, userId, action);
      game.applyAction(gameAction).then(res => {
        controller.dispatch({
          type: 'feedback/showFeedback',
          payload: {...res, card: action.payload.card},
        });

        const opponentName = action.payload.playerIndex !== undefined ? game.state.players[action.payload.playerIndex].name : undefined;
        const playerSuffix = opponentName ? ` on ${opponentName}` : '';
        const cardName = cardNameMapping[action.payload.card];
        const name = controller.getInfo().name;
        this.sendToTheGame(gameId, () => createTextMessage(`${name} played ${cardName}${playerSuffix}`, 'info'));
        if (res.killed) {
          this.sendToTheGame(gameId, () => createTextMessage(`${opponentName} ${nextKilledText()}`, 'death'));
        } else if (res.suicide) {
          this.sendToTheGame(gameId, () => createTextMessage(`${name} ${nextSuicideText()}`, 'death'));
        }

        if (game.state.winnerId) {
          this.onRoundEnd(gameId, game);
          return;
        }

        game.state.players.forEach(p => {
          if (p.updatedCard) {
            this.send(p.id, createLoadCardMessage(p));
            p.updatedCard = false;
          }
        });
        this.sendToTheGame(gameId, (player, game) => createSetTableMessage(player.id, game.state));

        const player = game.state.getActivePlayer();
        this.send(player.id, createStartTurnMessage(player.hand.pendingCard!));
      }).catch(err => console.log(err));
    });
  }

  private sendJoined(controller: InGamePlayerController, controllers: InGamePlayerController[]) {
    controllers.filter(c => c.getInfo().userId !== controller.getInfo().userId).forEach(c => c.dispatch(createJoinedMessage(controller)));
    controllers.forEach(c => controller.dispatch(createJoinedMessage(c)));
  }

  private sendToTheGame(gameId: GameId, messageCreator: (player: Player, game: LoveLetterGame) => RemoteAction): void {
    const game = this.games.get(gameId);
    if (!game) {
      return;
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

  private createAction(game: LoveLetterGame, player: PlayerId, action: CardAction): GameAction<LoveLetterGameState> {
    const gameAction = game.getActionForCard(action);
    return this.action(action, player, gameAction);
  }

  private action(cardAction: CardAction, playerId: PlayerId,
    action: (me: Player, target: Player, s: LoveLetterGameState) => ActionResult): GameAction<LoveLetterGameState> {
    const playerIndex = cardAction.payload.playerIndex;
    const playedCard = cardAction.payload.card;
    return {
      playerId: playerId,
      apply: (s: LoveLetterGameState): Promise<ActionResult> => {
        const me = s.getPlayer(playerId);
        const hand = me.hand;
        if (playedCard === hand.card) {
          hand.card = hand.pendingCard;
        }

        const targetPlayer = playerIndex !== undefined ? s.players[playerIndex] : me;
        if (targetPlayer.id !== me.id && targetPlayer.hand.immune) {
          return Promise.reject();
        }

        return Promise.resolve(action(me, targetPlayer, s));
      },
    };
  }

  private onRoundEnd(gameId: GameId, game: LoveLetterGame) {
    const winnerController = this.playerControllers.get(game.state.winnerId!!)!!;
    const winnerName = winnerController.getInfo().name;
    if (!winnerController.isReady()) {
      console.log('Winner is not ready. Cannot start next round');
      this.sendToTheGame(gameId, () => createTextMessage(`${winnerName} is not ready. Cannot start next round`, 'error'));
      return;
    }
    this.sendToTheGame(gameId, () => createTextMessage(`${winnerName} won the round! Starting next one`, 'victory'));
    game.state.start(winnerController as ReadyPlayerController);
    game.state.players.forEach(c => GamesController.initGameForPlayer(c.controller, game));
  }

  private static initGameForPlayer(controller: ReadyPlayerController, game: LoveLetterGame) {
    const {userId} = controller.getInfo();
    controller.dispatch(createSetTableMessage(userId, game.state));
    controller.dispatch(createLoadCardMessage(game.state.getPlayer(userId)));
    const activePlayer = game.state.getActivePlayer();
    if (activePlayer.id === userId) {
      controller.dispatch(createStartTurnMessage(activePlayer.hand.pendingCard!));
    }
    controller.dispatch(createTextMessage(`It's ${activePlayer.name}'s turn`, 'info'));
  }
}

function getReady(controllers: PlayerController[]): ReadyPlayerController[] {
  return controllers.filter(c => c.isReady()) as ReadyPlayerController[];
}