export type HeatColor = { background: string; color: string };

const GREEN_HUE = 142;
const RED_HUE = 356;

function heatHsl(changePercent: number, maxAbs: number) {
  const clamped = Math.max(-maxAbs, Math.min(maxAbs, changePercent));
  const magnitude = Math.abs(clamped) / maxAbs;
  const hue = clamped >= 0 ? GREEN_HUE : RED_HUE;
  const lightness = 92 - magnitude * 57;
  const saturation = 38 + magnitude * 40;
  return { hue, saturation, lightness };
}

function hslToRgbString(h: number, s: number, l: number): string {
  const sFrac = s / 100;
  const lFrac = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sFrac * Math.min(lFrac, 1 - lFrac);
  const f = (n: number) =>
    lFrac - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(f(0) * 255);
  const g = Math.round(f(8) * 255);
  const b = Math.round(f(4) * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Shared color scale for all heat-map surfaces (treemap tiles, mobile list
 * chips, sector grid). Colors are opaque HSL values, not alpha-blended over
 * the page background, so they read the same in light and dark mode — only
 * the surrounding canvas/gaps need to be theme-aware.
 */
export function heatColor(changePercent: number, maxAbs = 5): HeatColor {
  const { hue, saturation, lightness } = heatHsl(changePercent, maxAbs);
  const background = `hsl(${hue} ${saturation}% ${lightness}%)`;
  const color = lightness > 55 ? `hsl(${hue} 65% 22%)` : `hsl(${hue} 45% 96%)`;
  return { background, color };
}

/** Same scale as heatColor, but as rgb() strings for renderers (e.g. Satori/next-og) that don't reliably parse hsl(). */
export function heatColorRgb(changePercent: number, maxAbs = 5): HeatColor {
  const { hue, saturation, lightness } = heatHsl(changePercent, maxAbs);
  const background = hslToRgbString(hue, saturation, lightness);
  const color =
    lightness > 55 ? hslToRgbString(hue, 65, 22) : hslToRgbString(hue, 45, 96);
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
