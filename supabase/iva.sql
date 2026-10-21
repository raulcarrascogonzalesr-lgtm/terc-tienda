-- IVA: notas de crédito, ventas fuera de la web y tasa de PPM.
alter table movements drop constraint if exists movements_doc_type_check;
alter table movements add constraint movements_doc_type_check
  check (doc_type in ('factura', 'boleta', 'otro', 'nota_credito'));
alter table movements add column if not exists product_id uuid references products(id) on delete set null;
alter table movements add column if not exists unit_cost integer check (unit_cost >= 0);

create table if not exists settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table settings enable row level security;
