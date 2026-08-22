import type { SourceProduct } from "../data/source-products";

export type ProductFormat =
  | "air-single"
  | "air-dual"
  | "air-oven"
  | "air-microwave"
  | "air-glass"
  | "portable"
  | "immersion"
  | "combo"
  | "personal"
  | "countertop";

function listingFormat(title: string): ProductFormat {
  const value = title.toLowerCase();
  if (/air.?fry/.test(value) && /microwave/.test(value)) return "air-microwave";
  if (/air.?fry/.test(value) && /toaster|french door|air fry oven|rotisserie|convection oven/.test(value)) return "air-oven";
  if (/air.?fry/.test(value) && /glass basket|glass air|glass container|crispi/.test(value)) return "air-glass";
  if (/air.?fry/.test(value) && /dual.?zone|dual basket|double basket|two basket|2-basket|2 independent/.test(value)) return "air-dual";
  if (/air.?fry/.test(value)) return "air-single";
  if (/immersion|hand blender|stick blender/.test(value)) return "immersion";
  if (/portable|cordless|rechargeable|wireless/.test(value)) return "portable";
  if (/food processor|kitchen system|processor system|triple prep/.test(value)) return "combo";
  if (/personal|single.?serve|mini|nutribullet|magic bullet|ninja fit|nutri-blender|nutri-plus/.test(value)) return "personal";
  return "countertop";
}

function extractFacts(product: SourceProduct) {
  const capacities = Array.from(
    product.title.matchAll(/\b\d+(?:\.\d+)?\s?(?:cu\.?\s?ft|oz|ounce|ounces|qt|quart|quarts|cup|cups|ml)\b/gi),
    (match) => match[0],
  ).slice(0, 2);
  const power = product.title.match(/\b\d{3,4}\s?(?:peak\s?)?(?:w|watt|watts|pw|wp)\b/i)?.[0];
  const temperature = product.title.match(/\b\d{3}°?\s?f\b/i)?.[0];
  return Array.from(new Set([...capacities, ...(power ? [power] : []), ...(temperature ? [temperature] : [])]));
}

function formatLabel(format: ProductFormat) {
  return {
    "air-single": "Single-basket air fryer",
    "air-dual": "Dual-zone air fryer",
    "air-oven": "Air fryer toaster oven",
    "air-microwave": "Microwave air-fryer combo",
    "air-glass": "Glass air fryer",
    portable: "Cordless portable",
    immersion: "Immersion / hand blender",
    combo: "Blender + prep system",
    personal: "Personal / compact",
    countertop: "Full-size countertop",
  }[format];
}

function fitGuidance(format: ProductFormat) {
  return {
    "air-single": {
      bestFor: "everyday crisping, roasting and reheating in one removable basket",
      skipIf: "you need two independent temperatures or a broad oven-style cavity",
    },
    "air-dual": {
      bestFor: "a main and side, two flavors or two foods that need independent timing",
      skipIf: "one uninterrupted wide cooking floor matters more than two separate zones",
    },
    "air-oven": {
      bestFor: "toast, sheet-pan foods, pizza and larger oven-style batches",
      skipIf: "small-batch speed and the easiest removable-basket cleanup are the priority",
    },
    "air-microwave": {
      bestFor: "kitchens combining microwave reheating with convection browning in one appliance",
      skipIf: "you frequently need microwave and air-fryer functions at the same time",
    },
    "air-glass": {
      bestFor: "visible cooking and buyers prioritizing a glass-vessel workflow",
      skipIf: "you want the lightest basket or the widest family-size cooking floor",
    },
    portable: {
      bestFor: "commutes, gym bags, travel and one fresh drink away from a wall outlet",
      skipIf: "you mainly crush dense frozen loads or need several servings in one cycle",
    },
    immersion: {
      bestFor: "puréeing soups and sauces directly in a pot with less vessel cleanup",
      skipIf: "your priority is dry grinding, large ice loads or a sealed travel cup",
    },
    combo: {
      bestFor: "buyers who will regularly use both blending and food-prep attachments",
      skipIf: "you have limited cabinet space or want the fewest parts to wash",
    },
    personal: {
      bestFor: "single smoothies, protein shakes and compact everyday storage",
      skipIf: "you routinely make family batches or need a wide pitcher for shared recipes",
    },
    countertop: {
      bestFor: "larger smoothie batches, shared drinks and general countertop blending",
      skipIf: "most recipes are one small serving and counter height or storage is tight",
    },
  }[format];
}

