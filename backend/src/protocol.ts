import * as t from 'io-ts';
import {Validation} from 'io-ts';
import {Reporter} from 'io-ts/lib/Reporter';
import * as WebSocket from 'ws';
import {PathReporter} from 'io-ts/lib/PathReporter';
import * as Either from 'fp-ts/lib/Either';
import {GameId, LoveLetterGameState, Player, PlayerId, TradeInfo} from './game/loveletter';
import {CardType, StatusMessageType} from './game/commonTypes';
import {InGamePlayerController} from './PlayerController';
import _ = require('lodash');

export const MessageType = t.union([
  t.literal('connection/initSession'),
  t.literal('connection/createGame'),
  t.literal('connection/join'),
  t.literal('connection/forceGame'),
  t.literal('cardAction'),
  t.literal('status/victoryAcknowledgement'),
  t.literal('state'),
]);

export const Message = t.interface({
  type: MessageType,
});

export const JoinMessage = t.interface({
  type: t.literal('connection/join'),
  payload: t.interface({
    gameId: t.string,
    userId: t.string,
    name: t.union([t.string, t.undefined]),
  }),
});

export const CreateGameMessage = t.interface({
  type: t.literal('connection/createGame'),
  payload: t.interface({
    gameId: t.string,
    userId: t.string,
  }),
});

export const InitSession = t.interface({
  type: t.literal('connection/initSession'),
  payload: t.string,
});

export const VictoryAcknowledgement = t.interface({
  type: t.literal('status/victoryAcknowledgement')
});

export const ForceGame = t.interface({
  type: t.literal('connection/forceGame'),
  payload: t.interface({
    gameId: t.string,
    userId: t.string,
  }),
});

export const BoardStateMessage = t.interface({
  type: t.literal('state'),
});

interface PlayerDescription {
  index: number,
  name: string
  score: number,
  alive: boolean,
  shield: boolean
}

export interface RemoteAction {
  type: string;
  payload: any;
}

export interface UserJoinedMessage {
  type: 'connection/userJoined',
  payload: {
    gameId: string;
    userId: string;
    name?: string;
    ready: boolean;
  };
}

export interface UserDisconnectedMessage {
  type: 'connection/userDisconnected',
  payload: PlayerId;
}

export interface GameNotFoundMessage {
  type: 'connection/gameNotFound',
  payload: GameId | undefined;
}

export interface GameCreatedMessage {
  type: 'connection/gameCreated',
  payload: GameId;
}

export interface GamePreexistedMessage {
  type: 'connection/gamePreexisted',
  payload: GameId;
}

export interface SetTableMessage {
  type: 'board/setTable',
  payload: {
    deckLeft: number;
    discardPileTop: number | undefined;
    players: PlayerDescription[];
    turnIndex: number | undefined;
    currentPlayerIndex: number
  }
}

export interface LoadCardMessage {
  type: 'yourTurn/loadCard',
  payload: {
    card: number;
  };
}

export interface StartTurnMessage {
  type: 'yourTurn/startTurn',
  payload: {
    card: number;
  }
}

export interface ShowFeedback {
  type: 'feedback/showFeedback',
  payload: {
    card: number;
    success: boolean;
    playerCard: number | undefined;
  };
}

export interface TradeMessage {
  type: 'feedback/reportTrade',
  payload: TradeInfo;
}

export interface CardAction {
  payload: {
    card: CardType;
    playerIndex: number | undefined;
    guess?: CardType;
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
    },
  };
}

export function error(code: ErrorCode, message: any): ErrorResponse {
  return {
    code: code,
    message: JSON.stringify(message),
  };
}

export function createJoinedMessage(controller: InGamePlayerController): UserJoinedMessage {
  return {
    type: 'connection/userJoined',
    payload: {
      ...controller.getInfo(),
      ready: controller.isReady(),
    },
  };
}

export function createUserDisconnectedMessage(userId: PlayerId): UserDisconnectedMessage {
  return {
    type: 'connection/userDisconnected',
    payload: userId,
  };
}

export function createGameNotFoundMessage(gameId?: GameId): GameNotFoundMessage {
  return {
    type: 'connection/gameNotFound',
    payload: gameId,
  };
}

export function createGameCreatedMessage(gameId: GameId): GameCreatedMessage {
  return {
    type: 'connection/gameCreated',
    payload: gameId,
  };
}

export function createGamePreexistedMessage(gameId: GameId): GamePreexistedMessage {
  return {
    type: 'connection/gamePreexisted',
    payload: gameId,
  };
}

export function createSetTableMessage(playerId: PlayerId, state: LoveLetterGameState): SetTableMessage {
  return {
    type: 'board/setTable',
    payload: {
      deckLeft: state.deck.size(),
      discardPileTop: _.last(state.discardPile),
      turnIndex: state.getPlayer(state.activeTurnPlayerId!).index,
      currentPlayerIndex: state.getPlayer(playerId).index,
      players: state.players.map((player, index) => {
        return ({
          index: index,
          name: player.name,
          score: player.score,
          alive: player.alive,
          shield: player.hand.immune,
        });
      }),
    },
  };
}

export function createLoadCardMessage(player: Player): LoadCardMessage {
  return {
    type: 'yourTurn/loadCard',
    payload: {
      card: player.hand.card!!,
    },
  };
}

export function createStartTurnMessage(card: CardType): StartTurnMessage {
  return {
    type: 'yourTurn/startTurn',
    payload: {card},
  };
}

export function createTextMessage(text: string, type?: StatusMessageType): RemoteAction {
  return {
    type: 'status/addMessage',
    payload: {text, type},
  };
}

export function createRoundVictoryMessage(winnerName: string): RemoteAction {
  return {
    type: 'status/reportRoundVictory',
    payload: winnerName,
  };
}

export function createTradeMessage(trade: TradeInfo): TradeMessage {
  return {
    type: 'feedback/reportTrade',
    payload: trade,
  };
}

export const MO_MORE_SEATS: RemoteAction = {
  type: 'connection/noMoreSeats',
  payload: 'Game has already started',
};