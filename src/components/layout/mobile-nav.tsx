"use client";

import Link from "next/link";
import { Menu, HeartPulse, LayoutDashboard, Activity, FolderGit2, Users, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { href: "/dashboard", label: "Visao geral", icon: LayoutDashboard },
  { href: "/atividade", label: "Atividade", icon: Activity },
  { href: "/repositorios", label: "Repositorios", icon: FolderGit2 },
  { href: "/colaboracao", label: "Colaboracao", icon: Users },
  { href: "/insights", label: "Insights", icon: Lightbulb },
];

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="size-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        }
      />
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HeartPulse className="size-5 text-rose-500" />
            GitHealth
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
