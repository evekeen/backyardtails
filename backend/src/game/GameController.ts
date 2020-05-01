import {ActionResult, GameAction, GameId, LoveLetterGame, LoveLetterGameState, Player, PlayerId} from './loveletter';
import {PlayerController} from '../PlayerController';
import {
  CardAction,
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

  addSpectator(userId: PlayerId, gameId: GameId, playerController: PlayerController): void {
    if (this.playerControllers.get(userId)) {
      console.log(`Ignored repeated connection for user ${userId}`);
      return;
    }
    this.subscribe(userId, gameId, playerController);

    let currentGame = this.games.get(gameId);
    if (currentGame && currentGame.hasPlayer(userId)) {
      // Send current state to joined user
    }

    let pendingPlayers = this.pendingGames.get(gameId);
    const status = {id: userId, ready: false};
    if (pendingPlayers) {
      pendingPlayers.push(status);
    } else {
      pendingPlayers = [status];
      this.pendingGames.set(gameId, pendingPlayers);
      console.log(`Pending game ${gameId} created!`);
    }
    console.log(`User ${userId} has joined ${gameId} as spectator`);
    pendingPlayers.forEach(h => this.broadcast(pendingPlayers!!, createJoinedMessage(h)));
  }

  onJoin(userId: PlayerId, name: string, gameId: GameId): void {
    const pendingPlayers = this.pendingGames.get(gameId)!!;
    if (getReady(pendingPlayers).length >= PLAYERS_COUNT) {
      this.send(userId, MO_MORE_SEATS);
      return;
    }
    console.log(`User ${userId} has joined ${gameId} as ${name}`);
    const index = pendingPlayers.findIndex(p => p.id === userId);
    pendingPlayers[index] = {...pendingPlayers[index], name, ready: true};
    this.pendingGames.set(gameId, pendingPlayers);

    pendingPlayers.forEach(h => this.broadcast(pendingPlayers!!, createJoinedMessage(h)));

    const readyPlayers = getReady(pendingPlayers);

    if (readyPlayers.length == PLAYERS_COUNT) {
      this.pendingGames.delete(gameId);
      const game = new LoveLetterGame(readyPlayers);
      this.games.set(gameId, game);
      console.log(`Created game ${gameId} with players ${readyPlayers}`)
      game.init()

      this.sendToTheGame(gameId, (player, game) => createSetTableMessage(player.id, game.state));
      this.sendToTheGame(gameId, (player, game) => createLoadCardMessage(player));
      this.sendToTheGame(gameId, (player, game) => createTextMessage(`It's ${game.state.activeTurnPlayerId}'s turn`));

      const player = game.state.getActivePlayer();
      this.send(player.id, createStartTurnMessage(player.hand.pendingCard!));
    }
  }

  disconnect(userId: PlayerId, gameId: GameId): void {
    const players = this.pendingGames.get(gameId);
    if (!players) {
      return;
    }
    const otherPlayers = players.filter(p => p.id !== userId);
    this.pendingGames.set(gameId, otherPlayers);
    this.playerControllers.delete(userId);
    this.broadcast(otherPlayers, createUserDisconnectedMessage(userId));
  }

  private subscribe(userId: PlayerId, gameId: GameId, playerController: PlayerController) {
    this.playerControllers.set(userId, playerController);

    playerController.on('cardAction', (action: CardAction) => {
      const game = this.games.get(gameId)!;
      const gameAction = this.createAction(game, playerController.userId, action);
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

        this.sendToTheGame(gameId, () => createTextMessage(`${userId} played ${cardName}${playerSuffix}`));
        // TODO report if a player is dead
        this.sendToTheGame(gameId, (player, game) => createSetTableMessage(player.id, game.state));

        const player = game.state.getActivePlayer();
        playerController.dispatch(createStartTurnMessage(player.hand.pendingCard!));
      }).catch(() => {
        // TODO
      });
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

  private broadcast(handles: PlayerHandle[], message: RemoteAction): void {
    handles.forEach(h => this.send(h.id, message));
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