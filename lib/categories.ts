export type CategoryHub = {
  name: string;
  slug: string;
  short: string;
  description: string;
  heroImage: string;
};

/** All live CounterCrave category hubs for header + footer discovery. */
export const categoryHubs: CategoryHub[] = [
  {
    name: "Air Fryers",
    slug: "air-fryers",
    short: "Air Fryers",
    description: "Capacity, dual-basket, cleanup and family vs compact picks.",
    heroImage: "/images/heroes/air-fryers.jpg",
  },
  {
    name: "Blenders",
    slug: "blenders",
    short: "Blenders",
    description: "Smoothies, ice crushing, personal cups and pitcher power.",
    heroImage: "/images/heroes/blenders.jpg",
  },
  {
    name: "Toaster Ovens",
    slug: "toaster-ovens",
    short: "Toaster Ovens",
    description: "Bake, toast, air-fry combos and countertop footprint.",
    heroImage: "/images/heroes/toaster-ovens.jpg",
  },
  {
    name: "Food Processors",
    slug: "food-processors",
    short: "Food Processors",
    description: "Bowl size, slicing, shredding and cleanup effort.",
    heroImage: "/images/heroes/food-processors.jpg",
  },
  {
    name: "Mini Choppers",
    slug: "mini-choppers",
    short: "Mini Choppers",
    description: "Garlic, onions and small prep without a full processor.",
    heroImage: "/images/heroes/mini-choppers.jpg",
  },
  {
    name: "Rice Cookers",
    slug: "rice-cookers",
    short: "Rice Cookers",
    description: "Cup size, sticky rice, brown rice and family models.",
    heroImage: "/images/heroes/rice-cookers.jpg",
  },
  {
    name: "Electric Kettles",
    slug: "electric-kettles",
    short: "Kettles",
    description: "Boil speed, temperature control and pour control.",
    heroImage: "/images/heroes/electric-kettles.jpg",
  },
  {
    name: "Coffee Grinders",
    slug: "coffee-grinders",
    short: "Grinders",
    description: "Burr consistency, noise and brew-method fit.",
    heroImage: "/images/heroes/coffee-grinders.jpg",
  },
  {
    name: "Waffle Makers",
    slug: "waffle-makers",
    short: "Waffle Makers",
    description: "Belgian, classic, mini and flip designs.",
    heroImage: "/images/heroes/waffle-makers.jpg",
  },
  {
    name: "Air Purifiers",
    slug: "air-purifiers",
    short: "Air Purifiers",
    description: "HEPA filtration, CADR ratings, smoke, dust and allergy control.",
    heroImage: "/images/heroes/air-purifiers.jpg",
  },
  {
    name: "Robot Vacuums",
    slug: "robot-vacuums",
    short: "Robot Vacuums",
    description: "LiDAR mapping, anti-tangle brushes, pet hair and self-empty docks.",
    heroImage: "/images/heroes/robot-vacuums.jpg",
  },
];
