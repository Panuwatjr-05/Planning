import { Sidebar } from '@/components/shared/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 pt-20 md:pt-8 overflow-y-auto">{children}</main>
    </div>
  )
}
