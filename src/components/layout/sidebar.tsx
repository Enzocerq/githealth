import Link from "next/link";
import { HeartPulse, LayoutDashboard, Activity, FolderGit2, Users, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Visao geral", icon: LayoutDashboard },
  { href: "/atividade", label: "Atividade", icon: Activity },
  { href: "/repositorios", label: "Repositorios", icon: FolderGit2 },
  { href: "/colaboracao", label: "Colaboracao", icon: Users },
  { href: "/insights", label: "Insights", icon: Lightbulb },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
        <HeartPulse className="size-5 text-rose-500" />
        GitHealth
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "transition-colors",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
