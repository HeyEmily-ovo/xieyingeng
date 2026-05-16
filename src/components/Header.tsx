import { useNavigate } from "react-router-dom";

interface HeaderProps {
  levelId?: number;
  category?: string;
  showBack?: boolean;
}

export default function Header({ levelId, category, showBack = true }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="w-20">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            <span className="text-lg leading-none">←</span>
            <span>返回</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {levelId && (
          <span className="text-gray-400 text-sm font-mono">第 {levelId} 关</span>
        )}
        {category && (
          <span className="bg-emerald-600/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-600/30">
            {category}
          </span>
        )}
      </div>

      <div className="w-20" />
    </header>
  );
}
