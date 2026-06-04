# Planning App — ระบบจัดการแผนและเป้าหมาย

แอปพลิเคชันช่วยจัดการงานประจำวัน โปรเจค เป้าหมาย และไอเดีย แก้ปัญหา "มีแผนในหัวไม่หมด / ลืม" ด้วยระบบที่เป็นเพื่อนที่ดีที่สุด

เปิด [http://localhost:3000](http://localhost:3000)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Email + Password) |
| Storage | Supabase Storage (รูปภาพโปรเจค/ไอเดีย) |
| State | TanStack Query + Zustand |
| UI | Tailwind CSS 4 + shadcn/ui + lucide-react |
| Calendar | FullCalendar 6 |
| Drag & Drop | dnd-kit |
| Deploy | Vercel |

## บัญชีทดสอบ

| บทบาท | วิธีเข้าใช้ | หมายเหตุ |
|-------|-----------|---------|
| ผู้ใช้ | สมัครสมาชิกที่ `/register` หรือ login ที่ `/login` | Email + Password |

## โครงสร้างไฟล์

```
planning-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        — หน้าเข้าสู่ระบบ
│   │   └── register/page.tsx     — หน้าสมัครสมาชิก
│   ├── (app)/
│   │   ├── layout.tsx            — Sidebar + nav หลัก
│   │   ├── today/page.tsx        — งานประจำวัน
│   │   ├── projects/
│   │   │   ├── page.tsx          — รายการโปรเจคทั้งหมด
│   │   │   └── [id]/page.tsx     — รายละเอียดโปรเจค (Kanban)
│   │   ├── goals/page.tsx        — เป้าหมายระยะสั้น/ยาว
│   │   ├── ideas/
│   │   │   ├── page.tsx          — inbox ไอเดีย
│   │   │   └── [id]/page.tsx     — รายละเอียดไอเดีย
│   │   └── calendar/page.tsx     — ปฏิทิน (week/month/day view)
│   └── layout.tsx                — Root layout
├── components/
│   ├── ui/                       — shadcn components (button, input, badge, sheet)
│   ├── auth/
│   │   └── AuthForm.tsx          — ฟอร์ม login/register
│   ├── tasks/
│   │   ├── TaskItem.tsx          — รายการ task เดี่ยว
│   │   └── TaskBoard.tsx         — กระดาน task ประจำวัน
│   ├── projects/
│   │   ├── ProjectCard.tsx       — การ์ดโปรเจค (inline double-click delete)
│   │   ├── ProjectForm.tsx       — ฟอร์มสร้าง/แก้ไขโปรเจค
│   │   ├── ProjectEditor.tsx     — แก้ไขรายละเอียดโปรเจค
│   │   └── KanbanBoard.tsx       — Kanban board (dnd-kit)
│   ├── goals/
│   │   └── OverviewGrid.tsx      — กริดเป้าหมาย + progress + confetti
│   ├── ideas/
│   │   ├── IdeaCard.tsx          — การ์ดไอเดีย
│   │   ├── IdeaForm.tsx          — ฟอร์มเพิ่มไอเดีย
│   │   └── IdeaEditor.tsx        — แก้ไขเนื้อหาไอเดีย
│   ├── calendar/
│   │   ├── CalendarView.tsx      — FullCalendar wrapper
│   │   ├── MiniCalendar.tsx      — Mini calendar picker
│   │   └── TaskDetailSheet.tsx   — Bottom sheet รายละเอียด task
│   └── shared/
│       ├── Sidebar.tsx           — Navigation sidebar
│       ├── ProgressBar.tsx       — Progress bar component
│       └── QueryProvider.tsx     — TanStack Query provider
├── lib/
│   ├── supabase/
│   │   ├── client.ts             — Browser Supabase client
│   │   └── server.ts             — Server Supabase client (SSR)
│   ├── queries/
│   │   ├── useTasks.ts           — TanStack Query hooks สำหรับ tasks
│   │   ├── useGoals.ts           — TanStack Query hooks สำหรับ goals
│   │   └── useProjects.ts        — TanStack Query hooks สำหรับ projects
│   ├── store/
│   │   └── ui.ts                 — Zustand UI state
│   └── utils.ts
├── actions/                      — Next.js Server Actions
│   ├── auth.ts                   — login, register, logout
│   ├── tasks.ts                  — CRUD tasks
│   ├── projects.ts               — CRUD projects
│   ├── goals.ts                  — CRUD goals + progress
│   ├── ideas.ts                  — CRUD ideas
│   ├── subtasks.ts               — CRUD subtasks
│   └── idea_tasks.ts             — แปลงไอเดียเป็น task
├── types/
│   └── database.ts               — Supabase generated types
└── supabase/
    └── migrations/               — SQL migration files
        ├── 20260521000000_initial_schema.sql
        ├── 20260521000001_add_task_times.sql
        ├── 20260521000002_add_project_description.sql
        ├── 20260521000003_project_images.sql
        ├── 20260521000004_ideas_content_images.sql
        ├── 20260521000005_projects_completed.sql
        ├── 20260521000006_subtasks.sql
        ├── 20260521000007_idea_tasks.sql
        └── 20260522000000_project_pinned.sql
```

## Features

### งานประจำวัน (Today)
- CRUD task พร้อม tag: `work` / `life` / `urgent`
- ติ๊กเสร็จ + progress bar รายวัน
- กำหนดเวลาเริ่ม-สิ้นสุดของแต่ละ task
- auto-focus input — พร้อม capture ทันทีที่เปิด

### โปรเจค (Projects)
- CRUD project พร้อมรูปภาพ, คำอธิบาย, deadline
- Kanban board ด้วย dnd-kit (drag & drop)
- Subtasks ในแต่ละ task
- pin โปรเจคสำคัญไว้ด้านบน
- mark โปรเจคว่า completed

### เป้าหมาย (Goals)
- เป้าหมายระยะสั้น/ยาว
- อัปเดต progress % แบบ manual
- **Confetti animation** เมื่อ goal สำเร็จ 100%

### ไอเดีย (Ideas)
- inbox dump เขียนเร็ว ไม่มี friction
- tag, ค้นหา, pin
- แปลงไอเดียเป็น task ได้โดยตรง
- เพิ่มรูปภาพและเนื้อหาแบบ rich content

### ปฏิทิน (Calendar)
- Day / Week / Month view ด้วย FullCalendar
- แสดง task ตาม deadline บนปฏิทิน
- Mini calendar picker สำหรับ navigate
- คลิก task บนปฏิทินเพื่อดู detail ใน bottom sheet

### ระบบกลาง
- Supabase Auth (Email + Password)
- RLS — ข้อมูลส่วนตัว user ปลอดภัย
- Server Actions — ไม่ต้องเขียน API routes
- TanStack Query — cache + optimistic updates

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Getting Started

```bash
npm install
npm run dev
```

Built with Next.js 16 + Supabase + TanStack Query
