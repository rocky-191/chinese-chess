// 象棋记谱法

import { Piece, Position, PieceColor } from '../engine/board';

// 棋子中文名称
const PIECE_NAMES: Record<string, { red: string; black: string }> = {
  'k': { red: '帅', black: '将' },
  'r': { red: '车', black: '车' },
  'n': { red: '马', black: '马' },
  'b': { red: '相', black: '象' },
  'a': { red: '仕', black: '士' },
  'c': { red: '炮', black: '炮' },
  'p': { red: '兵', black: '卒' },
};

// 数字转中文数字
const NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

// 纵线数字（红方视角）
const RED_COLUMNS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const BLACK_COLUMNS = ['9', '8', '7', '6', '5', '4', '3', '2', '1'];

// 获取纵线名称
function getColumnName(x: number, color: PieceColor): string {
  if (color === 'red') {
    return RED_COLUMNS[x];
  } else {
    return BLACK_COLUMNS[x];
  }
}

// 获取横线名称
function getRowName(y: number, color: PieceColor): string {
  if (color === 'red') {
    return NUMBERS[9 - y];
  } else {
    return NUMBERS[y];
  }
}

// 判断是否需要加"进"、"平"、"退"
function getMoveVerb(from: Position, to: Position, piece: Piece): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  switch (piece.type) {
    case 'k': // 帅将
    case 'r': // 车
    case 'c': // 炮
      if (dx === 0) {
        return dy < 0 ? '进' : '退';
      } else {
        return '平';
      }
    case 'n': // 马
    case 'b': // 相
    case 'a': // 仕
      if (dx === 0) {
        return dy < 0 ? '进' : '退';
      } else {
        return '进';
      }
    case 'p': // 兵
      const forward = piece.color === 'red' ? -1 : 1;
      if (from.y === (piece.color === 'red' ? 3 : 6)) {
        // 过河兵
        if (dx === 0) {
          return '进';
        } else {
          return '平';
        }
      } else {
        return '进';
      }
    default:
      return '';
  }
}

// 获取移动距离
function getMoveDistance(from: Position, to: Position, piece: Piece): string {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  
  switch (piece.type) {
    case 'k':
    case 'r':
    case 'c':
      if (dx === 0) {
        return NUMBERS[dy];
      } else {
        return getColumnName(to.x, piece.color);
      }
    case 'n':
    case 'a':
    case 'b':
      if (dx === 0) {
        return NUMBERS[dy];
      } else {
        return NUMBERS[dx];
      }
    case 'p':
      if (dx === 0) {
        return NUMBERS[dy];
      } else {
        return getColumnName(to.x, piece.color);
      }
    default:
      return '';
  }
}

// 生成着法描述
export function generateNotation(
  from: Position, 
  to: Position, 
  piece: Piece, 
  pieces: Piece[],
  isCapture: boolean
): string {
  const pieceName = PIECE_NAMES[piece.type][piece.color];
  
  // 统计同类型棋子位置（用于区分）
  const sameTypePieces = pieces.filter(
    p => p.type === piece.type && p.color === piece.color
  );
  
  let locationPrefix = '';
  
  if (sameTypePieces.length > 1) {
    // 有多个同类棋子，需要区分
    const fromPieces = sameTypePieces.filter(p => p.x === from.x);
    const toPieces = sameTypePieces.filter(p => p.x === to.x);
    
    if (fromPieces.length === 1) {
      // 只有一个棋子从这个位置出发
      locationPrefix = getColumnName(from.x, piece.color);
    } else if (toPieces.length === 1) {
      // 只有一个棋子到达这个位置
      locationPrefix = getColumnName(from.x, piece.color);
    } else {
      // 需要用纵线区分
      locationPrefix = getColumnName(from.x, piece.color);
    }
  } else {
    locationPrefix = getColumnName(from.x, piece.color);
  }
  
  const verb = getMoveVerb(from, to, piece);
  const distance = getMoveDistance(from, to, piece);
  
  const captureStr = isCapture ? '吃' : '';
  
  return `${pieceName}${locationPrefix}${verb}${distance}${captureStr}`;
}

// 简化的着法描述（用于显示）
export function getSimplifiedNotation(from: Position, to: Position, piece: Piece): string {
  const pieceName = PIECE_NAMES[piece.type][piece.color];
  const fromName = getColumnName(from.x, piece.color);
  const toName = getColumnName(to.x, piece.color);
  
  if (piece.type === 'r' || piece.type === 'c') {
    if (from.x === to.x) {
      return `${pieceName}${NUMBERS[Math.abs(to.y - from.y)]}`;
    } else {
      return `${pieceName}${fromName}平${getColumnName(to.x, piece.color)}`;
    }
  }
  
  return `${pieceName}${fromName}${toName}`;
}

// 获取棋子显示字符
export function getPieceChar(type: string, color: PieceColor): string {
  return PIECE_NAMES[type]?.[color] || '';
}
