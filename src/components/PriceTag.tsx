import { formatCLP } from "@/lib/format";

// Etiqueta de precio de los banners: precio grande, % de descuento y precio anterior.
export function PriceTag({
  price,
  before,
  percent,
  beforeLabel,
}: {
  price: number;
  before?: number;
  percent?: number;
  beforeLabel?: string;
}) {
  return (
    <div className="inline-flex items-stretch overflow-hidden rounded-2xl bg-surface shadow-lg shadow-black/20">
      <div className="px-5 py-3">
        <p className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">{formatCLP(price)}</p>
        {before && (
          <p className="text-xs text-muted">
            {beforeLabel} <span className="line-through">{formatCLP(before)}</span>
          </p>
        )}
      </div>
      {percent && (
        <div className="flex items-center bg-sale px-4 text-2xl sm:text-3xl font-bold text-white">
          −{percent}%
        </div>
      )}
    </div>
  );
}
