/** 单个字符的校验状态 */
export type CharStatus = "correct" | "present" | "absent";

/** 单个字符的校验结果 */
export interface CharResult {
  char: string;
  status: CharStatus;
}

/** 关卡数据 */
export interface Level {
  id: number;
  category: string;
  topText: string;
  topImage?: string;
  bottomImage?: string;
  answer: string;
  difficulty: number;
}

/** 关卡配置文件 */
export interface LevelData {
  version: string;
  levels: Level[];
}

/** 游戏状态 */
export type GameState = "playing" | "won" | "lost";
