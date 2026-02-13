interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GAP = 24;

function rectsOverlap(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width + GAP <= b.x ||
    b.x + b.width + GAP <= a.x ||
    a.y + a.height + GAP <= b.y ||
    b.y + b.height + GAP <= a.y
  );
}

function hasCollision(candidate: Rect, existing: Rect[]): boolean {
  return existing.some((r) => rectsOverlap(candidate, r));
}

export function findNonOverlappingPosition(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  existingItems: Rect[]
): { x: number; y: number } {
  const candidate: Rect = {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  };

  if (!hasCollision(candidate, existingItems)) {
    return { x: candidate.x, y: candidate.y };
  }

  // Spiral search — step must be large enough to clear the item
  const stepX = width + GAP;
  const stepY = height + GAP;
  let dx = 0;
  let dy = 0;
  let segmentLength = 1;
  let segmentPassed = 0;
  let direction = 0; // 0=right, 1=down, 2=left, 3=up

  for (let i = 0; i < 200; i++) {
    switch (direction) {
      case 0: dx += stepX; break;
      case 1: dy += stepY; break;
      case 2: dx -= stepX; break;
      case 3: dy -= stepY; break;
    }
    segmentPassed++;

    if (segmentPassed === segmentLength) {
      segmentPassed = 0;
      direction = (direction + 1) % 4;
      if (direction % 2 === 0) segmentLength++;
    }

    const test: Rect = {
      x: centerX - width / 2 + dx,
      y: centerY - height / 2 + dy,
      width,
      height,
    };

    if (!hasCollision(test, existingItems)) {
      return { x: test.x, y: test.y };
    }
  }

  // Fallback
  return {
    x: centerX - width / 2 + Math.random() * 100,
    y: centerY - height / 2 + Math.random() * 100,
  };
}

export function computeTidyLayout(
  items: { id: string; width: number; height: number }[],
  centerX: number,
  centerY: number
): { id: string; posX: number; posY: number }[] {
  if (items.length === 0) return [];

  const cols = Math.max(1, Math.ceil(Math.sqrt(items.length)));
  const colWidth = 320;
  const rowGap = GAP;
  const colGap = GAP;

  const totalWidth = cols * colWidth + (cols - 1) * colGap;
  const startX = centerX - totalWidth / 2;

  // Arrange in columns, top-to-bottom
  const colHeights = new Array(cols).fill(0);
  const result: { id: string; posX: number; posY: number }[] = [];

  for (const item of items) {
    // Find shortest column
    let minCol = 0;
    for (let c = 1; c < cols; c++) {
      if (colHeights[c] < colHeights[minCol]) minCol = c;
    }

    const x = startX + minCol * (colWidth + colGap);
    const y = centerY - 200 + colHeights[minCol];

    result.push({ id: item.id, posX: x, posY: y });
    colHeights[minCol] += item.height + rowGap;
  }

  return result;
}

export function nudgeToNonOverlapping(
  itemId: string,
  movedRect: Rect,
  allItems: { id: string; x: number; y: number; width: number; height: number }[]
): { x: number; y: number } | null {
  const others = allItems
    .filter((i) => i.id !== itemId)
    .map((i) => ({ x: i.x, y: i.y, width: i.width, height: i.height }));

  if (!hasCollision(movedRect, others)) {
    return null;
  }

  return findNonOverlappingPosition(
    movedRect.x + movedRect.width / 2,
    movedRect.y + movedRect.height / 2,
    movedRect.width,
    movedRect.height,
    others
  );
}
