import * as React from 'react';
import {Score} from './Score';
import {Player} from '../model/Player';
import {Card} from './Card';

export interface PlayerProps {
  player: Player;
  selectable: boolean;
  selected: boolean;
  onClick: (player: Player) => void;
}

export const OtherPlayer = (props: PlayerProps) => {
  const disabledClass = props.selectable ? '' : 'disabled';
  const selectedClass = props.selected ? 'player-selected' : '';
  return (
    <div className='player-wrapper'>
      <div className={`player ${selectedClass} ${disabledClass}`} onClick={() => props.onClick(props.player)}>
        <h3>{props.player?.name || 'Unknown'}</h3>
        <Card/>
      </div>
      <Score score={props.player?.score || 0}/>
    </div>
  );
};