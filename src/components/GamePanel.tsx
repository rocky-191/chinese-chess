// 游戏面板组件

import React from 'react';
import { useChessStore, Difficulty, PieceColor, GameMode } from '../store/chessStore';

export const GamePanel: React.FC = () => {
  const { 
    currentTurn, 
    gameStatus, 
    isAIThinking,
    playerColor,
    difficulty,
    gameMode,
    isInCheck,
    thinkingTime,
    undoMove,
    resetGame,
    setDifficulty,
    setPlayerColor,
    setGameMode,
  } = useChessStore();
  
  const statusText = () => {
    if (gameStatus === 'red_wins') return '红方获胜!';
    if (gameStatus === 'black_wins') return '黑方获胜!';
    if (gameStatus === 'draw') return '和棋!';
    if (gameMode === 'two-player') {
      if (isAIThinking) return '思考中...';
      if (isInCheck) return currentTurn === 'red' ? '红方被将军!' : '黑方被将军!';
      return currentTurn === 'red' ? '红方走棋' : '黑方走棋';
    }
    if (isAIThinking) return 'AI思考中...';
    if (isInCheck) return currentTurn === 'red' ? '红方被将军!' : '黑方被将军!';
    if (currentTurn === playerColor) return '轮到你走棋';
    return 'AI走棋中...';
  };
  
  const statusColor = () => {
    if (gameStatus !== 'playing') return 'text-yellow-400';
    if (isInCheck) return 'text-red-500';
    if (gameMode === 'two-player') {
      return currentTurn === 'red' ? 'text-red-500' : 'text-blue-800';
    }
    if (currentTurn === playerColor) return 'text-green-400';
    return 'text-gray-400';
  };
  
  return (
    <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-xl shadow-xl p-6 w-80 border-4 border-amber-800">
      {/* 标题 */}
      <h1 className="text-2xl font-bold text-center mb-4 text-amber-900" style={{ fontFamily: 'SimSun, serif' }}>
        中国象棋
      </h1>
      
      {/* 状态显示 */}
      <div className={`text-xl font-bold text-center py-3 px-4 rounded-lg mb-4 ${statusColor()} bg-amber-50 border-2 border-amber-400`}>
        {statusText()}
      </div>
      
      {/* AI思考时间 */}
      {isAIThinking && thinkingTime > 0 && (
        <div className="text-sm text-center text-gray-600 mb-4">
          思考时间: {(thinkingTime / 1000).toFixed(2)}秒
        </div>
      )}
      
      {/* 游戏控制 */}
      <div className="space-y-4">
        {/* 模式选择 */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-300">
          <label className="block text-sm font-bold text-amber-800 mb-2">游戏模式</label>
          <div className="flex gap-2">
            <button
              onClick={() => setGameMode('ai')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                gameMode === 'ai'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-200 text-green-800 hover:bg-green-300'
              }`}
            >
              人机对弈
            </button>
            <button
              onClick={() => setGameMode('two-player')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                gameMode === 'two-player'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
              }`}
            >
              双人对弈
            </button>
          </div>
        </div>
        
        {/* 难度选择 */}
        {gameMode === 'ai' && (
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-300">
          <label className="block text-sm font-bold text-amber-800 mb-2">AI难度</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                  difficulty === d
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                }`}
              >
                {d === 'easy' ? '入门' : d === 'medium' ? '中等' : '大师'}
              </button>
            ))}
          </div>
        </div>
        )}
        
        {/* 执棋选择 */}
        {gameMode === 'ai' && (
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-300">
          <label className="block text-sm font-bold text-amber-800 mb-2">执棋</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPlayerColor('red')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                playerColor === 'red'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-red-200 text-red-800 hover:bg-red-300'
              }`}
            >
              红方
            </button>
            <button
              onClick={() => setPlayerColor('black')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                playerColor === 'black'
                  ? 'bg-blue-800 text-white shadow-md'
                  : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
              }`}
            >
              黑方
            </button>
          </div>
        </div>
        )}
        
        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={undoMove}
            disabled={isAIThinking || gameStatus !== 'playing'}
            className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-bold shadow-md transition-all"
          >
            悔棋
          </button>
          <button
            onClick={resetGame}
            className="flex-1 py-3 px-4 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-bold shadow-md transition-all"
          >
            重新开始
          </button>
        </div>
      </div>
      
      {/* 提示信息 */}
      <div className="mt-4 text-xs text-center text-amber-700">
        <p>点击棋子选中，再点击目标位置移动</p>
        <p className="mt-1">绿点表示可移动位置，红圈表示可吃子</p>
      </div>
      
      {/* 胜负判定说明 */}
      {gameStatus !== 'playing' && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-400">
          <p className="text-sm font-bold text-amber-800 mb-1">游戏结束</p>
          <p className="text-xs text-amber-700">
            {gameStatus === 'red_wins' && '恭喜红方获胜！'}
            {gameStatus === 'black_wins' && '恭喜黑方获胜！'}
            {gameStatus === 'draw' && '双方握手言和！'}
          </p>
          <button
            onClick={resetGame}
            className="mt-2 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm"
          >
            再来一局
          </button>
        </div>
      )}
    </div>
  );
};
