export type Ingredient = {
  amount?: number;
  unit?: string;
  item: string;
  note?: string;
};

export type IngredientGroup = {
  name: string;
  ingredients: Ingredient[];
};

export type RecipeStep = {
  title: string;
  text: string;
  cue: string;
  time?: string;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type SourceLink = {
  label: string;
  url: string;
  note: string;
};

export type RecipeArticle = {
  slug: string;
  eyebrow: string;
  title: string;
  metaTitle: string;
  description: string;
  dek: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  updated: string;
  published: string;
  readMinutes: number;
  prepMinutes: number;
  cookMinutes: number;
  additionalMinutes?: number;
  recipeYield: string;
  servings: number;
  cuisine: string;
  category: string;
  hero: string;
  heroAlt: string;
  stepImage: string;
  stepImageAlt: string;
  quickAnswer: string;
  quickSummary: string;
  intro: string[];
  equipment: string[];
  ingredientGroups: IngredientGroup[];
  ingredientLogic: { title: string; text: string }[];
  steps: RecipeStep[];
  principles: { title: string; text: string }[];
  diagnostics: { problem: string; cause: string; fix: string }[];
  variations: { title: string; text: string }[];
  makeAhead: { title: string; text: string }[];
  safetyNote?: string;
  faqs: FAQ[];
  sources: SourceLink[];
  related: { label: string; href: string }[];
};
