import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameProgress } from "../hooks/useGameProgress";
import type { Level } from "../types";
import levelsData from "../data/levels.json";
import Header from "../components/Header";

const levels: Level[] = levelsData.levels;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const card = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

export default function LevelSelectPage() {
  const navigate = useNavigate();
  const { progress, isLevelUnlocked } = useGameProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBack backTo="/" />

      <div className="max-w-xl mx-auto px-4 py-8">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-center mb-2 text-gray-900"
        >
          关卡选择
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-gray-400 text-sm text-center mb-8"
        >
          已通关 {progress.maxClearedId} / {levels.length} 关
        </motion.p>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {levels.map((level) => {
            const unlocked = isLevelUnlocked(level.id);
            const cleared = progress.maxClearedId >= level.id;
            const isNext = !cleared && unlocked;

            return (
              <motion.button
                key={level.id}
                variants={card}
                onClick={() => unlocked && navigate(`/game/${level.id}`)}
                disabled={!unlocked}
                whileHover={unlocked ? { scale: 1.04 } : {}}
                whileTap={unlocked ? { scale: 0.96 } : {}}
                className={`relative flex flex-col items-center justify-center p-5 rounded-2xl
                  border-2 transition-all aspect-[4/3] ${
                    cleared
                      ? "bg-emerald-50 border-emerald-300 cursor-pointer hover:bg-emerald-100"
                      : isNext
                        ? "bg-white border-emerald-400 cursor-pointer hover:border-emerald-500 ring-1 ring-emerald-200 shadow-sm"
                        : unlocked
                          ? "bg-white border-gray-200 cursor-pointer hover:border-gray-400 shadow-sm"
                          : "bg-gray-100 border-gray-200 cursor-not-allowed"
                  }`}
              >
                <span
                  className={`text-3xl font-black mb-1.5 ${
                    cleared
                      ? "text-emerald-600"
                      : isNext
                        ? "text-gray-900"
                        : unlocked
                          ? "text-gray-700"
                          : "text-gray-300"
                  }`}
                >
                  {level.id}
                </span>

                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 mb-1">
                  {level.category}
                </span>

                <span className="text-xs text-gray-400">{[...level.answer].length} 字</span>

                {cleared && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full
                    flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </span>
                )}
                {!unlocked && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl">
                    <span className="text-gray-300 text-xl">🔒</span>
                  </span>
                )}
                {isNext && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2
                    bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                    下一关
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
