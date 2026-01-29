import { assetUrl } from "../utils/imageUtils";

export const Logo = () => (
  <img src={assetUrl("/logo.webp")} alt="Hushållskampen" className="logo-mark" loading="lazy" decoding="async" width="1200" height="800" />
);
