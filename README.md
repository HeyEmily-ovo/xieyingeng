# 这是谐音梗

看图猜词 · 谐音联想 · 挑战脑洞

一个中文谐音猜词网页游戏，灵感来源于 Steam 游戏《这是谐音梗》。每关通过两张图片给出线索，玩家需要猜出对应的谐音梗词语或成语。

## 快速开始 在线试玩

游戏部署在 GitHub Pages，直接打开即可游玩：

**[开始游戏](https://wingsxie.github.io/xieyingeng/)**

## 怎么玩 玩法

1. 每关有两张图 —— **上图**告诉你"这是什么"，**下图**给一个关联场景
2. 根据两张图的线索，联想出对应的**谐音梗答案**
3. 在输入框输入你的猜测（字数需与答案一致）
4. 根据颜色反馈调整答案：

| 颜色 | 含义 |
|------|------|
| 🟢 绿色 | 字和位置都正确 |
| 🟠 橙色 | 字正确但位置不对 |
| ⬜ 灰色 | 字不在答案中 |

> 每关最多 **8 次**猜测机会，通关后自动解锁下一关。

## 特点 功能

- **393 个关卡**，涵盖词语、成语、地名、品牌、人名、俗语、美食等多种类别
- **本地进度保存**，刷新页面不丢失，支持一键重置
- **关卡选择**，已通关关卡可随时重玩
- **响应式布局**，手机和电脑均可流畅游玩
- **流畅动效**，翻转入场、页面切换、错误抖动等细腻反馈

## 本地开发 技术栈

```bash
# 安装依赖
npm install

# 启动开发服务器（localhost:5173）
npm run dev

# 类型检查 + 生产构建
npm run build

# 本地预览生产构建
npm run preview
```

**技术栈**：React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + React Router

## 项目结构 目录

```
xieyingeng/
├── src/
│   ├── pages/          # 页面组件（HomePage、GamePage、LevelSelectPage）
│   ├── components/     # 通用组件（Header、AnswerInput、GuessRow、ResultFeedback）
│   ├── hooks/          # 自定义 Hook（useGameProgress）
│   ├── utils/          # 工具函数（答案校验）
│   ├── types/          # TypeScript 类型定义
│   └── data/           # 关卡配置数据（levels.json）
├── public/images/      # 关卡图片资源
└── dist/               # 构建产物
```

## 许可证 许可

MIT License

---

Copyright © 2026 Wings
