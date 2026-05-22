alter table ideas add column if not exists content text;
alter table ideas add column if not exists images text[] default '{}';
