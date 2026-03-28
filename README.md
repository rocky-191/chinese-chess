# 🀄 中国象棋 - Chinese Chess

一个基于 Web 的中国象棋对弈游戏，支持人机对战和双人对战。

在线体验：https://d07ea0b8.chinese-chess-ahi.pages.dev

## 🎯 功能特性

- ✅ 完整的中国象棋规则实现
- ✅ 人机对战（AI 搜索引擎）
- ✅ 双人对战（红方/黑方轮流走棋）
- ✅ 走棋记录查看
- ✅ 棋谱谱子（Chinese Notation）
- ✅ 棋子移动动画
- ✅ 胜负判定

## 🏗 项目结构

```
chinese-chess/
├── src/
│   ├── components/          # React 组件
│   │   ├── ChessBoard.tsx   # 棋盘组件
│   │   ├── GamePanel.tsx    # 游戏面板（控制、AI设置）
│   │   └── MoveHistory.tsx  # 走棋记录
│   ├── engine/              # 核心引擎
│   │   ├── board.ts         # 棋盘数据结构
│   │   ├── rules.ts         # 棋子移动规则
│   │   ├── moves.ts         # 走法生成
│   │   ├── evaluate.ts      # 局面评估
│   │   └── ai.worker.ts     # AI 计算（Web Worker）
│   ├── store/
│   │   └── chessStore.ts    # Zustand 状态管理
│   └── utils/
│       └── notation.ts      # 棋谱谱子工具
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🛠 技术架构

### 前端框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架

### 状态管理
- **Zustand** - 轻量级状态管理

### AI 引擎
- **Web Worker** - 独立的 AI 计算线程，不阻塞 UI
- **Alpha-Beta 剪枝** - 搜索算法
- **局面评估** - 基于棋子价值的评估函数

### 核心算法

#### 棋子移动规则 (`rules.ts`)
每个棋子都有独立的移动规则实现：
| 棋子 | 移动规则 |
|------|----------|
| 帅/将 | 九宫内直线移动一格 |
| 士 | 九宫内斜线移动一格 |
| 象/相 | 田字对角，不能过河，不能塞象眼 |
| 马 | 日字移动，不能蹩马腿 |
| 车 | 直线任意距离 |
| 炮 | 直线，吃子需隔一子（炮架） |
| 兵/卒 | 未过河只能前进，过河后可横向 |

#### AI 搜索 (`ai.worker.ts`)
```
1. 使用 Alpha-Beta 剪枝算法
2. 搜索深度可配置（默认 3 层）
3. 局面评估函数计算棋子价值 + 位置价值
4. Web Worker 异步计算，不阻塞 UI
```

#### 局面评估 (`evaluate.ts`)
- 棋子基础价值（车>马>炮>士>象>兵）
- 位置价值表（每个棋子在不同位置的价值）
- 棋子灵活性评估

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📝 棋谱谱子

游戏支持标准中国象棋谱子记录方式：

| 棋子 | 谱子符号 |
|------|----------|
| 帅/将 | 帅/将 |
| 士 | 士 |
| 象/相 | 象/相 |
| 马 | 马 |
| 车 | 车 |
| 炮 | 炮 |
| 兵/卒 | 兵/卒 |

## 📄 开源协议

MIT License