function productPros(product: SourceProduct, format: ProductFormat, facts: string[]) {
  const title = product.title.toLowerCase();
  const pros: string[] = [];
  if (facts[0]) pros.push(`${facts[0]} vessel or capacity detail is identified in the supplied listing`);
  if (facts.find((fact) => /w|watt|pw|wp/i.test(fact))) {
    pros.push("Motor rating is visible before opening the retailer page");
  }
  if (/auto.?iq|auto.?program|preset|programs/.test(title)) {
    pros.push("Automated program or preset is called out in the exact product title");
  }
  if (/pfas.?free|ptfe.?free|pfoa.?free/.test(title)) pros.push("A material claim is stated directly in the supplied title for exact-model verification");
  if (/glass/.test(title)) pros.push("Glass or viewing capability is identified in the exact listing");
  if (/stainless steel/.test(title)) pros.push("Stainless-steel construction or finish is identified in the supplied title");
  if (format === "air-single") pros.push("One removable basket keeps the cooking and cleanup workflow direct");
  if (format === "air-dual") pros.push("Separate zones can coordinate foods with different time or temperature needs");
  if (format === "air-oven") pros.push("Oven-style cavity supports broader foods, racks and toast-style tasks");
  if (format === "air-microwave") pros.push("One appliance combines rapid reheating with convection-style browning");
  if (format === "air-glass") pros.push("Glass-vessel format makes food contact and browning easier to inspect");
  if (format === "portable") pros.push("Cordless or rechargeable format supports use away from the counter");
  if (format === "immersion") pros.push("Blends in the cooking vessel, reducing transfer between containers");
  if (format === "combo") pros.push("One listing combines blending with food-prep capability");
  if (format === "personal") pros.push("Compact vessel format is aligned with individual drinks");
  if (format === "countertop") pros.push("Pitcher format is better aligned with shared or larger batches");
  pros.push("Exact ASIN is retained for model-level comparison");
  return Array.from(new Set(pros)).slice(0, 3);
}

function productCons(format: ProductFormat) {
  const formatWatchout = {
    "air-single": "One temperature zone cannot independently coordinate a main and side",
    "air-dual": "Two baskets increase counter width and create more removable parts to wash",
    "air-oven": "The larger cavity and door create more surfaces, clearance needs and cleanup",
    "air-microwave": "Mode-specific cookware rules and a deep body need careful manual checking",
    "air-glass": "Glass adds weight and breakage risk and may reduce practical batch size",
    portable: "Battery runtime and frozen-ingredient limits need checking before travel use",
    immersion: "Open-vessel blending needs careful depth, angle and splash control",
    combo: "More bowls, blades and lids create additional storage and cleanup",
    personal: "Small cups are less suitable for family batches and batch meal prep",
    countertop: "A full-size base and pitcher demand more counter and cabinet space",
  }[format];
  return [
    formatWatchout,
    "Included accessories, warranty and exact color can vary by ASIN or seller bundle",
  ];
}

export function getSourceProductPresentation(product: SourceProduct) {
  const format = listingFormat(product.title);
  const facts = extractFacts(product);
  const fit = fitGuidance(format);
  return {
    format,
    label: formatLabel(format),
    facts,
    fit,
    pros: productPros(product, format, facts),
    cons: productCons(format),
  };
}

export function SourceProductCard({ product }: { product: SourceProduct }) {
  const { label, facts, fit, pros, cons } = getSourceProductPresentation(product);

  return (
    <article className="source-product-card" id={`asin-${product.asin.toLowerCase()}`}>
      <div className="source-product-media">
        <img
          src={product.image}
          alt={`${product.title} product image`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <span className="source-rank">Listing {product.position}</span>
      </div>
      <div className="source-product-copy">
        <div className="source-product-kicker">
          <span>{label}</span>
          <code>ASIN {product.asin}</code>
        </div>
        <h3>{product.title}</h3>
        <p>
          This is product #{product.position} in the supplied article HTML. Its listing format is
          best aligned with {fit.bestFor}. Compare the exact ASIN—not only the family name—because
          attachments, vessel sizes and regional bundles can differ between near-identical models.
        </p>
        <div className="source-facts" aria-label={`${product.title} facts from supplied listing`}>
          <span>{label}</span>
          {facts.map((fact) => <span key={fact}>{fact}</span>)}
          <span>ASIN verified from source</span>
        </div>
        <div className="pros-cons-grid source-pros-cons">
          <div className="pros-list">
            <strong>Pros</strong>
            <ul>{pros.map((pro) => <li key={pro}>{pro}</li>)}</ul>
          </div>
          <div className="cons-list">
            <strong>Cons</strong>
            <ul>{cons.map((con) => <li key={con}>{con}</li>)}</ul>
          </div>
        </div>
        <div className="source-fit-check">
          <strong>Buyer check</strong>
          Skip or compare a different format if {fit.skipIf}. Confirm the live product page,
          manual, included parts, electrical specification and return terms before ordering.
        </div>
        <a
          className="button source-product-button"
          href={product.amazonUrl}
          target="_blank"
          rel="sponsored nofollow noopener"
        >
          View exact ASIN
        </a>
      </div>
    </article>
  );
}
