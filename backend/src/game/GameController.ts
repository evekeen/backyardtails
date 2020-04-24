import * as _ from 'lodash';
import {Game, LoveLetterGame} from "./loveletter";

interface GameStorage {
  createGame(id: string): void;
  applyAction(id: string, action: string): void;
}

export class GamesController {
  private games = new Map<string, LoveLetterGame>();

  onJoin(userId: string, gameId: string | undefined): Promise<LoveLetterGame> {
    const usedGameId = gameId || GamesController.generateGameId();
    if (!this.games.has(usedGameId)) {
      const newGame = new LoveLetterGame();
      this.games.set(usedGameId, newGame);
      newGame.init();
    }

    const game = this.games.get(usedGameId)!;
    game.join({
      id: userId,
      name: userId
    })

    return Promise.resolve(game);
  }

  private static generateGameId(): string {
    return "Нарба" + Math.ceil(Math.random() * 100);
  }
}