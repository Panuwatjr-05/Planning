'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logout } from '@/actions/auth'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { CalendarDays, Calendar, FolderKanban, Target, Lightbulb, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/today',    label: 'งาน',      icon: CalendarDays },
  { href: '/calendar', label: 'ปฏิทิน',   icon: Calendar },
  { href: '/projects', label: 'โปรเจค',   icon: FolderKanban },
  { href: '/goals',    label: 'เป้าหมาย', icon: Target },
  { href: '/ideas',    label: 'ไอเดีย',   icon: Lightbulb },
]

function SidebarHeader() {
  return (
    <div className="px-4 pt-5 pb-4 border-b border-border">
      <div className="flex items-center gap-3">

        {/* Icon — abstract upward path mark */}
        <div
          className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center"
          style={{ background: 'oklch(0.13 0.015 255)' }}
        >
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 15 L6 8 L10 11 L15 4 L21 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="1" r="1.5" fill="white"/>
          </svg>
        </div>

        {/* Wordmark */}
        <div className="flex flex-col gap-1.5">
          <h1 className="font-black text-[18px] text-foreground tracking-tight leading-none">
            Planning
          </h1>
          <p className="text-[10.5px] text-muted-foreground/60 leading-none">
            บันทึก · วางแผน · สำเร็จ
          </p>
        </div>

      </div>
    </div>
  )
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors',
              pathname === href
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
            )}
          >
            <Icon size={14} strokeWidth={pathname === href ? 2.5 : 1.75} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
          >
            <LogOut size={15} />
            ออกจากระบบ
          </button>
        </form>
      </div>
    </>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-56 border-r flex-col h-screen sticky top-0 shrink-0 bg-sidebar">
        <SidebarHeader />
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-border">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="p-1 rounded-md hover:bg-accent">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0 flex flex-col bg-sidebar">
            <SidebarHeader />
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center"
            style={{ background: 'oklch(0.13 0.015 255)' }}>
            <svg width="15" height="12" viewBox="0 0 22 18" fill="none">
              <path d="M1 15 L6 8 L10 11 L15 4 L21 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="21" cy="1" r="1.5" fill="white"/>
            </svg>
          </div>
          <h1 className="font-bold text-sm tracking-tight">Planning</h1>
        </div>
      </div>
    </>
  )
}
