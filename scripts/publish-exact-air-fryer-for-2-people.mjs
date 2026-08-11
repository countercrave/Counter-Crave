import fs from "node:fs";
import path from "node:path";

const pagePath = path.join(process.cwd(), "content", "pages", "af-r04-best-air-fryer-for-2-people.json");

const pageData = {
  pageId: "AF-R04",
  title: "Best Air Fryer for 2 People (2026): 22 Models Compared",
  slug: "best-air-fryer-for-2-people",
  canonicalPath: "/best-air-fryer-for-2-people/",
  description: "Compare 22 air fryers for two people, from compact 2.6–5 qt models to dual-basket picks. See the best sizes, features, pros, cons and buying tips for 2026.",
  pageType: "Roundup",
  priority: "P1",
  cluster: "Air Fryers",
  parentPillar: "AF-PIL",
  primaryKeyword: "best air fryer for 2 people",
  secondaryKeywords: [
    "best air fryer for 2 people reviews",
    "best air fryer for 2 people comparison",
    "best air fryer for 2 people buying guide",
    "best air fryer for 2 people for the money",
    "top rated air fryer for 2 people"
  ],
  searchIntent: "Commercial Investigation",
  funnel: "BOFU",
  targetLength: "2,500–4,000",
  monetization: "High — product table + contextual CTAs",
  schemaRecommendation: "Article + ItemList + BreadcrumbList",
  evidenceRequirement: "Original selection methodology; spec verification; decision criteria; custom comparison table; explain exclusions; ideally hands-on notes or documented research.",
  answerBlockBrief: "50-word direct answer; ranked list; decision matrix; explicit selection logic; pros/cons; audience fit; concise FAQ answers.",
  requiredTables: "Top picks table; full comparison table; selection criteria table; optional size/value decision table",
  ctaGuidance: "Disclosure → Check price on Amazon; contextual CTA after verdict; alternatives link",
  faqGuidance: "Use 4–8 visible, non-repetitive questions. Answer each in 40–80 words. Add schema only when valid and useful.",
  summary: "Quick answer: A 3–5 quart single-basket air fryer is the most practical starting range for most two-person households. Choose 2.6–4 qt if counter space and small portions matter most; move to 5–6 qt if you cook larger proteins, meal prep or want more breathing room. Dual-basket 8–10 qt models make sense when you regularly cook a main and side at different settings.",
  sections: [
    {
      heading: "Our quick picks for two people",
      level: 2,
      paragraphs: [
        "These six models are the most directly aligned with the query because their capacities and layouts suit everyday meals for two without excessive bulk."
      ],
      bullets: [
        "Best overall for two: Instant Pot 4QT Vortex Plus 6-in-1 Mini Air Fryer",
        "Best budget-size pick: Chefman Air Fryer – 4 QT Compact Airfryer",
        "Best compact air fryer: Cuisinart Air Fryer, 2.6-Quart Compact (AIR-80)",
        "Best 5-quart simple pick: Ninja Air Fryer Pro 5 Qt (AF141)",
        "Best 5-quart control set: Cosori Air Fryer Pro LE 5 Qt",
        "Best glass-basket option: Cuisinart Air Fryer Glass Basket 4 Qt (AFC-4)"
      ]
    },
    {
      heading: "How we chose and ranked these air fryers",
      level: 2,
      paragraphs: [
        "This update is a specification-led comparison, not a claim of hands-on testing. We retained all 22 unique products from the uploaded Amazon search results and assessed them for two-person relevance using capacity, basket configuration, maximum temperature when stated, cooking functions, cleaning features, viewing windows and likely counter-space trade-offs.",
        "Compact 3–5 qt single-basket models receive priority because they are generally easier to size for two portions. Larger 6 qt machines are included when the extra room adds useful flexibility. Dual-basket and oven-style models remain in the guide for couples who cook multi-component meals, batch-cook or want one appliance to replace several countertop tools."
      ],
      bullets: []
    },
    {
      heading: "All 22 source products at a glance",
      level: 2,
      paragraphs: [
        "The table keeps every unique product from the upload. Marketplace price and rating values are snapshots from the supplied source and should be rechecked at the retailer.",
        "Compare capacity, basket layout, and best use-case fit across all 22 models below before checking current Amazon availability."
      ],
      bullets: []
    },
    {
      heading: "The 10 best air fryers for 2 people from the source list",
      level: 2,
      paragraphs: [
        "The first six prioritize classic couple-friendly basket sizes. The final four add extra capacity or dual-zone flexibility for people who cook larger meals or want two foods to finish together."
      ],
      bullets: []
    },
    {
      heading: "Also consider: every other product from the uploaded list",
      level: 2,
      paragraphs: [
        "These models are preserved so the update does not drop any unique product supplied in the source. Several are excellent appliances in their own right, but their larger capacities make them less targeted to a typical two-person household."
      ],
      bullets: []
    },
    {
      heading: "What size air fryer is best for 2 people?",
      level: 2,
      paragraphs: [
        "Capacity is the fastest way to narrow the field, but it is not the only thing that matters. The basket’s usable floor area, shape and how much you like to spread food out can be more important than the headline quart number.",
        "Basket shape matters. A square 4-quart basket can sometimes be more useful than a taller, narrower basket with a bigger advertised volume because food browns best when it is not heavily stacked."
      ],
      bullets: [
        "2–3 qt (Minimalist): Best for light eaters, snacks, reheating and very small kitchens. Full dinners may need batches.",
        "3–5 qt (Sweet spot): The easiest range to recommend for two people. Enough room for everyday mains without much wasted space.",
        "5–6.5 qt (Roomy): Useful for larger proteins, leftovers and meal prep. Still practical if you have counter room.",
        "8–10+ qt (Special case): Best when the capacity is split into independent baskets or when you regularly batch-cook or entertain."
      ]
    },
    {
      heading: "Single basket vs. dual basket for couples",
      level: 2,
      paragraphs: [
        "A single basket is the default choice for two people because it is smaller, simpler and usually cheaper. It works especially well for meals where both servings use the same time and temperature.",
        "A dual-basket air fryer earns its extra footprint when dinner often has two components. One basket can handle a protein while the other cooks vegetables or fries, and sync features on models such as the Ninja DZ201 and Cosori Dual can coordinate finish times."
      ],
      bullets: []
    },
    {
      heading: "Features that matter most in an air fryer for two",
      level: 2,
      paragraphs: [
        "Focus on features that improve daily usability rather than counting presets."
      ],
      bullets: [
        "Usable basket area: Prioritize space to spread two portions over sheer volume.",
        "400–450°F capability: Higher maximum heat can help with browning and frozen foods.",
        "Dishwasher-safe parts: Particularly valuable for an appliance used several times a week.",
        "Viewing window: Helpful if you like checking color without opening the basket.",
        "Shake reminder: Useful for fries, vegetables and small pieces that benefit from turning.",
        "Reheat mode: Often more useful day to day than a long list of specialty presets.",
        "Counter footprint: Measure width, depth and overhead clearance before choosing an XL model.",
        "Dual-zone sync: Worth paying for only if you regularly cook foods at different settings."
      ]
    },
    {
      heading: "What can you cook for two in an air fryer?",
      level: 2,
      paragraphs: [
        "A couple-sized air fryer is particularly useful for foods that benefit from fast circulating heat and a relatively dry cooking environment. Think two chicken breasts or thighs, salmon fillets, pork chops, tofu, roasted vegetables, frozen fries, wings, reheated pizza, small batches of baked goods and crisped leftovers.",
        "For best texture, avoid packing the basket too tightly. If the food forms a thick pile, the outer pieces will receive more moving hot air than the center. Shaking or turning halfway through cooking is useful for small loose foods, while larger proteins may only need a single flip depending on the recipe and appliance."
      ],
      bullets: []
    },
    {
      heading: "Common mistakes couples should avoid",
      level: 2,
      paragraphs: [
        "Buying only by quart number. Capacity does not tell you the basket shape. Check the usable cooking surface and dimensions.",
        "Going too small to save a few inches. A tiny model can turn a two-person dinner into two or three rounds, which removes much of the convenience.",
        "Buying an XL dual fryer without a clear reason. Dual baskets are excellent for different foods, but if most dinners are one protein or one frozen food, a 4–5 qt single basket may be the better everyday tool.",
        "Ignoring cleaning. The best air fryer is the one you actually keep using. Removable, dishwasher-safe baskets and crisper plates make frequent use easier.",
        "Blocking airflow. Liners, foil and overcrowded food can interfere with circulation if they cover vents or basket perforations. Follow the specific manufacturer instructions for your model."
      ],
      bullets: []
    },
    {
      heading: "Which type should you buy?",
      level: 2,
      paragraphs: [
        "Small apartment or limited counter: Start with the Cuisinart 2.6-Quart, Chefman 4-Quart or one of the Instant Vortex 4-Quart models.",
        "Most couples: A 4–5 qt single basket gives the best balance. The Instant Vortex Plus 4QT, Ninja Pro 5QT and Cosori Pro LE 5QT are the clearest fits in the uploaded lineup.",
        "Couples who meal prep: Move up to 5.8–6.5 qt. The Cosori TurboBlaze 6QT, Instant Vortex Plus ClearCook 6QT and Ninja AF181 6.5QT provide more room without requiring dual baskets.",
        "Main-and-side cooks: The Ninja DZ201 is the most naturally sized dual-basket option here because its total 8 qt capacity is split into two 4 qt zones. The Ninja DoubleStack offers similar flexibility in a stacked layout.",
        "Appliance replacement: The Gourmia 14QT and Typhur 27QT are better thought of as countertop ovens with air-frying capability, not compact basket fryers for two."
      ],
      bullets: []
    },
    {
      heading: "Final verdict",
      level: 2,
      paragraphs: [
        "For a two-person household, start with basket size before presets. The Instant Pot Vortex Plus 4QT is the strongest all-around fit in this source list because its capacity is closely matched to two servings while still providing multiple cooking functions. The Chefman 4QT is the value-oriented alternative, and the Cuisinart 2.6QT is the most compact choice when counter space matters more than batch size.",
        "If you want more room, a 5-quart Ninja or Cosori is a sensible step up. If you routinely cook two foods at once, the Ninja DZ201’s two 4-quart baskets make the larger total capacity genuinely useful rather than simply oversized."
      ],
      bullets: []
    }
  ],
  faqs: [
    {
      question: "What size air fryer is best for 2 people?",
      answer: "For most couples, a 3–5 quart single-basket air fryer is the most practical starting point. A 2.6-quart model can work for small portions, while 5–6 quarts gives more room for larger proteins, leftovers or meal prep."
    },
    {
      question: "Is a 4-quart air fryer big enough for two people?",
      answer: "Usually, yes. A 4-quart basket is a strong everyday size for two servings, especially when food can be arranged in a mostly single layer. Very large meals may still require a second batch."
    },
    {
      question: "Is a 6-quart air fryer too big for two people?",
      answer: "Not necessarily. Six quarts is larger than many couples need for daily cooking, but it can be useful for meal prep, leftovers, larger cuts of meat or fewer crowded batches."
    },
    {
      question: "Should two people buy a dual-basket air fryer?",
      answer: "A dual-basket model is worthwhile when you regularly cook a main and side at different temperatures or times. If most meals use one cooking setting, a 4–5 quart single basket is simpler, smaller and easier to clean."
    },
    {
      question: "Can two chicken breasts fit in a 4-quart air fryer?",
      answer: "In many 4-quart models, two average chicken breasts can fit, but basket shape and the size of the chicken matter. Leave space around the food when possible so hot air can circulate."
    },
    {
      question: "What is the easiest air fryer size to clean for a couple?",
      answer: "A 3–5 quart single-basket model is usually the simplest because there is only one basket and crisper plate to wash. Dishwasher-safe parts can further reduce cleanup."
    },
    {
      question: "Do air fryer prices and ratings in this guide change?",
      answer: "Yes. Prices, availability and marketplace ratings change frequently. The values shown here reflect the uploaded Amazon search snapshot used for this update; use the retailer link to confirm current details before buying."
    }
  ],
  productPageIds: [
    "AF-R04"
  ],
  relatedPageIds: [
    "AF-PIL",
    "AF-HUB",
    "AF-R01",
    "AF-R02",
    "AF-R03",
    "AF-R05"
  ],
  author: "Navjeet Kamboj",
  reviewer: null,
  publishedAt: "2026-07-24",
  updatedAt: "2026-08-11",
  heroImage: null,
  heroImageAlt: null,
  draft: false,
  noindex: true
};

fs.writeFileSync(pagePath, JSON.stringify(pageData, null, 2), "utf8");
console.log("Successfully updated af-r04-best-air-fryer-for-2-people.json!");
