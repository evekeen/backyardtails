import * as t from 'io-ts';
import {Reporter} from 'io-ts/lib/Reporter';
import * as WebSocket from 'ws';
import {PathReporter} from 'io-ts/lib/PathReporter';
import * as Either from 'fp-ts/lib/Either';
import {Validation} from "io-ts";
import {getCardIndex, LoveLetterGameState, PlayerId} from "./game/loveletter";
import _ = require("lodash");

export const MessageType = t.union([t.literal("connection/join"), t.literal("cardAction"), t.literal("state")])

export const Message = t.interface({
  type: MessageType
})

export const JoinMessage = t.interface({
  type: t.literal("connection/join"),
  payload: t.interface({
    gameId: t.union([t.string, t.undefined]),
    userId: t.union([t.string, t.undefined])
  }),
});

export const BoardStateMessage = t.interface({
  type: t.literal("state")
});

interface PlayerDescription {
  index: number,
  name: string
  score: number,
  alive: boolean,
  shield: boolean
}

export interface SetTableMessage {
  type: "board/setTable",
  payload: {
    deckLeft: number;
    discardPileTop: number | undefined;
    players: PlayerDescription[];
    turnIndex: number | undefined;
    currentPlayerIndex: number
  }
}

export enum ErrorCode {
  INVALID_MESSAGE = 500
}

interface ErrorResponse {
  code: number;
  message: string;
}


export function websocketReporter(ws: WebSocket): Reporter<void> {
  return {
    report: function (validation: Validation<any>) {
      if (Either.isLeft(validation)) {
        ws.send(JSON.stringify(error(ErrorCode.INVALID_MESSAGE, PathReporter.report(validation))));
      }
    }
  }
}

export function error(code: ErrorCode, message: any): ErrorResponse {
  return {
    code: code,
    message: JSON.stringify(message)
  }
}

export function createSetTableMessage(playerId: PlayerId, state: LoveLetterGameState): SetTableMessage {
  const player = state.getPlayer(playerId);
  const discardPileTop = _.last(player.discardPile);
  return {
    type: "board/setTable",
    payload: {
      deckLeft: state.deck.size(),
      discardPileTop: discardPileTop && getCardIndex(discardPileTop) || undefined,
      turnIndex: state.getPlayerIndex(state.activeTurnPlayerId),
      currentPlayerIndex: state.getPlayerIndex(playerId)!,
      players: state.players.map((player, index) => {
        return ({
          index: index,
          name: player.id,
          score: player.score,
          alive: player.alive,
          shield: player.hand.immune,
        });
      })
    }
  }
}