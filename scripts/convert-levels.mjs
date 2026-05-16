import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const srcPath = "D:/AllProjects/bb/output/levels.json";
const targetPath = join(__dirname, "..", "src", "data", "levels.json");

const src = JSON.parse(readFileSync(srcPath, "utf-8"));
const target = JSON.parse(readFileSync(targetPath, "utf-8"));

// 保留前6关（test关卡）
const testLevels = target.levels.filter((l) => l.id <= 6);
let nextId = 7;
let added = 0;
let skippedWid = 0;
let skippedCb = 0;
let skippedNoImg = 0;

const newLevels = [...testLevels];

for (const s of src.levels) {
  // 过滤：缺图片
  if (!s.images || s.images.length < 2) {
    skippedNoImg++;
    continue;
  }
  // 过滤：含-cb
  if (s.images[0].file.includes("-cb") || s.images[1].file.includes("-cb")) {
    skippedCb++;
    continue;
  }
  // 过滤：w_id不一致
  if (s.images[0].w_id !== s.images[1].w_id) {
    skippedWid++;
    continue;
  }

  newLevels.push({
    id: nextId,
    category: s.category,
    topText: s.answer,
    topImage: s.images[0].file.replace(/\\/g, "/"),
    bottomImage: s.images[1].file.replace(/\\/g, "/"),
    answer: s.question,
    difficulty: Math.floor(Math.random() * 3) + 1,
  });
  nextId++;
  added++;
}

const output = { version: target.version, levels: newLevels };
writeFileSync(targetPath, JSON.stringify(output, null, 2), "utf-8");
console.log(`新增 ${added} 关，总计 ${newLevels.length} 关`);
console.log(`过滤: -cb=${skippedCb} w_id不一致=${skippedWid} 缺图片=${skippedNoImg}`);
