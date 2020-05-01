import {PlayerId} from './loveletter';

export interface PlayerHandle {
  id: PlayerId;
  name?: string;
  ready: boolean;
}