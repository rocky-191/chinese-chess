// 走法记录组件

import React from 'react';
import { useChessStore } from '../store/chessStore';
import { generateNotation } from '../utils/notation';
import { Position } from '../engine/board';

export const MoveHistory: React.FC = () => {
  const { moveHistory, pieces } = useChessStore();
  
  const formatMoves = () => {
    const rows: { moveNo: number; red: string; black: string }[] = [];
    
    for (let i = 0; i < moveHistory.length; i += 2) {
      const redMove = moveHistory[i];
      const blackMove = moveHistory[i + 1];
      
      const redNotation = generateNotation(
        redMove.from,
        redMove.to,
        redMove.piece,
        [...pieces, ...moveHistory.slice(0, i).map(m => ({
          ...m.piece,
          x: m.to.x,
          y: m.to.y
        }))],
        !!redMove.captured
      );
      
      let blackNotation = '';
      if (blackMove) {
        blackNotation = generateNotation(
          blackMove.from,
          blackMove.to,
          blackMove.piece,
          [...pieces, ...moveHistory.slice(0, i + 1).map(m => ({
            ...m.piece,
            x: m.to.x,
            y: m.to.y
          }))],
          !!blackMove.captured
        );
      }
      
      rows.push({
        moveNo: Math.floor(i / 2) + 1,
        red: `${i + 1}. ${redNotation}`,
        black: blackMove ? `${i + 2}. ${blackNotation}` : ''
      });
    }
    
    return rows;
  };
  
  return (
    <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-xl shadow-xl p-4 w-64 border-4 border-amber-800">
      <h2 className="text-lg font-bold text-center mb-3 text-amber-900">走棋记录</h2>
      
      <div className="bg-amber-50 rounded-lg border border-amber-300 max-h-96 overflow-y-auto">
        {moveHistory.length === 0 ? (
          <p className="text-center text-amber-600 py-4 text-sm">暂无记录</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-amber-200 sticky top-0">
              <tr>
                <th className="py-1 px-2 text-left text-amber-800 font-bold">#</th>
                <th className="py-1 px-2 text-left text-red-700 font-bold">红方</th>
                <th className="py-1 px-2 text-left text-blue-800 font-bold">黑方</th>
              </tr>
            </thead>
            <tbody>
              {formatMoves().map((row) => (
                <tr key={row.moveNo} className="border-t border-amber-200">
                  <td className="py-1 px-2 text-amber-700 font-medium">{row.moveNo}</td>
                  <td className="py-1 px-2 text-red-700">{row.red}</td>
                  <td className="py-1 px-2 text-blue-800">{row.black}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="mt-3 text-xs text-center text-amber-700">
        共 {Math.ceil(moveHistory.length / 2)} 回合
      </div>
    </div>
  );
};
