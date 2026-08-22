import type { NextConfig } from "next";

const guideSlugs = [
  "best-air-fryers-2026",
  "best-non-toxic-air-fryer",
  "best-toaster-oven-air-fryer",
  "best-small-air-fryer",
  "best-air-fryer-chicken-wings",
  "best-air-fryer-microwave-combo",
  "best-air-fryer-toaster-oven-combo",
  "best-stainless-steel-air-fryer",
  "best-air-fryers-for-french-fries",
  "best-air-fryer-chicken-thighs",
  "best-budget-air-fryer",
  "best-air-fryer-for-two-people",
  "best-air-fryer-toaster-ovens",
  "best-dual-basket-air-fryer",
  "best-glass-air-fryer-non-toxic",
  "best-air-fryer-for-one-person",
  "best-air-fryer-for-family",
  "best-large-air-fryer",
  "best-air-fryer-rotisserie",
  "best-air-fryer-for-baking",
  "best-air-fryer-crispy-tofu-recipe",
  "best-way-to-clean-air-fryer",
  "best-things-to-cook-in-air-fryer",
  "best-blender-for-smoothies",
  "best-inexpensive-blender",
  "best-small-blender-for-smoothies",
  "best-portable-blenders-for-smoothies",
  "best-immersion-blenders-for-soups-and-sauces",
  "best-affordable-blender",
  "blender-for-kitchen",
  "best-blender-for-smoothies-and-ice",
  "best-blender-for-fruit-smoothies",
  "best-blenders-for-protein-shakes",
  "best-blender-food-processor-combo",
];

const categorySlugs = [
  "air-fryers",
  "blenders",
  "food-processors",
  "toaster-ovens",
  "mini-choppers",
  "rice-cookers",
  "electric-kettles",
  "coffee-grinders",
  "waffle-makers",
];

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "foodgressing.com" },
      { protocol: "https", hostname: "slimages.macysassets.com" },
      { protocol: "https", hostname: "target.scene7.com" },
      { protocol: "https", hostname: "coohom-biz-sg-s3.coohom.com" },
      { protocol: "https", hostname: "images.ctfassets.net" },
    ],
  },
  async headers() {
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "X-Robots-Tag",
              value: "noindex, nofollow",
            },
          ],
        },
      ];
    }
    return [];
  },
  async redirects() {
    const redirectsList: { source: string; destination: string; permanent: boolean }[] = [];

    // Guide redirects: /{slug}.html -> /guides/{slug} & /guides/{slug}.html -> /guides/{slug}
    for (const slug of guideSlugs) {
      redirectsList.push({
        source: `/${slug}.html`,
        destination: `/guides/${slug}`,
        permanent: true,
      });
      redirectsList.push({
        source: `/guides/${slug}.html`,
        destination: `/guides/${slug}`,
        permanent: true,
      });
    }

    // Category redirects: /{cat}.html -> /categories/{cat} & /categories/{cat}.html -> /categories/{cat}
    for (const cat of categorySlugs) {
      redirectsList.push({
        source: `/${cat}.html`,
        destination: `/categories/${cat}`,
        permanent: true,
      });
      redirectsList.push({
        source: `/categories/${cat}.html`,
        destination: `/categories/${cat}`,
        permanent: true,
      });
    }

    // Specific legacy and alias redirects
    const legacyRedirects = [
      { source: "/about.html", destination: "/about" },
      { source: "/disclosure.html", destination: "/disclosure" },
      { source: "/how-we-review.html", destination: "/about" },
      { source: "/affiliate-disclosure.html", destination: "/disclosure" },
      { source: "/articles.html", destination: "/guides" },
      { source: "/legal/affiliate-disclosure.html", destination: "/disclosure" },
      { source: "/legal/privacy.html", destination: "/disclosure" },
      { source: "/legal/terms.html", destination: "/disclosure" },
      { source: "/tools/product-finder.html", destination: "/#finder" },
      { source: "/tools/compare.html", destination: "/#finder" },
      { source: "/best-air-fryer-for-2-people", destination: "/guides/best-air-fryer-for-two-people" },
      { source: "/best-air-fryer-for-2-people.html", destination: "/guides/best-air-fryer-for-two-people" },
      { source: "/guides/best-air-fryer-for-2-people", destination: "/guides/best-air-fryer-for-two-people" },
      { source: "/guides/best-air-fryer-for-2-people.html", destination: "/guides/best-air-fryer-for-two-people" },
    ];

    for (const item of legacyRedirects) {
      redirectsList.push({
        source: item.source,
        destination: item.destination,
        permanent: true,
      });
    }

    return redirectsList;
  },
};

export default nextConfig;
