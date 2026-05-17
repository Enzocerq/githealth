import { HeartPulse } from "lucide-react";

import { signIn } from "@/lib/auth";
import { GitHubIcon } from "@/components/icons/github-icon";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl border bg-background shadow-sm">
            <HeartPulse className="size-6 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">GitHealth</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre com sua conta do GitHub para começar.
            </p>
          </div>
        </div>

        {/* Formulário de login */}
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            <GitHubIcon className="size-5" />
            Continuar com GitHub
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Ao entrar, você autoriza leitura dos seus repositórios e atividade pública.
        </p>
      </div>
    </div>
  );
}
