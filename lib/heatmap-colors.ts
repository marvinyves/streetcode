export type HeatColor = { background: string; color: string };

const GREEN_HUE = 142;
const RED_HUE = 356;

/**
 * Shared color scale for all heat-map surfaces (treemap tiles, mobile list
 * chips, sector grid). Colors are opaque HSL values, not alpha-blended over
 * the page background, so they read the same in light and dark mode — only
 * the surrounding canvas/gaps need to be theme-aware.
 */
export function heatColor(changePercent: number, maxAbs = 5): HeatColor {
  const clamped = Math.max(-maxAbs, Math.min(maxAbs, changePercent));
  const magnitude = Math.abs(clamped) / maxAbs;
  const hue = clamped >= 0 ? GREEN_HUE : RED_HUE;
  const lightness = 92 - magnitude * 57;
  const saturation = 38 + magnitude * 40;
  const background = `hsl(${hue} ${saturation}% ${lightness}%)`;
  const color = lightness > 55 ? `hsl(${hue} 65% 22%)` : `hsl(${hue} 45% 96%)`;
  return { background, color };
}

/** Solid text color for standalone labels (e.g. sector avg, list totals) — theme-aware via CSS vars. */
export function heatTextColor(changePercent: number): string {
  return changePercent >= 0 ? "var(--heat-up-fg)" : "var(--heat-down-fg)";
}

export function heatmapLegendGradient(maxAbs = 5, steps = 9): string {
  const stops: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const pct = (i / steps) * 100;
    const value = -maxAbs + (i / steps) * (2 * maxAbs);
    stops.push(`${heatColor(value, maxAbs).background} ${pct}%`);
  }
  return `linear-gradient(to right, ${stops.join(", ")})`;
}
