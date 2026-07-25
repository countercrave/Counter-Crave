export type CategoryHub = {
  name: string;
  slug: string;
  short: string;
  description: string;
};

/** All live CounterCrave category hubs for header + footer discovery. */
export const categoryHubs: CategoryHub[] = [
  {
    name: "Air Fryers",
    slug: "air-fryers",
    short: "Air Fryers",
    description: "Capacity, dual-basket, cleanup and family vs compact picks.",
  },
  {
    name: "Blenders",
    slug: "blenders",
    short: "Blenders",
    description: "Smoothies, ice crushing, personal cups and pitcher power.",
  },
  {
    name: "Toaster Ovens",
    slug: "toaster-ovens",
    short: "Toaster Ovens",
    description: "Bake, toast, air-fry combos and countertop footprint.",
  },
  {
    name: "Food Processors",
    slug: "food-processors",
    short: "Food Processors",
    description: "Bowl size, slicing, shredding and cleanup effort.",
  },
  {
    name: "Mini Choppers",
    slug: "mini-choppers",
    short: "Mini Choppers",
    description: "Garlic, onions and small prep without a full processor.",
  },
  {
    name: "Rice Cookers",
    slug: "rice-cookers",
    short: "Rice Cookers",
    description: "Cup size, sticky rice, brown rice and family models.",
  },
  {
    name: "Electric Kettles",
    slug: "electric-kettles",
    short: "Kettles",
    description: "Boil speed, temperature control and pour control.",
  },
  {
    name: "Coffee Grinders",
    slug: "coffee-grinders",
    short: "Grinders",
    description: "Burr consistency, noise and brew-method fit.",
  },
  {
    name: "Waffle Makers",
    slug: "waffle-makers",
    short: "Waffle Makers",
    description: "Belgian, classic, mini and flip designs.",
  },
];
