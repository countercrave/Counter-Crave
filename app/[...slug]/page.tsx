import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageRenderer } from "@/components/PageRenderer";
import {
  canShowDrafts,
  getAllPages,
  getPageBySlug,
  getRelatedPages,
} from "@/lib/content";
import {
  articleSchema,
  breadcrumbSchema,
} from "@/lib/schema";
import { siteConfig } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

const standaloneRoutes = [
  "best-blender-food-processor-combo",
  "best-toaster-oven-air-fryer",
];

export function generateStaticParams() {
  return getAllPages()
    .filter((page) => !page.draft && !standaloneRoutes.includes(page.slug))
    .map((page) => ({
      slug: page.slug.split("/").filter(Boolean),
    }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug.join("/");
  if (standaloneRoutes.includes(slugStr)) return {};
  const page = getPageBySlug(slugStr, {
    includeDrafts: canShowDrafts(),
  });

  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.canonicalPath,
    },
    openGraph: {
      type: "article",
      title: page.title,
      description: page.description,
      url: `${siteConfig.siteUrl}${page.canonicalPath}`,
      publishedTime: page.publishedAt || undefined,
      modifiedTime: page.updatedAt || undefined,
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

export default async function ContentRoute({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = slug.join("/");
  if (standaloneRoutes.includes(slugStr)) notFound();
  const page = getPageBySlug(slugStr, {
    includeDrafts: canShowDrafts(),
  });

  if (!page) notFound();

  const relatedPages = getRelatedPages(page);

  return (
    <>
      <JsonLd data={[breadcrumbSchema(page), articleSchema(page)]} />
      <PageRenderer page={page} relatedPages={relatedPages} />
    </>
  );
}
