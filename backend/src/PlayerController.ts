import {LoveLetterGame, LoveLetterGameState} from "./game/loveletter";
import {EventEmitter} from 'events';
import {JoinMessage} from "./protocol";
import {pipe} from "fp-ts/lib/pipeable";
import {fold} from "fp-ts/lib/Either";

export class PlayerController extends EventEmitter {
  private game: LoveLetterGame | undefined;

  constructor(private userId: string) {
    super();
    this.registerEventHandlers();
  }

  private registerEventHandlers() {

  }

  join(game: LoveLetterGame): void {
    this.game = game;
  }

  onMessage(type: string, message: any) {
    this.emit(type, message);
  }
}