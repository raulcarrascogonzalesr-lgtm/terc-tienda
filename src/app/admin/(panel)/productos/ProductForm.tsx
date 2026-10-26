"use client";

import Link from "next/link";
import { useActionState } from "react";
import { GRADE_LABELS } from "@/lib/format";
import type { AdminProduct } from "@/lib/types";
import { saveProduct } from "../actions";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[#6b716f]">{hint}</span>}
    </label>
  );
}

export function ProductForm({ product }: { product?: AdminProduct }) {
  const [state, action, pending] = useActionState(saveProduct, null);
  return (
    <form action={action} className="bg-white rounded-xl border border-[#e4e2dc] p-6 space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      {product && (
        <p className="text-sm text-[#6b716f]">
          SKU <span className="font-mono font-semibold text-[#1f2a27]">{product.sku}</span>
          <span className="block text-xs">Lo pone la tienda sola y no cambia.</span>
        </p>
      )}

      <Field label="Nombre" hint="Ej: iPhone 12 128 GB Azul">
        <input name="name" required defaultValue={product?.name} className="input" />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Marca">
          <input name="brand" required defaultValue={product?.brand} className="input" />
        </Field>
        <Field label="Categoría" hint="Celulares, Notebooks, Tablets…">
          <input name="category" required defaultValue={product?.category} className="input" />
        </Field>
        <Field label="Grado">
          <select name="grade" defaultValue={product?.grade ?? "A"} className="input">
            {Object.entries(GRADE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Precio de venta con IVA (CLP)" hint="Lo que paga el cliente.">
          <input
            name="price"
            required
            inputMode="numeric"
            defaultValue={product?.price}
            className="input"
          />
        </Field>
        <Field
          label="Costo neto (CLP)"
          hint="Lo que te costó un equipo, sin IVA, como sale en la factura. Privado."
        >
          <input
            name="cost"
            inputMode="numeric"
            defaultValue={product?.cost ?? ""}
            className="input"
          />
        </Field>
        <Field label="Stock">
          <input
            name="stock"
            required
            inputMode="numeric"
            defaultValue={product?.stock ?? 1}
            className="input"
          />
        </Field>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          name="on_demand"
          type="checkbox"
          defaultChecked={product?.on_demand ?? false}
          className="mt-0.5"
        />
        <span>
          Del proveedor: no lo tengo yo, se lo pido al proveedor cuando alguien lo compra.
          <span className="block text-xs text-[#6b716f]">
            El stock es la cantidad que informa el proveedor. El cliente lo ve como stock normal,
            pero no cuenta como plata invertida.
          </span>
        </span>
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Proveedor" hint="Opcional. Privado.">
          <input name="supplier" defaultValue={product?.supplier ?? ""} className="input" />
        </Field>
        <Field label="Código en la lista del proveedor" hint="Opcional. Privado.">
          <input
            name="supplier_sku"
            defaultValue={product?.supplier_sku ?? ""}
            className="input"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Precio antes, para ofertas (CLP)"
          hint="Opcional. Pon el precio al que lo vendías antes de rebajarlo; la tienda lo muestra tachado con el % de descuento. Debe ser un precio real: inventarlo es publicidad engañosa."
        >
          <input
            name="compare_price"
            inputMode="numeric"
            defaultValue={product?.compare_price ?? ""}
            className="input"
          />
        </Field>
        <Field
          label="Último día de la oferta"
          hint="Opcional. Se muestra “Solo por tiempo limitado” con cuenta regresiva. Al pasar ese día, la tienda vuelve sola al precio de antes."
        >
          <input
            type="date"
            name="offer_ends_at"
            defaultValue={product?.offer_ends_at ?? ""}
            className="input"
          />
        </Field>
        <Field
          label="Nombre de la oferta"
          hint="Opcional. Por ejemplo “Remate de Terqui”. Se muestra en el aviso de arriba de la tienda y en la ficha mientras dure la oferta."
        >
          <input
            name="offer_name"
            maxLength={40}
            defaultValue={product?.offer_name ?? ""}
            className="input"
          />
        </Field>
        <Field
          label="Precio de un equipo nuevo (CLP)"
          hint="Opcional. La tienda muestra cuánto ahorra el cliente."
        >
          <input
            name="list_price"
            inputMode="numeric"
            defaultValue={product?.list_price ?? ""}
            className="input"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Salud de batería (%)" hint="Dejar vacío si no aplica">
          <input
            name="battery_health"
            inputMode="numeric"
            defaultValue={product?.battery_health ?? ""}
            className="input"
          />
        </Field>
        <Field label="Garantía (meses)">
          <input
            name="warranty_months"
            inputMode="numeric"
            defaultValue={product?.warranty_months ?? 6}
            className="input"
          />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Paquete para el envío</legend>
        <p className="text-xs text-[#6b716f]">
          Peso y medidas de la caja ya armada, con plumavit, cargador y cables. Shipit cotiza el envío con estos
          datos. Si los dejas vacíos, se usa una estimación según la categoría.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Peso (kg)" hint="Ej: 2,5">
            <input
              name="ship_weight_kg"
              inputMode="decimal"
              defaultValue={product?.ship_weight_kg?.toString().replace(".", ",") ?? ""}
              className="input"
            />
          </Field>
          <Field label="Largo (cm)">
            <input name="ship_length_cm" inputMode="numeric" defaultValue={product?.ship_length_cm ?? ""} className="input" />
          </Field>
          <Field label="Ancho (cm)">
            <input name="ship_width_cm" inputMode="numeric" defaultValue={product?.ship_width_cm ?? ""} className="input" />
          </Field>
          <Field label="Alto (cm)">
            <input name="ship_height_cm" inputMode="numeric" defaultValue={product?.ship_height_cm ?? ""} className="input" />
          </Field>
        </div>
      </fieldset>

      <Field label="Descripción">
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description}
          className="input"
        />
      </Field>

      <Field
        label="Foto"
        hint={
          product?.image_url ? "Sube una nueva solo si quieres cambiarla" : "JPG o PNG, hasta 5 MB"
        }
      >
        {product?.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt=""
            className="w-32 h-32 object-cover rounded-lg border border-[#e4e2dc]"
          />
        )}
        <input name="photo" type="file" accept="image/*" className="block text-sm" />
      </Field>

      <Field
        label="Más fotos"
        hint="Enlaces a fotos (uno por línea), en el orden en que se muestran. Hasta 8. La tienda agrega al final una tarjeta con la garantía TERC."
      >
        {product && product.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.images.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt=""
                className="w-20 h-20 object-cover rounded-lg border border-[#e4e2dc]"
              />
            ))}
          </div>
        )}
        <textarea
          name="images"
          rows={3}
          defaultValue={product?.images.join("\n")}
          placeholder="https://…"
          className="input font-mono text-xs"
        />
        <input name="extra_photos" type="file" accept="image/*" multiple className="block text-sm" />
      </Field>

      <Field label="Dirección web (slug)" hint="Se crea sola a partir del nombre si la dejas vacía">
        <input name="slug" defaultValue={product?.slug} className="input" />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />
        Visible en la tienda
      </label>

      {state?.error && <p className="text-sm text-[#b3362a]">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/admin/productos" className="btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
