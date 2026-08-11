import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CounterCrave",
    short_name: "CounterCrave",
    description:
      "Independent kitchen appliance reviews, comparisons and buying guides.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#0f4c46",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
