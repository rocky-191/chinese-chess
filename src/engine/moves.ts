// 走法生成

import { Piece, Position, PieceColor, BOARD_WIDTH, BOARD_HEIGHT, placePieces, copyPieces, movePiece, getPieceAt } from './board';
import { getLegalMoves, isInCheck, wouldBeInCheck } from './rules';
import { evaluate } from './evaluate';

export interface MoveNode {
  piece: Piece;
  from: Position;
  to: Position;
  score: number;
}

// 获取所有合法着法（带评估分数，用于排序）
export function generateMoves(board: (Piece | null)[][], pieces: Piece[], color: PieceColor): MoveNode[] {
  const moves: MoveNode[] = [];
  const myPieces = pieces.filter(p => p.color === color);
  
  for (const piece of myPieces) {
    const legalMoves = getLegalMoves(board, piece);
    
    for (const to of legalMoves) {
      // 检查移动后是否会被将军
      if (wouldBeInCheck(board, piece, to, color)) continue;
      
      // 评估这个着法
      const score = evaluateMove(board, piece, to);
      
      // 创建棋子副本，确保move.piece是独立的对象
      moves.push({
        piece: { ...piece },
        from: { x: piece.x, y: piece.y },
        to,
        score
      });
    }
  }
  
  // 排序：吃子着法优先
  moves.sort((a, b) => b.score - a.score);
  
  return moves;
}

// 评估着法分数
function evaluateMove(board: (Piece | null)[][], piece: Piece, to: Position): number {
  let score = 0;
  const target = getPieceAt(board, to.x, to.y);
  
  // 吃子分数
  if (target) {
    const pieceValues: Record<string, number> = {
      'k': 10000, 'r': 1000, 'c': 450, 'n': 450, 'a': 200, 'b': 200, 'p': 100
    };
    score += pieceValues[target.type] || 0;
  }
  
  // 位置奖励（靠近中心的着法）
  const centerX = 4;
  const centerY = 4.5;
  const distFromCenter = Math.abs(to.x - centerX) + Math.abs(to.y - centerY);
  score -= distFromCenter * 2;
  
  return score;
}

// 执行移动
export function executeMove(pieces: Piece[], move: MoveNode): { newPieces: Piece[], captured: Piece | null } {
  const newPieces = copyPieces(pieces);
  let pieceIndex = newPieces.findIndex(p =>
    p.x === move.from.x && p.y === move.from.y
  );

  let captured: Piece | null = null;

  // 找被吃的棋子
  const capturedIndex = newPieces.findIndex(p =>
    p.x === move.to.x && p.y === move.to.y
  );

  if (capturedIndex !== -1) {
    captured = { ...newPieces[capturedIndex] };
    newPieces.splice(capturedIndex, 1);
    // splice 后若被吃棋子在移动棋子之前，索引需前移一位
    if (capturedIndex < pieceIndex) {
      pieceIndex--;
    }
  }

  // 移动棋子
  if (pieceIndex !== -1) {
    newPieces[pieceIndex] = { ...newPieces[pieceIndex], x: move.to.x, y: move.to.y };
  }

  return { newPieces, captured };
}

// 获取AI最佳着法
export function getBestMove(
  board: (Piece | null)[][],
  pieces: Piece[],
  color: PieceColor,
  depth: number
): MoveNode | null {
  const moves = generateMoves(board, pieces, color);
  
  if (moves.length === 0) return null;
  
  let bestMove: MoveNode | null = null;
  let bestScore = color === 'red' ? -Infinity : Infinity;
  
  for (const move of moves) {
    const { newPieces } = executeMove(pieces, move);
    const newBoard = placePieces(newPieces);
    
    const score = alphaBeta(
      newBoard,
      newPieces,
      depth - 1,
      -Infinity,
      Infinity,
      color === 'red' ? 'black' : 'red'
    );
    
    if (color === 'red') {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }
  
  return bestMove;
}

// Alpha-Beta剪枝搜索
function alphaBeta(
  board: (Piece | null)[][],
  pieces: Piece[],
  depth: number,
  alpha: number,
  beta: number,
  color: PieceColor
): number {
  // 达到搜索深度或游戏结束
  if (depth === 0) {
    return evaluate(board, pieces);
  }
  
  const opponentColor = color === 'red' ? 'black' : 'red';
  const moves = generateMoves(board, pieces, color);
  
  // 无子可动
  if (moves.length === 0) {
    if (isInCheck(board, color)) {
      // 被将死
      return color === 'red' ? -100000 + depth : 100000 - depth;
    } else {
      // 困毙
      return color === 'red' ? -50000 : 50000;
    }
  }
  
  if (color === 'red') {
    // 红方最大化
    let maxScore = -Infinity;
    
    for (const move of moves) {
      const { newPieces } = executeMove(pieces, move);
      const newBoard = placePieces(newPieces);
      
      const score = alphaBeta(newBoard, newPieces, depth - 1, alpha, beta, opponentColor);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      
      if (beta <= alpha) break; // 剪枝
    }
    
    return maxScore;
  } else {
    // 黑方最小化
    let minScore = Infinity;
    
    for (const move of moves) {
      const { newPieces } = executeMove(pieces, move);
      const newBoard = placePieces(newPieces);
      
      const score = alphaBeta(newBoard, newPieces, depth - 1, alpha, beta, opponentColor);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      
      if (beta <= alpha) break; // 剪枝
    }
    
    return minScore;
  }
}
