// Zustand 状态管理

import { create } from 'zustand';
import { Piece, PieceColor as PieceColorType, Position, getInitialPieces, placePieces, copyPieces, movePiece } from '../engine/board';
export type PieceColor = PieceColorType;
import { isInCheck, isCheckmate, isStalemate, getLegalMoves } from '../engine/rules';
import { getBestMove, MoveNode } from '../engine/moves';
import { AIRequest, AIResponse } from '../engine/ai.worker';

export type GameStatus = 'playing' | 'red_wins' | 'black_wins' | 'draw';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'ai' | 'two-player';

interface ChessState {
  pieces: Piece[];
  selectedPiece: Piece | null;
  legalMoves: Position[];
  currentTurn: PieceColor;
  moveHistory: { from: Position; to: Position; piece: Piece; captured?: Piece }[];
  gameStatus: GameStatus;
  isAIThinking: boolean;
  playerColor: PieceColor;
  difficulty: Difficulty;
  gameMode: GameMode;
  lastMove: { from: Position; to: Position } | null;
  isInCheck: boolean;
  thinkingTime: number;
  
  // Actions
  selectPiece: (piece: Piece) => void;
  movePiece: (to: Position) => void;
  deselectPiece: () => void;
  undoMove: () => void;
  resetGame: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setPlayerColor: (color: PieceColor) => void;
  setGameMode: (mode: GameMode) => void;
  makeAIMove: () => void;
}

const getDepth = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'easy': return 2;
    case 'medium': return 3;
    case 'hard': return 4;
    default: return 3;
  }
};

// 音效函数
const playSound = (type: 'move' | 'capture' | 'check') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'move':
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'capture':
        oscillator.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'check':
        oscillator.frequency.value = 1200;
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  } catch (e) {
    // 音频不可用，静默处理
  }
};

