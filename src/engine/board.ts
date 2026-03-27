// 棋盘数据结构

export type PieceType = 'k' | 'r' | 'n' | 'b' | 'a' | 'c' | 'p'; // king, rook, knight, bishop, advisor, cannon, pawn
export type PieceColor = 'red' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  notation: string;
}

export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 10;

// 初始棋子布局
export function getInitialPieces(): Piece[] {
  return [
    // 红方 (下方)
    { type: 'r', color: 'red', x: 0, y: 0 },
    { type: 'n', color: 'red', x: 1, y: 0 },
    { type: 'b', color: 'red', x: 2, y: 0 },
    { type: 'a', color: 'red', x: 3, y: 0 },
    { type: 'k', color: 'red', x: 4, y: 0 },
    { type: 'a', color: 'red', x: 5, y: 0 },
    { type: 'b', color: 'red', x: 6, y: 0 },
    { type: 'n', color: 'red', x: 7, y: 0 },
    { type: 'r', color: 'red', x: 8, y: 0 },
    { type: 'c', color: 'red', x: 1, y: 2 },
    { type: 'c', color: 'red', x: 7, y: 2 },
    { type: 'p', color: 'red', x: 0, y: 3 },
    { type: 'p', color: 'red', x: 2, y: 3 },
    { type: 'p', color: 'red', x: 4, y: 3 },
    { type: 'p', color: 'red', x: 6, y: 3 },
    { type: 'p', color: 'red', x: 8, y: 3 },
    // 黑方 (上方)
    { type: 'r', color: 'black', x: 0, y: 9 },
    { type: 'n', color: 'black', x: 1, y: 9 },
    { type: 'b', color: 'black', x: 2, y: 9 },
    { type: 'a', color: 'black', x: 3, y: 9 },
    { type: 'k', color: 'black', x: 4, y: 9 },
    { type: 'a', color: 'black', x: 5, y: 9 },
    { type: 'b', color: 'black', x: 6, y: 9 },
    { type: 'n', color: 'black', x: 7, y: 9 },
    { type: 'r', color: 'black', x: 8, y: 9 },
    { type: 'c', color: 'black', x: 1, y: 7 },
    { type: 'c', color: 'black', x: 7, y: 7 },
    { type: 'p', color: 'black', x: 0, y: 6 },
    { type: 'p', color: 'black', x: 2, y: 6 },
    { type: 'p', color: 'black', x: 4, y: 6 },
    { type: 'p', color: 'black', x: 6, y: 6 },
    { type: 'p', color: 'black', x: 8, y: 6 },
  ];
}

// 创建空棋盘 (10行9列)
export function createEmptyBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    board[y] = [];
    for (let x = 0; x < BOARD_WIDTH; x++) {
      board[y][x] = null;
    }
  }
  return board;
}

// 将棋子放到棋盘上
export function placePieces(pieces: Piece[]): (Piece | null)[][] {
  const board = createEmptyBoard();
  pieces.forEach(piece => {
    board[piece.y][piece.x] = piece;
  });
  return board;
}

// 获取棋盘上特定位置的棋子
export function getPieceAt(board: (Piece | null)[][], x: number, y: number): Piece | null {
  if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) return null;
  return board[y][x];
}

// 复制棋盘
export function copyBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

// 复制棋子数组
export function copyPieces(pieces: Piece[]): Piece[] {
  return pieces.map(p => ({ ...p }));
}

// 移动棋子 (返回新的棋子数组)
export function movePiece(pieces: Piece[], from: Position, to: Position): Piece[] {
  const newPieces = copyPieces(pieces);
  const pieceIndex = newPieces.findIndex(p => p.x === from.x && p.y === from.y);
  if (pieceIndex === -1) return pieces;
  
  // 移除被吃的棋子
  const targetIndex = newPieces.findIndex(p => p.x === to.x && p.y === to.y);
  if (targetIndex !== -1) {
    newPieces.splice(targetIndex, 1);
  }
  
  // 移动棋子
  newPieces[pieceIndex] = { ...newPieces[pieceIndex], x: to.x, y: to.y };
  return newPieces;
}

// 获取某颜色的所有棋子
export function getPiecesByColor(pieces: Piece[], color: PieceColor): Piece[] {
  return pieces.filter(p => p.color === color);
}

// 查找将/帅的位置
export function findKing(board: (Piece | null)[][], color: PieceColor): Position | null {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const piece = board[y][x];
      if (piece && piece.type === 'k' && piece.color === color) {
        return { x, y };
      }
    }
  }
  return null;
}

// 检查两个位置之间是否直线且中间无子
export function isLineClear(board: (Piece | null)[][], from: Position, to: Position): boolean {
  if (from.x !== to.x && from.y !== to.y) return false;
  
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  
  let x = from.x + dx;
  let y = from.y + dy;
  
  while (x !== to.x || y !== to.y) {
    if (board[y][x] !== null) return false;
    x += dx;
    y += dy;
  }
  
  return true;
}

// 计算两点之间的步数
export function countSteps(from: Position, to: Position): number {
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}
