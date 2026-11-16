#!/usr/bin/env bash
# Copies the pose tracker (MediaPipe, free and open source) next to the Check Form page.
# Usage: scripts/form-check-assets.sh dist
set -euo pipefail
out="${1:-dist}/form-check/lib"
src=node_modules/@mediapipe/tasks-vision
mkdir -p "$out/wasm"
cp "$src/vision_bundle.mjs" "$out/"
cp "$src/wasm/vision_wasm_internal.js" "$src/wasm/vision_wasm_internal.wasm" "$out/wasm/"
curl -fsSL -o "$out/pose_landmarker_lite.task" \
  https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task
echo "Form check assets copied to $out"
