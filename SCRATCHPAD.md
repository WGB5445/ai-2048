# SCRATCHPAD — 执行状态与笔记

## 执行顺序与状态

1. **初始化项目** — 完成  
   - `npx @react-native-community/cli init Ai2048 --directory ai-2048`（在父目录执行）  
   - 安装 gesture-handler、reanimated、async-storage  
   - babel.config.js 添加 reanimated/plugin  
   - index.js 包裹 GestureHandlerRootView  

2. **Biome** — 完成  
   - `npx @biomejs/biome init`  
   - 配置：2 空格、单引号、行宽 100  
   - package.json：lint、format、check 脚本  
   - Board.tsx 使用 array index 作为 key，在 biome.json overrides 中关闭 noArrayIndexKey  

3. **游戏逻辑** — 完成  
   - src/game/types.ts：Board、Direction、GameState  
   - src/game/core.ts：mergeLine、moveBoard、addRandomTile、createInitialBoard、canMove、isGameOver、hasWon  
   - __tests__/game/core.test.ts：21 个单测全部通过  

4. **持久化** — 完成  
   - src/game/persistence.ts：loadHighScore、saveHighScore、loadGameState、saveGameState、clearGameState  
   - 启动时若有 gameState 则 Alert「Resume game?」  

5. **UI 与响应式** — 完成  
   - useResponsive：useWindowDimensions → boardSize、cellSize、tileFontSize、scoreFontSize  
   - useSwipeGesture：Gesture.Pan().onEnd，按 velocity/translation 判定方向  
   - useGameState：board、score、highScore、move、startNewGame、restoreGame、gameOver、won  
   - GameBoard（原计划名 Board，因与类型同名改为 GameBoard）、Tile、GameOver  
   - GameScreen：分数、Best、New Game、手势、恢复弹窗、GameOver/胜利弹层  

6. **动画** — 完成  
   - Tile：spawn 时 scale 0.5→1 + opacity 0→1；合并时 scale 1→1.15→1（Reanimated withSpring）  

7. **收尾** — 完成  
   - GameOver 组件：标题、副标题、按钮  
   - 胜利弹层「Keep Playing」、游戏结束弹层「Try Again」  
   - Jest：jest.setup.js 中 mock gesture-handler、reanimated、async-storage，App.test 与 core.test 均通过  

## 临时结论与备注

- 组件命名：Board 类型与 Board 组件冲突，导出组件改名为 GameBoard。  
- 棋盘 key：4x4 网格位置稳定，使用 (r,c) 作为 key，在 biome overrides 中对该文件关闭 noArrayIndexKey。  
- 未实现「滑动」动画（方块从旧格滑到新格），需为每个方块维护 id 与 (row,col)，实现成本较高；当前仅实现 spawn 与 merge 的 scale/opacity 动画。  
- **布局与手势优化**：按钮偏上、棋盘居中；手势区域扩大至整个游戏区域（含下方空白），滑动体验更好；已在 BUILD.md、PLAN.md、CONVO.md 中记录。  
- **Git 保留版本与 Aptos**：当前版本已提交并打 tag `v1.0-game-only`，Aptos 在 `feature/aptos` 分支开发；上传 GitHub 需执行 `git push -u origin main` 与 `git push origin v1.0-game-only`；Aptos 分阶段（先钱包连接后链上）。  

## 真机/模拟器手动检查清单（测试真实性互补）

在真机或模拟器上跑一遍，确认 Jest 里 mock 掉的部分在真实设备上可用：

- [ ] 启动 app → 出现棋盘与分数（Score、Best、New Game）
- [ ] 上下左右滑动 → 方块移动且可合并，分数增加
- [ ] 杀进程再打开 → 若有未结束对局则弹出「Resume game?」，选 Resume 恢复棋盘
- [ ] 游戏结束（无空位且无法合并）→ 出现 Game Over 弹层，可点 Try Again
- [ ] 达到 2048 → 出现 You Win 弹层，可点 Keep Playing 继续
- [ ] 横竖屏切换 → 棋盘与字体随尺寸变化，不溢出

## 交付物

- PLAN.md：本计划副本（含已实现结构说明）  
- SCRATCHPAD.md：本文件  
- CONVO.md：对话与输出摘要  