export const useChessStore = create<ChessState>((set, get) => ({
  pieces: getInitialPieces(),
  selectedPiece: null,
  legalMoves: [],
  currentTurn: 'red',
  moveHistory: [],
  gameStatus: 'playing',
  isAIThinking: false,
  playerColor: 'red',
  difficulty: 'medium',
  gameMode: 'ai',
  lastMove: null,
  isInCheck: false,
  thinkingTime: 0,
  
  selectPiece: (piece: Piece) => {
    const state = get();
    if (state.gameStatus !== 'playing' || state.isAIThinking) return;
    if (piece.color !== state.currentTurn) return;
    // 在AI模式下，只有玩家自己的棋子可以被选择
    if (state.gameMode === 'ai' && piece.color !== state.playerColor) return;
    
    const board = placePieces(state.pieces);
    const moves = getLegalMoves(board, piece);
    
    set({ 
      selectedPiece: piece, 
      legalMoves: moves 
    });
  },
  
  deselectPiece: () => {
    set({ selectedPiece: null, legalMoves: [] });
  },
  
  movePiece: (to: Position) => {
    const state = get();
    const { selectedPiece, pieces, currentTurn, moveHistory } = state;
    
    if (!selectedPiece || state.gameStatus !== 'playing' || state.isAIThinking) return;
    
    // 验证是否是合法移动
    const board = placePieces(pieces);
    const allLegalMoves = getLegalMoves(board, selectedPiece);
    const isLegal = allLegalMoves.some(m => m.x === to.x && m.y === to.y);
    
    if (!isLegal) {
      console.log('非法移动:', {
        selectedPiece,
        to,
        allLegalMoves
      });
      return;
    }
    
    // 获取被吃的棋子
    const capturedPiece = pieces.find(p => p.x === to.x && p.y === to.y);
    
    // 调试日志：打印移动前的信息
    console.log('执行移动:', {
      from: { x: selectedPiece.x, y: selectedPiece.y },
      to,
      selectedPiece,
      piecesCount: pieces.length
    });
    
    // 执行移动
    const newPieces = movePiece(pieces, { x: selectedPiece.x, y: selectedPiece.y }, to);
    const newBoard = placePieces(newPieces);
    
    // 切换回合
    const nextTurn = currentTurn === 'red' ? 'black' : 'red';
    
    // 检查游戏状态
    let gameStatus: GameStatus = state.gameStatus;
    let inCheckState = false;
    
    if (isCheckmate(newBoard, newPieces, nextTurn)) {
      gameStatus = currentTurn === 'red' ? 'red_wins' : 'black_wins';
    } else if (isStalemate(newBoard, newPieces, nextTurn)) {
      gameStatus = 'draw';
    } else if (isInCheck(newBoard, nextTurn)) {
      inCheckState = true;
    }
    
    // 播放音效
    if (capturedPiece) {
      playSound('capture');
    } else {
      playSound('move');
    }
    
    if (inCheckState) {
      setTimeout(() => playSound('check'), 100);
    }
    
    set({
      pieces: newPieces,
      selectedPiece: null,
      legalMoves: [],
      currentTurn: nextTurn,
      moveHistory: [...moveHistory, { 
        from: { x: selectedPiece.x, y: selectedPiece.y }, 
        to, 
        piece: { ...selectedPiece },
        captured: capturedPiece 
      }],
      lastMove: { from: { x: selectedPiece.x, y: selectedPiece.y }, to },
      gameStatus,
      isInCheck: inCheckState,
    });
    
    // 在AI模式下，如果游戏未结束且下一步是AI走棋，触发AI
    if (state.gameMode === 'ai' && gameStatus === 'playing' && nextTurn !== state.playerColor) {
      setTimeout(() => get().makeAIMove(), 500);
    }
  },
  
  undoMove: () => {
    const state = get();
    if (state.moveHistory.length === 0 || state.isAIThinking) return;
    
    // 移除最后一步
    const newHistory = [...state.moveHistory];
    const lastMove = newHistory.pop()!;
    
    // 恢复棋子位置
    let newPieces = copyPieces(state.pieces);
    const movedPieceIndex = newPieces.findIndex(
      p => p.x === lastMove.to.x && p.y === lastMove.to.y
    );
    
    if (movedPieceIndex !== -1) {
      newPieces[movedPieceIndex] = { 
        ...newPieces[movedPieceIndex], 
        x: lastMove.from.x, 
        y: lastMove.from.y 
      };
    }
    
    // 如果有被吃的棋子，恢复它
    if (lastMove.captured) {
      newPieces.push(lastMove.captured);
    }
    
    // 切换回上一回合
    const nextTurn = state.currentTurn === 'red' ? 'black' : 'red';
    const board = placePieces(newPieces);
    const isInCheckState = isInCheck(board, nextTurn);
    
    set({
      pieces: newPieces,
      selectedPiece: null,
      legalMoves: [],
      currentTurn: nextTurn,
      moveHistory: newHistory,
      lastMove: newHistory.length > 0 
        ? { from: newHistory[newHistory.length - 1].from, to: newHistory[newHistory.length - 1].to }
        : null,
      gameStatus: 'playing',
      isInCheck: isInCheckState,
    });
  },
  
  resetGame: () => {
    set({
      pieces: getInitialPieces(),
      selectedPiece: null,
      legalMoves: [],
      currentTurn: 'red',
      moveHistory: [],
      gameStatus: 'playing',
      isAIThinking: false,
      lastMove: null,
      isInCheck: false,
      thinkingTime: 0,
    });
  },
  
  setDifficulty: (difficulty: Difficulty) => {
    set({ difficulty });
  },
  
  setPlayerColor: (playerColor: PieceColor) => {
    set({ playerColor });
  },

  setGameMode: (gameMode: GameMode) => {
    set({ gameMode });
    // 重置游戏
    get().resetGame();
  },

  makeAIMove: () => {
    const state = get();
    if (state.gameStatus !== 'playing' || state.isAIThinking || state.gameMode !== 'ai') return;
    
    set({ isAIThinking: true });
    
    const depth = getDepth(state.difficulty);
    const aiColor = state.playerColor === 'red' ? 'black' : 'red';
    
    // 使用 setTimeout 避免阻塞 UI
    setTimeout(() => {
      // 重新获取当前状态，确保使用最新的棋盘
      const currentState = get();
      const piecesCopy = copyPieces(currentState.pieces);
      const board = placePieces(piecesCopy);
      const move = getBestMove(board, piecesCopy, aiColor, depth);
      
      if (move) {
        // 在当前棋盘上找到对应的棋子（因为move.piece来自piecesCopy）
        // 再次重新获取当前状态，确保使用最新的棋盘
        const latestState = get();
        
        // 调试日志：打印移动信息
        console.log('AI移动信息:', {
          moveFrom: move.from,
          moveTo: move.to,
          movePiece: move.piece,
          movePieceX: move.piece.x,
          movePieceY: move.piece.y,
          movePieceType: move.piece.type,
          movePieceColor: move.piece.color
        });
        
        // 根据位置和类型查找棋子，确保找到正确的棋子
        // 注意：move.piece是副本，它的x,y坐标可能与move.from不一致
        // 我们使用move.from作为查找依据，因为它来自piecesCopy中的原始位置
        // 同时验证move.piece的x,y坐标是否与move.from一致
        const pieceMatch = latestState.pieces.find(p => 
          p.x === move.from.x && 
          p.y === move.from.y &&
          p.type === move.piece.type &&
          p.color === move.piece.color
        );
        
        // 如果找不到匹配的棋子，尝试使用move.piece的x,y坐标
        const currentPiece = pieceMatch || latestState.pieces.find(p => 
          p.x === move.piece.x && 
          p.y === move.piece.y &&
          p.type === move.piece.type &&
          p.color === move.piece.color
        );
        
        // 调试日志：打印找到的棋子
        console.log('找到的棋子:', currentPiece, '期望的棋子类型:', move.piece.type);
        
        if (currentPiece) {
          const moveBoard = placePieces(latestState.pieces);
          const legalMoves = getLegalMoves(moveBoard, currentPiece);
          
          // 验证目标位置是否在合法移动中
          const isLegal = legalMoves.some(m => m.x === move.to.x && m.y === move.to.y);
          
          if (isLegal) {
            set({ 
              selectedPiece: currentPiece, 
              legalMoves 
            });
            // 直接调用 movePiece，不使用 setTimeout
            const movePieceFn = get().movePiece;
            movePieceFn(move.to);
            set({ isAIThinking: false });
          } else {
            console.log('AI 移动不合法，跳过:', {
              currentPiece,
              to: move.to,
              legalMoves
            });
            set({ isAIThinking: false });
          }
        } else {
          console.log('未找到匹配的棋子:', {
            moveFrom: move.from,
            movePiece: move.piece,
            availablePieces: latestState.pieces.filter(p => p.color === aiColor)
          });
          set({ isAIThinking: false });
        }
      } else {
        // AI无子可动
        const newBoard = placePieces(piecesCopy);
        if (isStalemate(newBoard, piecesCopy, aiColor)) {
          set({ 
            gameStatus: aiColor === 'red' ? 'black_wins' : 'red_wins',
            isAIThinking: false 
          });
        } else if (isCheckmate(newBoard, piecesCopy, aiColor)) {
          set({ 
            gameStatus: aiColor === 'red' ? 'black_wins' : 'red_wins',
            isAIThinking: false 
          });
        } else {
          set({ isAIThinking: false });
        }
      }
    }, 100);
  },
}));
