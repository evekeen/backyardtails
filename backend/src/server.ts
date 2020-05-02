import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import {AddressInfo} from 'net';
import * as session from 'express-session';
import {error, ErrorCode, JoinMessage, Message, OpenGameMessage} from './protocol';
import {ThrowReporter} from 'io-ts/lib/ThrowReporter';
import * as Either from 'fp-ts/lib/Either';
import {fold} from 'fp-ts/lib/Either';
import {pipe} from 'fp-ts/lib/pipeable';
import {PlayerController} from './PlayerController';
import {GamesController} from './game/GameController';

const app = express();

const sessionParser = session({
  saveUninitialized: false,
  secret: 'Нарба',
  resave: false
});

app.use(sessionParser);

const server = http.createServer(app);
const wss = new WebSocket.Server({noServer: true});
const gamesController = new GamesController();

function generateUserId(): string {
  return 'u-' + Math.ceil(Math.random() * 100);
}

function authenticate(req: any, callback: (userId: string) => any) {
  sessionParser(req, {} as any, () => {
    if (!req.session.userId) {
      const userId = generateUserId();
      console.log('Generated userId: ' + userId);
      req.session.userId = userId;
      callback(userId);
    } else {
      callback(req.session.userId);
    }
  });
}

wss.on('connection', (ws: WebSocket, request: any) => {
  console.log('connection');
  // authenticate(request, sessionUserId => {
  const controller = new PlayerController();

  controller.on('connection/openGame', msg => {
    console.log('openGame', msg);
    pipe(OpenGameMessage.decode(msg), fold(() => console.log('Failed to parse: ' + msg),
      joinMessage => {
        const gameId = joinMessage.payload.gameId;
        const userId = joinMessage.payload.userId;
        controller.gameId = gameId;
        controller.userId = userId;
        console.log(`Added spectator ${userId} to a game...`);
        gamesController.addSpectator(controller, gameId)
      }));
  });

  controller.on('connection/join', msg => {
    console.log('join', msg);
    pipe(JoinMessage.decode(msg), fold(() => console.log('Failed to parse: ' + msg),
      joinMessage => {
        const gameId = joinMessage.payload.gameId;
        const userId = joinMessage.payload.userId;
        const name = joinMessage.payload.name;
        controller.gameId = gameId;
        controller.userId = userId;
        controller.name = name;
        console.log(`Joining user ${controller.userId} to a game...`);
        gamesController.onJoin(controller, name, gameId);
      }));
  });

  // Wait for hello message.
  ws.on('message', (m: string) => {
    const parsedMessage = Either.parseJSON(m, reason => {
      ws.send(error(ErrorCode.INVALID_MESSAGE, 'Invalid JSON received: ' + reason));
    })

    pipe(parsedMessage, Either.map(message => {
      const typedMessage = Message.decode(message);

      // websocketReporter(ws).report(typedMessage)
      pipe(typedMessage, fold(_ => ThrowReporter.report(typedMessage), m => {
        console.log('received: %s', JSON.stringify(m));
        const type = m.type
        controller.onMessage(type, message);
      }))
    }));
  });

  controller.on('stateReady', state => {
    console.log(`Sending ${state.type} to ${controller.userId}`)
    ws.send(JSON.stringify(state));
  });

  ws.on('error', (error) => console.log('Error: ' + error));
  ws.on('close', () => {
    console.log(`Disconnected ${controller.userId}`);
    gamesController.disconnect(controller.userId, controller.gameId)
  });
  ws.send(JSON.stringify({type: 'ready'}));
  // });
});

server.on('upgrade', function upgrade(request, socket, head) {
  console.log('Connection upgrade!');
  // console.log("Parsing session from request...");

  // authenticate(request, userId => {
  //   console.log("Successfully parsed session for " + userId);

  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
  // });
});

//start our server
server.listen(process.env.WS_PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  console.log(`Server started on port ${address.port} :)`);
});