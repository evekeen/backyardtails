import {ActionResult, GameAction, GameId, LoveLetterGame, LoveLetterGameState, Player, PlayerId} from './loveletter';
import {InGamePlayerController, InGamePlayerControllerInfo, PlayerController, PlayerControllerInfo, ReadyPlayerController} from '../PlayerController';
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
  RemoteAction
} from '../protocol';
import {cardNameMapping} from './commonTypes';
import _ = require('lodash');

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
    controller.setInfo({gameId, userId});
    this.addToPending(controller as InGamePlayerController);
    controller.dispatch(createGameCreatedMessage(gameId));
  }

  onJoin(c: PlayerController, info: InGamePlayerControllerInfo): void {
    // this.resubscribe(controller, oldInfo);
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
    if (game !== undefined) {
      this.tryJoinExistingGame(game, userId, controller);
    } else if (pending !== undefined) {
      const readyControllers = getReady(pending);
      console.log('ready', readyControllers);

      if (getReady(readyControllers).length >= PLAYERS_COUNT) {
        console.log('game is full');
        controller.dispatch(MO_MORE_SEATS);
        return;
      }
      this.addToPending(controller);
      console.log('Pending', pending);

      const newReady = getReady(pending);
      if (newReady.length === PLAYERS_COUNT) {
        this.pendingGames.delete(gameId);
        const game = new LoveLetterGame(newReady);
        this.games.set(gameId, game);
        console.log(`Created game ${gameId} with players ${newReady}`)
        game.init()

        this.sendToTheGame(gameId, (player, game) => createSetTableMessage(player.id, game.state));
        this.sendToTheGame(gameId, (player) => createLoadCardMessage(player));
        this.sendToTheGame(gameId, (player, game) => createTextMessage(`It's ${game.state.activeTurnPlayerId}'s turn`));

        const player = game.state.getActivePlayer();
        this.send(player.id, createStartTurnMessage(player.hand.pendingCard!));
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
      const info = _.pick(controller, 'gameId', 'userId') as PlayerControllerInfo; // Clear name
      controller.setInfo(info);
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
    pending.filter(c => c.getInfo().userId !== userId).forEach(c => c.dispatch(createJoinedMessage(controller)));
    pending.forEach(c => controller.dispatch(createJoinedMessage(c)));
  }

  private tryJoinExistingGame(game: LoveLetterGame, userId: string, controller: InGamePlayerController) {
    if (game.hasPlayer(userId)) {
      this.joinActiveGame(game, controller);
    } else {
      console.log(game.state.players);
      console.log('game is already started without you');
      controller.setInfo({userId}); // Clear gameId and name
      controller.dispatch(MO_MORE_SEATS);
    }
  }

  private joinActiveGame(game: LoveLetterGame, controller: InGamePlayerController) {
    const {userId} = controller.getInfo();
    console.log(`Joining user ${userId} back`);
    const controllers = game.state.players.filter(p => p.controller.isReady()).map(p => p.controller);
    controllers.forEach(c => c.dispatch(createJoinedMessage(controller)));

    controller.dispatch(createSetTableMessage(userId, game!!.state));
    controller.dispatch(createLoadCardMessage(game!!.state.getPlayer(userId)));
    const activePlayer = game!!.state.getActivePlayer();
    if (activePlayer.id === userId) {
      controller.dispatch(createStartTurnMessage(activePlayer.hand.pendingCard!));
    }
    controller.dispatch(createTextMessage(`It's ${activePlayer.id}'s turn`));
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
          payload: {...res, card: action.payload.card}
        });

        const playerSuffix = action.payload.playerIndex ? ` on ${game.state.players[action.payload.playerIndex].name}` : '';
        const cardName = cardNameMapping[action.payload.card];
        const name = controller.getInfo().name;
        this.sendToTheGame(gameId, () => createTextMessage(`${name} played ${cardName}${playerSuffix}`));
        // TODO report if a player is dead

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
    const gameAction = game.getActionForCard(action)
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
        if (playedCard == hand.card) {
          hand.card = hand.pendingCard;
        }

        const targetPlayer = playerIndex ? s.players[playerIndex] : me;
        if (targetPlayer.id != me.id && targetPlayer.hand.immune) {
          return Promise.reject();
        }

        return Promise.resolve(action(me, targetPlayer, s));
      }
    };
  }
}

function getReady(controllers: PlayerController[]): ReadyPlayerController[] {
  return controllers.filter(c => c.isReady()) as ReadyPlayerController[];
}