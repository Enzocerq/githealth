import type { User } from "@prisma/client";

import { Avatar } from "@/components/ui/avatar";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  user: Pick<User, "name" | "email" | "image" | "lastSyncAt">;
  syncButton?: React.ReactNode;
}

export function Header({ user, syncButton }: HeaderProps) {
  const initials = user.name?.split(" ").map((n) => n[0]).join("") ?? user.email?.[0] ?? "?";
  const lastSync = user.lastSyncAt
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(user.lastSyncAt)
    : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <MobileNav />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sync status */}
      {lastSync && (
        <span className="hidden text-xs text-muted-foreground sm:block">
          Sincronizado {lastSync}
        </span>
      )}

      {/* Sync button slot */}
      {syncButton}

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Avatar */}
      <Avatar src={user.image} alt={user.name ?? "Usuário"} fallback={initials} />
    </header>
  );
}
