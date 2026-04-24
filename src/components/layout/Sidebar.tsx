"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  Users,
  Phone,
  CalendarDays,
  BarChart2,
  FileText,
  Settings,
} from "lucide-react"

const nav = [
  { href: "/pipeline", label: "Pipeline", icon: LayoutGrid },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/calls", label: "Ligações", icon: Phone },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/metricas", label: "Métricas", icon: BarChart2 },
  { href: "/propostas", label: "Propostas", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 border-r border-[var(--color-lt-border)] bg-[var(--color-lt-surface)] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[var(--color-lt-border)]">
        <span className="text-[15px] font-bold text-[var(--color-lt-text-bright)] tracking-tight">
          <span className="text-[var(--color-orakulo-primary)]">●</span> Orakulo CRM
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[var(--color-lt-surface-fade)] text-[var(--color-lt-text-bright)]"
                  : "text-[var(--color-lt-text-muted)] hover:bg-[var(--color-lt-surface-fade)] hover:text-[var(--color-lt-text-base)]"
              }`}
            >
              <Icon
                size={15}
                className={active ? "text-[var(--color-orakulo-primary)]" : ""}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-[var(--color-lt-border)]">
        <Link
          href="/configuracoes"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-[var(--color-lt-text-muted)] hover:bg-[var(--color-lt-surface-fade)] hover:text-[var(--color-lt-text-base)] transition-colors"
        >
          <Settings size={15} />
          Configurações
        </Link>
      </div>
    </aside>
  )
}
