export type Sized = { value: number };
export type Positioned<T> = T & { x: number; y: number; w: number; h: number };

function worstRatio(rowAreas: number[], length: number): number {
  const sum = rowAreas.reduce((a, b) => a + b, 0);
  if (sum === 0) return Infinity;
  const rowMax = Math.max(...rowAreas);
  const rowMin = Math.min(...rowAreas);
  return Math.max(
    (length * length * rowMax) / (sum * sum),
    (sum * sum) / (length * length * rowMin),
  );
}

function layoutRow<T>(
  row: Array<T & { area: number }>,
  x: number,
  y: number,
  w: number,
  h: number,
): Positioned<T>[] {
  const rowSum = row.reduce((s, it) => s + it.area, 0);
  const results: Positioned<T>[] = [];

  if (w >= h) {
    // Vertical strip along the left: fixed height h, thickness (width) = rowSum / h.
    const rowW = rowSum / h;
    let offsetY = y;
    for (const it of row) {
      const itemH = (it.area / rowSum) * h;
      results.push({ ...it, x, y: offsetY, w: rowW, h: itemH });
      offsetY += itemH;
    }
  } else {
    // Horizontal strip along the top: fixed width w, thickness (height) = rowSum / w.
    const rowH = rowSum / w;
    let offsetX = x;
    for (const it of row) {
      const itemW = (it.area / rowSum) * w;
      results.push({ ...it, x: offsetX, y, w: itemW, h: rowH });
      offsetX += itemW;
    }
  }
  return results;
}

/**
 * Squarified treemap layout (Bruls, Huizing, van Wijk). Returns items
 * positioned in the same coordinate space as the input rect (x, y, w, h) —
 * pass a fixed canvas (e.g. 1000x600) and convert to percentages for
 * responsive, JS-measurement-free rendering.
 */
export function squarify<T extends Sized>(
  items: T[],
  x: number,
  y: number,
  w: number,
  h: number,
): Positioned<T>[] {
  const filtered = items.filter((it) => it.value > 0);
  if (filtered.length === 0 || w <= 0 || h <= 0) return [];

  const totalValue = filtered.reduce((s, it) => s + it.value, 0);
  const scale = (w * h) / totalValue;
  const sized = filtered
    .map((it) => ({ ...it, area: it.value * scale }))
    .sort((a, b) => b.area - a.area);

  const result: Positioned<T>[] = [];
  let rectX = x;
  let rectY = y;
  let rectW = w;
  let rectH = h;
  let remaining = sized;

  while (remaining.length > 0) {
    const shorterSide = Math.min(rectW, rectH);
    let row = [remaining[0]];
    let i = 1;
    while (i < remaining.length) {
      const testRow = [...row, remaining[i]];
      const testAreas = testRow.map((it) => it.area);
      const curAreas = row.map((it) => it.area);
      if (worstRatio(testAreas, shorterSide) <= worstRatio(curAreas, shorterSide)) {
        row = testRow;
        i++;
      } else {
        break;
      }
    }

    result.push(...layoutRow(row, rectX, rectY, rectW, rectH));

    const rowArea = row.reduce((s, it) => s + it.area, 0);
    if (rectW >= rectH) {
      const usedW = rowArea / rectH;
      rectX += usedW;
      rectW -= usedW;
    } else {
      const usedH = rowArea / rectW;
      rectY += usedH;
      rectH -= usedH;
    }

    remaining = remaining.slice(row.length);
  }

  return result;
}
