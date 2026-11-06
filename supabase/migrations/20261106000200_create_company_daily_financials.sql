create table if not exists public.company_daily_financials (
  report_date date primary key,
  revenue numeric(15, 0) not null check (revenue >= 0),
  profit numeric(15, 0) not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.company_daily_financials enable row level security;

revoke all on public.company_daily_financials from public, anon;
grant select, insert, update on public.company_daily_financials to authenticated;

drop policy if exists "Authenticated users can read company daily financials" on public.company_daily_financials;
create policy "Authenticated users can read company daily financials"
  on public.company_daily_financials for select to authenticated
  using ((select auth.uid()) is not null);

drop policy if exists "Authenticated users can create company daily financials" on public.company_daily_financials;
create policy "Authenticated users can create company daily financials"
  on public.company_daily_financials for insert to authenticated
  with check ((select auth.uid()) is not null);

drop policy if exists "Authenticated users can update company daily financials" on public.company_daily_financials;
create policy "Authenticated users can update company daily financials"
  on public.company_daily_financials for update to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);
