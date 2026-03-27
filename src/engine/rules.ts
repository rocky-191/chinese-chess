// 规则校验

import { Piece, PieceColor, Position, BOARD_WIDTH, BOARD_HEIGHT, getPieceAt, findKing, isLineClear, countSteps } from './board';

// 将/帅移动规则
export function canKingMove(board: (Piece | null)[][], from: Position, to: Position, color: PieceColor): boolean {
  // 只能移动1格
  if (countSteps(from, to) !== 1) return false;
  
  // 九宫内移动
  const palaceX = color === 'red' ? [3, 4, 5] : [3, 4, 5];
  const palaceY = color === 'red' ? [0, 1, 2] : [7, 8, 9];
  
  if (!palaceX.includes(to.x) || !palaceY.includes(to.y)) return false;
  
  return true;
}

// 将帅对面检测
export function isKingsFacing(board: (Piece | null)[][]): boolean {
  const redKing = findKing(board, 'red');
  const blackKing = findKing(board, 'black');
  
  if (!redKing || !blackKing) return false;
  if (redKing.x !== blackKing.x) return false;
  
  // 检查中间是否有子
  const y1 = Math.min(redKing.y, blackKing.y);
  const y2 = Math.max(redKing.y, blackKing.y);
  
  for (let y = y1 + 1; y < y2; y++) {
    if (board[y][redKing.x] !== null) return false;
  }
  
  return true;
}

// 仕/士移动规则
export function canAdvisorMove(board: (Piece | null)[][], from: Position, to: Position, color: PieceColor): boolean {
  // 只能走斜线1格
  if (Math.abs(to.x - from.x) !== 1 || Math.abs(to.y - from.y) !== 1) return false;
  
  // 九宫内移动
  const palaceX = [3, 4, 5];
  const palaceY = color === 'red' ? [0, 1, 2] : [7, 8, 9];
  
  if (!palaceX.includes(to.x) || !palaceY.includes(to.y)) return false;
  
  return true;
}

// 相/象移动规则
export function canBishopMove(board: (Piece | null)[][], from: Position, to: Position, color: PieceColor): boolean {
  // 走"田"字，对角线2格
  if (Math.abs(to.x - from.x) !== 2 || Math.abs(to.y - from.y) !== 2) return false;
  
  // 不能过河
  const riverY = color === 'red' ? 5 : 4;
  if (color === 'red' && to.y > riverY) return false;
  if (color === 'black' && to.y < riverY) return false;
  
  // 塞象眼检测
  const eyeX = (from.x + to.x) / 2;
  const eyeY = (from.y + to.y) / 2;
  
  if (board[eyeY][eyeX] !== null) return false;
  
  return true;
}

// 马移动规则
export function canKnightMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // 走"日"字
  // 两种情况：横向1纵 向2，或纵向1横向2
  let isValid = false;
  let legX = from.x;
  let legY = from.y;
  
  if (Math.abs(dx) === 1 && Math.abs(dy) === 2) {
    isValid = true;
    legY = from.y + Math.sign(dy);
  } else if (Math.abs(dx) === 2 && Math.abs(dy) === 1) {
    isValid = true;
    legX = from.x + Math.sign(dx);
  } else {
    return false;
  }
  
  // 撇脚检测
  if (board[legY][legX] !== null) return false;
  
  return isValid;
}

// 车移动规则
export function canRookMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  // 只能直线移动
  if (from.x !== to.x && from.y !== to.y) return false;
  
  // 中间不能有子
  return isLineClear(board, from, to);
}

// 炮移动规则
export function canCannonMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  // 只能直线移动
  if (from.x !== to.x && from.y !== to.y) return false;
  
  const target = getPieceAt(board, to.x, to.y);
  
  // 数中间有多少子
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  
  let count = 0;
  let x = from.x + dx;
  let y = from.y + dy;
  
  while (x !== to.x || y !== to.y) {
    if (board[y][x] !== null) count++;
    x += dx;
    y += dy;
  }
  
  // 吃子时必须隔一子打
  if (target !== null) {
    return count === 1;
  }
  
  // 移动时中间不能有子
  return count === 0;
}

