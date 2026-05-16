import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameProgress } from "../hooks/useGameProgress";
import levelsData from "../data/levels.json";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { progress, resetProgress } = useGameProgress();
  const totalLevels = levelsData.levels.length;
  const hasProgress = progress.maxClearedId > 0;
  const nextLevel = Math.min(progress.maxClearedId + 1, totalLevels);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center"
      >
        {/* 标题 */}
        <motion.div variants={item} className="text-center mb-10">
          <h1 className="text-5xl sm:text-7xl font-black tracking-widest mb-3 text-gray-900">
            这是<span className="text-emerald-500">谐音梗</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">看图猜词 · 谐音联想 · 挑战脑洞</p>
        </motion.div>

        {/* 进度条 */}
        {hasProgress && (
          <motion.div variants={item} className="w-full max-w-xs mb-8">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>游戏进度</span>
              <span>
                {progress.maxClearedId} / {totalLevels} 关
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progress.maxClearedId / totalLevels) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* 主按钮 */}
        <motion.div variants={item} className="w-full max-w-xs mb-3">
          <button
            onClick={() => navigate(`/game/${nextLevel}`)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
              text-white font-bold text-lg py-4 px-8 rounded-xl
              transition-all hover:scale-[1.03] active:scale-[0.98]
              shadow-lg shadow-emerald-200"
          >
            {hasProgress ? `继续游戏（第 ${nextLevel} 关）` : "开始游戏"}
          </button>
        </motion.div>

        {/* 次级按钮 */}
        <motion.div variants={item} className="w-full max-w-xs flex gap-3">
          <button
            onClick={() => navigate("/levels")}
            className="flex-1 bg-white hover:bg-gray-50 active:bg-gray-100
              text-gray-700 font-medium py-3.5 rounded-xl transition-all
              border border-gray-200 text-sm shadow-sm"
          >
            关卡选择
          </button>
          <button
            onClick={() =>
              alert(
                "🎮 玩法说明\n\n" +
                  "1. 每关有两张图，上图告诉你「这是什么」\n" +
                  "2. 下图给出一个关联场景，暗示谐音答案\n" +
                  "3. 在输入框输入你的猜测（字数需一致）\n\n" +
                  "🎨 颜色反馈\n" +
                  "🟢 绿色 = 字和位置都正确\n" +
                  "🟠 橙色 = 字正确但位置不对\n" +
                  "⬛ 灰色 = 字不在答案中\n\n" +
                  "💡 每题有 8 次猜测机会！"
              )
            }
            className="flex-1 bg-white hover:bg-gray-50 active:bg-gray-100
              text-gray-700 font-medium py-3.5 rounded-xl transition-all
              border border-gray-200 text-sm shadow-sm"
          >
            玩法说明
          </button>
        </motion.div>

        {/* 底部 */}
        {hasProgress && (
          <motion.div variants={item} className="mt-10">
            <button
              onClick={() => {
                if (confirm("确定要重置所有进度吗？此操作不可撤销。")) {
                  resetProgress();
                  window.location.reload();
                }
              }}
              className="text-gray-300 hover:text-red-400 text-xs underline transition-colors"
            >
              重置进度
            </button>
          </motion.div>
        )}
      </motion.div>

      <p className="fixed bottom-4 text-gray-200 text-xs">这是谐音梗 · Web 版</p>
    </div>
  );
}
