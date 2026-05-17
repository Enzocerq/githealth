import Link from "next/link";
import { LayoutDashboard, Activity, FolderGit2, Users, Lightbulb } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const screens = [
  { href: "/preview/dashboard", label: "Visao Geral", icon: LayoutDashboard, description: "Score Wolter, KPIs e evolução" },
  { href: "/preview/atividade", label: "Atividade & Fluxo", icon: Activity, description: "Cycle time, review e linha do tempo" },
  { href: "/preview/repositorios", label: "Repositorios", icon: FolderGit2, description: "Tabela por repositório" },
  { href: "/preview/colaboracao", label: "Colaboracao", icon: Users, description: "Reviews e comparação com o time" },
  { href: "/preview/insights", label: "Insights", icon: Lightbulb, description: "Heatmap e diagnósticos" },
];

export default function PreviewIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Preview com dados mockados</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualize o design das telas sem precisar de banco de dados ou GitHub.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {screens.map((screen) => (
          <Link
            key={screen.href}
            href={screen.href}
            className="group flex flex-col gap-3 rounded-xl border p-5 hover:bg-accent transition-colors"
          >
            <screen.icon className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div>
              <p className="font-medium">{screen.label}</p>
              <p className="text-sm text-muted-foreground">{screen.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
