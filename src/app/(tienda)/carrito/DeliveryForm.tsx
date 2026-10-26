"use client";

import { useState } from "react";
import { addressLine, DWELLINGS, isDwelling, normalizePhone, normalizeRut, type Dwelling } from "@/lib/address";
import type { ShippingChoice } from "./ShippingPicker";

// Paso 2 del pago: quién recibe y la dirección completa, separada en partes para que el
// courier no tenga dudas al entregar. El servidor vuelve a revisar todo antes de cobrar.

const field = "mt-1 w-full border border-line/20 rounded px-3 py-2 bg-surface";

type Errors = Partial<Record<"phone" | "rut" | "unit", string>>;

export function DeliveryForm({
  choice,
  onBack,
  onSubmit,
  sending,
  aside,
}: {
  choice: ShippingChoice;
  onBack: () => void;
  onSubmit: (customer: Record<string, string>) => void;
  sending: boolean;
  aside: React.ReactNode;
}) {
  const [dwelling, setDwelling] = useState<Dwelling>("casa");
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function readForm(form: HTMLFormElement) {
    const data = Object.fromEntries(
      [...new FormData(form).entries()].map(([k, v]) => [k, String(v).trim()]),
    ) as Record<string, string>;
    return data;
  }

  function updatePreview(form: HTMLFormElement) {
    const d = readForm(form);
    if (!d.street || !d.number) return setPreview("");
    const line = addressLine({
      street: d.street,
      number: d.number,
      dwelling: isDwelling(d.dwelling) ? d.dwelling : "casa",
      unit: d.unit,
      villa: d.villa,
    });
    setPreview(`${line}, ${choice.comuna}, ${choice.region}`);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = readForm(e.currentTarget);
    const found: Errors = {};
    const phone = normalizePhone(d.phone ?? "");
    if (!phone) found.phone = "Escribe un celular o teléfono de 9 dígitos, por ejemplo 9 1234 5678.";
    const rut = d.rut ? normalizeRut(d.rut) : "";
    if (rut === null) found.rut = "Ese RUT no es válido. Revisa el número y el dígito verificador.";
    if (dwelling !== "casa" && !d.unit) found.unit = "Escribe el número del depto u oficina.";
    setErrors(found);
    if (Object.keys(found).length > 0) {
      e.currentTarget.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    onSubmit({ ...d, phone: phone!, rut: rut ?? "" });
  }

  return (
    <form
      onSubmit={handleSubmit}
      onInput={(e) => updatePreview(e.currentTarget)}
      className="grid lg:grid-cols-[1fr_380px] gap-8"
    >
      <section className="space-y-6">
        <div>
          <button type="button" onClick={onBack} className="text-sm text-muted underline">
            ← Volver al carrito
          </button>
          <h1 className="mt-2 text-2xl font-bold">¿Dónde entregamos tu pedido?</h1>
          <p className="mt-1 text-sm text-muted">
            Llénalo con calma: el courier usa estos datos tal cual para llegar a tu puerta.
          </p>
        </div>

        <div className="rounded-xl bg-mint-50 px-4 py-3 text-sm">
          <p>
            Envío con <strong>{choice.courier}</strong> a <strong>{choice.comuna}</strong>, {choice.region}.
          </p>
          <button type="button" onClick={onBack} className="mt-1 text-pine-700 underline">
            Cambiar comuna o courier
          </button>
        </div>

        <fieldset className="bg-surface rounded-xl border border-line/10 p-6 space-y-4" disabled={sending}>
          <legend className="px-1 text-lg font-semibold">Quién recibe</legend>
          <Input name="name" label="Nombre y apellido" autoComplete="name" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="email" label="Correo" type="email" autoComplete="email" required />
            <Input
              name="phone"
              label="Celular"
              type="tel"
              autoComplete="tel"
              placeholder="9 1234 5678"
              required
              error={errors.phone}
              help="El courier te llama o escribe si no encuentra la dirección."
            />
          </div>
          <Input
            name="rut"
            label="RUT (opcional)"
            placeholder="12.345.678-9"
            error={errors.rut}
            help="Algunos couriers lo piden para entregar equipos de mayor valor."
          />
        </fieldset>

        <fieldset className="bg-surface rounded-xl border border-line/10 p-6 space-y-4" disabled={sending}>
          <legend className="px-1 text-lg font-semibold">Dirección</legend>
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <Input
              name="street"
              label="Calle o avenida"
              autoComplete="address-line1"
              placeholder="Av. Pajaritos"
              required
            />
            <Input name="number" label="Número" placeholder="1234 o S/N" required />
          </div>

          <div>
            <p className="text-sm">Tipo de lugar</p>
            <div className="mt-1 grid gap-2 sm:grid-cols-3">
              {Object.entries(DWELLINGS).map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-line/10 px-3 py-2.5 text-sm has-[:checked]:border-pine-700 has-[:checked]:bg-mint-50"
                >
                  <input
                    type="radio"
                    name="dwelling"
                    value={value}
                    checked={dwelling === value}
                    onChange={() => setDwelling(value as Dwelling)}
                    className="accent-pine-700"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="unit"
              label={dwelling === "casa" ? "Block o casa (opcional)" : dwelling === "depto" ? "Número de depto y torre" : "Número de oficina o local"}
              autoComplete="address-line2"
              placeholder={dwelling === "casa" ? "Casa 12" : dwelling === "depto" ? "52, Torre B" : "301"}
              required={dwelling !== "casa"}
              error={errors.unit}
            />
            <Input name="villa" label="Villa, población o condominio (opcional)" placeholder="Villa Los Aromos" />
          </div>

          <label className="block text-sm">
            Indicaciones para el repartidor (opcional)
            <textarea
              name="references"
              rows={2}
              maxLength={200}
              placeholder="Ej: portón negro, al lado del almacén. Si no estoy, dejar con conserjería."
              className={field}
            />
          </label>

          {preview && (
            <p className="rounded-lg bg-line/5 px-3 py-2 text-sm">
              <span className="text-muted">Así le llega al courier:</span>
              <br />
              <strong>{preview}</strong>
            </p>
          )}
        </fieldset>
      </section>

      <aside className="bg-surface rounded-xl border border-line/10 p-6 space-y-4 h-fit">
        <h2 className="text-lg font-semibold">Tu pedido</h2>
        {aside}
      </aside>
    </form>
  );
}

function Input(props: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  help?: string;
}) {
  return (
    <label className="block text-sm">
      {props.label}
      <input
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        required={props.required}
        maxLength={120}
        aria-invalid={props.error ? true : undefined}
        className={`${field} ${props.error ? "border-red-700" : ""}`}
      />
      {props.error ? (
        <span className="mt-1 block text-xs text-red-700">{props.error}</span>
      ) : (
        props.help && <span className="mt-1 block text-xs text-muted">{props.help}</span>
      )}
    </label>
  );
}
