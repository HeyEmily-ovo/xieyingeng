# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 语言偏好

始终使用**简体中文**回复，代码标识符使用英文，注释使用中文。

## 项目概述

谐音梗 —— 一个中文谐音猜词游戏。玩家通过两张图片提示猜测谐音梗答案，每关最多尝试 8 次。部署于 GitHub Pages。

## 常用命令

```bash
npm run dev       # 启动开发服务器（localhost:5173，HMR）
npm run build     # 类型检查 + 构建到 dist/
npm run preview   # 本地预览生产构建
npm run deploy    # 部署 dist/ 到 GitHub Pages
```

## 技术栈

React 18 + TypeScript 5 + Vite 5 + Tailwind CSS 3 + Framer Motion 12 + React Router 6（HashRouter）

## 架构

**三层结构**：

- `src/pages/` — 页面组件，承载业务逻辑和状态。每个路由对应一个页面：
  - `HomePage.tsx` — 主菜单（进度条、开始/选关/说明按钮）
  - `GamePage.tsx` — 核心游戏（图片展示、输入、猜测记录、输赢判定）
  - `LevelSelectPage.tsx` — 关卡选择网格
- `src/components/` — 纯展示/交互组件，通过 props 接收数据（`Header`、`AnswerInput`、`GuessRow`、`ResultFeedback`）
- `src/utils/` 和 `src/hooks/` — 纯函数和自定义 hook

**无全局状态管理**，页面间不共享可变状态。

## 路由（HashRouter）

| 路径 | 页面 | 说明 |
|------|------|------|
| `#/` | HomePage | 主菜单 |
| `#/game/:id` | GamePage | 核心游戏 |
| `#/levels` | LevelSelectPage | 选关 |

## 数据流

**持久化**：`useGameProgress()` hook 直接读写 localStorage 键 `xieyingeng_progress`，存储 `{ maxClearedId }`。第 1 关始终解锁，后续关卡需要前序关卡已通关。

**会话内**：`GamePage` 管理 `history`（猜测记录 `CharResult[][]`）、`gameState`（playing/won/lost）、`shake`（错误抖动动画）。

**答案校验**：`validate.ts` 中的两遍算法——第一遍标记位置完全匹配（绿色/correct），第二遍标记存在但位置不对的字符（橙色/present），其余为灰色/absent。

## 关卡数据

`src/data/levels.json` 定义所有关卡（`Level[]`），字段包括 `id`、`category`、`topText`、`answer`、`difficulty` 等。关卡图片放在 `public/images/` 下，命名规则：`question_{id}.webp` 和 `question_{id}_hint.webp`。

## 关键约定

- `base: "/xieyingeng/"` 在 `vite.config.ts` 中配置，因部署在 GitHub Pages 子路径下
- 使用 HashRouter 而非 BrowserRouter，确保 GitHub Pages 刷新不 404
- 最多猜测次数 `MAX_ATTEMPTS = 8`，在 `GamePage.tsx` 中定义
- 移动端：input 设 `font-size: 16px` 防止 iOS 缩放
