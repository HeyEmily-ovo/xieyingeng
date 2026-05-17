# CLAUDE.md

此文件为 Claude Code 提供项目专属指导。

## 语言偏好

始终使用**简体中文**回复，代码标识符（变量名、函数名、类型名）使用英文，注释和提交信息使用中文。

## 项目概述

**谐音梗** —— 一个中文谐音猜词游戏。玩家通过两张图片提示猜测谐音梗答案，每关最多尝试 8 次。部署于 GitHub Pages（`/xieyingeng/` 子路径）。

## 常用命令

```bash
npm run dev       # 启动开发服务器（localhost:5173，HMR）
npm run build     # 类型检查（tsc） + 构建到 dist/
npm run preview   # 本地预览生产构建
npm run deploy    # 将 dist/ 部署到 GitHub Pages（gh-pages）
```

## 技术栈

React 18 + TypeScript 5 + Vite 5 + Tailwind CSS 3 + Framer Motion 12 + React Router 6（HashRouter）

## 架构

**三层结构，无全局状态管理**：

| 层级 | 目录 | 职责 |
|------|------|------|
| 页面 | `src/pages/` | 承载业务逻辑、路由状态和副作用，每个路由对应一个页面组件 |
| 组件 | `src/components/` | 纯展示/交互，通过 props 接收数据，不持有业务状态 |
| 工具/Hook | `src/utils/`、`src/hooks/` | 纯函数和自定义 hook，可跨页面复用 |

**页面清单**：
- `HomePage` — 主菜单（进度条、继续游戏/关卡选择/玩法说明）
- `GamePage` — 核心游戏（双图展示、输入框、猜测记录双列布局、输赢弹窗）
- `LevelSelectPage` — 关卡网格（已通关/下一关/未解锁三种状态）

**组件清单**：
- `Header` — 顶部导航栏，显示关卡编号和分类标签，支持返回按钮
- `AnswerInput` — 输入框 + 提交按钮，含字数校验和剩余次数显示，使用 `forwardRef`
- `GuessRow` — 单次猜测的字符格子行，带翻转入场动画
- `ResultFeedback` — 通关/失败的全屏遮罩弹窗，含下一步操作按钮

**动画**：Framer Motion 用于三处 —— 页面切换（`AnimatePresence` 淡入淡出）、列表交错入场（`staggerChildren`）、猜词格子翻转（`rotateX`）。错误时图片卡片触发水平抖动。

## 路由（HashRouter）

使用 HashRouter 确保 GitHub Pages 刷新不 404：

| 路径 | 页面 | 说明 |
|------|------|------|
| `#/` | HomePage | 主菜单 |
| `#/game/:id` | GamePage | 核心游戏，`:id` 为关卡编号 |
| `#/levels` | LevelSelectPage | 关卡选择网格 |

## 数据流

**持久化**：`useGameProgress()` hook 读写 `localStorage` 键 `xieyingeng_progress`，结构为 `{ maxClearedId: number }`。第 1 关始终解锁，其他关卡需要前序关卡已通关。

**会话内**：`GamePage` 管理四个状态：
- `history: CharResult[][]` — 猜测记录数组，每项为逐字校验结果
- `gameState: GameState` — `"playing" | "won" | "lost"`
- `shake: boolean` — 错误抖动触发标志
- 猜测次数上限 `MAX_ATTEMPTS = 8`

**答案校验**（`validate.ts`）：两遍算法，对齐 Steam 版规则：
1. 第一遍标记位置完全匹配 → 🟢 `correct`
2. 第二遍标记存在但位置不对 → 🟠 `present`，其余 → ⬜ `absent`

## 类型定义

`src/types/index.ts` 定义核心类型：`CharStatus`、`CharResult`、`Level`、`LevelData`、`GameState`。

`Level` 接口字段：`id`、`category`、`topText`、`topImage?`、`bottomImage?`、`answer`、`difficulty`。

## 关卡数据与资源

`src/data/levels.json` 为 `LevelData` 格式（含 `version` 和 `levels[]`），页面直接 `import`。

关卡图片位于 `public/images/`，按 `question_{id}.webp` 和 `question_{id}_hint.webp` 命名。当 `Level.topImage` / `bottomImage` 字段有值时显示图片，否则显示占位 emoji。

## 关键约定

- `vite.config.ts` 中 `base: "/xieyingeng/"`，因部署在 GitHub Pages 子路径下
- 使用 HashRouter 而非 BrowserRouter
- `input[type="text"]` 设 `font-size: 16px` 防止 iOS 自动缩放
- 中文字体栈：PingFang SC → Microsoft YaHei → Noto Sans SC
- `sharp` 已安装为 devDependency，可用于服务端/脚本端图片处理
