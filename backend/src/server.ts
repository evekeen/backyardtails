import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import {AddressInfo} from 'net';
import * as session from 'express-session';
import {CreateGameMessage, error, ErrorCode, ForceGame, InitSession, JoinMessage, Message} from './protocol';
import {ThrowReporter} from 'io-ts/lib/ThrowReporter';
import * as Either from 'fp-ts/lib/Either';
import {fold} from 'fp-ts/lib/Either';
import {pipe} from 'fp-ts/lib/pipeable';
import {PlayerControllerImpl} from './PlayerController';
import {GamesController} from './game/GamesController';

const app = express();

const sessionParser = session({
  saveUninitialized: false,
  secret: 'Нарба',
  resave: false,
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
  const controller = new PlayerControllerImpl();

  const scheduleKa = (ws: WebSocket) => setTimeout(() => {
    controller.kaTimer = scheduleKa(ws);
    ws.send('ka');
  }, KA_INTERVAL);

  scheduleKa(ws);

  controller.on('connection/initSession', msg => {
    pipe(InitSession.decode(msg), fold(() => console.log('Failed to parse: ' + JSON.stringify(msg)),
      request => {
        console.log(`Init session for ${request.payload}`);
        gamesController.subscribe(controller, request.payload);
      }));
  });

  controller.on('connection/createGame', msg => {
    pipe(CreateGameMessage.decode(msg), fold(() => console.log('Failed to parse: ' + JSON.stringify(msg)),
      request => {
        const {gameId, userId} = request.payload;
        console.log(`Creating a game ${gameId} by user ${userId}...`);
        gamesController.onCreateGame(controller, gameId, userId);
      }));
  });

  controller.on('connection/join', msg => {
    pipe(JoinMessage.decode(msg), fold(() => console.log('Failed to parse: ' + JSON.stringify(msg)),
      request => {
        console.log(`Joining user ${request.payload.userId} to a game...`);
        gamesController.onJoin(controller, request.payload);
      }));
  });

  controller.on('connection/forceGame', msg => {
    pipe(ForceGame.decode(msg), fold(() => console.log('Failed to parse: ' + JSON.stringify(msg)),
      request => {
        gamesController.forceGame(controller, request.payload);
      }));
  });

  // Wait for hello message.
  ws.on('message', (m: string) => {
    const parsedMessage = Either.parseJSON(m, reason => {
      ws.send(error(ErrorCode.INVALID_MESSAGE, 'Invalid JSON received: ' + reason));
    });

    pipe(parsedMessage, Either.map(message => {
      const typedMessage = Message.decode(message);

      // websocketReporter(ws).report(typedMessage)
      pipe(typedMessage, fold(_ => ThrowReporter.report(typedMessage), m => {
        console.log('received: %s', JSON.stringify(m));
        const type = m.type;
        controller.onMessage(type, message);
      }));
    }));
  });

  controller.on('stateReady', state => {
    const userId = state.payload?.userId ? ` about ${state.payload.userId}` : '';
    console.log(`Sending ${state.type}${userId} to ${controller.userId}`);
    ws.send(JSON.stringify(state));
  });

  ws.on('error', (error) => console.log('Error: ' + error));
  ws.on('close', () => {
    console.log(`Disconnected ${controller.userId}`);
    gamesController.disconnect(controller);
    clearTimeout(controller.kaTimer);
    controller.kaTimer = undefined;
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

const KA_INTERVAL = 30000;