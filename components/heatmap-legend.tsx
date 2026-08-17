import { heatmapLegendGradient } from "@/lib/heatmap-colors";

export function HeatmapLegend({
  maxAbs = 5,
  caption,
}: {
  maxAbs?: number;
  caption?: string;
}) {
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="tabular-nums">-{maxAbs}%</span>
        <div
          className="h-2 flex-1 rounded-full border border-border/50"
          style={{ background: heatmapLegendGradient(maxAbs) }}
          role="img"
          aria-label={caption ?? `Color scale from -${maxAbs}% to +${maxAbs}%`}
        />
        <span className="tabular-nums">+{maxAbs}%</span>
      </div>
      {caption && <p className="text-xs text-muted">{caption}</p>}
    </div>
  );
}
