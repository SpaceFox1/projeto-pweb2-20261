# Requisitos funcionais

## RF01 — Autenticação de Usuário

### Descrição

O usuário deve conseguir criar uma conta e acessar a aplicação com suas credenciais. Enquanto não autenticado, o acesso às demais telas deve ser bloqueado. A autenticação é o requisito base para todos os demais requisitos

### Detalhes Técnicos

- Telas de **Login** (`/login`) e **Cadastro** (`/register`) com formulários validados
- Após login bem-sucedido, redirecionar para `/`
- Implementar o componente `ProtectedRoute` via React Router para bloquear rotas privadas (descritas em outros requisitos)
- Armazenar `token` e dados do usuário em um slice do Redux
- Criar thunks `login` e `register` consumindo a API

### Critérios de Aceitação

- [ ] O usuário consegue criar uma conta com nome, email e senha
- [ ] O usuário consegue fazer login com email e senha válidos
- [ ] Credenciais inválidas exibem uma mensagem de erro clara
- [ ] Ao tentar acessar qualquer rota privada sem autenticação, o usuário é redirecionado para `/login`
- [ ] Após login, o usuário é redirecionado para a tela inicial

---

## RF02 — Registro de Transações

### Descrição

O usuário deve conseguir registrar suas receitas e despesas, informando o valor, tipo, categoria, data e uma descrição opcional. As transações registradas devem ser listadas em ordem cronológica.

### Detalhes Técnicos

- Telas de **listagem** (`/transactions`) e **criação** (`/transactions/new`) de transações
- Campos do formulário:
  - Valor;
  - Tipo (receita/despesa, ou pode derivar do valor digitado);
  - Categoria (alimentação, aluguel, parcelas...);
  - Data (padrão para o dia de hoje);
  - Descrição.
  - Tag (Opcional)
- Armazenar as `categorias` e a `lista de transações` em um slice do Redux.
  - Caso hajam muitas transações, implementar paginação (suportado pela API) ou scroll infinito para otimizar a performance, guarde no Redux apenas as transações da página atual.
- Criar thunks `fetchTransactions` e `createTransaction` consumindo a API

### Critérios de Aceitação

- [ ] O usuário consegue registrar uma transação preenchendo todos os campos obrigatórios
- [ ] A listagem exibe todas as transações do usuário com tipo, valor, categoria e data
- [ ] Não é possível submeter o formulário com campos obrigatórios vazios
- [ ] Após criar uma transação, o usuário é redirecionado para a listagem

---

## RF03 — Dashboard Financeiro

### Descrição

O usuário deve ter acesso a uma tela inicial com um resumo financeiro do mês atual, exibindo o saldo, o total de receitas, o total de despesas e as transações mais recentes.

### Detalhes Técnicos

- Tela principal na rota `/` protegida pelo `ProtectedRoute`
- Exibir: saldo atual, total de receitas e total de despesas do mês
- Listar as 5 transações mais recentes
- Utilizar **selectors derivados** sobre a `lista de transações` do Redux para calcular os valores — sem slice próprio para o dashboard

### Critérios de Aceitação

- [ ] A tela inicial exibe o saldo, total de receitas e total de despesas do mês corrente
- [ ] Os valores são recalculados automaticamente após o registro de uma nova transação
- [ ] As 5 transações mais recentes são listadas com tipo, valor e data
- [ ] Os dados exibidos estão sempre sincronizados com o estado do Redux

---

## RF04 - Definido pelo grupo - Gráficos (Etapa 1)

### Descrição

O usuário deve ter acesso a representações visuais e dinâmicas dos seus dados financeiros para facilitar a compreensão, dimensão e análise de seus hábitos de consumo. A aplicação deve renderizar gráficos interativos que ilustrem a distribuição de gastos por categoria e o balanço consolidado entre receitas e despesas, permitindo uma tomada de decisão financeira mais rápida.

### Detalhes Técnicos

- Exibição dos componentes gráficos na página Home, com o objetivo de deixar os dados já exibidos ainda mais visuais
- Os dados dos gráficos devem ser calculados em tempo de execução, mudando conforme adição de novas transações
- Os gráficos adicionados devem ter um tamanho e local fixo para serem visíveis
- Não há restrição sobre os tipos de gráficos a serem utilizados. Devem ser aqueles que melhor se encaixarem com as informações

