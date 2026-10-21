"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { formatCLP } from "@/lib/format";
import type { Campaign, DocType } from "@/lib/types";
import { addMovement } from "../actions";
import { ICONS } from "../icons";
import { Icon, Tip } from "../ui";
import { INTENTS, type DocMode, type IntentKey } from "./intents";

const DOC_NAMES: Record<DocType, string> = {
  factura: "Factura",
  boleta: "Boleta",
  otro: "Otro comprobante",
  nota_credito: "Nota de crédito",
};

const DOC_OPTIONS: Record<NonNullable<DocMode>, (DocType | "")[]> = {
  compra: ["factura", "boleta", "otro", ""],
  venta: ["boleta", "factura"],
  nota: ["nota_credito"],
};

const DEFAULT_DOC: Record<NonNullable<DocMode>, DocType> = {
  compra: "factura",
  venta: "boleta",
  nota: "nota_credito",
};

export type SellableProduct = { id: string; name: string; stock: number; onDemand: boolean };

const MAX_FILE = 5 * 1024 * 1024;

function digits(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10);
}

function longDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Steps({ step }: { step: number }) {
  const names = ["¿Qué pasó?", "Detalles", "Confirmar"];
  return (
    <ol className="flex items-center gap-2 sm:gap-3 text-sm">
      {names.map((name, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "now" : "next";
        return (
          <li key={name} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                state === "next"
                  ? "border border-[#d8d6cf] text-[#6b716f]"
                  : "bg-[#0f5f59] text-white"
              }`}
            >
              {state === "done" ? <Icon path={ICONS.check} className="w-3.5 h-3.5" /> : n}
            </span>
            <span
              className={`hidden sm:inline ${state === "now" ? "font-semibold text-[#14201f]" : "text-[#6b716f]"}`}
            >
              {name}
            </span>
            {n < names.length && <span className="w-6 sm:w-10 h-px bg-[#d8d6cf]" />}
          </li>
        );
      })}
    </ol>
  );
}

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
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[#14201f]">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[#6b716f]">{hint}</span>}
    </label>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 py-3 border-b border-[#efede8] last:border-0 text-sm">
      <dt className="text-[#6b716f] shrink-0">{label}</dt>
      <dd className="text-right font-medium text-[#14201f] min-w-0 break-words">{children}</dd>
    </div>
  );
}

export function RegisterWizard({
  campaigns,
  products,
  today,
  cash,
  loanPending,
  initialIntent,
}: {
  campaigns: Campaign[];
  products: SellableProduct[];
  today: string;
  cash: number;
  loanPending: number;
  initialIntent: IntentKey | null;
}) {
  const [state, formAction, pending] = useActionState(addMovement, null);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(initialIntent ? 2 : 1);
  const [intent, setIntent] = useState<IntentKey | null>(initialIntent);
  const [sub, setSub] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [docType, setDocType] = useState<DocType | "">("");
  const [supplier, setSupplier] = useState("");
  const [supplierRut, setSupplierRut] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [description, setDescription] = useState("");
  const [vatText, setVatText] = useState("");
  const [productId, setProductId] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [file, setFile] = useState<{ name: string; error?: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const top = useRef<HTMLDivElement>(null);

  const config = intent ? INTENTS[intent] : null;
  const subKeys = config ? Object.keys(config.options) : [];

  // Al elegir qué pasó, deja listas las opciones más comunes.
  useEffect(() => {
    if (!intent) return;
    const keys = Object.keys(INTENTS[intent].options);
    setSub(keys.length === 1 ? keys[0] : "");
    const docs = INTENTS[intent].docs;
    setDocType(docs ? DEFAULT_DOC[docs] : "");
    setVatText("");
  }, [intent]);

  useEffect(() => {
    if (state && "ok" in state) setDone(true);
  }, [state]);

  useEffect(() => {
    top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step, done]);

  const value = Number(amount || 0);
  const mode = config?.docs ?? null;
  const showDocs = !!mode;
  const isSale = mode === "venta" || mode === "nota";
  // IVA del documento: lo calcula solo, pero se puede corregir como sale en el papel.
  const hasVat = isSale || (mode === "compra" && docType === "factura");
  const vat = hasVat ? (vatText !== "" ? Number(vatText) : Math.round((value * 19) / 119)) : 0;
  const needsNumber = docType === "factura" || docType === "nota_credito";
  const needsSupplier = mode === "compra" && docType === "factura";
  const ready =
    !!config &&
    !!sub &&
    value > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    (!showDocs || !isSale || docType !== "") &&
    (!needsNumber || docNumber.trim() !== "") &&
    (!needsSupplier || supplier.trim() !== "") &&
    vat <= value &&
    !file?.error;
  const partyLabel = isSale ? "Cliente" : "Proveedor";
  const newCash = config?.kind === "ingreso" ? cash + value : cash - value;

  function choose(key: IntentKey) {
    setIntent(key);
    setStep(2);
  }

  function reset() {
    setDone(false);
    setStep(1);
    setIntent(null);
    setSub("");
    setAmount("");
    setDate(today);
    setDocType("");
    setSupplier("");
    setSupplierRut("");
    setDocNumber("");
    setCampaignId("");
    setDescription("");
    setVatText("");
    setProductId("");
    setUnitCost("");
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return setFile(null);
    const okType = f.type.startsWith("image/") || f.type === "application/pdf";
    setFile({
      name: f.name,
      error: !okType
        ? "Sube una foto o un PDF."
        : f.size > MAX_FILE
          ? "El archivo pesa más de 5 MB. Prueba con una foto más liviana."
          : undefined,
    });
  }

  if (done && config) {
    return (
      <div
        ref={top}
        className="max-w-xl mx-auto bg-white rounded-xl border border-[#e4e2dc] p-8 text-center space-y-5 scroll-mt-6"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f2ea] text-[#0a6b38]">
          <Icon path={ICONS.check} className="w-7 h-7" />
        </span>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Movimiento guardado</h2>
          <p className="text-sm text-[#6b716f]">
            {config.options[sub]?.label} por {formatCLP(value)}. Tu caja ahora es de{" "}
            <span className="font-semibold text-[#14201f]">{formatCLP(cash)}</span>.
          </p>
        </div>
        {intent === "compra" && (
          <Tip title="Siguiente paso">
            Anota cuánto te costó cada equipo en{" "}
            <Link href="/admin/productos" className="underline font-medium">
              Productos
            </Link>
            . Así el panel calcula bien tu ganancia cuando lo vendas.
          </Tip>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Registrar otro
          </button>
          <Link href="/admin/finanzas" className="btn-secondary">
            Ver la caja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={top} className="space-y-6 scroll-mt-6">
      <Steps step={step} />

      <form
        action={formAction}
        onSubmit={(e) => {
          // Enter en un campo avanza de paso en vez de guardar.
          if (step !== 3) {
            e.preventDefault();
            if (step === 2 && ready) setStep(3);
          }
        }}
        className="space-y-6"
      >
        <input type="hidden" name="category" value={config ? `${config.kind}:${sub}` : ""} />
        <input type="hidden" name="amount" value={amount} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="doc_type" value={showDocs ? docType : ""} />
        <input type="hidden" name="supplier" value={supplier} />
        <input type="hidden" name="supplier_rut" value={supplierRut} />
        <input type="hidden" name="doc_number" value={docNumber} />
        <input type="hidden" name="campaign_id" value={campaignId} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="vat" value={hasVat ? String(vat) : ""} />
        <input type="hidden" name="product_id" value={mode === "venta" ? productId : ""} />
        <input
          type="hidden"
          name="unit_cost"
          value={mode === "venta" && !productId ? unitCost : ""}
        />

        {/* Paso 1: qué pasó */}
        <section hidden={step !== 1} className="space-y-4">
          <h2 className="text-lg font-semibold">¿Qué pasó con la plata?</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {(Object.keys(INTENTS) as IntentKey[]).map((key) => {
              const item = INTENTS[key];
              const incoming = item.kind === "ingreso";
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => choose(key)}
                  className={`group text-left bg-white rounded-xl border p-5 transition hover:border-[#0f5f59] hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0f5f59]/10 ${
                    intent === key ? "border-[#0f5f59]" : "border-[#e4e2dc]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                        incoming ? "bg-[#e6f2ea] text-[#0a6b38]" : "bg-[#f3f2ee] text-[#0c2f2c]"
                      }`}
                    >
                      <Icon path={item.icon} className="w-[22px] h-[22px]" />
                    </span>
                    <span className="space-y-1">
                      <span className="block font-semibold text-[#14201f]">{item.title}</span>
                      <span className="block text-sm text-[#6b716f]">{item.text}</span>
                      <span
                        className={`inline-block pt-1 text-xs font-medium ${incoming ? "text-[#0a6b38]" : "text-[#8a5a00]"}`}
                      >
                        {incoming ? "Suma a tu caja" : "Resta de tu caja"}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <Tip>
            ¿Vendiste algo en la tienda web? No lo anotes aquí: las ventas pagadas en terc.cl se
            suman solas.
          </Tip>
        </section>

        {/* Paso 2: detalles */}
        {config && (
          <section
            hidden={step !== 2}
            className="max-w-2xl bg-white rounded-xl border border-[#e4e2dc] divide-y divide-[#efede8]"
          >
            <div className="flex items-center gap-3 p-5 sm:p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3f2ee] text-[#0c2f2c]">
                <Icon path={config.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{config.title}</h2>
                <p className="text-xs text-[#6b716f]">Completa los datos y luego revisa.</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-[#0f5f59] hover:underline"
              >
                Cambiar
              </button>
            </div>

            {subKeys.length > 1 && (
              <div className="p-5 sm:p-6 space-y-3">
                <p className="text-sm font-medium">
                  {config.kind === "ingreso" ? "¿De dónde vino?" : "¿En qué gastaste?"}
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {subKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSub(key)}
                      aria-pressed={sub === key}
                      className={`text-left rounded-lg border px-4 py-3 transition ${
                        sub === key
                          ? "border-[#0f5f59] bg-[#f0f7f6] ring-1 ring-[#0f5f59]"
                          : "border-[#e4e2dc] hover:border-[#b5b2a8]"
                      }`}
                    >
                      <span className="block text-sm font-medium">{config.options[key].label}</span>
                      <span className="block text-xs text-[#6b716f]">
                        {config.options[key].help}
                      </span>
                    </button>
                  ))}
                </div>
                {sub === "publicidad" && campaigns.length > 0 && (
                  <Field
                    label="¿De qué campaña?"
                    hint="Así el panel sabe cuánto te costó cada venta de esa campaña."
                  >
                    <select
                      value={campaignId}
                      onChange={(e) => setCampaignId(e.target.value)}
                      className="input"
                    >
                      <option value="">Ninguna en particular</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                {sub === "publicidad" && (
                  <Tip>
                    Meta (Instagram y Facebook) y Google cobran desde el extranjero y no entregan
                    factura chilena. Elige <strong>Otro comprobante</strong>: ese gasto no rebaja
                    IVA.
                  </Tip>
                )}
              </div>
            )}

            {mode === "venta" && (
              <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-5">
                <Field label="¿Qué vendiste?" hint="Si es del catálogo, el stock baja solo.">
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="input"
                  >
                    <option value="">No está en el catálogo</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.onDemand ? "(a pedido)" : `(quedan ${p.stock})`}
                      </option>
                    ))}
                  </select>
                </Field>
                {!productId && (
                  <Field
                    label="Costo neto de lo que vendiste (opcional)"
                    hint="Lo que te costó, sin IVA. Sirve para calcular la ganancia."
                  >
                    <input
                      inputMode="numeric"
                      value={unitCost ? Number(unitCost).toLocaleString("es-CL") : ""}
                      onChange={(e) => setUnitCost(digits(e.target.value))}
                      placeholder="0"
                      className="input tabular-nums"
                    />
                  </Field>
                )}
              </div>
            )}

            <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-5">
              <Field
                label="¿Cuánto fue?"
                hint={
                  mode === "venta"
                    ? "Lo que te pagó el cliente, con IVA incluido."
                    : mode === "nota"
                      ? "Lo que le devolviste, con IVA incluido."
                      : docType === "factura"
                        ? "El total de la factura, con IVA incluido."
                        : intent === "devolucion" && loanPending > 0
                          ? `Te quedan ${formatCLP(loanPending)} por devolver.`
                          : "Solo números, sin puntos."
                }
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b716f]">
                    $
                  </span>
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0"
                    value={amount ? Number(amount).toLocaleString("es-CL") : ""}
                    onChange={(e) => {
                      setAmount(digits(e.target.value));
                      setVatText("");
                    }}
                    className="input pl-7 text-lg font-semibold tabular-nums"
                  />
                </div>
              </Field>
              <Field
                label="¿Cuándo?"
                hint={
                  showDocs && docType
                    ? "La fecha del documento."
                    : "La fecha en que pagaste o recibiste la plata."
                }
              >
                <input
                  type="date"
                  value={date}
                  max={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </Field>
            </div>

            {showDocs && (
              <div className="p-5 sm:p-6 space-y-5">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {mode === "compra"
                      ? "¿Tienes factura o boleta?"
                      : mode === "venta"
                        ? "¿Qué documento le diste al cliente?"
                        : "Documento"}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup">
                    {DOC_OPTIONS[mode!].map((o) => (
                      <button
                        key={o || "ninguno"}
                        type="button"
                        role="radio"
                        aria-checked={docType === o}
                        onClick={() => {
                          setDocType(o);
                          setVatText("");
                        }}
                        className={`rounded-lg border px-3 py-2.5 text-sm transition ${
                          docType === o
                            ? "border-[#0f5f59] bg-[#f0f7f6] font-semibold text-[#0c2f2c] ring-1 ring-[#0f5f59]"
                            : "border-[#e4e2dc] hover:border-[#b5b2a8]"
                        }`}
                      >
                        {o ? DOC_NAMES[o] : "No tengo"}
                      </button>
                    ))}
                  </div>
                </div>

                {docType && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field
                        label={needsSupplier ? partyLabel : `${partyLabel} (opcional)`}
                        hint={
                          isSale
                            ? "Nombre de la persona o empresa."
                            : "Nombre de la empresa o persona a quien le pagaste."
                        }
                      >
                        <input
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          placeholder={isSale ? "Ej: Juan Pérez" : "Ej: Reacondicionados SpA"}
                          className="input"
                        />
                      </Field>
                      <Field
                        label={
                          needsNumber
                            ? `Número de ${DOC_NAMES[docType as DocType].toLowerCase()}`
                            : "Número (opcional)"
                        }
                        hint="Aparece arriba a la derecha del documento, como «Nº 1234»."
                      >
                        <input
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value)}
                          placeholder="1234"
                          className="input"
                        />
                      </Field>
                      {docType === "factura" && (
                        <Field label={`RUT del ${partyLabel.toLowerCase()} (opcional)`}>
                          <input
                            value={supplierRut}
                            onChange={(e) => setSupplierRut(e.target.value)}
                            placeholder="76.123.456-7"
                            className="input"
                          />
                        </Field>
                      )}
                      <Field
                        label="Foto o PDF del documento (opcional)"
                        hint="Queda guardado en privado. Solo tú lo puedes abrir."
                      >
                        <input
                          ref={fileInput}
                          name="attachment"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={onFile}
                          className="block w-full text-sm text-[#6b716f] file:mr-3 file:rounded-md file:border file:border-[#d8d6cf] file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#14201f] hover:file:bg-[#fafaf8]"
                        />
                        {file?.error && (
                          <span className="block text-xs text-[#b3362a]">{file.error}</span>
                        )}
                      </Field>
                    </div>

                    {hasVat && value > 0 && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 rounded-lg bg-[#f8f7f3] border border-[#e4e2dc] text-center tabular-nums">
                          <div className="p-3">
                            <p className="eyebrow">Neto</p>
                            <p className="font-semibold mt-1">{formatCLP(value - vat)}</p>
                          </div>
                          <label className="p-3 border-x border-[#e4e2dc] block">
                            <span className="eyebrow block">IVA</span>
                            <input
                              inputMode="numeric"
                              value={vat.toLocaleString("es-CL")}
                              onChange={(e) => setVatText(digits(e.target.value) || "0")}
                              className="mt-1 w-full rounded-md border border-[#d8d6cf] bg-white px-2 py-1 text-center font-semibold"
                              aria-label="IVA del documento"
                            />
                          </label>
                          <div className="p-3">
                            <p className="eyebrow">Total</p>
                            <p className="font-semibold mt-1">{formatCLP(value)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#6b716f]">
                          El IVA se calcula solo (19%). Si el documento dice otro monto, por ejemplo
                          porque tiene partes exentas, cópialo tal como sale.
                        </p>
                        {vat > value && (
                          <p className="text-xs text-[#b3362a]">
                            El IVA no puede ser mayor que el total.
                          </p>
                        )}
                      </div>
                    )}
                    {mode === "compra" && docType === "factura" && (
                      <Tip>
                        Pide que la factura salga a nombre de <strong>Wiremax</strong> (con su RUT).
                        Solo así su IVA se puede rebajar.
                      </Tip>
                    )}
                    {mode === "venta" && (
                      <Tip>
                        La boleta o factura la emite Wiremax en el SII. Aquí solo anotas su número y
                        montos para llevar la cuenta del IVA.
                      </Tip>
                    )}
                    {mode === "nota" && (
                      <Tip>
                        Si devolviste un pedido de la web en el mismo mes en que se vendió, basta
                        con cambiar el pedido a <strong>Cancelado</strong>. Usa esto para
                        devoluciones de meses anteriores o de ventas fuera de la web.
                      </Tip>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="p-5 sm:p-6">
              <Field
                label={
                  intent === "compra"
                    ? "¿Qué compraste?"
                    : intent === "reembolso"
                      ? "¿Por qué devolviste?"
                      : "Detalle (opcional)"
                }
                hint="Una nota corta para acordarte después."
              >
                <input
                  value={description}
                  maxLength={300}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    intent === "compra"
                      ? "Ej: 3 notebooks Lenovo T480 y 2 cargadores"
                      : intent === "entrada"
                        ? "Ej: préstamo de mi papá para partir"
                        : intent === "devolucion"
                          ? "Ej: primera cuota"
                          : intent === "venta"
                            ? "Ej: notebook a un compañero del colegio"
                            : intent === "reembolso"
                              ? "Ej: el equipo llegó con la pantalla fallada"
                              : "Ej: anuncio de notebooks en Instagram"
                  }
                  className="input"
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 bg-[#fafaf8] rounded-b-xl">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                Atrás
              </button>
              <button
                type="button"
                disabled={!ready}
                onClick={() => setStep(3)}
                className="btn-primary"
              >
                Revisar
              </button>
            </div>
          </section>
        )}

        {/* Paso 3: confirmar */}
        {config && step === 3 && (
          <section className="max-w-2xl bg-white rounded-xl border border-[#e4e2dc]">
            <div className="p-5 sm:p-6 text-center border-b border-[#efede8]">
              <p className="eyebrow">Vas a registrar</p>
              <p
                className={`text-[34px] font-semibold tracking-tight tabular-nums mt-1 ${
                  config.kind === "ingreso" ? "text-[#0a6b38]" : "text-[#14201f]"
                }`}
              >
                {config.kind === "ingreso" ? "+" : "−"}
                {formatCLP(value)}
              </p>
              <p className="text-sm text-[#6b716f]">{config.options[sub]?.label}</p>
            </div>
            <dl className="px-5 sm:px-6">
              <Row label="Fecha">
                <span className="first-letter:uppercase inline-block">{longDate(date)}</span>
              </Row>
              {sub === "publicidad" && campaignId && (
                <Row label="Campaña">{campaigns.find((c) => c.id === campaignId)?.name}</Row>
              )}
              {mode === "venta" && (
                <Row label="Qué vendiste">
                  {products.find((p) => p.id === productId)?.name ?? "Fuera del catálogo"}
                </Row>
              )}
              {showDocs && (
                <Row label="Documento">
                  {docType
                    ? `${DOC_NAMES[docType]}${docNumber ? ` Nº ${docNumber}` : ""}`
                    : "Sin documento"}
                </Row>
              )}
              {showDocs && docType && supplier && (
                <Row label={partyLabel}>
                  {supplier}
                  {supplierRut && <span className="text-[#6b716f]"> · {supplierRut}</span>}
                </Row>
              )}
              {hasVat && (
                <>
                  <Row label="Neto">{formatCLP(value - vat)}</Row>
                  <Row label="IVA">{formatCLP(vat)}</Row>
                </>
              )}
              {showDocs && docType && file && <Row label="Archivo">{file.name}</Row>}
              {description && <Row label="Detalle">{description}</Row>}
              <Row label="Tu caja quedará en">
                <span className={`tabular-nums ${newCash < 0 ? "text-[#b3362a]" : ""}`}>
                  {formatCLP(newCash)}
                </span>
              </Row>
            </dl>
            {newCash < 0 && (
              <div className="mx-5 sm:mx-6 mb-4">
                <Tip title="Tu caja quedaría en negativo">
                  Puede que falte registrar una entrada de plata, como el préstamo de tu papá.
                  Puedes guardar igual y registrarla después.
                </Tip>
              </div>
            )}
            {state && "error" in state && (
              <p className="mx-5 sm:mx-6 mb-4 rounded-lg bg-[#fbe9e6] border border-[#f2cbc5] px-4 py-3 text-sm text-[#8f2318]">
                {state.error}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 bg-[#fafaf8] rounded-b-xl border-t border-[#efede8]">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                Corregir
              </button>
              <button type="submit" disabled={pending} className="btn-primary">
                {pending ? "Guardando…" : "Guardar movimiento"}
              </button>
            </div>
          </section>
        )}
      </form>
    </div>
  );
}
