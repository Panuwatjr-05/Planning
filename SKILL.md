# SKILL.md — Coding Conventions

Convention และ pattern ที่ใช้ในโปรเจคนี้ทั้งหมด Claude ต้องอ่านและทำตามเสมอ

---

## TypeScript

- **strict mode เสมอ** — ไม่ใช้ `any` เด็ดขาด ใช้ `unknown` แล้ว narrow type
- type ของ database ต้อง generate จาก Supabase แล้ว import จาก `types/database.ts`
- props ของ component ใช้ `interface` ไม่ใช้ `type` ยกเว้น union/intersection

```ts
// ✅ ถูก
interface TaskItemProps {
  task: Tables<'tasks'>
  onToggle: (id: string) => void
}

// ❌ ผิด
function TaskItem({ task }: { task: any }) {}
```

---

## Data Fetching — Server vs Client

### Server Components (default)
- fetch ข้อมูลที่ไม่ต้องการ realtime ใน Server Component โดยตรง
- ใช้ `lib/supabase/server.ts` สำหรับ server-side client

```ts
// app/(app)/today/page.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function TodayPage() {
  const supabase = createServerClient()
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('date', new Date().toISOString().split('T')[0])
  return <TaskList tasks={tasks ?? []} />
}
```

### TanStack Query (client — realtime / optimistic)
- ใช้เมื่อต้องการ optimistic update หรือ polling
- hooks อยู่ใน `lib/queries/`
- ต้อง invalidate query หลัง Server Action สำเร็จ

```ts
// lib/queries/useTasks.ts
export function useTasks(date: string) {
  return useQuery({
    queryKey: ['tasks', date],
    queryFn: () => fetchTasksByDate(date),
  })
}
```

---

## Server Actions — Mutations

- **mutations ทั้งหมดต้องใช้ Server Actions** ไม่เขียน API route เพิ่ม
- ไฟล์อยู่ใน `actions/` เสมอ
- ต้อง validate input ด้วย Zod ก่อนเสมอ
- ต้อง `revalidatePath` หรือ return ข้อมูลให้ client invalidate query

```ts
// actions/tasks.ts
'use server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  tag:   z.enum(['work', 'life', 'urgent']),
  date:  z.string(),
})

export async function createTask(input: z.infer<typeof CreateTaskSchema>) {
  const parsed = CreateTaskSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = createServerClient()
  const { error } = await supabase.from('tasks').insert({
    ...parsed.data,
    user_id: (await supabase.auth.getUser()).data.user!.id,
  })
  if (error) throw error
  revalidatePath('/today')
}
```

---

## State Management — Zustand

- ใช้ Zustand **เฉพาะ UI state** เท่านั้น เช่น modal open/close, selected tab, sidebar state
- ห้ามเก็บ server data ใน Zustand ให้ใช้ TanStack Query แทน

```ts
// lib/store/ui.ts
interface UIStore {
  isAddTaskOpen: boolean
  openAddTask: () => void
  closeAddTask: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isAddTaskOpen: false,
  openAddTask:  () => set({ isAddTaskOpen: true }),
  closeAddTask: () => set({ isAddTaskOpen: false }),
}))
```

---

## Components

### โครงสร้าง
- ใช้ **shadcn/ui เสมอ** ก่อน custom เอง
- แยก component เป็น `feature/ComponentName.tsx`
- Server Component เป็น default, ใส่ `'use client'` เมื่อจำเป็นเท่านั้น

### Naming
| สิ่ง           | Convention              | ตัวอย่าง          |
|----------------|-------------------------|--------------------|
| Component file | PascalCase              | `TaskItem.tsx`     |
| Hook           | camelCase + `use` prefix| `useTasks.ts`      |
| Action         | camelCase + verb prefix | `createTask`       |
| Type/Interface | PascalCase              | `TaskWithProject`  |
| CSS class      | Tailwind เท่านั้น       | `className="..."`  |

### Client Component pattern

```tsx
'use client'

interface TaskItemProps {
  task: Tables<'tasks'>
}

export function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await toggleTask(task.id)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={task.is_done} onCheckedChange={handleToggle} disabled={isPending} />
      <span className={task.is_done ? 'line-through text-muted-foreground' : ''}>
        {task.title}
      </span>
    </div>
  )
}
```

---

## Error Handling

- Server Action — throw Error ที่มีความหมาย, client จัดการด้วย `useFormState` หรือ try/catch
- ไม่ใช้ `console.log` ใน production code — ใช้ `console.error` เฉพาะ error จริง
- ไม่ catch error แล้วเงียบ ต้อง surface ขึ้นมาให้ user เห็นเสมอ

---

## Supabase Patterns

### Client selection
```ts
// browser (Client Component)
import { createBrowserClient } from '@/lib/supabase/client'

// server (Server Component / Action)
import { createServerClient } from '@/lib/supabase/server'
```

### Query pattern
```ts
const { data, error } = await supabase
  .from('tasks')
  .select('*, projects(title)')   // join ถ้าต้องการ
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

if (error) throw error
```

### RLS — ไม่ต้องกรอง user_id ใน query ถ้า RLS เปิดอยู่
- RLS จัดการให้อัตโนมัติ แต่ถ้าใช้ `service_role` key ต้องกรอง user_id เอง

---

## Styling Rules

- **Tailwind เท่านั้น** ห้ามเขียน CSS file แยก ยกเว้น global styles ใน `app/globals.css`
- ใช้ `cn()` utility จาก shadcn สำหรับ conditional class
- responsive: mobile-first เสมอ (`sm:`, `md:`, `lg:`)
- dark mode: ใช้ shadcn system (class strategy) ไม่ implement เอง

```tsx
import { cn } from '@/lib/utils'

<div className={cn('base-class', isActive && 'active-class', className)} />
```

---

## File Organization Rules

1. ไฟล์ใหม่ต้องอยู่ถูก folder ตาม structure ใน CLAUDE.md
2. ห้าม import ข้าม feature โดยตรง ให้ export จาก index ของ feature นั้น
3. `lib/` — pure functions, no React
4. `components/` — React components เท่านั้น
5. `actions/` — Server Actions เท่านั้น, ไม่มี UI logic

---

## Database & Supabase File Rules

| ประเภท | ที่อยู่ |
|--------|---------|
| สร้าง/แก้ database (tables, RLS, indexes) | `supabase/migrations/*.sql` |
| Logic / Functions ทุกอย่าง | TypeScript ใน `actions/`, `lib/` |

**ห้ามเขียน logic ใน SQL** — ทุกอย่างที่เป็น function ใช้ TypeScript เสมอ

---

## Performance

- ใช้ `loading.tsx` ทุก route สำหรับ Suspense boundary
- Image ต้องใช้ `next/image` เสมอ
- ไม่ import library ทั้งก้อนถ้า tree-shake ได้
- `use client` ให้ push ลงไปที่ leaf component มากที่สุด

---

## Git Convention

```
feat: add task creation
fix: correct goal progress calculation
refactor: extract TaskForm component
style: update today page layout
```

- commit ละ 1 เรื่อง
- ไม่ commit `.env.local` เด็ดขาด
