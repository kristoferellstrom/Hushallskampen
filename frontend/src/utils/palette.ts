const palettes: Record<string, string[]> = {
  blue: ["#e0f2ff", "#c7e3ff", "#a6d3ff", "#85c2ff", "#64b2ff", "#439fff", "#1e89f5", "#0f74d1", "#0b5ba6", "#08457a"],
  green: ["#e8f8ec", "#d3f0d9", "#b6e6c0", "#96d9a3", "#76cc86", "#56bf69", "#34b14b", "#24923d", "#1c7332", "#145626"],
  red: ["#ffe6e6", "#ffcfcf", "#ffb1b1", "#ff9494", "#ff7777", "#ff5959", "#ff3c3c", "#e02f2f", "#b82424", "#8f1a1a"],
  orange: ["#fff1e6", "#ffdcbc", "#ffc690", "#ffad61", "#ff9431", "#ff7b00", "#e96f00", "#c65d00", "#a44d00", "#823d00"],
  purple: ["#f1e6ff", "#e2ccff", "#cfb0ff", "#bc95ff", "#a97aff", "#9660ff", "#7c4dd6", "#643da8", "#4d2f7d", "#3a235c"],
  pink: ["#ffe6f1", "#ffcce3", "#ffafd3", "#ff92c3", "#ff75b3", "#ff58a3", "#e64890", "#c33b78", "#9f2e60", "#7b224a"],
  yellow: ["#fff9e0", "#fff2b3", "#ffe985", "#ffdd57", "#ffd029", "#ffc200", "#e3ad00", "#c49800", "#a68400", "#876e00"],
  teal: ["#e0f7f7", "#c2eeee", "#9fe3e3", "#7bd8d8", "#57cdcd", "#33c2c2", "#259d9d", "#1d7b7b", "#165d5d", "#0f4242"],
};

export function shadeForPoints(color: string | undefined, points: number) {
  const palette = color ? palettes[color] : null;
  const idx = Math.min(Math.max(points, 1), 10) - 1;
  return palette ? palette[idx] : "#f8fafc";
}

export function colorPreview(color: string) {
  const palette = palettes[color];
  return palette ? palette[5] : "#e2e8f0";
}

export const colorKeys = Object.keys(palettes);
