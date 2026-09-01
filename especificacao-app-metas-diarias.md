# Especificação de Produto — App de Metas Diárias com Incentivo

## 1. Visão Geral

Um aplicativo pessoal onde o usuário cadastra suas atividades/metas diárias, marca quando as conclui, e recebe recompensas e incentivos visuais por isso. O foco não é um RPG completo, e sim um sistema simples e recompensador: **cadastrar → cumprir → ser recompensado → se sentir motivado a continuar**.

**Objetivo duplo do projeto:**
- Uso pessoal real, para organizar e manter consistência nas atividades do dia a dia
- Peça de portfólio: demonstrar domínio de stack full-stack moderna, modelagem de dados e design de produto

---

## 2. Princípios de Design (por que funciona)

A pesquisa sobre hábitos e gamificação aponta alguns princípios centrais que vamos seguir, mesmo em uma versão simplificada:

- **Recompensa imediata**: o reforço (pontos, mensagem, animação) deve acontecer no instante em que a atividade é marcada como concluída — não depois. O cérebro reforça muito mais rápido a associação "esforço → ganho" quando a recompensa é instantânea.
- **Baixa fricção**: marcar uma atividade como concluída deve levar um toque, nunca um formulário.
- **Progresso visível**: barras, contadores e streaks tornam o progresso abstrato em algo tangível.
- **Tolerância a falhas**: um dia ruim não pode destruir todo o histórico — isso é o que faz as pessoas abandonarem o app depois de duas semanas.
- **Variedade de reforço**: mensagens de incentivo variadas (não sempre a mesma frase) mantêm o efeito de novidade.

---

## 3. Funcionalidades do MVP

### 3.1 Cadastro de Atividades
- Criar atividade com: título, descrição opcional, categoria (ex: saúde, trabalho, estudo, pessoal), frequência (diária, dias específicos da semana, ou pontual/meta única)
- Definir um "peso" ou nível de esforço (leve / médio / difícil) — usado para calcular a recompensa
- Editar e arquivar/excluir atividades

### 3.2 Conclusão de Atividades
- Marcar atividade como concluída com um toque, direto na tela principal
- Desmarcar (caso erro) dentro de uma janela de tempo curta
- Registro automático de data/hora de conclusão

### 3.3 Sistema de Recompensa
- Pontos por conclusão, proporcionais ao peso da atividade
- Mensagens de incentivo variadas e contextuais (ex: reconhecer sequências, retomadas após falha, marcos)
- Pequenas animações/feedback visual instantâneo ao concluir (sem exigir RPG completo)
- Conquistas/badges simples por marcos (ex: "7 dias seguidos", "primeira semana completa", "50 atividades concluídas")

### 3.4 Streaks (Sequências)
- Contagem de dias consecutivos cumprindo uma atividade (ou o conjunto de atividades do dia)
- Um "perdão" limitado por semana (streak freeze), para não punir demais um deslize pontual

### 3.5 Dashboard de Progresso
- Visão do dia atual (atividades pendentes/concluídas)
- Gráfico de consistência (ex: heatmap estilo GitHub, semanas x dias)
- Pontuação total e evolução ao longo do tempo
- Lista de conquistas desbloqueadas

### 3.6 Sistema de Nível (leve, opcional no MVP)
- Pontos acumulados sobem um "nível" geral do usuário, como forma simples de progressão de longo prazo — sem atributos de personagem, apenas um único indicador de evolução

---

## 4. Fora do Escopo do MVP (ideias para v2, se quiser expandir depois)

Fica registrado aqui para não perder as ideias, mas não faz parte da primeira versão:
- Atributos de personagem tipo RPG (força, intelecto etc.)
- Avatar customizável
- "Boss battles" semanais
- Itens/loot colecionáveis
- Modo social/comparação com outros usuários

---

## 5. Fluxos Principais de Usuário

**Fluxo 1 — Cadastrar nova atividade**
1. Usuário toca em "Nova Atividade"
2. Preenche título, categoria, frequência e peso
3. Salva → atividade aparece na lista do dia (se aplicável)

**Fluxo 2 — Concluir atividade**
1. Usuário vê lista de atividades do dia
2. Toca no checkbox/botão de concluir
3. Sistema calcula pontos, atualiza streak, dispara feedback visual e mensagem
4. Se atingiu um marco, exibe conquista desbloqueada

**Fluxo 3 — Revisar progresso**
1. Usuário acessa o dashboard
2. Vê heatmap de consistência, pontos totais, nível atual e conquistas

---

## 6. Modelo de Dados (visão geral)

```
users
- id
- nome
- email
- pontos_totais
- nivel
- streak_atual
- streak_freezes_disponiveis
- criado_em

activities
- id
- user_id (FK)
- titulo
- descricao
- categoria
- frequencia (diaria | dias_especificos | unica)
- peso (leve | medio | dificil)
- ativa (bool)
- criado_em

activity_logs
- id
- activity_id (FK)
- user_id (FK)
- concluida_em (timestamp)
- pontos_ganhos

achievements
- id
- titulo
- descricao
- criterio (ex: streak_7_dias, total_100_atividades)

user_achievements
- id
- user_id (FK)
- achievement_id (FK)
- desbloqueada_em
```

---

## 7. Stack Técnica Recomendada

| Camada | Tecnologia | Motivo |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript | Padrão atual de mercado, Server Components, boa vitrine de portfólio |
| Estilo | Tailwind CSS + shadcn/ui | Produtividade visual sem reinventar componentes |
| Backend/Banco | Supabase (PostgreSQL) | Auth, banco e API prontos, sem servidor próprio para manter |
| Autenticação | Supabase Auth + Row Level Security | Cada usuário só acessa seus próprios dados, nativamente |
| Deploy | Vercel | Deploy contínuo gratuito, ideal para portfólio |
| Testes | Vitest + Playwright | Sinal de qualidade para quem avalia o portfólio |

---

## 8. Roadmap de Desenvolvimento Sugerido

**Fase 1 — Fundação**
- Configurar projeto Next.js + Supabase + Tailwind
- Autenticação de usuário
- CRUD de atividades

**Fase 2 — Núcleo do produto**
- Tela do dia com conclusão de atividades
- Cálculo de pontos e streaks
- Feedback visual/mensagens de incentivo

**Fase 3 — Progresso e recompensas**
- Dashboard com heatmap de consistência
- Sistema de conquistas/badges
- Nível geral do usuário

**Fase 4 — Polimento (portfólio)**
- Responsividade e modo escuro
- Testes automatizados de fluxos críticos
- README detalhado + deploy público

---

## 9. Critérios de Sucesso

- **Uso pessoal**: o usuário volta ao app diariamente por pelo menos 3 semanas seguidas
- **Portfólio**: o projeto demonstra modelagem de dados clara, autenticação segura, testes e um deploy funcional e público
