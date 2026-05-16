import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const targetPath = join(__dirname, "..", "src", "data", "levels.json");
const publicDir = join(__dirname, "..", "public");

const data = JSON.parse(readFileSync(targetPath, "utf-8"));
const levels = data.levels;

let fixedCount = 0;
let removedCount = 0;

// 过滤：去掉引用-cb且对应非cb文件不存在的关卡
// 修复：w_id不一致的关卡，统一到同一个w_id
const newLevels = [];

for (const level of levels) {
  // 前6关是test关卡，不动
  if (level.id <= 6) {
    newLevels.push(level);
    continue;
  }

  const top = level.topImage;
  const bottom = level.bottomImage;

  // 检测到-cb引用，尝试替换为非cb版本
  let newTop = top;
  let newBottom = bottom;

  if (top.includes("-cb")) {
    const fixed = top.replace(/-cb/g, "");
    if (existsSync(join(publicDir, fixed))) {
      newTop = fixed;
    }
  }
  if (bottom.includes("-cb")) {
    const fixed = bottom.replace(/-cb/g, "");
    if (existsSync(join(publicDir, fixed))) {
      newBottom = fixed;
    }
  }

  // 提取w_id
  const tm = newTop.match(/w(\d+)-(\d)/);
  const bm = newBottom.match(/w(\d+)-(\d)/);

  if (!tm || !bm) {
    // 无法识别的格式，保留
    newLevels.push({ ...level, topImage: newTop, bottomImage: newBottom });
    continue;
  }

  const topW = tm[1];
  const topV = tm[2];
  const botW = bm[1];
  const botV = bm[2];

  // 如果w_id相同且已经分别是-1和-2，无需修复
  if (topW === botW && topV === "1" && botV === "2") {
    newLevels.push({ ...level, topImage: newTop, bottomImage: newBottom });
    continue;
  }

  // 需要修复 — 尝试用 bottomImage 的 w_id 构建新配对
  const folder = dirname(newBottom.replace(/^images\//, "")); // e.g. "classic"
  const candidateTop = `images/${folder}/w${botW}-1.png`;
  const candidateBottom = `images/${folder}/w${botW}-2.png`;

  if (existsSync(join(publicDir, candidateTop)) && existsSync(join(publicDir, candidateBottom))) {
    // 检查是否与其他关卡冲突（只检查已加入newLevels的）
    const conflict = newLevels.find(
      (l) => l.topImage === candidateTop || l.bottomImage === candidateBottom
    );
    if (!conflict) {
      newLevels.push({
        ...level,
        topImage: candidateTop,
        bottomImage: candidateBottom,
      });
      fixedCount++;
      continue;
    }
  }

  // 回退：用 topImage 的 w_id
  const folderT = dirname(newTop.replace(/^images\//, ""));
  const cTop2 = `images/${folderT}/w${topW}-1.png`;
  const cBottom2 = `images/${folderT}/w${topW}-2.png`;

  if (existsSync(join(publicDir, cTop2)) && existsSync(join(publicDir, cBottom2))) {
    const conflict = newLevels.find(
      (l) => l.topImage === cTop2 || l.bottomImage === cBottom2
    );
    if (!conflict) {
      newLevels.push({
        ...level,
        topImage: cTop2,
        bottomImage: cBottom2,
      });
      fixedCount++;
      continue;
    }
  }

  // 无法修复，丢弃该关卡
  removedCount++;
}

data.levels = newLevels;
writeFileSync(targetPath, JSON.stringify(data, null, 2), "utf-8");
console.log(`修复 ${fixedCount} 关，丢弃 ${removedCount} 关，总计 ${newLevels.length} 关`);
