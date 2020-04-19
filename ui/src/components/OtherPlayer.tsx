import * as React from 'react';
import {Score} from './Score';
import {Player} from '../model/Player';

export interface PlayerProps {
  player: Player;
}

export const OtherPlayer = (props: PlayerProps) => {
  return (
    <div className="player">
      <div className="player__name">
        <h3>{props.player?.name || 'Unknown'}</h3>
        <div className="ll-card">
          <div className="ll-card__box">
            <div className="ll-card__cover">
              <img src="dist/img/cover.jpg" alt=""/>
            </div>
          </div>
        </div>
      </div>
      <Score score={props.player?.score || 0}/>
    </div>
  );
};