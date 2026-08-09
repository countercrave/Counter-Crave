"use client";

type ProductImageProps = {
  src?: string;
  alt: string;
  width?: number | null;
  height?: number | null;
};

export function ProductImage({
  src,
  alt,
  width = 500,
  height = 500,
}: ProductImageProps) {
  if (!src) {
    return (
      <div className="product-image-placeholder" role="img" aria-label={alt}>
        Product image pending
      </div>
    );
  }

  return (
    // Amazon-provided image URLs are displayed directly. They are not scraped,
    // downloaded or re-hosted by this starter.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="product-image"
      src={src}
      alt={alt}
      width={width || 500}
      height={height || 500}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const target = e.currentTarget;
        const stage = Number.parseInt(target.dataset.stage || "0", 10);
        const asinMatch = src.match(/\/P\/([A-Z0-9]{10})/i) || src.match(/ASIN=([A-Z0-9]{10})/i);
        const asin = asinMatch ? asinMatch[1] : null;

        if (stage === 0 && asin) {
          target.dataset.stage = "1";
          target.src = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL500_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1`;
          return;
        }

        if (stage === 1 && asin) {
          target.dataset.stage = "2";
          target.src = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.PT01._SL1500_.jpg`;
          return;
        }

        if (stage < 3) {
          target.dataset.stage = "3";
          target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="340"><rect width="100%" height="100%" fill="#faf6ef"/><rect x="12" y="12" width="426" height="316" fill="none" stroke="#e7e1d6" stroke-width="2" rx="10"/><text x="50%" y="45%" font-family="sans-serif" font-size="16" fill="#5c6470" text-anchor="middle">${alt.replace(/["'<>]/g, "")}</text><text x="50%" y="58%" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f4c46" text-anchor="middle">View product photos on Amazon</text></svg>`
          )}`;
        }
      }}
    />
  );
}
