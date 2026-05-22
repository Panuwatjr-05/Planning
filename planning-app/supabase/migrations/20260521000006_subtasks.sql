create table if not exists subtasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  title text not null,
  status text check (status in ('todo', 'doing', 'done')) default 'todo',
  order_index int default 0,
  created_at timestamptz default now()
);

alter table subtasks enable row level security;

create policy "users see own subtasks" on subtasks
  for all using (auth.uid() = user_id);
