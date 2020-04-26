import {GameId, LoveLetterGame, Player, PlayerId} from './loveletter';
import {PlayerController} from '../PlayerController';
import {CardAction, createLoadCardMessage, createSetTableMessage, createTextMessage, RemoteAction} from '../protocol';

const PLAYERS_COUNT = 4; // TODO allow to alter this on game creation

export class GamesController {
  private playerControllers = new Map<PlayerId, PlayerController>();
  private pendingGames = new Map<GameId, PlayerId[]>();
  private games = new Map<GameId, LoveLetterGame>();

  onJoin(userId: PlayerId, gameId: GameId | undefined, playerController: PlayerController): void {
    const usedGameId = gameId || GamesController.generateGameId();
    this.subscribe(userId, usedGameId, playerController);

    let currentGame = this.games.get(usedGameId);
    if (currentGame && currentGame.hasPlayer(userId)) {
      // Send current state to joined user
    }

    let pendingPlayers = this.pendingGames.get(usedGameId)
    if (pendingPlayers) {
      pendingPlayers.push(userId);
      console.log(`User ${userId} has joined to ${usedGameId}. ${PLAYERS_COUNT - pendingPlayers.length} players left.`);
    } else {
      pendingPlayers = [userId];
      this.pendingGames.set(usedGameId, pendingPlayers);
      console.log(`Pending game ${usedGameId} created!`);
      console.log(`User ${userId} has joined to ${usedGameId}. ${PLAYERS_COUNT - 1} players left.`);
    }

    if (pendingPlayers.length == PLAYERS_COUNT) {
      this.pendingGames.delete(usedGameId);
      const game = new LoveLetterGame(pendingPlayers);
      this.games.set(usedGameId, game);
      console.log(`Created game ${usedGameId} with players ${pendingPlayers}`)
      game.init()

      this.sendEveryone(usedGameId, (player, game) => createSetTableMessage(player.id, game.state));
      this.sendEveryone(usedGameId, (player, game) => createLoadCardMessage(player));
      this.sendEveryone(usedGameId, (player, game) => createTextMessage(`It's ${game.state.activeTurnPlayerId}'s turn`));
    }
  }

  private static generateGameId(): string {
    return "Нарба";
    // return "Нарба" + Math.ceil(Math.random() * 100);
  }

  private subscribe(userId: PlayerId, gameId: GameId, playerController: PlayerController) {
    this.playerControllers.set(userId, playerController);
    playerController.on('cardAction', (action: CardAction) => {

      const game = this.games.get(gameId)!!;
      // TODO game.applyAction()

      const controller = this.playerControllers.get(userId);
      if (!controller) {
        console.log(`Cannot find player controller ${userId}`);
        return;
      }
      controller.dispatch({
        type: 'feedback/showFeedback',
        payload: {
          card: action.payload.card,
          success: true,
          playerCard: undefined
        }
      });

      const playerSuffix = action.payload.playerIndex ? ` on ${game.state.players[action.payload.playerIndex].id}` : '';
      this.sendEveryone(gameId, () => createTextMessage(`${userId} played ${action.payload.card}${playerSuffix}`));
    });
  }

  private sendEveryone(gameId: GameId, messageCreator: (player: Player, game: LoveLetterGame) => RemoteAction): void {
    const game = this.games.get(gameId)!!;
    game.state.players.forEach((player: Player) => {
      const controller = this.playerControllers.get(player.id);
      if (!controller) {
        console.log(`Cannot find player controller ${player.id}`);
        return;
      }
      controller.dispatch(messageCreator(player, game));
    });
  }
}