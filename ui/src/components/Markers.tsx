import {Shield} from './Shield';
import {Score} from './Score';
import * as React from 'react';
import {Player} from '../model/Player';

interface MarkersProps {
  player?: Player;
}

export const Markers = (props: MarkersProps) => {
  return (
    <div className="markers">
      {props.player?.shield && <Shield/>}
      <Score score={props.player?.score || 0}/>
    </div>
  );
}