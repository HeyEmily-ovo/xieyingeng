import { useCallback } from "react";

const STORAGE_KEY = "xieyingeng_progress";

export interface GameProgress {
  /** 已通关的最高关卡 ID（0 表示尚未通关任何关卡） */
  maxClearedId: number;
}

function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.maxClearedId === "number") {
        return parsed;
      }
    }
  } catch {
    // 数据损坏则重置
  }
  return { maxClearedId: 0 };
}

function saveProgress(progress: GameProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useGameProgress() {
  const progress = loadProgress();

  /** 通关某关卡后调用 */
  const completeLevel = useCallback((levelId: number) => {
    const current = loadProgress();
    if (levelId > current.maxClearedId) {
      saveProgress({ maxClearedId: levelId });
    }
  }, []);

  /** 检查某关卡是否已解锁（通关上一关即可解锁） */
  const isLevelUnlocked = useCallback((levelId: number): boolean => {
    if (levelId === 1) return true;
    const current = loadProgress();
    return current.maxClearedId >= levelId - 1;
  }, []);

  /** 重置所有进度 */
  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { progress, completeLevel, isLevelUnlocked, resetProgress };
}
