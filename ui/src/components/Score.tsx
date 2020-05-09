import * as React from 'react';

export interface ScoreProps {
  score: number;
}

export const Score = (props: ScoreProps) => {
  const tokens: number[] = Array.apply(null, Array(MAX_SCORE)).map((x: any, i: number) => MAX_SCORE - i - 1);
  return (
    <ul className="score">
      {tokens.map(i => <li key={`token-${i}`}><LoveToken active={i < props.score}/></li>)}
    </ul>
  );
};

interface TokenProps {
  active: boolean;
}

const LoveToken = (props: TokenProps) => {
  const src = props.active ? 'img/mish-active.svg' : 'img/mish.svg';
  return (
    <img src={src} alt=""/>
  );
};

const MAX_SCORE = 5;