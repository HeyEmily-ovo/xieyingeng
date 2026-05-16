import sharp from "sharp";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, "..", "public", "images");
const TARGET_W = 588;
const TARGET_H = 400;

function sh(cmd) {
  return execSync(cmd, { stdio: "pipe", encoding: "utf-8" });
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full);
      continue;
    }
    const ext = extname(e.name).toLowerCase();
    if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) continue;

    const fullUnix = full.replace(/\\/g, "/");

    // 先读入 buffer，sharp 不持有文件句柄
    const inputBuf = await readFile(full);

    const meta = await sharp(inputBuf).metadata();
    if (meta.width === TARGET_W && meta.height === TARGET_H) continue;

    let pipeline = sharp(inputBuf).resize(TARGET_W, TARGET_H, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    });

    if (ext === ".webp") pipeline = pipeline.webp({ quality: 85 });
    else if (ext === ".png") pipeline = pipeline.png({ quality: 85 });
    else pipeline = pipeline.jpeg({ quality: 85 });

    const outBuf = await pipeline.toBuffer();
    const tmpPath = fullUnix + ".tmp";

    await writeFile(tmpPath, outBuf);
    sh(`rm -f "${fullUnix}"`);
    sh(`mv "${tmpPath}" "${fullUnix}"`);

    console.log(`✓ ${fullUnix} (${meta.width} × ${meta.height} → ${TARGET_W} × ${TARGET_H})`);
  }
}

console.log("开始调整图片尺寸...");
await walk(imagesDir);
console.log("完成");
