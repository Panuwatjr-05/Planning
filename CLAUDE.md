# CLAUDE.md — Planning App

คู่มือนี้ใช้กับ Claude Code เพื่อให้เข้าใจ project context ทั้งหมดก่อนลงมือเขียน

---

## Project Overview

**ชื่อ:** Planning App — ระบบจัดการแผนและเป้าหมาย  
**เป้าหมาย:** แก้ปัญหา "มีแผนในหัวไม่หมด เจตนาไม่ได้ / ลืม" ด้วยระบบที่เป็นเพื่อนที่ดีที่สุด  
**Stack:** Next.js 14 (App Router) + Supabase + Vercel

---

## Tech Stack

| Layer     | Technology                  | เหตุผล                                    |
|-----------|-----------------------------|-------------------------------------------|
| Frontend  | Next.js 14 (App Router)     | Server Components, Server Actions ไม่ต้องเขียน API เยอะ |
| Database  | Supabase PostgreSQL         | Realtime, Auth, RLS ครบในตัว              |
| Auth      | Supabase Auth               | email + OAuth, JWT built-in               |
| State     | TanStack Query + Zustand    | server state vs client state แยกกัน       |
| Styling   | Tailwind CSS + shadcn/ui    | ไม่ต้องเขียน CSS เอง                      |
| Deploy    | Vercel                      | native Next.js support                    |

---

## Features

### วันนี้ (Today)
- CRUD task ประจำวัน
- แบ่งประเภท tag: `work` / `life` / `urgent`
- ติ๊กสำเร็จ + progress bar
- auto-focus input — พร้อม capture ทันทีที่เปิด

### โปรเจค (Projects)
- CRUD project
- subtask, deadline, progress bar
- เชื่อม task รายวันกับ project ได้

### เป้าหมาย (Goals)
- เป้าหมายระยะสั้น/ยาว
- อัปเดต progress %
- **Celebration animation** เมื่อ goal สำเร็จ 100%

### ไอเดีย (Ideas)
- inbox dump เขียนเร็ว ไม่มี friction
- tag, ค้นหา, pin
- แปลงเป็น task/goal ได้

### ระบบกลาง
- Supabase Auth (email + OAuth)
- Realtime sync หลายอุปกรณ์
- RLS — ข้อมูลส่วนตัว user ปลอดภัย

---

## Folder Structure

```
planning-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          # sidebar + nav
│   │   ├── today/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── goals/page.tsx
│   │   └── ideas/page.tsx
│   ├── api/
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn components
│   ├── tasks/
│   │   ├── TaskItem.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskForm.tsx
│   ├── goals/
│   │   ├── GoalCard.tsx
│   │   ├── GoalList.tsx
│   │   └── CelebrationAnimation.tsx
│   ├── projects/
│   └── shared/
│       ├── ProgressBar.tsx
│       └── StreakBadge.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # browser client
│   │   ├── server.ts           # server client (SSR)
│   │   └── middleware.ts
│   ├── queries/                # TanStack Query hooks
│   │   ├── useTasks.ts
│   │   ├── useGoals.ts
│   │   └── useProjects.ts
│   └── utils.ts
├── actions/                    # Server Actions
│   ├── tasks.ts
│   ├── goals.ts
│   └── projects.ts
├── types/
│   └── database.ts             # generated Supabase types
├── CLAUDE.md
└── SKILL.md
```

---

## Database Schema

```sql
-- tasks
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

-- projects
create table projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  title      text not null,
  deadline   date,
  created_at timestamptz default now()
);

-- goals
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

-- ideas
create table ideas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  title      text not null,
  tags       text[] default '{}',
  is_pinned  boolean default false,
  created_at timestamptz default now()
);

-- RLS (ทุก table)
alter table tasks    enable row level security;
alter table projects enable row level security;
alter table goals    enable row level security;
alter table ideas    enable row level security;

create policy "users see own data" on tasks    for all using (auth.uid() = user_id);
create policy "users see own data" on projects for all using (auth.uid() = user_id);
create policy "users see own data" on goals    for all using (auth.uid() = user_id);
create policy "users see own data" on ideas    for all using (auth.uid() = user_id);
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-side only
```

---

## Key UX Decisions

1. **Celebration animation** เมื่อ goal สำเร็จ — ต้องรู้สึก rewarding ไม่ใช่แค่ติ๊ก
2. **Auto-focus** — หน้าวันนี้ต้องบอกทันทีว่า "ต้องทำอะไรก่อน"
3. **Quick capture** — บันทึกได้ภายใน 1 วินาที ไม่มี friction
4. **ข้อมูลไม่หาย** — ทุกอย่าง persist ใน Supabase เสมอ

---

## Development Phases

| Phase | เนื้อหา                        | สถานะ     |
|-------|-------------------------------|-----------|
| 0     | Setup & config                | ⬜ todo   |
| 1     | Auth & Layout                 | ⬜ todo   |
| 2     | Today Page (core loop)        | ⬜ todo   |
| 3     | Projects & Goals              | ⬜ todo   |
| 4     | Ideas & Polish                | ⬜ todo   |
| 5     | Launch                        | ⬜ todo   |
