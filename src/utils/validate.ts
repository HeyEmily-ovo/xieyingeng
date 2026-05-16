import type { CharResult, CharStatus } from "../types";

/**
 * 逐字比对猜测与答案，返回带颜色标记的结果数组。
 * 规则（对齐 Steam 版《这是谐音梗》）：
 * - 🟢 correct：字正确且位置正确
 * - 🟠 present：字存在于答案中但位置不对
 * - ⬜ absent：字不存在于答案中
 */
export function validateGuess(guess: string, answer: string): CharResult[] {
  const guessChars = [...guess];
  const answerChars = [...answer];
  const result: CharResult[] = new Array(guessChars.length);
  const used = new Array(answerChars.length).fill(false);

  // 第一遍：标记完全匹配（绿）
  for (let i = 0; i < guessChars.length; i++) {
    if (i < answerChars.length && guessChars[i] === answerChars[i]) {
      result[i] = { char: guessChars[i], status: "correct" as CharStatus };
      used[i] = true;
    }
  }

  // 第二遍：标记存在但错位（橙）或不存在（灰）
  for (let i = 0; i < guessChars.length; i++) {
    if (result[i]) continue;
    const idx = answerChars.findIndex((c, j) => c === guessChars[i] && !used[j]);
    if (idx !== -1) {
      result[i] = { char: guessChars[i], status: "present" as CharStatus };
      used[idx] = true;
    } else {
      result[i] = { char: guessChars[i], status: "absent" as CharStatus };
    }
  }

  return result;
}

/** 检查是否全部猜中 */
export function isAllCorrect(results: CharResult[]): boolean {
  return results.every((r) => r.status === "correct");
}
