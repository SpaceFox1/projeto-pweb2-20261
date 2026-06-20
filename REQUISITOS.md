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

## RF05 — Cadastro de Metas Financeiras (Etapa 2)

## RF06 - Limites de Gastos (Etapa 2)

## RF07 - Definido pelo grupo (Etapa 2)
