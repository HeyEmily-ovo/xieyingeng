import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ResultFeedbackProps {
  show: boolean;
  won: boolean;
  answer: string;
  levelId: number;
  hasNextLevel: boolean;
}

export default function ResultFeedback({
  show,
  won,
  answer,
  levelId,
  hasNextLevel,
}: ResultFeedbackProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
            className="bg-gray-900 border border-gray-700/50 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
          >
            {won ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="text-6xl mb-5"
                >
                  🎉
                </motion.div>
                <h2 className="text-2xl font-black text-emerald-400 mb-2">恭喜通关！</h2>
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1">正确答案</p>
                  <p className="text-white font-bold text-2xl tracking-widest">{answer}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate("/levels")}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300
                      font-medium py-3 rounded-xl transition-colors border border-gray-700/50"
                  >
                    关卡选择
                  </button>
                  {hasNextLevel && (
                    <button
                      onClick={() => navigate(`/game/${levelId + 1}`)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white
                        font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/30"
                    >
                      下一关 →
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">😢</div>
                <h2 className="text-2xl font-bold text-amber-400 mb-2">次数用完了</h2>
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1">正确答案</p>
                  <p className="text-white font-bold text-2xl tracking-widest">{answer}</p>
                </div>
                <p className="text-gray-500 text-sm mb-6">别灰心，再来一次吧！</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate("/levels")}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300
                      font-medium py-3 rounded-xl transition-colors border border-gray-700/50"
                  >
                    关卡选择
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white
                      font-bold py-3 rounded-xl transition-all"
                  >
                    重试本关
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
