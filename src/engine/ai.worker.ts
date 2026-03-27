// AI Worker - Web Worker实现

import { Piece, PieceColor, placePieces } from './board';
import { getBestMove } from './moves';

export interface AIRequest {
  pieces: Piece[];
  color: PieceColor;
  depth: number;
}

export interface AIResponse {
  move: {
    from: { x: number; y: number };
    to: { x: number; y: number };
  } | null;
  thinkingTime: number;
}

self.onmessage = (e: MessageEvent<AIRequest>) => {
  const startTime = performance.now();
  
  const { pieces, color, depth } = e.data;
  const board = placePieces(pieces);
  
  const move = getBestMove(board, pieces, color, depth);
  
  const thinkingTime = performance.now() - startTime;
  
  const response: AIResponse = {
    move: move ? { from: move.from, to: move.to } : null,
    thinkingTime
  };
  
  self.postMessage(response);
};
