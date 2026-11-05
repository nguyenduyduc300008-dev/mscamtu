create table if not exists public.ai_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  prompt text not null check (char_length(prompt) between 1 and 4000),
  agent_id text not null check (agent_id in (
    'coordinator',
    'research',
    'social',
    'short-video',
    'publisher',
    'sales',
    'video',
    'training',
    'landing',
    'brand-review',
    'brand-voice',
    'quality'
  )),
  provider text not null check (provider in ('gemini', 'openai')),
  status text not null default 'queued' check (status in ('queued', 'in_progress', 'completed', 'failed')),
  progress integer not null default 0 check (progress between 0 and 100),
  result text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists ai_tasks_owner_created_idx
  on public.ai_tasks (owner_id, created_at desc);

alter table public.ai_tasks enable row level security;

revoke all on public.ai_tasks from anon;
grant select, insert, update on public.ai_tasks to authenticated;

drop policy if exists "Users can read their own AI tasks" on public.ai_tasks;
create policy "Users can read their own AI tasks"
  on public.ai_tasks for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Users can create their own AI tasks" on public.ai_tasks;
create policy "Users can create their own AI tasks"
  on public.ai_tasks for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can update their own AI tasks" on public.ai_tasks;
create policy "Users can update their own AI tasks"
  on public.ai_tasks for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
