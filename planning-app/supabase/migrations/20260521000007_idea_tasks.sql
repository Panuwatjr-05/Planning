create table if not exists idea_tasks (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  title text not null,
  status text check (status in ('todo', 'doing', 'done')) default 'todo',
  order_index int default 0,
  created_at timestamptz default now()
);

alter table idea_tasks enable row level security;

create policy "users see own idea_tasks" on idea_tasks
  for all using (auth.uid() = user_id);
