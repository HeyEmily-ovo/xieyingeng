from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

ROOT_DIR = Path(__file__).resolve().parents[1]
LEVELS_PATH = ROOT_DIR / "src" / "data" / "levels.json"
PUBLIC_DIR = ROOT_DIR / "public"
OUTPUT_PATH = ROOT_DIR / "mapping_candidates.json"
MODEL_NAME = "openai/clip-vit-base-patch32"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="为每个关卡生成 topText 候选映射表")
    parser.add_argument("--threshold", type=float, default=0.5, help="候选阈值，默认 0.5")
    parser.add_argument("--topK", type=int, default=0, help="仅保留前 K 个候选，0 表示全部保留")
    return parser.parse_args()


def load_levels() -> list[dict[str, Any]]:
    data = json.loads(LEVELS_PATH.read_text(encoding="utf-8"))
    levels = data.get("levels", [])
    if not isinstance(levels, list):
        raise ValueError("levels.json 中的 levels 不是数组")
    return levels


def collect_unique_top_texts(levels: list[dict[str, Any]]) -> list[str]:
    seen: set[str] = set()
    texts: list[str] = []

    for level in levels:
        text = str(level.get("topText", "")).strip()
        if not text or text in seen:
            continue
        seen.add(text)
        texts.append(text)

    return texts


def round_score(value: float) -> float:
    return round(float(value), 6)


def build_text_features(
    model: CLIPModel,
    processor: CLIPProcessor,
    texts: list[str],
) -> torch.Tensor:
    text_inputs = processor(text=texts, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        text_features = model.get_text_features(**text_inputs)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)
    return text_features


def score_image(
    model: CLIPModel,
    processor: CLIPProcessor,
    image_path: Path,
    texts: list[str],
    text_features: torch.Tensor,
) -> list[dict[str, Any]]:
    image = Image.open(image_path).convert("RGB")
    image_inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        image_features = model.get_image_features(**image_inputs)
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        logits = model.logit_scale.exp() * image_features @ text_features.T
        scores = torch.softmax(logits, dim=-1)[0].tolist()

    candidates = [
        {"topText": text, "similarity": round_score(score)}
        for text, score in zip(texts, scores, strict=True)
    ]
    candidates.sort(key=lambda item: item["similarity"], reverse=True)
    return candidates


def maybe_limit_candidates(candidates: list[dict[str, Any]], top_k: int) -> list[dict[str, Any]]:
    if top_k <= 0:
        return candidates
    return candidates[:top_k]


def main() -> None:
    args = parse_args()
    if not (0 <= args.threshold <= 1):
        raise ValueError("--threshold 必须在 0 到 1 之间")

    levels = load_levels()
    all_top_texts = collect_unique_top_texts(levels)

    processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    model = CLIPModel.from_pretrained(MODEL_NAME)
    model.eval()

    text_features = build_text_features(model, processor, all_top_texts)

    proposals: list[dict[str, Any]] = []
    for index, level in enumerate(levels, start=1):
        level_id = level.get("id")
        current_top_text = str(level.get("topText", ""))
        image_path_str = str(level.get("topImage", ""))
        image_path = PUBLIC_DIR / image_path_str

        if not image_path_str or not image_path.exists():
            proposals.append(
                {
                    "id": level_id,
                    "current_topText": current_top_text,
                    "image_path": image_path_str,
                    "current_topText_similarity": 0,
                    "best_match_topText": None,
                    "best_match_similarity": 0,
                    "current_topText_maybe_correct": False,
                    "qualified_candidates": [],
                    "candidates": [],
                    "error": "image_not_found",
                }
            )
            print(f"[{index}/{len(levels)}] id={level_id} 图片不存在")
            continue

        try:
            candidates = score_image(model, processor, image_path, all_top_texts, text_features)
            limited_candidates = maybe_limit_candidates(candidates, args.topK)
            qualified_candidates = [
                candidate for candidate in candidates if candidate["similarity"] >= args.threshold
            ]
            best_match = candidates[0] if candidates else None
            current_candidate = next(
                (candidate for candidate in candidates if candidate["topText"] == current_top_text),
                None,
            )

            proposals.append(
                {
                    "id": level_id,
                    "current_topText": current_top_text,
                    "image_path": image_path_str,
                    "current_topText_similarity": current_candidate["similarity"] if current_candidate else 0,
                    "best_match_topText": best_match["topText"] if best_match else None,
                    "best_match_similarity": best_match["similarity"] if best_match else 0,
                    "current_topText_maybe_correct": bool(
                        best_match
                        and best_match["topText"] == current_top_text
                        and best_match["similarity"] >= args.threshold
                    ),
                    "qualified_candidates": qualified_candidates,
                    "candidates": limited_candidates,
                }
            )
            print(f"[{index}/{len(levels)}] id={level_id} 完成")
        except Exception as exc:  # noqa: BLE001
            proposals.append(
                {
                    "id": level_id,
                    "current_topText": current_top_text,
                    "image_path": image_path_str,
                    "current_topText_similarity": 0,
                    "best_match_topText": None,
                    "best_match_similarity": 0,
                    "current_topText_maybe_correct": False,
                    "qualified_candidates": [],
                    "candidates": [],
                    "error": str(exc),
                }
            )
            print(f"[{index}/{len(levels)}] id={level_id} 失败：{exc}")

    output = {
        "metadata": {
            "model": MODEL_NAME,
            "threshold": args.threshold,
            "topK": None if args.topK <= 0 else args.topK,
            "total_levels": len(levels),
            "unique_topText_count": len(all_top_texts),
        },
        "proposals": proposals,
    }

    OUTPUT_PATH.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"已输出 {len(proposals)} 条候选到 {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
