import * as t from 'io-ts';
import {Reporter} from 'io-ts/lib/Reporter';
import * as WebSocket from 'ws';
import {PathReporter} from 'io-ts/lib/PathReporter';
import * as Either from 'fp-ts/lib/Either';
import {Validation} from "io-ts";

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