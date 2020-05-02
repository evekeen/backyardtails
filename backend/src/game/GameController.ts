import {ActionResult, GameAction, GameId, LoveLetterGame, LoveLetterGameState, Player, PlayerId} from './loveletter';
import {PlayerController} from '../PlayerController';
import {
  CardAction,
  createGameNotFoundMessage,
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
import {PlayerHandle} from './PlayerHandle';

const PLAYERS_COUNT = 4; // TODO allow to alter this on game creation

export class GamesController {
  private playerControllers = new Map<PlayerId, PlayerController>();
  private pendingGames = new Map<GameId, PlayerHandle[]>();
  private games = new Map<GameId, LoveLetterGame>();

  onOpenGame(controller: PlayerController, gameId: GameId): void {
    const userId = controller.userId!!;
    if (this.playerControllers.get(userId)) {
      console.log(`Repeated openGame for user ${userId}`);
      return;
    }
    this.subscribe(userId, gameId, controller);

    if (this.games.has(gameId)) {
      console.log(`Game already exists ${gameId}`);
      const game = this.games.get(gameId)!!;
      if (game.hasPlayer(userId)) {
        this.joinActiveGame(game, userId, controller);
      }
      return;
    }

    let pendingPlayers = this.pendingGames.get(gameId);
    const handle = {id: userId, ready: false};
    if (pendingPlayers) {
      pendingPlayers.push(handle);
    } else {
      pendingPlayers = [handle];
      this.pendingGames.set(gameId, pendingPlayers);
      console.log(`Pending game ${gameId} created!`);
    }
    console.log(`User ${userId} has joined ${gameId} as spectator`);
    pendingPlayers.forEach(h => this.broadcast(pendingPlayers!!, createJoinedMessage(h)));
  }

  onJoin(controller: PlayerController, name: string, gameId: GameId): void {
    const userId = controller.userId!!;
    if (!this.playerControllers.get(userId)) {
      this.subscribe(userId, gameId, controller);
    }
    const pendingPlayers = this.pendingGames.get(gameId);
    const game = this.games.get(gameId);
    if (pendingPlayers === undefined && game === undefined) {
      console.log(`Game ${gameId} was not found`);
      controller.dispatch(createGameNotFoundMessage(gameId));
      return;
    }
    // TODO refactor: need to create a function to send whole game state to a particular user on reconnect
    // TODO keep a log of messages sent to users, so they can be send again
    if (game !== undefined && game.hasPlayer(userId)) {
      this.joinActiveGame(game, userId, controller);
      return;
    }

    if (pendingPlayers === undefined) {
      console.log('WTF', game);
      return;
    }

    if (getReady(pendingPlayers).length >= PLAYERS_COUNT) {
      controller.dispatch(MO_MORE_SEATS);
      return;
    }
    console.log(`User ${userId} has joined ${gameId} as ${name}`);
    const index = pendingPlayers.findIndex(p => p.id === userId);
    const handle = {id: userId, name, ready: true};
    if (index !== -1) {
      pendingPlayers[index] = handle;
      this.pendingGames.set(gameId, pendingPlayers);
    } else {
      pendingPlayers.push(handle);
      this.pendingGames.set(gameId, pendingPlayers);
    }
    console.log(pendingPlayers);
    pendingPlayers.forEach(h => this.broadcast(pendingPlayers!!, createJoinedMessage(h)));

    const readyPlayers = getReady(pendingPlayers);

    if (readyPlayers.length === PLAYERS_COUNT) {
      this.pendingGames.delete(gameId);
      const game = new LoveLetterGame(readyPlayers);
      this.games.set(gameId, game);
      console.log(`Created game ${gameId} with players ${readyPlayers}`)
      game.init()

      this.sendToTheGame(gameId, (player, game) => createSetTableMessage(player.id, game.state));
      this.sendToTheGame(gameId, (player) => createLoadCardMessage(player));
      this.sendToTheGame(gameId, (player, game) => createTextMessage(`It's ${game.state.activeTurnPlayerId}'s turn`));

      const player = game.state.getActivePlayer();
      this.send(player.id, createStartTurnMessage(player.hand.pendingCard!));
    }
  }

  private joinActiveGame(game: LoveLetterGame, userId: string, controller: PlayerController) {
    game.state.players.find(p => p.id === userId)!!.ready = true;
    const handles = game.state.players.filter(p => p.ready);
    game.state.players.forEach(h => this.broadcast(handles, createJoinedMessage(h)));

    controller.dispatch(createSetTableMessage(userId, game!!.state));
    controller.dispatch(createLoadCardMessage(game!!.state.getPlayer(userId)));
    const activePlayer = game!!.state.getActivePlayer();
    if (activePlayer.id === userId) {
      controller.dispatch(createStartTurnMessage(activePlayer.hand.pendingCard!));
    }
    controller.dispatch(createTextMessage(`It's ${activePlayer.id}'s turn`));
  }
  disconnect(userId: PlayerId | undefined, gameId: GameId | undefined): void {
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
      game.state.players.find(p => p.id === userId)!!.ready = false;
    } else if (pending) {
      const other = pending.filter(h => h.id !== userId);
      this.pendingGames.set(gameId, other);
      otherPlayers = other.map(h => h.id);
    } else {
      return;
    }

    this.broadcast(otherPlayers, createUserDisconnectedMessage(userId));
  }

  private subscribe(userId: PlayerId, gameId: GameId, controller: PlayerController) {
    controller.removeAllListeners('cardAction');
    this.playerControllers.set(userId, controller);

    controller.on('cardAction', (action: CardAction) => {
      const game = this.games.get(gameId);
      if (!game) {
        console.log(`Game ${gameId} was not found`);
        controller.dispatch(createGameNotFoundMessage(gameId));
        return;
      }
      const gameAction = this.createAction(game, controller.userId!!, action);
      game.applyAction(gameAction).then(res => {
        const controller = this.playerControllers.get(userId);
        if (!controller) {
          console.log(`Cannot find player controller ${userId}`);
          return;
        }
        controller.dispatch({
          type: 'feedback/showFeedback',
          payload: {...res, card: action.payload.card}
        });

        const playerSuffix = action.payload.playerIndex ? ` on ${game.state.players[action.payload.playerIndex].id}` : '';
        const cardName = cardNameMapping[action.payload.card];

        this.sendToTheGame(gameId, () => createTextMessage(`${controller.name} played ${cardName}${playerSuffix}`));
        // TODO report if a player is dead
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

  private broadcast(handles: Array<PlayerHandle | PlayerId>, message: RemoteAction): void {
    handles.forEach(h => {
      const id = typeof h === 'string' ? h : h.id;
      this.send(id, message)
    });
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

function getReady(handles: PlayerHandle[]): PlayerHandle[] {
  return handles.filter(p => p.ready);
}