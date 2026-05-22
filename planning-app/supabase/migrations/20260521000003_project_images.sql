alter table projects add column if not exists images text[] default '{}';
alter table projects add column if not exists description text;
