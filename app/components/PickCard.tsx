import { BuyButton, ProductPlate, ProsCons, SpecStrip } from "./ProductPlate";

export type PickView = {
  key: string;
  award: string;
  reason: string;
  watchout: string;
  name: string;
  brandLine: string;
  image: string;
  imageAlt: string;
  specs: string[];
  pros: string[];
  cons: string[];
  buyUrl: string;
};

export function PickCard({ index, pick }: { index: number; pick: PickView }) {
  return (
    <article className="pick-card" id={`pick-${index + 1}`}>
      <div className="pick-card-media">
        <span className="pick-number" aria-label={`Pick ${index + 1}`}>{index + 1}</span>
        <span className="award-sticker">{pick.award}</span>
        <ProductPlate src={pick.image} alt={pick.imageAlt} size="lg" priority />
      </div>
      <div className="pick-card-body">
        <span className="brand-line">{pick.brandLine}</span>
        <h3>{pick.name}</h3>
        <SpecStrip items={pick.specs} label={`${pick.name} specifications`} />
        <p className="pick-reason">{pick.reason}</p>
        <ProsCons pros={pick.pros.slice(0, 2)} cons={pick.cons.slice(0, 2)} compact />
        <p className="pick-watchout"><strong>Skip it if</strong> {pick.watchout}</p>
        <BuyButton href={pick.buyUrl} />
      </div>
    </article>
  );
}
