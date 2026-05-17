import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline, RawImage } from "@xenova/transformers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const levelsPath = join(rootDir, "src", "data", "levels.json");
const publicDir = join(rootDir, "public");
const outputPath = join(rootDir, "mapping_candidates.json");

function parseArgs(argv) {
  const args = { threshold: 0.5, topK: Number.POSITIVE_INFINITY };

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--threshold" && argv[i + 1]) {
      args.threshold = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (item === "--topK" && argv[i + 1]) {
      args.topK = Number(argv[i + 1]);
      i += 1;
    }
  }

  if (!Number.isFinite(args.threshold) || args.threshold < 0 || args.threshold > 1) {
    throw new Error("--threshold 必须是 0 到 1 之间的数字");
  }

  if (!Number.isFinite(args.topK) || args.topK < 1) {
    args.topK = Number.POSITIVE_INFINITY;
  }

  return args;
}

function roundScore(score) {
  return Number(score.toFixed(6));
}

function uniqueTopTexts(levels) {
  const seen = new Set();
  const texts = [];

  for (const level of levels) {
    const text = typeof level.topText === "string" ? level.topText.trim() : "";
    if (!text || seen.has(text)) {
      continue;
    }
    seen.add(text);
    texts.push(text);
  }

  return texts;
}

async function classifyImage(classifier, imagePath, candidateTexts) {
  const image = await RawImage.read(imagePath);
  const result = await classifier(image, candidateTexts, {
    topk: candidateTexts.length,
    hypothesis_template: "这张图片最可能表达的是 {}。",
  });

  return result
    .map((item) => ({
      topText: item.label,
      similarity: roundScore(item.score),
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

async function main() {
  const { threshold, topK } = parseArgs(process.argv.slice(2));
  const data = JSON.parse(await readFile(levelsPath, "utf-8"));
  const levels = Array.isArray(data.levels) ? data.levels : [];
  const allTopTexts = uniqueTopTexts(levels);
  const classifier = await pipeline("zero-shot-image-classification", "Xenova/clip-vit-base-patch32");

  const proposals = [];

  for (const level of levels) {
    const imagePath = join(publicDir, level.topImage ?? "");
    const relativeImagePath = level.topImage ?? "";

    if (!relativeImagePath || !existsSync(imagePath)) {
      proposals.push({
        id: level.id,
        current_topText: level.topText,
        image_path: relativeImagePath,
        current_topText_similarity: 0,
        best_match_topText: null,
        best_match_similarity: 0,
        current_topText_maybe_correct: false,
        qualified_candidates: [],
        candidates: [],
        error: "image_not_found",
      });
      continue;
    }

    try {
      const candidates = await classifyImage(classifier, imagePath, allTopTexts);
      const limitedCandidates = Number.isFinite(topK) ? candidates.slice(0, topK) : candidates;
      const qualifiedCandidates = candidates.filter((candidate) => candidate.similarity >= threshold);
      const bestMatch = candidates[0] ?? null;
      const currentCandidate = candidates.find((candidate) => candidate.topText === level.topText) ?? null;

      proposals.push({
        id: level.id,
        current_topText: level.topText,
        image_path: relativeImagePath,
        current_topText_similarity: currentCandidate?.similarity ?? 0,
        best_match_topText: bestMatch?.topText ?? null,
        best_match_similarity: bestMatch?.similarity ?? 0,
        current_topText_maybe_correct:
          Boolean(bestMatch && bestMatch.topText === level.topText && bestMatch.similarity >= threshold),
        qualified_candidates,
        candidates: limitedCandidates,
      });
    } catch (error) {
      proposals.push({
        id: level.id,
        current_topText: level.topText,
        image_path: relativeImagePath,
        current_topText_similarity: 0,
        best_match_topText: null,
        best_match_similarity: 0,
        current_topText_maybe_correct: false,
        qualified_candidates: [],
        candidates: [],
        error: error instanceof Error ? error.message : "classification_failed",
      });
    }
  }

  const output = {
    metadata: {
      model: "Xenova/clip-vit-base-patch32",
      threshold,
      topK: Number.isFinite(topK) ? topK : null,
      total_levels: levels.length,
      unique_topText_count: allTopTexts.length,
      generated_at: new Date().toISOString(),
    },
    proposals,
  };

  await writeFile(outputPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`已输出 ${proposals.length} 条候选到 ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
