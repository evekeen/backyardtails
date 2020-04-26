import {GameId, LoveLetterGame, PlayerId} from "./loveletter";
import {PlayerController} from "../PlayerController";

const PLAYERS_COUNT = 4; // TODO allow to alter this on game creation

export class GamesController {
  private playerControllers = new Map<PlayerId, PlayerController>();
  private pendingGames = new Map<GameId, PlayerId[]>();
  private games = new Map<GameId, LoveLetterGame>();

  onJoin(userId: string, gameId: string | undefined, playerController: PlayerController): void {
    const usedGameId = gameId || GamesController.generateGameId();
    this.playerControllers.set(userId, playerController);

    let currentGame = this.games.get(usedGameId);
    if (currentGame && currentGame.hasPlayer(userId)) {
      // Send current state to joined user
    }

    let pendingPlayers = this.pendingGames.get(usedGameId)
    if (pendingPlayers) {
      pendingPlayers.push(userId);
    } else {
      pendingPlayers = [userId];
      this.pendingGames.set(usedGameId, pendingPlayers);
    }

    if (pendingPlayers.length == PLAYERS_COUNT) {
      this.pendingGames.delete(usedGameId);
      const game = new LoveLetterGame(pendingPlayers);
      this.games.set(usedGameId, game);
    }
  }

  private static generateGameId(): string {
    return "Нарба" + Math.ceil(Math.random() * 100);
  }
}