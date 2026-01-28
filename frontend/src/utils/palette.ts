const palettes: Record<string, string[]> = {
  blue: ["#e3f2ff", "#c5dfff", "#93c4ff", "#5aa2ff", "#2c7cd3"],
  green: ["#e6f6eb", "#c8ebd1", "#92d7a7", "#59c17a", "#2f9b55"],
  red: ["#ffe8e8", "#ffcfcf", "#ff9f9f", "#f36b6b", "#d33c3c"],
  orange: ["#fff2e4", "#ffdcb7", "#ffbc7a", "#ff9a3d", "#e47616"],
  purple: ["#f3e9ff", "#dec8ff", "#bd9dff", "#9266f2", "#6a41c2"],
  pink: ["#ffe6f2", "#ffc9e2", "#ff9ec8", "#f46ba4", "#d23c7f"],
  yellow: ["#fff8df", "#ffe9a8", "#ffd25a", "#ffb71c", "#d59400"],
  teal: ["#e4f7f7", "#c6ecec", "#8fd8d8", "#59c2c2", "#2a9b9b"],
};

const aliases: Record<string, string> = {
  blå: "blue",
  bla: "blue",
  grön: "green",
  groen: "green",
  röd: "red",
  rod: "red",
  orange: "orange",
  lila: "purple",
  purple: "purple",
  rosa: "pink",
  gul: "yellow",
  turkos: "teal",
  turquoise: "teal",
  aqua: "teal",
  cyan: "teal",
  mint: "teal",
  teal: "teal",
  blue: "blue",
  green: "green",
  red: "red",
  pink: "pink",
  yellow: "yellow",
};

function normalizeColorKey(input: string) {
  const key = input.toLowerCase();
  if (key.startsWith("#")) return key;
  if (aliases[key]) return aliases[key];
  return key;
}

export function shadeForPoints(color: string | undefined, points: number) {
  if (color && color.startsWith("#")) return color;
  const key = color ? normalizeColorKey(color) : undefined;
  const palette = key ? palettes[key] : null;
  const clamped = Math.min(Math.max(points, 1), 10);

  const idx = Math.min(Math.ceil(clamped / 2), (palette?.length || 1) - 1);
  return palette ? palette[idx] : "#f8fafc";
}

export function colorPreview(color: string) {
  const key = normalizeColorKey(color);
  if (key.startsWith("#")) return key;
  const palette = palettes[key];
  if (!palette || palette.length === 0) return "#e2e8f0";
  return palette[Math.floor(palette.length / 2)];
}

export function fallbackColorForUser(userId: string) {
  if (!colorKeys.length) return "#e2e8f0";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const key = colorKeys[Math.abs(hash) % colorKeys.length];
  return colorPreview(key);
}

function hexToRgb(hex: string) {
  const stripped = hex.replace("#", "");
  const bigint = parseInt(stripped, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function mix(hexA: string, hexB: string, t: number) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const mixChannel = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r = mixChannel(a.r, b.r);
  const g = mixChannel(a.g, b.g);
  const bch = mixChannel(a.b, b.b);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(bch)}`;
}

export function textColorForBackground(hex: string) {
  const lum = luminance(hex);
  if (lum < 0.6) return "#ffffff";
  const t = clamp((0.75 - lum) / 0.75, 0, 1);
  return mix("#0f172a", "#f8fafc", t);
}

export const colorKeys = Object.keys(palettes);
