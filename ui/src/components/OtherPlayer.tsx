import * as React from 'react';
import {Score} from './Score';
import {Player} from '../model/Player';

export interface PlayerProps {
  player: Player;
  selected: boolean;
  onClick: (player: Player) => void;
}

export const OtherPlayer = (props: PlayerProps) => {
  const selectedClass = props.selected ? 'player-selected' : '';
  return (
    <div className='player-wrapper'>
      <div className={`player ${selectedClass}`} onClick={() => props.onClick(props.player)}>
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