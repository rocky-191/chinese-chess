// 主应用组件

import React from 'react';
import { ChessBoard } from './components/ChessBoard';
import { GamePanel } from './components/GamePanel';
import { MoveHistory } from './components/MoveHistory';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* 左侧：游戏面板 */}
        <div className="order-2 lg:order-1">
          <GamePanel />
        </div>
        
        {/* 中间：棋盘 */}
        <div className="order-1 lg:order-2">
          <ChessBoard />
        </div>
        
        {/* 右侧：走法记录 */}
        <div className="order-3">
          <MoveHistory />
        </div>
      </div>
    </div>
  );
};

export default App;
