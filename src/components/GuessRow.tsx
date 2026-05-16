import { motion } from "framer-motion";
import type { CharResult } from "../types";

interface GuessRowProps {
  results: CharResult[];
  index: number;
}

const statusStyle: Record<string, string> = {
  correct: "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40",
  present: "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-900/30",
  absent: "bg-gray-700 border-gray-600 text-gray-300",
};

export default function GuessRow({ results, index }: GuessRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex justify-center gap-1.5 mb-2"
    >
      {results.map((r, i) => (
        <motion.div
          key={i}
          initial={{ rotateX: 0, scale: 0.8 }}
          animate={{ rotateX: 360, scale: 1 }}
          transition={{
            delay: index * 0.05 + i * 0.12,
            duration: 0.45,
            ease: "easeInOut",
          }}
          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center
            text-xl sm:text-2xl font-bold rounded-xl border-2 ${statusStyle[r.status]}`}
        >
          {r.char}
        </motion.div>
      ))}
    </motion.div>
  );
}
