import type { ReactNode } from "react";

export function ProductPlate({
  src,
  alt,
  size = "md",
  priority = false,
  children,
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`plate plate-${size}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        referrerPolicy="no-referrer"
      />
      {children}
    </div>
  );
}

export function SpecStrip({ items, label }: { items: string[]; label?: string }) {
  const visible = items.filter(Boolean);
  if (!visible.length) return null;
  return (
    <ul className="spec-strip" aria-label={label ?? "Key specifications"}>
      {visible.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function BuyButton({ href, small = false, label = "Buy Now" }: { href: string; small?: boolean; label?: string }) {
  const amazon = href.includes("amazon.com");
  return (
    <a
      className={`buy-button${small ? " buy-button-small" : ""}`}
      href={href}
      target="_blank"
      rel={amazon ? "sponsored nofollow noopener" : "noopener"}
    >
      {label}
      <span aria-hidden="true">→</span>
    </a>
  );
}

export function ProsCons({ pros, cons, compact = false }: { pros: string[]; cons: string[]; compact?: boolean }) {
  return (
    <div className={`pros-cons${compact ? " pros-cons-compact" : ""}`}>
      <div className="pros">
        <strong>Good</strong>
        <ul>{pros.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div className="cons">
        <strong>Watch</strong>
        <ul>{cons.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </div>
  );
}