### Critérios de Aceitação

- [ ] O usuário consegue visualizar o histórico de saldos ao longo do tempo
- [ ] O usuário consegue visualizar o histórico de gastos por mês
- [ ] O usuário consegue visualizar quanto seus gastos equivalem em relação a seu salário, em valores absolutos e em percentual
- [ ] O usuário consegue visualizar quanto foi seus gastos por categoria

## RF05 — Cadastro de Metas Financeiras

### Descrição

O usuário deve conseguir registrar metas financeiras de poupança, definindo nome, valor-alvo, data-limite e categoria opcional. O progresso de cada meta é calculado automaticamente com base nas receitas registradas no período.

### Detalhes Técnicos

- Telas de **listagem** (`/goals`) e **criação** (`/goals/new`) de metas, protegidas pelo `ProtectedRoute`
- Campos do formulário:
  - Nome da meta;
  - Valor-alvo;
  - Data-limite;
  - Categoria (opcional).
- Armazenar as metas em um slice `goalsSlice` do Redux
- Criar thunks `fetchGoals` e `createGoal` consumindo a API (`GET /goals`, `POST /goals`)
- Selector derivado `selectGoalProgress(goalId)` calculando percentual atingido com base nas transações de receita do slice de transações — sem slice próprio para o progresso
- **Testes automatizados obrigatórios (Vitest + React Testing Library)**:
  - `goalsSlice.test.ts`: estado inicial, reducers e thunks (usar `msw` para mock de API)
  - `goalSelectors.test.ts`: selector com 3 cenários — sem receitas (0%), progresso parcial e meta atingida (100%)
  - `GoalsList.test.tsx` (ou relativo ao seu componente): renderização da listagem com metas de fixture
  - `GoalForm.test.tsx` (ou relativo ao seu componente): validação de campos obrigatórios e submissão bem-sucedida
- Script `npm test` configurado com Vitest no `package.json`

### Critérios de Aceitação

- [ ] O usuário consegue criar uma meta com nome, valor-alvo e data-limite
- [ ] A listagem exibe todas as metas com barra de progresso percentual atualizada
- [ ] Não é possível submeter o formulário com campos obrigatórios vazios
- [ ] O selector de progresso é coberto por testes com cenários de 0%, parcial e 100%
- [ ] `npm test` passa sem erros

---

## RF06 — Limites de Gastos

### Descrição

O usuário deve conseguir definir limites mensais de gastos por categoria. O sistema deve alertar quando o gasto do mês corrente em uma categoria se aproximar ou ultrapassar o limite definido, utilizando Service Workers para cache offline e notificações — mesmo com a aba em segundo plano.

### Detalhes Técnicos

- Tela de gerenciamento de limites (`/spending-limits`), protegida pelo `ProtectedRoute`
- Campos do formulário:
  - Categoria;
  - Valor-limite (mensal).
- Armazenar os limites em um slice `spendingLimitsSlice` do Redux
- Criar thunks `fetchSpendingLimits`, `createSpendingLimit` e `deleteSpendingLimit` consumindo a API
- Selector derivado `selectSpendingStatus`: cruza os limites com as transações do mês atual e retorna `{ categoryId, limitAmount, spent, percentUsed }[]` — sem slice próprio
- **Service Worker** (`public/sw.js`, registrado em `main.tsx` via `navigator.serviceWorker.register`):
  - Estratégia **cache-first** para `GET /categories` e `GET /spending-limits` (Cache API)
  - Estratégia **network-first com fallback** para `GET /transactions` (exibe dados cacheados quando offline)
  - **Notificação** via Web Notifications API: quando uma transação é criada com sucesso e `percentUsed ≥ 80%` na categoria, o Service Worker envia uma notificação ao usuário (solicitar permissão com `Notification.requestPermission()`)
  - Página de **offline fallback** exibida quando nenhum recurso em cache for encontrado
- Integração no formulário `/transactions/new`: ao preencher categoria e valor, verificar `spendingStatus` no Redux e exibir alerta inline se `percentUsed ≥ 100%`

### Critérios de Aceitação

