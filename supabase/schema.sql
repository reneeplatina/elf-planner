-- Elf planner key/value JSON store
create table if not exists public.elf_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.elf_store enable row level security;

-- RLS NOTES:
-- The anon key ships in the public JS bundle, so anyone who finds the URL could read/write
-- with a permissive policy. Recommended: enable Supabase Auth (magic link for Renee only),
-- add an owner column, and restrict to auth.uid(). Simplest private option:
--   alter table public.elf_store add column owner uuid default auth.uid();
--   create policy "owner rw" on public.elf_store for all
--     using (owner = auth.uid()) with check (owner = auth.uid());
-- QUICK-START (less private, obscure-URL only) policy:
create policy "anon rw" on public.elf_store for all to anon using (true) with check (true);
