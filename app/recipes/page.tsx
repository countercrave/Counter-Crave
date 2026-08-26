import type { Metadata } from "next";
import { RecipeHub } from "@/components/RecipeHub";

export const metadata: Metadata = {
  title: "Recipes: Exact Methods & Visual Cues",
  description: "Explore 22 original recipes across five technique-first guides with exact quantities, visual cues and troubleshooting.",
  alternates: { canonical: "/recipes" },
  openGraph: {
    title: "CounterCrave Recipes: Cook by the Cue",
    description: "Exact quantities, original step visuals and useful fixes for the food you actually make.",
    url: "/recipes",
  },
};

export default function RecipesPage() {
  return <RecipeHub />;
}
