const WEBP_SUFFIX = ".webp";
const BASE_URL = import.meta.env.BASE_URL || "/";

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

const withBaseUrl = (src: string) => {
  if (!src) return src;
  if (/^(?:[a-z]+:)?\/\//i.test(src)) return src;
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  if (src.startsWith("/")) return `${base}${src.slice(1)}`;
  return `${base}${src}`;
};

export const assetUrl = (src: string) => withBaseUrl(normalizeAssetPath(src));

export const withWebpWidth = (src: string, width: number) => {
  const safeSrc = normalizeAssetPath(src);
  if (!safeSrc.endsWith(WEBP_SUFFIX)) return withBaseUrl(safeSrc);
  return withBaseUrl(`${safeSrc.slice(0, -WEBP_SUFFIX.length)}-${width}${WEBP_SUFFIX}`);
};

export const buildWebpSrcSet = (src: string, widths: number[], originalWidth: number) => {
  const safeSrc = normalizeAssetPath(src);
  if (!safeSrc.endsWith(WEBP_SUFFIX)) return undefined;
  const entries = widths.map((width) => `${withWebpWidth(safeSrc, width)} ${width}w`);
  entries.push(`${withBaseUrl(safeSrc)} ${originalWidth}w`);
  return entries.join(", ");
};
