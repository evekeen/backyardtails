import * as React from 'react';

export interface ScoreProps {
  score: number;
}

export const Score = (props: ScoreProps) => {
  const tokens: number[] = Array.apply(null, Array(MAX_SCORE)).map((x: any, i: number) => i);
  return (
    <ul className="score">
      {tokens.map(i => <li key={`token-${i}`}><LoveToken active={i <= props.score}/></li>)}
    </ul>
  );
};

interface TokenProps {
  active: boolean;
}

const LoveToken = (props: TokenProps) => {
  const src = props.active ? 'img/mish.svg' : 'img/mish-active.svg';
  return (
    <img src={src} alt="" width="50" height="auto"/>
  );
};

const MAX_SCORE = 5;