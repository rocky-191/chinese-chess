// 棋盘组件 - Canvas渲染

import React, { useRef, useEffect, useCallback } from 'react';
import { useChessStore } from '../store/chessStore';
import { Position, Piece } from '../engine/board';
import { getPieceChar } from '../utils/notation';

const BOARD_WIDTH = 9;
const BOARD_HEIGHT = 10;
const CELL_SIZE = 55;
const PADDING = 30;
const PIECE_RADIUS = 22;
const BOARD_PIXEL_WIDTH = (BOARD_WIDTH - 1) * CELL_SIZE + PADDING * 2;
const BOARD_PIXEL_HEIGHT = (BOARD_HEIGHT - 1) * CELL_SIZE + PADDING * 2;

export const ChessBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    pieces, 
    selectedPiece, 
    legalMoves, 
    selectPiece, 
    movePiece, 
    deselectPiece,
    lastMove,
    isInCheck,
    gameStatus,
    playerColor,
  } = useChessStore();
  
  // 绘制棋盘
  const drawBoard = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT);
    
    // 绘制背景
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT);
    
    // 绘制边框
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, BOARD_PIXEL_WIDTH - 10, BOARD_PIXEL_HEIGHT - 10);
    
    // 绘制横线
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(PADDING, PADDING + y * CELL_SIZE);
      ctx.lineTo(PADDING + (BOARD_WIDTH - 1) * CELL_SIZE, PADDING + y * CELL_SIZE);
      ctx.stroke();
    }
    
    // 绘制竖线
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (x === 0 || x === BOARD_WIDTH - 1) {
        // 边线连续
        ctx.beginPath();
        ctx.moveTo(PADDING + x * CELL_SIZE, PADDING);
        ctx.lineTo(PADDING + x * CELL_SIZE, PADDING + (BOARD_HEIGHT - 1) * CELL_SIZE);
        ctx.stroke();
      } else {
        // 中间断开（楚河汉界）
        ctx.beginPath();
        ctx.moveTo(PADDING + x * CELL_SIZE, PADDING);
        ctx.lineTo(PADDING + x * CELL_SIZE, PADDING + 4 * CELL_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(PADDING + x * CELL_SIZE, PADDING + 5 * CELL_SIZE);
        ctx.lineTo(PADDING + x * CELL_SIZE, PADDING + (BOARD_HEIGHT - 1) * CELL_SIZE);
        ctx.stroke();
      }
    }
    
    // 绘制九宫格斜线
    ctx.beginPath();
    // 左上角
    ctx.moveTo(PADDING + 3 * CELL_SIZE, PADDING + 0 * CELL_SIZE);
    ctx.lineTo(PADDING + 5 * CELL_SIZE, PADDING + 2 * CELL_SIZE);
    ctx.moveTo(PADDING + 3 * CELL_SIZE, PADDING + 2 * CELL_SIZE);
    ctx.lineTo(PADDING + 5 * CELL_SIZE, PADDING + 0 * CELL_SIZE);
    // 右下角
    ctx.moveTo(PADDING + 3 * CELL_SIZE, PADDING + 7 * CELL_SIZE);
    ctx.lineTo(PADDING + 5 * CELL_SIZE, PADDING + 9 * CELL_SIZE);
    ctx.moveTo(PADDING + 3 * CELL_SIZE, PADDING + 9 * CELL_SIZE);
    ctx.lineTo(PADDING + 5 * CELL_SIZE, PADDING + 7 * CELL_SIZE);
    ctx.stroke();
    
    // 绘制楚河汉界
    ctx.font = 'bold 28px "SimSun", serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('楚 河', PADDING + 2 * CELL_SIZE, PADDING + 4.5 * CELL_SIZE);
    ctx.fillText('汉 界', PADDING + 6 * CELL_SIZE, PADDING + 4.5 * CELL_SIZE);
    
    // 绘制炮和兵的标记
    drawMark(ctx, 1, 2, 'p'); // 红炮
    drawMark(ctx, 7, 2, 'p'); // 红炮
    drawMark(ctx, 1, 7, 'p'); // 黑炮
    drawMark(ctx, 7, 7, 'p'); // 黑炮
    
    for (let x of [0, 2, 4, 6, 8]) {
      drawMark(ctx, x, 3, 's'); // 红兵
      drawMark(ctx, x, 6, 's'); // 黑卒
    }
  }, []);
  
  // 绘制标记
  const drawMark = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string) => {
    const cx = PADDING + x * CELL_SIZE;
    const cy = PADDING + y * CELL_SIZE;
    const size = 6;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    if (type === 'p') {
      // 绘制米字标记
      ctx.beginPath();
      ctx.moveTo(cx - size, cy - size);
      ctx.lineTo(cx + size, cy + size);
      ctx.moveTo(cx + size, cy - size);
      ctx.lineTo(cx - size, cy + size);
      ctx.stroke();
    } else {
      // 绘制三角形标记
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx - size, cy + size);
      ctx.lineTo(cx + size, cy + size);
      ctx.closePath();
      ctx.stroke();
    }
  };
  
  // 绘制棋子
  const drawPiece = useCallback((ctx: CanvasRenderingContext2D, piece: Piece, isSelected: boolean, isLastMove: boolean) => {
    // 棋盘坐标 y=0 在红方底线（屏幕下方），y=9 在黑方底线（屏幕上方）
    // Canvas 渲染 y=0 在顶部、y=9 在底部，需要翻转 y 轴使红方显示在屏幕下方
    const cx = PADDING + piece.x * CELL_SIZE;
    const cy = PADDING + (BOARD_HEIGHT - 1 - piece.y) * CELL_SIZE;
    
    // 绘制选中高亮
    if (isSelected) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(cx, cy, PIECE_RADIUS + 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 绘制上一步移动位置高亮
    if (isLastMove) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, PIECE_RADIUS + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // 绘制棋子背景
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = piece.color === 'red' ? '#C41E3A' : '#1E3F5A';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(cx, cy, PIECE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 绘制内圈
    ctx.beginPath();
    ctx.arc(cx, cy, PIECE_RADIUS - 3, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制文字
    const char = getPieceChar(piece.type, piece.color);
    ctx.font = 'bold 26px "SimSun", "Noto Serif SC", serif';
    ctx.fillStyle = piece.color === 'red' ? '#C41E3A' : '#1E3F5A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, cx, cy + 1);
  }, []);
  
  // 绘制合法移动提示点
  const drawLegalMoveHints = useCallback((ctx: CanvasRenderingContext2D, moves: Position[], selectedPiece: Piece | null) => {
    for (const move of moves) {
      const cx = PADDING + move.x * CELL_SIZE;
      const cy = PADDING + (BOARD_HEIGHT - 1 - move.y) * CELL_SIZE;
      
      // 检查目标位置是否有棋子
      const hasPiece = pieces.some(p => p.x === move.x && p.y === move.y);
      
      if (hasPiece) {
        // 吃子提示 - 红色圆圈
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, PIECE_RADIUS + 3, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // 移动提示 - 绿色圆点
        ctx.fillStyle = 'rgba(0, 128, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [pieces]);
  
  // 绘制将军提示
  const drawCheckIndicator = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!isInCheck) return;
    
    ctx.font = 'bold 20px "SimSun", serif';
    ctx.fillStyle = '#FF0000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 找到被将军的将/帅
    const kingPiece = pieces.find(p => p.type === 'k');
    if (kingPiece) {
      const cx = PADDING + kingPiece.x * CELL_SIZE;
      const cy = PADDING - 15;
      ctx.fillText('将军!', cx, cy);
    }
  }, [isInCheck, pieces]);
  
  // 渲染
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置高清渲染
    const dpr = window.devicePixelRatio || 1;
    canvas.width = BOARD_PIXEL_WIDTH * dpr;
    canvas.height = BOARD_PIXEL_HEIGHT * dpr;
    canvas.style.width = `${BOARD_PIXEL_WIDTH}px`;
    canvas.style.height = `${BOARD_PIXEL_HEIGHT}px`;
    ctx.scale(dpr, dpr);
    
    drawBoard(ctx);
    
    // 绘制所有棋子
    for (const piece of pieces) {
      const isSelected = selectedPiece && selectedPiece.x === piece.x && selectedPiece.y === piece.y;
      const isLastMove = lastMove && lastMove.from.x === piece.x && lastMove.from.y === piece.y;
      drawPiece(ctx, piece, isSelected || false, isLastMove || false);
    }
    
    // 绘制合法移动提示
    if (selectedPiece) {
      drawLegalMoveHints(ctx, legalMoves, selectedPiece);
    }
    
    // 绘制将军提示
    drawCheckIndicator(ctx);
    
  }, [pieces, selectedPiece, legalMoves, lastMove, isInCheck, drawBoard, drawPiece, drawLegalMoveHints, drawCheckIndicator]);
  
  // 点击事件
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameStatus !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 转换为棋盘坐标（需要翻转 y 轴，使屏幕下方对应 board y=0 红方）
    const boardX = Math.round((x - PADDING) / CELL_SIZE);
    const boardY = Math.round((BOARD_HEIGHT - 1) - (y - PADDING) / CELL_SIZE);
    
    if (boardX < 0 || boardX >= BOARD_WIDTH || boardY < 0 || boardY >= BOARD_HEIGHT) return;
    
    // 检查是否点击了合法移动位置
    if (selectedPiece && legalMoves.some(m => m.x === boardX && m.y === boardY)) {
      movePiece({ x: boardX, y: boardY });
      return;
    }
    
    // 检查是否点击了己方棋子
    const clickedPiece = pieces.find(p => p.x === boardX && p.y === boardY);
    if (clickedPiece && clickedPiece.color === useChessStore.getState().currentTurn) {
      selectPiece(clickedPiece);
    } else {
      deselectPiece();
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={BOARD_PIXEL_WIDTH}
        height={BOARD_PIXEL_HEIGHT}
        onClick={handleClick}
        className="cursor-pointer shadow-2xl rounded-lg"
        style={{ 
          imageRendering: 'pixelated',
          background: '#DEB887',
        }}
      />
    </div>
  );
};
