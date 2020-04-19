import * as _ from 'lodash';
import {Game} from "./loveletter";

interface GameStorage {
  createGame(id: string): void;
  applyAction(id: string, action: string): void;
}

class GameContainer<T, G extends Game<T>> {
  games: _.Dictionary<G> = {};
}
