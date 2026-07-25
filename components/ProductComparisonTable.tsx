import { AmazonLink } from "@/components/AmazonLink";
import type { ProductLink } from "@/types/content";

type ProductComparisonTableProps = {
  pageId: string;
  products: ProductLink[];
};

export function ProductComparisonTable({
  pageId,
  products,
}: ProductComparisonTableProps) {
  if (products.length < 2) return null;

  return (
    <section id="comparison-table" aria-labelledby="comparison-heading">
      <div className="section-kicker">At a glance</div>
      <h2 id="comparison-heading">Compare the recommended products</h2>
      <div className="table-wrapper comparison-table-wrapper">
        <table className="comparison-table">
          <caption>
            {products.length} products compared by fit, score and key details
          </caption>
          <thead>
            <tr>
              <th scope="col">Pick</th>
              <th scope="col">Product</th>
              <th scope="col">Best for</th>
              <th scope="col">Score</th>
              <th scope="col">Key details</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const isBestOverall =
                product.rank === 1 ||
                /best overall/i.test(product.slotLabel);
              return (
                <tr
                  key={product.trackingKey}
                  className={isBestOverall ? "table-highlight-row" : undefined}
                >
                  <td>
                    <span className="table-rank">
                      #{product.rank ?? index + 1}
                    </span>
                    <small>{product.slotLabel}</small>
                  </td>
                <th scope="row">{product.productName}</th>
                <td>{product.bestFor || "Add best-for use case"}</td>
                <td>
                  {product.editorialScore !== null &&
                  product.editorialScore !== undefined
                    ? `${product.editorialScore}/10`
                    : "Pending"}
                </td>
                <td>
                  {product.keySpecs?.length
                    ? product.keySpecs.slice(0, 3).join(" · ")
                    : "Add verified specifications"}
                </td>
                <td>
                  <AmazonLink
                    asin={product.asin}
                    pageId={pageId}
                    productName={product.productName}
                    placement={`table-${product.slotId}`}
                    className="text-cta"
                  >
                    Check price
                  </AmazonLink>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
