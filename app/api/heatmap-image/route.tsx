import { ImageResponse } from "next/og";
import { getLatestHeatMap } from "@/lib/calendar";
import { heatColorRgb } from "@/lib/heatmap-colors";

export const runtime = "nodejs";

const WIDTH = 1200;

export async function GET() {
  const snapshot = await getLatestHeatMap();

  if (!snapshot || snapshot.stocks.length === 0) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#fafafa",
            fontSize: 32,
            color: "#6b7280",
          }}
        >
          No heat map data available
        </div>
      ),
      { width: WIDTH, height: 400 },
    );
  }

  const bySector = new Map<string, typeof snapshot.stocks>();
  for (const s of snapshot.stocks) {
    const list = bySector.get(s.sector) ?? [];
    list.push(s);
    bySector.set(s.sector, list);
  }
  const sectors = Array.from(bySector.entries());

  // Rough height estimate so nothing gets clipped: header + per-sector
  // label + wrapped rows of ~84px-wide chips at the given canvas width.
  const chipsPerRow = Math.max(1, Math.floor((WIDTH - 72) / 90));
  const height =
    140 +
    sectors.reduce((sum, [, stocks]) => {
      const rows = Math.ceil(stocks.length / chipsPerRow);
      return sum + 34 + rows * 58 + 14;
    }, 0);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#ffffff",
          padding: "36px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "24px",
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 700, color: "#171717" }}>
            Market Heat Map
          </div>
          <div style={{ fontSize: 20, color: "#6b7280" }}>{snapshot.date}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {sectors.map(([sector, stocks]) => (
            <div
              key={sector}
              style={{ display: "flex", flexDirection: "column", marginBottom: "14px" }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                {sector}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {stocks.map((s) => {
                  const style = heatColorRgb(s.changePercent);
                  const pctLabel = `${s.changePercent >= 0 ? "+" : ""}${s.changePercent.toFixed(1)}%`;
                  return (
                    <div
                      key={s.symbol}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "84px",
                        height: "52px",
                        borderRadius: "6px",
                        background: style.background,
                        color: style.color,
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{s.symbol}</div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{pctLabel}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: WIDTH, height },
  );
}
