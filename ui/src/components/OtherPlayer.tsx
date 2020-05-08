import * as React from 'react';
import {Score} from './Score';
import {Player} from '../model/Player';
import {Card} from './Card';
import _ = require('lodash');

export interface PlayerProps {
  active: boolean;
  player?: Player;
  selectable: boolean;
  selected: boolean;
  onClick: (player: Player) => void;
}

export const OtherPlayer = (props: PlayerProps) => {
  const disabledClass = props.selectable ? '' : 'disabled';
  const selectedClass = props.selected ? 'player-selected' : '';
  const activeClass = props.active ? 'player-active' : '';
  const deadClass = !props.player?.alive ? 'player-dead' : '';
  const select = props.selectable ? props.onClick : _.noop;
  return (
    <div className={`player-wrapper ${selectedClass} ${disabledClass} ${activeClass} ${deadClass}`}>
      <h3>{props.player?.name || 'Unknown'}</h3>
      <div className={`player ${selectedClass} ${disabledClass} ${activeClass} ${deadClass}`} onClick={() => select(props.player)}>
        <Card/>
        <Score score={props.player?.score || 0}/>
      </div>
    </div>
  );
};