- [ ] O usuário consegue definir um limite mensal por categoria
- [ ] A tela exibe o progresso de gastos vs. limite com indicação visual (verde / amarelo ≥ 80% / vermelho ≥ 100%)
- [ ] Uma Web Notification é exibida quando o gasto em uma categoria atinge 80% do limite ao criar uma transação
- [ ] A aplicação exibe dados cacheados (transações, limites e categorias) quando offline
- [ ] O formulário de nova transação exibe alerta inline quando a categoria selecionada já atingiu o limite

---

## RF07 - Definido pelo grupo (Etapa 2)

### Descrição

O usuário deve conseguir converter valores entre diferentes moedas utilizando as cotações mais recentes disponíveis. A funcionalidade deve permitir simulações rápidas de conversão, auxiliando usuários que realizam compras, viagens ou investimentos internacionais. Este requisito deverá ser implementado como um microfrontend, funcionando de forma independente da aplicação principal.

### Detalhes Técnicos

- Implementar como um microfrontend independente, integrado à aplicação principal
- Tela de conversão (`/exchange`) protegida pelo `ProtectedRoute`
- Campos do formulário:
  - Valor a ser convertido;
  - Moeda de origem;
  - Moeda de destino.
- Buscar as cotações por meio de uma API de câmbio
- Exibir o valor convertido utilizando a cotação mais recente disponível
- Permitir a inversão das moedas de origem e destino por meio de um botão de troca
- Exibir a data e hora da última atualização da cotação
- Criar um thunk `fetchExchangeRates` para consumir a API de câmbio
- Armazenar as cotações obtidas em um slice `exchangeSlice` do Redux para evitar requisições desnecessárias durante a navegação

### Critérios de Aceitação

- [ ] O usuário consegue converter um valor entre duas moedas disponíveis
- [ ] O valor convertido é calculado utilizando a cotação mais recente retornada pela API
- [ ] Não é possível realizar a conversão com campos obrigatórios vazios
- [ ] O usuário consegue inverter rapidamente as moedas de origem e destino
- [ ] A tela informa a data e hora da última atualização das cotações
- [ ] O módulo de cálculo de câmbio é carregado como um microfrontend independente da aplicação principal

---
## RF08 - Definido pelo grupo (Etapa 2) - Exportador de Dados

### Descrição

O usuário deve conseguir exportar os seus dados financeiros (transações, limites e metas) em diferentes formatos e também ser capaz de enviá-los rapidamente em aplicativos de mensagem e outras redes. A funcionalidade deve atuar de forma independente, oferecendo diferentes opções de manipulação e compartilhamento de dados com uma interface rica. 

### Detalhes Técnicos

- Implementar como um microfrontend independente (`financas-exportador`), integrado à aplicação principal.
- Tela de ferramentas de dados (`/export`) protegida pelo `ProtectedRoute`.
- Opções disponíveis na interface modular:
  - **Exportação em `.pdf`**: (usando `jsPDF` e `jspdf-autotable`), com um relatório detalhado gerado dinamicamente incluindo logo desenhada em API gráfica, gráficos em barra de limites e tabelas customizadas de transações e metas.
  - **Exportação em `.csv`**: compatível com Excel e Google Sheets, mesclando transações com as metas e limites mensais existentes.
  - **Compartilhamento (Redes Sociais)**: utilizando texto formatado com emojis organizando saldo, transações, limites e maiores despesas, podendo ser copiado rapidamente ou compartilhado via API nativa do sistema (`navigator.share`).
- A aplicação principal puxa informações (`transactions`, `goals` e `limits`) do Redux e injeta diretamente nas propriedades do Web Component (`<export-widget>`).
- O widget renderiza utilizando `IIFE` (Vite Lib Mode) sem afetar o pacote de estilos e lógicas da aplicação raiz.

### Critérios de Aceitação

- [x] A tela possui opções independentes (Tabs) para exportar em PDF, CSV e compartilhar nativamente.
- [x] O relatório PDF é gerado corretamente e inclui gráficos e sumarizações matemáticas dos módulos, além de estilos.
- [x] O documento CSV e sua pré-visualização contêm todos os dados do banco, formatando com sucesso arrays complexos.
- [x] O botão de compartilhamento utiliza API nativa do navegador (`navigator.share`), e uma opção manual via `clipboard.writeText` existe como fallback.
- [x] A funcionalidade roda através de um microfrontend isolado (`export-widget`) hospedado externamente (via src injection) para simular integração descentralizada.