// 兵/卒移动规则
export function canPawnMove(board: (Piece | null)[][], from: Position, to: Position, color: PieceColor): boolean {
  // 棋盘：y=0是红方底线（下方），y=9是黑方底线（上方）
  // 河界在y=4和y=5之间
  // 红兵起始y=3，向上前进（y增大），过河后进入y>=5
  // 黑卒起始y=6，向下前进（y减小），过河后进入y<=4
  
  if (color === 'red') {
    // 红兵只能向上（y增大），不能后退
    if (to.y < from.y) return false;
    // 红兵过河前（y<=4）只能前进，过河后（y>=5）可横向
    if (from.y <= 4) {
      // 没过河，只能前进1格
      if (to.y === from.y + 1 && to.x === from.x) return true;
      return false;
    } else {
      // 已过河，可以前进或横向
      if (from.y === to.y && Math.abs(to.x - from.x) === 1) return true;
      if (to.y === from.y + 1 && to.x === from.x) return true;
      return false;
    }
  } else {
    // 黑卒只能向下（y减小），不能后退
    if (to.y > from.y) return false;
    // 黑卒过河前（y>=5）只能前进，过河后（y<=4）可横向
    if (from.y >= 5) {
      // 没过河，只能前进1格
      if (to.y === from.y - 1 && to.x === from.x) return true;
      return false;
    } else {
      // 已过河，可以前进或横向
      if (from.y === to.y && Math.abs(to.x - from.x) === 1) return true;
      if (to.y === from.y - 1 && to.x === from.x) return true;
      return false;
    }
  }
}

// 检查某颜色的棋子能否移动到某位置
export function canPieceMove(board: (Piece | null)[][], piece: Piece, to: Position): boolean {
  const { type, color, x, y } = piece;
  const from = { x, y };
  
  switch (type) {
    case 'k':
      return canKingMove(board, from, to, color);
    case 'a':
      return canAdvisorMove(board, from, to, color);
    case 'b':
      return canBishopMove(board, from, to, color);
    case 'n':
      return canKnightMove(board, from, to);
    case 'r':
      return canRookMove(board, from, to);
    case 'c':
      return canCannonMove(board, from, to);
    case 'p':
      return canPawnMove(board, from, to, color);
    default:
      return false;
  }
}

// 检查移动是否合法（包括不能移动到己方棋子上）
export function isValidMove(board: (Piece | null)[][], piece: Piece, to: Position): boolean {
  const target = getPieceAt(board, to.x, to.y);
  
  // 不能吃自己的棋子
  if (target && target.color === piece.color) return false;
  
  // 检查基本移动规则
  return canPieceMove(board, piece, to);
}

// 获取某棋子所有合法移动
export function getLegalMoves(board: (Piece | null)[][], piece: Piece): Position[] {
  const moves: Position[] = [];
  const { x, y, type, color } = piece;
  
  // 根据棋子类型生成可能的移动
  const possibleMoves = getPossibleMoves(type, color, x, y);
  
  for (const to of possibleMoves) {
    if (isValidMove(board, piece, to)) {
      moves.push(to);
    }
  }
  
  return moves;
}

