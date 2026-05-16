import { readFileSync } from "node:fs";

const tgt = JSON.parse(readFileSync("src/data/levels.json", "utf-8")).levels;
const src = JSON.parse(readFileSync("D:/AllProjects/xyg-assets/levels.json", "utf-8")).levels;

// 构建源数据索引：question + answer + category -> images
const srcMap = new Map();
src.forEach((s) => {
  if (!s.images || s.images.length < 2) return;
  if (s.images[0].w_id !== s.images[1].w_id) return;
  if (s.images[0].file.includes("-cb") || s.images[1].file.includes("-cb")) return;
  const key = s.question + "|" + s.answer + "|" + s.category;
  srcMap.set(key, {
    top: s.images[0].file.replace(/\\/g, "/"),
    bot: s.images[1].file.replace(/\\/g, "/"),
  });
});

// 验证目标中每个关卡
let mismatch = 0;
let notFound = 0;
tgt.forEach((l) => {
  const key = l.answer + "|" + l.topText + "|" + l.category;
  const srcImg = srcMap.get(key);
  if (!srcImg) {
    notFound++;
    return;
  }
  if (srcImg.top !== l.topImage || srcImg.bot !== l.bottomImage) {
    console.log("错位 id=" + l.id + " " + key);
    console.log("  期望: " + srcImg.top + " / " + srcImg.bot);
    console.log("  实际: " + l.topImage + " / " + l.bottomImage);
    mismatch++;
  }
});

if (mismatch === 0) {
  console.log("全部 " + tgt.length + " 关文本与图片配对正确，无错位");
} else {
  console.log("发现 " + mismatch + " 处错位");
}
if (notFound > 0) console.log("源数据中未找到 " + notFound + " 关（可能来自其他数据源）");
