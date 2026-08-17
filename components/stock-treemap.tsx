import { squarify } from "@/lib/treemap";
import type { StockPerformance } from "@/lib/calendar";

const CANVAS_W = 1000;
const CANVAS_H = 560;
const HEADER_UNITS = 24;

function tileColor(changePercent: number): { background: string; color: string } {
  const clamped = Math.max(-5, Math.min(5, changePercent));
  const intensity = Math.abs(clamped) / 5;

  if (changePercent >= 0) {
    return {
      background: `rgba(34, 197, 94, ${0.25 + intensity * 0.6})`,
      color: "#f0fdf4",
    };
  }
  return {
    background: `rgba(239, 68, 68, ${0.25 + intensity * 0.6})`,
    color: "#fef2f2",
  };
}

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

export function StockTreemap({ stocks }: { stocks: StockPerformance[] }) {
  const bySector = new Map<string, StockPerformance[]>();
  for (const s of stocks) {
    const list = bySector.get(s.sector) ?? [];
    list.push(s);
    bySector.set(s.sector, list);
  }

  const sectorTotals = Array.from(bySector.entries()).map(([sector, items]) => ({
    sector,
    value: items.reduce((sum, s) => sum + s.marketCapB, 0),
    items: items.map((s) => ({ ...s, value: s.marketCapB })),
  }));

  const sectorBoxes = squarify(sectorTotals, 0, 0, CANVAS_W, CANVAS_H);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border bg-[#0b1220]"
      style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
    >
      {sectorBoxes.map((box) => {
        const header = Math.min(HEADER_UNITS, box.h * 0.3);
        const stockBoxes = squarify(
          box.items,
          box.x,
          box.y + header,
          box.w,
          box.h - header,
        );
        const sectorArea = box.w * box.h;

        return (
          <div key={box.sector}>
            <div
              className="absolute overflow-hidden truncate border border-[#0b1220] bg-[#1a2338] px-1.5 text-[9px] font-semibold uppercase tracking-wide text-[#94a3b8]"
              style={{
                left: pct(box.x, CANVAS_W),
                top: pct(box.y, CANVAS_H),
                width: pct(box.w, CANVAS_W),
                height: pct(header, CANVAS_H),
                lineHeight: pct(header, CANVAS_H),
                fontSize: sectorArea > 12000 ? "11px" : "9px",
              }}
            >
              {box.sector}
            </div>
            {stockBoxes.map((tile) => {
              const style = tileColor(tile.changePercent);
              const area = tile.w * tile.h;
              const showPercent = area > 1100;
              const fontSize = area > 6000 ? 22 : area > 2500 ? 15 : area > 1100 ? 11 : 8;

              return (
                <div
                  key={tile.symbol}
                  title={`${tile.symbol} ${tile.changePercent >= 0 ? "+" : ""}${tile.changePercent.toFixed(2)}%`}
                  className="absolute flex flex-col items-center justify-center gap-0.5 overflow-hidden whitespace-nowrap border border-[#0b1220] px-0.5 text-center leading-none"
                  style={{
                    left: pct(tile.x, CANVAS_W),
                    top: pct(tile.y, CANVAS_H),
                    width: pct(tile.w, CANVAS_W),
                    height: pct(tile.h, CANVAS_H),
                    backgroundColor: style.background,
                    color: style.color,
                  }}
                >
                  <span
                    className="font-semibold"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {tile.symbol}
                  </span>
                  {showPercent && (
                    <span
                      className="font-medium opacity-90"
                      style={{ fontSize: `${Math.max(fontSize * 0.6, 9)}px` }}
                    >
                      {tile.changePercent >= 0 ? "+" : ""}
                      {tile.changePercent.toFixed(2)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
