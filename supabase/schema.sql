-- Elf planner key/value JSON store: shared household data, PUBLIC (accepted by Renee).
drop table if exists public.elf_store;
create table public.elf_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.elf_store enable row level security;
grant select, insert, update, delete on public.elf_store to anon, authenticated;
create policy "public rw" on public.elf_store for all to anon, authenticated using (true) with check (true);
