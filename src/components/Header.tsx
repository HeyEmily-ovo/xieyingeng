import { useNavigate } from "react-router-dom";

interface HeaderProps {
  levelId?: number;
  category?: string;
  showBack?: boolean;
}

export default function Header({ levelId, category, showBack = true }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="w-20">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-800 transition-colors text-sm flex items-center gap-1"
          >
            <span className="text-lg leading-none">←</span>
            <span>返回</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {levelId && (
          <span className="text-gray-500 text-sm font-mono">第 {levelId} 关</span>
        )}
        {category && (
          <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full border border-emerald-200">
            {category}
          </span>
        )}
      </div>

      <div className="w-20" />
    </header>
  );
}