// 根据棋子类型获取所有可能的移动位置（不考虑其他棋子）
export function getPossibleMoves(type: PieceType, color: PieceColor, x: number, y: number): Position[] {
  const moves: Position[] = [];
  
  switch (type) {
    case 'k': // 将帅
      [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy]) => {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < 9 && ny >= 0 && ny < 10) {
          moves.push({x: nx, y: ny});
        }
      });
      break;
      
    case 'a': // 仕
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dx,dy]) => {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < 9 && ny >= 0 && ny < 10) {
          moves.push({x: nx, y: ny});
        }
      });
      break;
      
    case 'b': // 相
      [[-2,-2],[-2,2],[2,-2],[2,2]].forEach(([dx,dy]) => {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < 9 && ny >= 0 && ny < 10) {
          moves.push({x: nx, y: ny});
        }
      });
      break;
      
    case 'n': // 马
      [[-1,-2],[-1,2],[1,-2],[1,2],[-2,-1],[-2,1],[2,-1],[2,1]].forEach(([dx,dy]) => {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < 9 && ny >= 0 && ny < 10) {
          moves.push({x: nx, y: ny});
        }
      });
      break;
      
    case 'r': // 车
      for (let i = 0; i < 10; i++) {
        if (i !== y) moves.push({x, y: i});
      }
      for (let i = 0; i < 9; i++) {
        if (i !== x) moves.push({x: i, y});
      }
      break;
      
    case 'c': // 炮
      for (let i = 0; i < 10; i++) {
        if (i !== y) moves.push({x, y: i});
      }
      for (let i = 0; i < 9; i++) {
        if (i !== x) moves.push({x: i, y});
      }
      break;
      
    case 'p': // 兵/卒
      // 楚河汉界：y=4和y=5之间是河界
      // 红兵起始y=3，向上前进（y增大），过河后进入y>=5
      // 黑卒起始y=6，向下前进（y减小），过河后进入y<=4
      
      if (color === 'red') {
        // 红兵过河前（y<=4）只能前进，过河后（y>=5）可横向
        if (y <= 4) {
          // 没过河，只能前进（y增大）
          if (y + 1 < 10) moves.push({x, y: y + 1});
        } else {
          // 已过河，可以前进或横向
          if (y + 1 < 10) moves.push({x, y: y + 1});
          if (x - 1 >= 0) moves.push({x: x - 1, y});
          if (x + 1 < 9) moves.push({x: x + 1, y});
        }
      } else {
        // 黑卒过河前（y>=5）只能前进，过河后（y<=4）可横向
        if (y >= 5) {
          // 没过河，只能前进（y减小）
          if (y - 1 >= 0) moves.push({x, y: y - 1});
        } else {
          // 已过河，可以前进或横向
          if (y - 1 >= 0) moves.push({x, y: y - 1});
          if (x - 1 >= 0) moves.push({x: x - 1, y});
          if (x + 1 < 9) moves.push({x: x + 1, y});
        }
      }
      break;
  }
  
  return moves;
}

// 检测是否被将军
export function isInCheck(board: (Piece | null)[][], color: PieceColor): boolean {
  const king = findKing(board, color);
  if (!king) return false;
  
  const opponentColor = color === 'red' ? 'black' : 'red';
  
  // 遍历对方所有棋子
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const piece = board[y][x];
      if (piece && piece.color === opponentColor) {
        if (canPieceMove(board, piece, king)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// 检测是否被将死
export function isCheckmate(board: (Piece | null)[][], pieces: Piece[], color: PieceColor): boolean {
  // 如果没有被将军，检查是否所有合法移动都会被将军
  if (!isInCheck(board, color)) return false;
  
  // 尝试所有可能的移动
  const myPieces = pieces.filter(p => p.color === color);
  
  for (const piece of myPieces) {
    const moves = getLegalMoves(board, piece);
    if (moves.length > 0) return false;
  }
  
  return true;
}

// 检测是否困毙（无子可动但未被将军）
export function isStalemate(board: (Piece | null)[][], pieces: Piece[], color: PieceColor): boolean {
  // 没有被将军
  if (isInCheck(board, color)) return false;
  
  // 所有棋子都无法移动
  const myPieces = pieces.filter(p => p.color === color);
  
  for (const piece of myPieces) {
    const moves = getLegalMoves(board, piece);
    if (moves.length > 0) return false;
  }
  
  return true;
}

// 模拟移动并检测是否会将军己方
export function wouldBeInCheck(board: (Piece | null)[][], piece: Piece, to: Position, color: PieceColor): boolean {
  // 创建棋盘副本
  const newBoard = board.map(row => row.map(cell => (cell ? {...cell} : null)));
  
  // 移除目标位置的棋子（如果是吃子）
  newBoard[to.y][to.x] = null;
  
  // 移动棋子
  newBoard[piece.y][piece.x] = null;
  newBoard[to.y][to.x] = { ...piece, x: to.x, y: to.y };
  
  // 检查是否被将军
  if (isInCheck(newBoard, color)) return true;
  
  // 检查将帅是否对面
  if (isKingsFacing(newBoard)) return true;
  
  return false;
}

type PieceType = 'k' | 'r' | 'n' | 'b' | 'a' | 'c' | 'p';
