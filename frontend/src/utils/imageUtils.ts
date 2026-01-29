const WEBP_SUFFIX = ".webp";

const normalizeAssetPath = (src: string) => {
  if (!src) return src;
  const match = src.match(/^([^?#]+)([?#].*)?$/);
  if (!match) return src;
  const path = match[1];
  const suffix = match[2] ?? "";
  if (typeof path.normalize !== "function") return src;
  const normalized = path.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  return `${normalized}${suffix}`;
};

export const withWebpWidth = (src: string, width: number) => {
  const safeSrc = normalizeAssetPath(src);
  if (!safeSrc.endsWith(WEBP_SUFFIX)) return safeSrc;
  return `${safeSrc.slice(0, -WEBP_SUFFIX.length)}-${width}${WEBP_SUFFIX}`;
};

export const buildWebpSrcSet = (src: string, widths: number[], originalWidth: number) => {
  const safeSrc = normalizeAssetPath(src);
  if (!safeSrc.endsWith(WEBP_SUFFIX)) return undefined;
  const entries = widths.map((width) => `${withWebpWidth(safeSrc, width)} ${width}w`);
  entries.push(`${safeSrc} ${originalWidth}w`);
  return entries.join(", ");
};
