import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import {AddressInfo} from 'net';
import * as session from 'express-session';
import {error, ErrorCode, JoinMessage, Message} from './protocol';
import {ThrowReporter} from 'io-ts/lib/ThrowReporter';
import * as Either from 'fp-ts/lib/Either';
import {fold} from 'fp-ts/lib/Either';
import {pipe} from 'fp-ts/lib/pipeable';
import {PlayerController} from './PlayerController';
import {GamesController} from './game/GameController';

const app = express();

const sessionParser = session({
  saveUninitialized: false,
  secret: "Нарба",
  resave: false
});

app.use(sessionParser);

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const gamesController = new GamesController();

function generateUserId(): string {
  return "User " + Math.ceil(Math.random() * 100);
}

function authenticate(req: any, callback: (userId: string) => any) {
  sessionParser(req, {} as any, () => {
    const requestUserId = req.session.userId || req.payload?.userId;
    if (!requestUserId) {
      const userId = generateUserId();
      console.log("Generated userId: " + userId);
      req.session.userId = userId;
      callback(userId);
    } else {
      callback(req.session.userId);
    }
  });
}

wss.on('connection', (ws: WebSocket, request: any) => {
  console.log('connection');
  authenticate(request, userId => {
    console.log(`authenticate ${request} ${userId}`);
    const playerController = new PlayerController(userId);

    playerController.on('connection/join', joinMessageObj => {
      console.log('join', joinMessageObj);
      pipe(JoinMessage.decode(joinMessageObj), fold(
        error => console.log("Failed to parse JoinMessage:" + error),
        joinMessage => {
          console.log(`Joining user ${userId} to a game...`);
          gamesController.onJoin(userId, joinMessage.payload.gameId, playerController)
        }));
    });

    // Wait for hello message.
    ws.on('message', (m: string) => {
      const parsedMessage = Either.parseJSON(m, reason => {
        ws.send(error(ErrorCode.INVALID_MESSAGE, "Invalid JSON received: " + reason));
      })

      pipe(parsedMessage, Either.map(message => {
        const typedMessage = Message.decode(message);

        // websocketReporter(ws).report(typedMessage)
        pipe(typedMessage, fold(_ => ThrowReporter.report(typedMessage), m => {
          console.log('received: %s', JSON.stringify(m));
          const type = m.type
          playerController.onMessage(type, message);
        }))
      }));
    });

    playerController.on('stateReady', state => {
      console.log(`Sending ${state.type} to ${playerController.userId}`)
      ws.send(JSON.stringify(state));
    });

    ws.on('error', (error) => console.log("Error: " + error));

    ws.send(JSON.stringify({type: 'ready', userId: userId}));
  });
});

server.on('upgrade', function upgrade(request, socket, head) {
  console.log("Connection upgrade!");
  console.log("Parsing session from request...");

  authenticate(request, userId => {
    console.log("Successfully parsed session for " + userId);

    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  });
});

//start our server
server.listen(process.env.WS_PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  console.log(`Server started on port ${address.port} :)`);
});