const WEBP_SUFFIX = ".webp";

export const withWebpWidth = (src: string, width: number) => {
  if (!src.endsWith(WEBP_SUFFIX)) return src;
  return `${src.slice(0, -WEBP_SUFFIX.length)}-${width}${WEBP_SUFFIX}`;
};

export const buildWebpSrcSet = (src: string, widths: number[], originalWidth: number) => {
  if (!src.endsWith(WEBP_SUFFIX)) return undefined;
  const entries = widths.map((width) => `${withWebpWidth(src, width)} ${width}w`);
  entries.push(`${src} ${originalWidth}w`);
  return entries.join(", ");
};
