import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 读取源数据
const srcPath = "D:/AllProjects/bb/output/levels.json";
const targetPath = join(__dirname, "..", "src", "data", "levels.json");

const src = JSON.parse(readFileSync(srcPath, "utf-8"));
const target = JSON.parse(readFileSync(targetPath, "utf-8"));

const existingIds = new Set(target.levels.map((l) => l.id));
let nextId = Math.max(...target.levels.map((l) => l.id), 0) + 1;

let added = 0;
let skipped = 0;

for (const srcLevel of src.levels) {
  // 检查是否至少有两张图片
  if (!srcLevel.images || srcLevel.images.length < 2) {
    skipped++;
    continue;
  }

  const newLevel = {
    id: nextId,
    category: srcLevel.category,
    topText: srcLevel.answer,
    topImage: srcLevel.images[0].file.replace(/\\/g, "/"),
    bottomImage: srcLevel.images[1].file.replace(/\\/g, "/"),
    answer: srcLevel.question,
    difficulty: Math.floor(Math.random() * 3) + 1,
  };

  target.levels.push(newLevel);
  nextId++;
  added++;
}

writeFileSync(targetPath, JSON.stringify(target, null, 2), "utf-8");
console.log(`完成：新增 ${added} 关，跳过 ${skipped} 关，总计 ${target.levels.length} 关`);
