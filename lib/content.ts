import fs from "node:fs";
import path from "node:path";
import type { ContentPage } from "@/types/content";

const CONTENT_DIRECTORIES = [
  path.join(process.cwd(), "content", "static"),
  path.join(process.cwd(), "content", "pages"),
];

function readDirectory(directory: string): ContentPage[] {
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const fullPath = path.join(directory, file);
      return JSON.parse(fs.readFileSync(fullPath, "utf8")) as ContentPage;
    });
}

export function canShowDrafts(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.SHOW_DRAFTS === "true"
  );
}

export function canShowContentPlan(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.SHOW_CONTENT_PLAN === "true"
  );
}

export function getAllPages(options?: {
  includeDrafts?: boolean;
}): ContentPage[] {
  const includeDrafts = options?.includeDrafts ?? false;
  const pages = CONTENT_DIRECTORIES.flatMap(readDirectory);

  return pages
    .filter((page) => includeDrafts || !page.draft)
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        P0: 0,
        P1: 1,
        P2: 2,
        P3: 3,
        P4: 4,
      };
      const priorityDifference =
        (priorityOrder[a.priority] ?? 99) -
        (priorityOrder[b.priority] ?? 99);

      return priorityDifference || a.title.localeCompare(b.title);
    });
}

export function getPageBySlug(
  slug: string,
  options?: { includeDrafts?: boolean },
): ContentPage | null {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  return (
    getAllPages(options).find(
      (page) => page.slug.replace(/^\/+|\/+$/g, "") === normalized,
    ) ?? null
  );
}

export function getPageById(
  pageId: string,
  options?: { includeDrafts?: boolean },
): ContentPage | null {
  return (
    getAllPages(options).find((page) => page.pageId === pageId) ?? null
  );
}

export function getRelatedPages(page: ContentPage): ContentPage[] {
  const ids = page.relatedPageIds ?? [];
  const pages = getAllPages({ includeDrafts: canShowDrafts() });
  const byId = new Map(pages.map((item) => [item.pageId, item]));

  return ids
    .map((id) => byId.get(id))
    .filter((item): item is ContentPage => Boolean(item))
    .filter((item) => canShowDrafts() || !item.draft);
}
