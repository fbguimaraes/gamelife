# Metas Diárias

Aplicativo pessoal de metas diárias com sistema de recompensa: cadastre atividades, marque-as como concluídas e receba pontos, streaks e conquistas por manter consistência. Não é um RPG — é um sistema de hábitos com reforço positivo simples, direto e de baixa fricção.

Projeto com objetivo duplo: uso pessoal real e contínuo, e peça de portfólio técnico (modelagem de dados, autenticação, testes automatizados e design de produto).

## Funcionalidades

- Cadastro, edição e arquivamento de atividades (frequência diária, dias específicos da semana, ou pontual)
- Conclusão de atividades com 1 toque, com janela de 15s para desfazer
- Pontos por conclusão, proporcionais ao peso da atividade (leve/médio/difícil)
- Streak (sequência de dias) com regra de 50% de consistência diária e 1 "freeze" semanal para perdoar um dia perdido
- Mensagens de incentivo contextuais (streak, retomada após pausa, marcos)
- Conquistas desbloqueadas automaticamente por marcos de streak e de atividades concluídas
- Dashboard com heatmap de consistência (estilo GitHub), pontos totais e nível geral
- Autenticação própria (cadastro/login/logout) com Supabase Auth + Row Level Security

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + React 19 |
| Estilo | Tailwind CSS v4 + shadcn/ui (Base UI) |
| Backend/Banco | Supabase (PostgreSQL, Auth, Row Level Security) |
| Testes | Vitest (lógica pura) + Playwright (fluxos E2E) |
| Deploy | Vercel |

## Como rodar localmente

Pré-requisitos: Node.js 20+ e uma conta Supabase (gratuita).

```bash
git clone https://github.com/fbguimaraes/gamelife.git
cd gamelife
npm install
```

Crie um projeto no [Supabase](https://supabase.com) (ou use um já existente) e aplique o schema: rode, em ordem, os arquivos de `supabase/migrations/` no SQL Editor do painel Supabase.

Copie `.env.example` para `.env.local` e preencha com os dados do seu projeto (Project Settings → Data API):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Testes

```bash
npm run test       # Vitest — lógica pura (streak, pontos, nível, mensagens de incentivo)
npm run test:e2e   # Playwright — fluxos de UI (cadastro e conclusão de atividade)
```

Os testes E2E rodam contra um projeto Supabase real, usando uma conta de teste descartável. Defina `E2E_TEST_EMAIL` e `E2E_TEST_PASSWORD` em `.env.local` (ver `.env.example`) antes de rodar `npm run test:e2e`.

## Decisões de arquitetura

- **Streak e heatmap são recalculados do histórico, não incrementados.** A cada conclusão/desfeita, `recalculateStreak` (`src/lib/streak.ts`) reconstrói a sequência inteira a partir de `activity_logs`, em vez de manter um contador incremental — evita estados inconsistentes e é barato o suficiente na escala de um app pessoal. A função central (`computeStreak`) é pura e testável sem banco; o wrapper de I/O só busca e grava dados.
- **`src/lib/day-consistency.ts` é a fonte única de verdade de "o que era aplicável em cada dia"**, compartilhada entre a tela "Meu Dia", o cálculo de streak e o heatmap de consistência — os três sempre concordam sobre o que contou ou não em um dia.
- **Row Level Security faz o isolamento entre usuários**, não filtros manuais no código: a maioria das queries não passa `user_id` explicitamente, confiando nas políticas RLS do Supabase.
- **Sem cron/job em background.** Streak, nível e conquistas são recalculados de forma síncrona a cada ação do usuário (concluir/desfazer), não por um processo agendado — simplicidade sobre infraestrutura, adequado a um app de usuário único.

A especificação original de produto está em [`especificacao-app-metas-diarias.md`](./especificacao-app-metas-diarias.md).

## Estrutura do projeto

```
src/
  app/
    (app)/          rotas autenticadas: Meu Dia, Atividades, Progresso, Conquistas
    login/, cadastro/  autenticação
  components/ui/     componentes shadcn/ui
  lib/               lógica de domínio (streak, pontos, nível, conquistas, incentivo)
  lib/supabase/      clients Supabase (browser, server, middleware)
supabase/migrations/ schema do banco, em ordem
e2e/                 testes Playwright
```
