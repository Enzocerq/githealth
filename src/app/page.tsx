import Link from "next/link";
import { HeartPulse, BarChart3, GitPullRequest, Zap } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-semibold">
            <HeartPulse className="size-5 text-rose-500" />
            GitHealth
          </div>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1 text-sm">
            <Zap className="size-3.5 text-amber-500" />
            Software Engineering Intelligence
          </div>

          <h1 className="text-5xl font-semibold tracking-tight">
            Sua saúde de engenharia,
            <br />
            em dados reais.
          </h1>

          <p className="text-lg text-muted-foreground">
            Conecte seu GitHub e visualize commits, cycle time, taxa de aceitação de PRs
            e o Score Wolter — tudo em um dashboard limpo e objetivo.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Conectar com GitHub
            </Link>
            <Link
              href="/preview/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Ver demo
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-16 md:grid-cols-3">
          <Feature
            icon={BarChart3}
            title="Score Wolter"
            description="Pontuação 0–100 que combina frequência de commits, qualidade de PRs, participação em reviews e tempo em bug fixes."
          />
          <Feature
            icon={GitPullRequest}
            title="Cycle & Lead Time"
            description="Saiba quanto tempo suas PRs ficam abertas e quanto tempo seu código aguarda revisão externa."
          />
          <Feature
            icon={Zap}
            title="Insights automáticos"
            description="Diagnósticos em português gerados por regras — sem IA generativa, sem aleatório."
          />
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <Icon className="size-6 text-primary" />
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
