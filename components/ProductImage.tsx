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
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
