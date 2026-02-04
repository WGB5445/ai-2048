# iOS 与 Android 打包指南（新手向）

## 编译可以成功吗？

**可以。** 当前是标准的 React Native 0.83 裸项目，依赖（gesture-handler、reanimated、async-storage、safe-area-context）均支持自动链接，只要环境装对、按顺序执行命令，iOS 和 Android 都能编译通过。

---

## 阶段 0：环境准备（必做，只做一次）

### 环境下载与设置

按下面步骤「下载并设置好」本机环境，使 `npm run android` 与 `npm run ios` 能顺利编译运行。执行顺序：先做 1（Node + `npm install`）→ 若做 Android 则按 2.1～2.6 → 若做 iOS 则按 3.
1～3.4 → 用阶段 1 先跑 Android / 再跑 iOS 验证。

#### 1. 共用基础（必做）

| 项目               | 如何下载/安装                                                           | 如何设置/验证                        |
| ------------------ | ----------------------------------------------------------------------- | ------------------------------------ |
| **Node.js ≥ 20**   | 官网 [nodejs.org](https://nodejs.org/) 下载 LTS，或 `brew install node` | 终端执行 `node -v`、`npm -v`，版本满足即可 |
| **项目依赖**       | 在项目根目录执行 `npm install`                                          | 无报错即表示装好                       |

#### 2. Android 环境（要打包/跑 Android 时必做）

| 步骤                        | 内容                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2.1 下载安装 JDK 17**     | macOS: `brew install openjdk@17`。安装后 Homebrew 会提示把 `openjdk@17` 加入 PATH；需让 `JAVA_HOME` 指向 JDK 17（例如 `export JAVA_HOME=$(/usr/libexec/java_home -v 17)` 或 Homebrew 给出的路径）。验证：`java -version` 显示 17。                                                                                                                                                                       |
| **2.2 下载安装 Android Studio** | 打开 [developer.android.com/studio](https://developer.android.com/studio)，下载对应平台安装包，按向导安装。首次启动会进入 Setup Wizard。                                                                                                                                                                                                                                                             |
| **2.3 安装 Android SDK 组件**   | 在 Android Studio：**Settings/Preferences → Appearance & Behavior → System Settings → Android SDK**。在 **SDK Platforms** 勾选 **Android 14.0 (API 34)** 或更高（项目 [android/build.gradle](android/build.gradle) 使用 `compileSdkVersion = 36`，若本地有 API 36 则选 API 36；否则选当前推荐的最新 API）。在 **SDK Tools** 勾选：**Android SDK Build-Tools**（与项目一致的 36.x 若有则选）、**Android SDK Command-line Tools**、**NDK**（版本与项目一致：`ndkVersion = "27.1.12297006"`，在 SDK Tools 中安装 NDK 并尽量选 27.x）。应用并等待下载完成。 |
| **2.4 设置 ANDROID_HOME**   | SDK 位置一般为：macOS `~/Library/Android/sdk`，Windows `%LOCALAPPDATA%\Android\Sdk`。在 shell 配置（如 `~/.zshrc`）中增加：`export ANDROID_HOME=~/Library/Android/sdk` 和 `export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator`（按实际路径改）。保存后 `source ~/.zshrc`，验证：`echo $ANDROID_HOME` 有输出。                                                                                                                                       |
| **2.5 接受 SDK 许可（首次）** | 终端执行：`$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses`，全部输入 `y` 接受。                                                                                                                                                                                                                                                                                                        |
| **2.6 可选：模拟器**         | Android Studio → **Device Manager** → **Create Device**，选机型与系统镜像，创建 AVD，便于后续 `npm run android`。                                                                                                                                                                                                                                                                                     |

验证 Android 环境：在项目根目录执行 `cd android && ./gradlew assembleDebug`，能生成 `app/build/outputs/apk/debug/app-debug.apk` 即表示环境正确（需已执行过 `npm install`）。

#### 3. iOS 环境（仅 macOS，要打包/跑 iOS 时必做）

| 步骤                                   | 内容                                                                                                                                                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3.1 下载安装 Xcode**                 | 从 **App Store** 搜索并安装 **Xcode**（体积大，需预留时间）。安装后打开 Xcode 一次，接受协议并安装额外组件。                                                                                                                                                                            |
| **3.2 使用完整 Xcode 作为开发者目录**   | 终端执行：`sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`。验证：`xcodebuild -version` 能输出版本号（不能是空或报错）。若之前只装过 Command Line Tools，必须先装完整 Xcode 再执行本步，否则 `pod install` 会报 `SDK "iphoneos" cannot be located` 或 `Unexpected XCode version string ''`。 |
| **3.3 接受 Xcode 许可（首次必做）**     | 终端执行：`sudo xcodebuild -license accept`（或运行 `xcodebuild -license` 后按提示同意）。未接受许可时 `pod install` 会报「You have not agreed to the Xcode license」。                                                                                                                                   |
| **3.4 安装 Xcode Command Line Tools（若未装）** | 终端执行：`xcode-select --install`，按提示安装。若已用 3.2 指向 Xcode.app，通常不必再单独装。                                                                                                                                                                                          |
| **3.5 安装 CocoaPods（项目用 Bundler）** | 项目 [ios](ios) 下已有 [Gemfile](ios/Gemfile)，无需单独 `gem install cocoapods`。在项目根目录执行：`cd ios && bundle install && cd ..`，再执行：`cd ios && bundle exec pod install && cd ..`。成功后会生成 `ios/Ai2048.xcworkspace`。以后增删原生依赖或升级 RN 后，需再在 `ios` 下执行一次 `bundle exec pod install`。     |

验证 iOS 环境：在项目根目录先 `npm start` 一个终端，再开一个终端执行 `npm run ios`，能在模拟器里看到 2048 即表示环境正确（需已执行过 `npm install` 与上述 `bundle exec pod install`）。

#### 环境设置清单（可打勾）

- [x] Node ≥ 20 已装，`npm install` 已执行
- [ ] （Android）JDK 17 已装，`JAVA_HOME` 已设，`java -version` 为 17
- [ ] （Android）Android Studio 已装，SDK Platform 与 Build-Tools、NDK 已按项目版本装好
- [ ] （Android）`ANDROID_HOME` 已设，`sdkmanager --licenses` 已接受
- [x] （iOS）Xcode 已从 App Store 安装并打开过
- [x] （iOS）`sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` 已执行，`xcodebuild -version` 有输出
- [x] （iOS）已接受 Xcode 许可：`sudo xcodebuild -license accept`
- [x] （iOS）`cd ios && bundle install && bundle exec pod install` 已成功执行

完成以上后，按阶段 1 即可「先跑 Android、再跑 iOS」验证编译与运行。

---

### 0.1 你已经有的

- **Node 与 npm**：项目要求 Node >= 20。终端执行 `node -v`、`npm -v`，版本够即可。
- **项目依赖**：在项目根目录执行 `npm install`，保证依赖都装好。

### 0.2 要打包 Android，你需要

| 需要的东西 | 说明 / 怎么装 |
|------------|----------------|
| **JDK 17** | 推荐用 JDK 17。macOS 可 `brew install openjdk@17`，并保证 `JAVA_HOME` 指向 17。 |
| **Android Studio** | 从 [developer.android.com](https://developer.android.com/studio) 下载安装。 |
| **Android SDK** | 用 Android Studio 的 SDK Manager 安装：Android SDK Platform 36、Build-Tools 36.x、NDK 27.x。 |
| **环境变量** | 设置 `ANDROID_HOME`（或 `ANDROID_SDK_ROOT`）指向 SDK 目录。 |
| **模拟器或真机** | 可选：在 Android Studio 里建一个 AVD；或 USB 连一台开启「开发者选项 + USB 调试」的真机。 |

第一次用 SDK 时在终端执行一次：`$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses`，全部选 accept。

### 0.3 要打包 iOS，你需要（仅 macOS）

| 需要的东西 | 说明 / 怎么装 |
|------------|----------------|
| **Xcode** | 从 App Store 安装，并打开一次完成协议与组件。 |
| **Xcode Command Line Tools** | 终端执行 `xcode-select --install`（若未装）。 |
| **CocoaPods** | 项目用 Gemfile 管理。在项目根目录执行：`cd ios && bundle install && cd ..`，再 `cd ios && bundle exec pod install && cd ..`。以后每次增删原生依赖或升级 RN，一般都要再跑一次 `bundle exec pod install`。 |

**重要**：装完 Pod 后，iOS 要用 **`.xcworkspace`** 打开，不要用 `.xcodeproj`。即：`open ios/Ai2048.xcworkspace`。

**iOS 依赖说明**：`react-native-reanimated` 依赖 CocoaPods 里的 `RNWorklets`，因此项目将 `react-native-worklets` 列为直接依赖以便自动链接。`pod install` 必须使用**完整 Xcode**（不能只用 Command Line Tools）：若报错 `SDK "iphoneos" cannot be located` 或 `Unexpected XCode version string ''`，请安装 Xcode 后执行 `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`，再重新运行 `bundle exec pod install`。

---

## 阶段 1：先跑起来（开发构建，验证编译）

目标：在模拟器/真机上看到 2048 游戏，确认「编译可以成功」。

### 界面布局与操作

- **布局**：按钮（分数 + New Game）在上方，游戏棋盘在屏幕中间（除头部外的区域垂直、水平居中）。
- **操作**：滑动手势在整个游戏区域生效，包括棋盘下方空白处，便于单手操作。

### 1.1 启动 Metro（两个平台共用）

在项目根目录开一个终端，执行：

```bash
npm start
```

保持这个窗口不关。后面 `run-ios` / `run-android` 会连这个 Metro 拉 JS 包。

### 1.2 跑 Android（建议先做）

1. 确保 `ANDROID_HOME` 已设、JDK 17 已装。
2. 再开一个终端，在项目根目录执行：

   ```bash
   npm run android
   ```

3. 若已接真机或已开模拟器，会自动装 app 并启动；否则先到 Android Studio 里建好 AVD 再执行上述命令。

**常见问题**：

- 报错找不到 SDK：检查 `ANDROID_HOME` 和 SDK Manager 里是否装了 Platform 36、Build-Tools、NDK。
- 报错 JDK 版本：用 `java -version` 确认是 17，并设好 `JAVA_HOME`。

### 1.3 跑 iOS（仅 macOS）

1. 确认已执行过：`cd ios && bundle install && bundle exec pod install && cd ..`。
2. 在项目根目录执行：

   ```bash
   npm run ios
   ```

3. 默认会打模拟器；若想上真机，可加设备名，例如：`npm run ios -- --device "你的 iPhone 名称"`。

**常见问题**：

- 报错找不到 Pod 或 RN：确保是在 `ios` 目录下用 `bundle exec pod install`，且用 `Ai2048.xcworkspace` 打开。
- 报错「CoreSimulator / IDESimulatorFoundation 无法加载」：在终端执行 `xcodebuild -runFirstLaunch`，等待安装完成后再试。
- 报错「iOS devices or simulators not detected」：未安装模拟器运行时。打开 Xcode → **Window → Devices and Simulators** → **Simulators** 标签 → 左下角 **+** 添加设备（如 iPhone 16），按提示下载对应 iOS 运行时；或 Xcode → **Settings → Platforms** 下载 iOS 平台。
- 签名错误：在 Xcode 里打开 `Ai2048.xcworkspace`，在 Signing & Capabilities 里选你的 Apple ID 团队并勾选 Automatically manage signing。

---

## 阶段 2：打「可安装包」（发布用打包）

目标：得到可发给别人安装的包（Android APK/AAB，iOS IPA）。

### 2.1 Android：生成 APK（或 AAB）

- **Debug APK（测试用）**：

  ```bash
  cd android && ./gradlew assembleDebug && cd ..
  ```

  产出：`android/app/build/outputs/apk/debug/app-debug.apk`，可拷到手机安装。

- **Release APK（正式包，未签名）**：

  ```bash
  cd android && ./gradlew assembleRelease && cd ..
  ```

  产出：`android/app/build/outputs/apk/release/app-release.apk`。上架或对外发布前要在 `android/app/build.gradle` 里配置 `signingConfigs` 并给 release 用上，否则只是未签名包。

- **Release AAB（上架 Google Play 推荐）**：

  ```bash
  cd android && ./gradlew bundleRelease && cd ..
  ```

  产出：`android/app/build/outputs/bundle/release/app-release.aab`。同样需要先配置签名。

新手建议：先跑通 `assembleDebug`，确认能生成 APK 并安装；再学配置签名和 `assembleRelease` / `bundleRelease`。

### 2.2 iOS：Archive 打 IPA（仅 macOS）

1. 用 Xcode 打开：`open ios/Ai2048.xcworkspace`。
2. 顶部选 **Any iOS Device (arm64)**，不要选模拟器。
3. 菜单 **Product → Archive**。
4. Archive 完成后在 Organizer 里选该 Archive，点 **Distribute App**，按需选「开发 / 内测 / App Store」等，按向导导出 IPA 或上传。

真机与 Archive 需要有效的 Apple 开发者账号与签名；若仅做编译验证，用模拟器 + `npm run ios` 即可。

---

## 建议你做事的顺序（清单）

按顺序打勾即可：

1. [ ] **环境**：装好 Node 20+、`npm install`；要 Android 就装 JDK 17 + Android Studio + SDK，设好 `ANDROID_HOME`；要 iOS（Mac）就装 Xcode，并在 `ios` 里执行 `bundle install` 和 `bundle exec pod install`。
2. [ ] **先跑 Android**：`npm start` 一个终端，另一个终端 `npm run android`，直到在模拟器/真机上看到 2048。
3. [ ] **再跑 iOS**（有 Mac 时）：保持 Metro，执行 `npm run ios`，在模拟器里看到 2048。
4. [ ] **可选 - Android 打包**：`cd android && ./gradlew assembleDebug`，在 `app/build/outputs/apk/debug/` 取 APK 安装测试。
5. [ ] **可选 - Android 正式包**：在 `android/app/build.gradle` 里配置 release 签名，再 `./gradlew assembleRelease` 或 `bundleRelease`。
6. [ ] **可选 - iOS 打包**：Xcode 打开 `Ai2048.xcworkspace`，选真机，Product → Archive，再在 Organizer 里分发。

---

## 小结

- **编译可以成功吗？** 可以，前提是环境按上面装好、iOS 做完 `pod install`、用 `.xcworkspace` 打开。
- **你该做的事**：先完成阶段 0 和阶段 1（环境 + 能跑起来），再按需做阶段 2 的打包；建议先 Android 后 iOS，先 debug 后 release。
- 若某一步报错，把**完整终端报错**或 Xcode/Android Studio 的报错贴出来，再针对那一步查（例如：pod 失败、JDK 版本、ANDROID_HOME、签名等），会更容易排查。

### Git 与 GitHub

- 当前仓库用 Git 保留「纯游戏」版本（tag：`v1.0-game-only`），Aptos 在 `feature/aptos` 分支开发。
- 上传到 GitHub 前：在 GitHub 上创建仓库并记下 URL，执行 `git remote add origin <URL>`（若尚未添加），再执行 `git push -u origin main` 与 `git push origin v1.0-game-only`。
