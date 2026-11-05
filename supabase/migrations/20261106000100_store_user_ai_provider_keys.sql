create table if not exists public.user_ai_provider_keys (
  owner_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('gemini', 'openai')),
  ciphertext text not null,
  iv text not null,
  updated_at timestamptz not null default now(),
  primary key (owner_id, provider)
);

alter table public.user_ai_provider_keys enable row level security;

revoke all on public.user_ai_provider_keys from public, anon, authenticated;
grant all on public.user_ai_provider_keys to service_role;
