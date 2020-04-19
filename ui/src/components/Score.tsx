import * as React from 'react';

export interface ScoreProps {
  score: number;
}

export const Score = (props: ScoreProps) => {
  const tokens: number[] = Array.apply(null, Array(props.score)).map((x: any, i: number) => i);
  return (
    <ul className="score">
      {tokens.map(i => <li key={`token-${i}`}><LoveToken/></li>)}
    </ul>
  );
};

const LoveToken = () => {
  return (
    <img src="dist/img/mish.svg" alt="" width="50" height="auto"/>
  );
};