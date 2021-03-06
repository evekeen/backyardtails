import {Dispatch, Store} from 'redux';
import {ActionRouter} from './ActionRouter';

const CONNECT_TIMEOUT = 60000;

const MIN_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 32000;
const RECONNECT_DELAY_GROWTH = 2;

const STOP_TRYING_AFTER = 60 * 60 * 1000; // 1hSTOP_TRYING_AFTER

const KEEP_ALIVE_MSG = 'ka';
const WS_READY_MSG = 'ready';
const KEEP_ALIVE_CHECK_INTERVAL = 30000;
// equals to akka connection timeout
const KEEP_ALIVE_MAX_INTERVAL = 60000;

export class WsClient {
  private ws: WebSocket;
  private terminated: boolean = false;
  private _connected: boolean = false;
  private autoReconnect: boolean = true;
  private readonly initReconnectDelay = MIN_RECONNECT_DELAY + Math.floor(Math.random() * MIN_RECONNECT_DELAY);

  private nextReconnectDelay = this.initReconnectDelay;
  private connectDelayTimer: number | undefined;
  private connectTimeoutTimer: number | undefined;

  private lastMsgTime: number = Date.now();

  private keepAliveCheckTimer: number | undefined;
  private router: ActionRouter;
  private queue: any[] = [];

  constructor(private readonly url: string) {
    window.addEventListener('unload', () => {
      this.terminated = true;
      if (this.ws) {
        this.terminateWs();
      }
    });
  }

  remoteMiddleware = (store: Store<any, any>) => {
    this.init(store.dispatch);
    return (next: any) => (action: any) => {
      if (action.meta === 'remote') {
        console.info('dispatching remote action', action);
        this.dispatchToWs(action);
      }
      next(action);
    };
  }

  private terminateWs(): void {
    this.deleteWs();
    this.stopTimers();
  }

  private init(localDispatch?: Dispatch<any>): void {
    if (localDispatch) {
      this.router = new ActionRouter(localDispatch);
    }
    if (this.terminated) return;

    console.debug('Init');

    if (!this.ws) {
      this.ws = new WebSocket(this.url);
      this.ws.addEventListener('open', this.onOpen);
      this.ws.addEventListener('message', this.onMessage);
      this.ws.addEventListener('close', this.onClose);
      this.ws.addEventListener('error', this.onError);
      this.connectTimeoutTimer = window.setTimeout(() => {
        this.ws!.close();
      }, CONNECT_TIMEOUT);
    }
  }

  private onClose = () => {
    if (this._connected) {
      console.debug('Disconnected');
      this._connected = false;
    }
    this.terminateWs();
    this.router.reportDisconnected();

    if (this.autoReconnect) {
      this.setupReconnect();
    }
  };

  private reportConnected(): void {
    console.debug('WebSocket is ready to work');
    this.stopTimers();
    this._connected = true;
    this.autoReconnect = true;
    this.nextReconnectDelay = this.initReconnectDelay;
    this.lastMsgTime = Date.now();
    // this.keepAliveCheckTimer = window.setInterval(this.keepAliveCheck, KEEP_ALIVE_CHECK_INTERVAL);
    this.router.reportConnected();
  }

  private setupReconnect = () => {
    if (Date.now() - this.lastMsgTime > STOP_TRYING_AFTER) {
      console.error(`Unable to establish connection in ${STOP_TRYING_AFTER}ms, stop trying.. Need to reload the page.`);
      this.autoReconnect = false;
      return;
    }

    console.warn(`Reconnect after ${this.nextReconnectDelay} ms`);
    this.connectDelayTimer = window.setTimeout(() => this.init(), this.nextReconnectDelay);

    this.nextReconnectDelay = Math.min(this.nextReconnectDelay * RECONNECT_DELAY_GROWTH, MAX_RECONNECT_DELAY);
  };

  private keepAliveCheck = () => {
    if (Date.now() - this.lastMsgTime > KEEP_ALIVE_MAX_INTERVAL) {
      console.warn('Keep alive was not received in time, reconnecting');
      this.ws!.close();
    }
  };

  private onMessage = (msg: any) => {
    console.info('received', msg);
    this.lastMsgTime = Date.now();
    if (msg === KEEP_ALIVE_MSG || msg?.data === KEEP_ALIVE_MSG) return;
    if (!msg || !msg.data) {
      return
    }
    try {
      const data = JSON.parse(msg.data);
      if (data.type === WS_READY_MSG) {
        this.reportConnected();
        this.sendPending();
        return;
      }
      this.router.onServerAction(data);
    } catch (err) {
      console.error(err);
      console.error(`Cannot parse message ${msg.data}`)
    }
  };

  private sendPending() {
    const queue = [...this.queue];
    this.queue = [];
    queue.filter(action => !this.dispatchToWs(action));
  }

  private deleteWs(): void {
    if (this.ws === undefined) return;
    this.ws.removeEventListener('open', this.onOpen);
    this.ws.removeEventListener('message', this.onMessage);
    this.ws.removeEventListener('close', this.onClose);
    this.ws.removeEventListener('error', this.onError);
    if ([WebSocket.OPEN, WebSocket.CONNECTING].indexOf(this.ws.readyState) > -1) {
      this.ws.close();
    }
    this.ws = undefined;
  }

  private stopTimers(): void {
    if (this.connectTimeoutTimer) {
      window.clearTimeout(this.connectTimeoutTimer);
      this.connectTimeoutTimer = undefined;
    }
    if (this.keepAliveCheckTimer) {
      window.clearTimeout(this.keepAliveCheckTimer);
      this.keepAliveCheckTimer = undefined;
    }
    if (this.connectDelayTimer) {
      window.clearTimeout(this.connectDelayTimer);
      this.connectDelayTimer = undefined;
    }
  }

  private dispatchToWs(action: any): boolean {
    if (!this._connected) {
      console.warn('Adding action to a queue due to ws being disconnected', action);
      this.queue.push(action);
      return false;
    }
    this.ws.send(JSON.stringify(action));
    console.info('sent', action);
    return true;
  };

  private onOpen = () => {
    if (!this._connected) {
      console.debug('Connected');
    }
  };

  private onError = (ev: ErrorEvent) => {
    console.warn('Socket closed with error: ', ev);
  };
}