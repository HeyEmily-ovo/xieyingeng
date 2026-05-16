import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import GuessRow from "../components/GuessRow";
import AnswerInput from "../components/AnswerInput";
import ResultFeedback from "../components/ResultFeedback";
import { useGameProgress } from "../hooks/useGameProgress";
import { validateGuess, isAllCorrect } from "../utils/validate";
import type { CharResult, GameState, Level } from "../types";
import levelsData from "../data/levels.json";

const MAX_ATTEMPTS = 8;
const levels: Level[] = levelsData.levels;

function ImageCard({
  label,
  highlight,
  placeholder,
  imageSrc,
  alt,
  shake,
}: {
  label: string;
  highlight: string;
  placeholder: string;
  imageSrc?: string;
  alt: string;
  shake: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-gray-400 text-sm sm:text-base mb-2">
        {label}
        <span className="text-white font-bold text-xl sm:text-2xl ml-1">{highlight}</span>
      </p>
      <motion.div
        animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative w-44 h-32 sm:w-56 sm:h-40 mx-auto
          bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-2xl
          flex items-center justify-center overflow-hidden
          group hover:border-gray-500 transition-colors"
      >
        {imageSrc ? (
          <img src={imageSrc} alt={alt} className="max-w-full max-h-full object-contain rounded-xl" />
        ) : (
          <div className="text-center">
            <span className="text-4xl sm:text-5xl grayscale group-hover:grayscale-0 transition-all duration-300">
              {placeholder}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { completeLevel } = useGameProgress();
  const inputRef = useRef<HTMLInputElement>(null);

  const level = levels.find((l) => l.id === Number(id));

  const [history, setHistory] = useState<CharResult[][]>([]);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [shake, setShake] = useState(false);

  // 自动聚焦输入框
  useEffect(() => {
    if (gameState === "playing") {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [gameState, history.length]);

  const handleSubmit = useCallback(
    (guess: string) => {
      if (!level) return;
      const results = validateGuess(guess, level.answer);
      const newHistory = [...history, results];
      setHistory(newHistory);

      if (isAllCorrect(results)) {
        setGameState("won");
        completeLevel(level.id);
      } else if (newHistory.length >= MAX_ATTEMPTS) {
        setGameState("lost");
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    },
    [level, history, completeLevel]
  );

  if (!level) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-400 text-lg mb-4">关卡不存在</p>
        <button
          onClick={() => navigate("/levels")}
          className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition-colors"
        >
          返回关卡选择
        </button>
      </div>
    );
  }

  const answerChars = [...level.answer];
  const answerLength = answerChars.length;
  const remaining = MAX_ATTEMPTS - history.length;
  const isGameOver = gameState !== "playing";
  const hasNextLevel = level.id < levels.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header levelId={level.id} category={level.category} />

      {/* 游戏主体 */}
      <div className="flex-1 flex flex-col items-center px-4 py-5 max-w-lg mx-auto w-full">
        {/* 双图区域 */}
        <div className="w-full mb-5 space-y-4">
          <ImageCard
            label="这是"
            highlight={level.topText}
            placeholder="🖼️"
            imageSrc={level.topImage}
            alt={level.topText}
            shake={shake}
          />
          <ImageCard
            label="这是"
            highlight={isGameOver ? level.answer : "_".repeat(answerLength)}
            placeholder="🤔"
            imageSrc={level.bottomImage}
            alt={isGameOver ? level.answer : "猜猜看"}
            shake={false}
          />
        </div>

        {/* 猜测历史 */}
        <div className="flex-1 w-full mb-4 overflow-y-auto">
          {history.length === 0 && (
            <p className="text-center text-gray-600 text-sm py-4">
              输入 {answerLength} 个字，开始猜测
            </p>
          )}
          <AnimatePresence>
            {history.map((results, i) => (
              <GuessRow key={i} results={results} index={i} />
            ))}
          </AnimatePresence>

          {/* 剩余空行 */}
          {!isGameOver &&
            Array.from({ length: remaining }).map((_, i) => (
              <div key={`empty-${i}`} className="flex justify-center gap-1.5 mb-2">
                {answerChars.map((_, j) => (
                  <div
                    key={j}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-800"
                  />
                ))}
              </div>
            ))}
        </div>

        {/* 输入区域 */}
        <AnswerInput
          ref={inputRef}
          answerLength={answerLength}
          onSubmit={handleSubmit}
          disabled={isGameOver}
          remainingAttempts={remaining}
          maxAttempts={MAX_ATTEMPTS}
        />
      </div>

      {/* 结果弹窗 */}
      <ResultFeedback
        show={isGameOver}
        won={gameState === "won"}
        answer={level.answer}
        levelId={level.id}
        hasNextLevel={hasNextLevel}
      />
    </div>
  );
}
