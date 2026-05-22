-- projects ต้องสร้างก่อน tasks เพราะ tasks มี foreign key หา projects
create table projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  title      text not null,
  deadline   date,
  created_at timestamptz default now()
);

create table tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  title      text not null,
  tag        text check (tag in ('work', 'life', 'urgent')) default 'work',
  is_done    boolean default false,
  date       date not null default current_date,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now()
);

create table goals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  title        text not null,
  type         text check (type in ('short', 'long')) default 'short',
  progress     int default 0 check (progress between 0 and 100),
  is_completed boolean default false,
  completed_at timestamptz,
  created_at   timestamptz default now()
);

create table ideas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  title      text not null,
  tags       text[] default '{}',
  is_pinned  boolean default false,
  created_at timestamptz default now()
);

-- RLS: แต่ละ user เห็นเฉพาะข้อมูลตัวเอง
alter table tasks    enable row level security;
alter table projects enable row level security;
alter table goals    enable row level security;
alter table ideas    enable row level security;

create policy "users see own data" on tasks    for all using (auth.uid() = user_id);
create policy "users see own data" on projects for all using (auth.uid() = user_id);
create policy "users see own data" on goals    for all using (auth.uid() = user_id);
create policy "users see own data" on ideas    for all using (auth.uid() = user_id);
