#!/usr/bin/env bash
# validate-images.sh — 블로그 포스트 이미지 최소 개수 검증
# 사용: ./scripts/validate-images.sh [content_dir] [min_images]
# 기본값: content/posts 3

set -euo pipefail

CONTENT_DIR="${1:-content/posts}"
MIN_IMAGES="${2:-3}"
FAILED=0
CHECKED=0
SKIPPED=0

if [ ! -d "$CONTENT_DIR" ]; then
  echo "ERROR: 콘텐츠 디렉토리를 찾을 수 없습니다: $CONTENT_DIR"
  exit 1
fi

echo "=== 이미지 검증 시작 ==="
echo "대상: $CONTENT_DIR | 최소 이미지: ${MIN_IMAGES}개"
echo ""

for file in "$CONTENT_DIR"/*.md; do
  [ -f "$file" ] || continue

  filename=$(basename "$file")

  # _index.md 는 건너뛰기
  if [ "$filename" = "_index.md" ]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # draft: true 인 글은 건너뛰기
  if grep -q '^draft:\s*true' "$file" 2>/dev/null; then
    SKIPPED=$((SKIPPED + 1))
    echo "  SKIP (draft): $filename"
    continue
  fi

  CHECKED=$((CHECKED + 1))

  # 본문에서 이미지 태그 카운트 (front matter 이후)
  # Markdown: ![alt](url) 패턴
  # HTML: <img 태그
  body=$(sed -n '/^---$/,/^---$/!p' "$file" | tail -n +1)
  md_images=$(echo "$body" | grep -c '!\[' 2>/dev/null || true)
  html_images=$(echo "$body" | grep -ci '<img' 2>/dev/null || true)
  total_images=$((md_images + html_images))

  if [ "$total_images" -lt "$MIN_IMAGES" ]; then
    echo "  FAIL ($total_images/${MIN_IMAGES}): $filename"
    FAILED=$((FAILED + 1))
  else
    echo "  PASS ($total_images/${MIN_IMAGES}): $filename"
  fi
done

echo ""
echo "=== 검증 결과 ==="
echo "검사: ${CHECKED}개 | 통과: $((CHECKED - FAILED))개 | 실패: ${FAILED}개 | 건너뜀: ${SKIPPED}개"

if [ "$FAILED" -gt 0 ]; then
  echo ""
  echo "WARNING: ${FAILED}개 포스트가 이미지 최소 ${MIN_IMAGES}개 기준을 충족하지 못했습니다."
  echo "각 포스트에 최소 ${MIN_IMAGES}개의 이미지를 추가해주세요."
  echo "  - 스크린샷, 다이어그램, 인포그래픽, 제품 UI 등"
  echo "  - Markdown: ![설명](URL)"
  echo "  - HTML: <img src=\"URL\" alt=\"설명\">"
  exit 1
fi

echo "모든 포스트가 이미지 기준을 충족합니다."
exit 0
