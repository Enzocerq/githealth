# GitHealth

GitHealth e uma plataforma de Software Engineering Intelligence para produtividade, eficiencia, colaboracao e qualidade de desenvolvimento usando dados reais do GitHub.

## Stack

- Next.js 15 App Router, React 19, TypeScript e Tailwind CSS
- shadcn/ui, lucide-react e Recharts
- NextAuth v5 com GitHub OAuth e Prisma Adapter
- Prisma + PostgreSQL via Neon ou Supabase
- Octokit REST com retry e throttling
- Vitest para testes do motor de metricas

## Setup local

1. Crie uma GitHub OAuth App:
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
2. Crie um banco PostgreSQL no Neon ou Supabase.
3. Copie `.env.example` para `.env.local` e preencha:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/githealth?sslmode=require"
AUTH_SECRET="gere-com-openssl-rand-base64-32"
GITHUB_ID="client-id"
GITHUB_SECRET="client-secret"
CRON_SECRET="opcional"
```

4. Rode:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Acesse `http://localhost:3000`.

## Fluxo do MVP

1. O usuario entra com GitHub.
2. No primeiro acesso ao dashboard, o sync inicial busca os ultimos 90 dias dos top 10 repositorios acessiveis.
3. O header possui o botao `Atualizar dados` para sync incremental usando `lastSyncAt`.
4. As telas leem apenas o PostgreSQL; Octokit fica restrito as rotas de sync.

## Score Wolter

```txt
Score = 0.30C + 0.25P + 0.20Q + 0.15R + 0.10B
```

- `C`: frequencia de commits, dias ativos e tamanho medio dos commits
- `P`: taxa de aceitacao de PRs e cycle time
- `Q`: aceitacao inicial e issues reabertas
- `R`: reviews feitas contra a media do time
- `B`: proporcao de tempo em bug fixing

Quando uma metrica nao existe, o componente fica `null` e seu peso e redistribuido proporcionalmente entre os componentes disponiveis. Todos os valores sao limitados entre 0 e 100.

Classificacao:

- `0-39`: Baixa produtividade
- `40-59`: Produtividade moderada
- `60-79`: Boa produtividade
- `80-100`: Alta produtividade

## Rotas

- `/dashboard`: visao geral, KPIs, Score Wolter e graficos evolutivos
- `/atividade`: commits, PRs, cycle time, lead time, TCM e tempo em review
- `/repositorios`: repositorios conectados, TP e participacao relativa
- `/colaboracao`: contribuidores, reviews e comparacao individual vs time
- `/insights`: heatmap temporal e diagnosticos determinísticos

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Observacoes

- O OAuth solicita `read:user`, `user:email` e `repo` para acessar repositorios privados do usuario quando permitido.
- Organizacoes com SSO podem exigir autorizacao adicional no GitHub.
- O cron diario pode chamar `POST /api/cron/daily-snapshot` com `Authorization: Bearer $CRON_SECRET`.
