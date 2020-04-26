import {GameId, LoveLetterGame, Player, PlayerId} from "./loveletter";
import {PlayerController} from "../PlayerController";
import {createLoadCardMessage, createSetTableMessage, LoadCardMessage, SetTableMessage} from '../protocol';

const PLAYERS_COUNT = 4; // TODO allow to alter this on game creation

export class GamesController {
  private playerControllers = new Map<PlayerId, PlayerController>();
  private pendingGames = new Map<GameId, PlayerId[]>();
  private games = new Map<GameId, LoveLetterGame>();

  onJoin(userId: PlayerId, gameId: GameId | undefined, playerController: PlayerController): void {
    const usedGameId = gameId || GamesController.generateGameId();
    this.subscribe(userId, playerController);

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

      game.state.players.forEach((player: Player) => {
        const controller = this.playerControllers.get(player.id);
        if (!controller) return;
        controller.dispatch<SetTableMessage>("board/setTable", createSetTableMessage(player.id, game.state));
        controller.dispatch<LoadCardMessage>("yourTurn/loadCard", createLoadCardMessage(player));
      });
    }
  }

  private static generateGameId(): string {
    return "Нарба";
    // return "Нарба" + Math.ceil(Math.random() * 100);
  }

  private subscribe(userId: PlayerId, playerController: PlayerController) {
    this.playerControllers.set(userId, playerController);
    playerController.on('cardAction', () => {
      // Handle card action
    });
  }
}