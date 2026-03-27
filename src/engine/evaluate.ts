// 局面评估

import { Piece, PieceColor, BOARD_HEIGHT, BOARD_WIDTH, getPieceAt } from './board';

// 棋子基础价值
const PIECE_VALUES: Record<string, number> = {
  'k': 10000,  // 帅/将 - 最高价值
  'r': 1000,   // 车
  'c': 450,    // 炮
  'n': 450,    // 马
  'a': 200,    // 仕/士
  'b': 200,    // 相/象
  'p': 100,    // 兵/卒
};

// 兵/卒过河加成
const PAWN_RIVER_BONUS = 100;

// 位置价值表（红方视角，黑方镜像）
// 每个位置的价值加成，帮助AI更好地评估局面

// 帅的位置价值 - 九宫中心更有利
const KING_POSITIONS: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 5, 1, 0, 0, 0],
  [0, 0, 0, 2, 10, 2, 0, 0, 0],
  [0, 0, 0, 1, 5, 1, 0, 0, 0],
];

// 车的位置价值 - 控制中线很重要
const ROOK_POSITIONS: number[][] = [
  [6, 6, 6, 6, 6, 6, 6, 6, 6],
  [4, 4, 4, 4, 4, 4, 4, 4, 4],
  [2, 2, 3, 4, 4, 4, 3, 2, 2],
  [2, 2, 2, 3, 3, 3, 2, 2, 2],
  [1, 1, 1, 2, 2, 2, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// 马的位置价值
const KNIGHT_POSITIONS: number[][] = [
  [0, -2, -4, -6, -6, -6, -4, -2, 0],
  [0, -2, 0, 0, 0, 0, 0, -2, 0],
  [0, 0, 0, 2, 2, 2, 0, 0, 0],
  [0, 0, 2, 4, 4, 4, 2, 0, 0],
  [0, 0, 2, 4, 4, 4, 2, 0, 0],
  [0, 0, 0, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// 相的位置价值
const BISHOP_POSITIONS: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 2, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0],
];

// 仕的位置价值
const ADVISOR_POSITIONS: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 3, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0, 0],
];

// 炮的位置价值
const CANNON_POSITIONS: number[][] = [
  [0, 0, 1, 2, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 2, 2, 1, 0, 0],
  [1, 1, 1, 2, 2, 2, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 1],
  [2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 2, 2, 2, 1, 1, 1],
  [0, 0, 1, 2, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 2, 2, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// 兵的位置价值
const PAWN_POSITIONS: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [10, 20, 30, 45, 55, 45, 30, 20, 10],
  [10, 20, 30, 45, 55, 45, 30, 20, 10],
  [5, 10, 15, 20, 25, 20, 15, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// 获取位置价值表（考虑红黑方向）
function getPositionValue(positionTable: number[][], x: number, y: number, color: PieceColor): number {
  // 红方使用原表，黑方需要镜像
  if (color === 'red') {
    return positionTable[y][x];
  } else {
    // 黑方视角，y轴镜像
    return positionTable[BOARD_HEIGHT - 1 - y][x];
  }
}

// 评估局面
export function evaluate(board: (Piece | null)[][], pieces: Piece[]): number {
  let score = 0;
  
  for (const piece of pieces) {
    const pieceValue = PIECE_VALUES[piece.type] || 0;
    let posValue = 0;
    
    // 加上位置价值
    switch (piece.type) {
      case 'k':
        posValue = getPositionValue(KING_POSITIONS, piece.x, piece.y, piece.color);
        break;
      case 'r':
        posValue = getPositionValue(ROOK_POSITIONS, piece.x, piece.y, piece.color);
        break;
      case 'n':
        posValue = getPositionValue(KNIGHT_POSITIONS, piece.x, piece.y, piece.color);
        break;
      case 'b':
        posValue = getPositionValue(BISHOP_POSITIONS, piece.x, piece.y, piece.color);
        break;
      case 'a':
        posValue = getPositionValue(ADVISOR_POSITIONS, piece.x, piece.y, piece.color);
        break;
      case 'c':
        posValue = getPositionValue(CANNON_POSITIONS, piece.x, piece.y, piece.color);
        break;
      case 'p':
        posValue = getPositionValue(PAWN_POSITIONS, piece.x, piece.y, piece.color);
        // 兵过河额外加分
        const riverY = piece.color === 'red' ? 4 : 5;
        if ((piece.color === 'red' && piece.y <= riverY) || 
            (piece.color === 'black' && piece.y >= riverY)) {
          posValue += PAWN_RIVER_BONUS;
        }
        break;
    }
    
    const totalValue = pieceValue + posValue;
    
    if (piece.color === 'red') {
      score += totalValue;
    } else {
      score -= totalValue;
    }
  }
  
  return score;
}

// 获取棋子价值
export function getPieceValue(type: string, color: PieceColor, x: number, y: number): number {
  let value = PIECE_VALUES[type] || 0;
  
  // 兵过河加成
  if (type === 'p') {
    const riverY = color === 'red' ? 4 : 5;
    if ((color === 'red' && y <= riverY) || (color === 'black' && y >= riverY)) {
      value += PAWN_RIVER_BONUS;
    }
  }
  
  return value;
}
