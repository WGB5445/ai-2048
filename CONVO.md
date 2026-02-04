# CONVO — 对话与输出摘要

## 用户请求（原文）

1. 用中文对话  
2. 选择「1」：用中文重新问一遍取舍问题  
3. 取舍选择结果：  
   - **Expo vs 裸 RN**：裸 React Native  
   - **持久化**：完整（保存最高分 + 可恢复当前对局）  
   - **动画**：平滑（滑动/合并动画）  
4. 实现计划：按计划实现 React Native 2048 应用，不编辑计划文件本身；按 to-do 执行并标记进度，直到全部完成  

## 输出摘要

- **项目**：裸 React Native (CLI) + TypeScript，Biome 格式化与 lint，支持 Android/iOS，响应式布局（手机/平板）。  
- **功能**：2048 规则（4x4、合并、随机 2/4）、上下左右滑动手势、当前分与最高分、New Game、游戏结束/胜利弹层、恢复上次对局（启动时 Alert）。  
- **持久化**：AsyncStorage 存 `@2048/highScore`、`@2048/gameState`（board + score），每次有效移动后写入 gameState。  
- **动画**：Reanimated 实现新块出现（scale + opacity）与合并时 scale 回弹。  
- **测试**：game/core 单测 21 个通过；App 组件测试通过（Jest 中 mock gesture-handler、reanimated、async-storage）。  
- **交付文件**：PLAN.md、SCRATCHPAD.md、CONVO.md。  

## 后续迭代（布局与手势）

- **布局**：按钮在上、游戏画面在中间。
- **手势**：下方空白处也可滑动操作，体验更好。
- **记录位置**：BUILD.md、PLAN.md、SCRATCHPAD.md、CONVO.md。

## 后续迭代（Git 与 Aptos）

- **Git**：纯游戏版本已提交并打 tag `v1.0-game-only`，Aptos 在 `feature/aptos` 分支开发。
- **GitHub**：远程为 **WGB5445/ai-2048**（SSH：`git@github.com:WGB5445/ai-2048.git`）。推送步骤：`git push -u origin main` → `git push origin v1.0-game-only` → `git push -u origin feature/aptos`；详见 BUILD.md「Git 与 GitHub」。
- **Aptos**：分阶段（先钱包连接 + 显示地址，再视需求加交易/链上）；方案依官方 React Native / Mobile 文档。

## 后续迭代（游戏结束上传分数）

- 游戏结束后可用 Petra 签名并上传分数；通过 Deep Link 调用 Petra（connect + signAndSubmit）；链上需合约 submit_score，当前占位 `0x1::game::submit_score`；方案与记录见 BUILD、PLAN、SCRATCHPAD。

## 后续迭代（键盘与手柄）

- 支持外接键盘（方向键、WASD）与物理手柄（D-pad）；在 Mac 上控制 iPhone 时键盘也可操作。依赖 react-native-keyevent；Android MainActivity 转发 key 事件，iOS AppDelegate 注册 UIKeyCommand；JS 层 useKeyAndGamepadInput(move)；方案与记录见 BUILD、PLAN、SCRATCHPAD。

## 运行说明

- 安装依赖：`npm install`  
- iOS：`cd ios && bundle exec pod install && cd ..`，然后 `npm run ios`  
- Android：`npm run android`  
- 启动 Metro：`npm start`  
- 测试：`npm test`  
- Lint/格式：`npm run lint`、`npm run format`、`npm run check`  
