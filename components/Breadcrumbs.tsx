import Link from "next/link";

type BreadcrumbsProps = {
  title: string;
};

export function Breadcrumbs({ title }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li aria-current="page">{title}</li>
      </ol>
    </nav>
  );
}
