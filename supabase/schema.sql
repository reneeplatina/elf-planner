-- Elf planner key/value JSON store, owner-only (Supabase Auth)
create table if not exists public.elf_store (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.elf_store enable row level security;
revoke all on public.elf_store from anon;
grant select, insert, update, delete on public.elf_store to authenticated;
create policy "owner select" on public.elf_store for select to authenticated using ((select auth.uid()) = user_id);
create policy "owner insert" on public.elf_store for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "owner update" on public.elf_store for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owner delete" on public.elf_store for delete to authenticated using ((select auth.uid()) = user_id);
