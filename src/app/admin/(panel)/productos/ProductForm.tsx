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
