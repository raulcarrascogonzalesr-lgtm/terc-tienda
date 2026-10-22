// Sello redondo con el % de descuento, grande y a la vista. Solo se usa con descuentos reales.
export function DiscountSticker({
  percent,
  label,
  tone = "sale",
  size = "md",
  className = "",
}: {
  percent: number;
  label: string;
  tone?: "sale" | "gold";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-14 w-14 text-lg [&>small]:text-[8px]",
    md: "h-20 w-20 text-2xl [&>small]:text-[10px]",
    lg: "h-24 w-24 sm:h-28 sm:w-28 text-3xl sm:text-4xl [&>small]:text-[10px] sm:[&>small]:text-xs",
  };
  const tones = { sale: "bg-sale text-white", gold: "bg-gold text-pine" };
  return (
    <span
      className={`flex -rotate-[8deg] flex-col items-center justify-center rounded-full font-extrabold leading-none tracking-tight shadow-lg shadow-black/15 ring-4 ring-white/90 ${sizes[size]} ${tones[tone]} ${className}`}
    >
      −{percent}%
      <small className="mt-0.5 font-bold uppercase tracking-wider">{label}</small>
    </span>
  );
}
