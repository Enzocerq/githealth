import Link from "next/link";
import { HeartPulse, LayoutDashboard, Activity, FolderGit2, Users, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", label: "Visao geral", icon: LayoutDashboard },
  { path: "/atividade", label: "Atividade", icon: Activity },
  { path: "/repositorios", label: "Repositorios", icon: FolderGit2 },
  { path: "/colaboracao", label: "Colaboracao", icon: Users },
  { path: "/insights", label: "Insights", icon: Lightbulb },
];

export function Sidebar({ basePath = "" }: { basePath?: string }) {
  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
        <HeartPulse className="size-5 text-rose-500" />
        GitHealth
        {basePath && (
          <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            demo
          </span>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={`${basePath}${item.path}`}
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
