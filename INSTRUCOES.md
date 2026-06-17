# Instruções de execução do projeto

Esse projeto consiste em duas aplicações:

- `financas-api` (Backend)
- `financas-webapp` (Frontend, onde será desenvolvido o projeto)

Abaixo estão as instruções para executar cada uma delas. Certifique-se de ter o Java 21 e o Node.js instalados em sua máquina.

## Executando o Backend

1. Navegue até a pasta `financas-api`:

   ```bash
   cd financas-api
   ```

2. Compile e execute a aplicação Spring Boot:

   ```bash
   ./mvnw spring-boot:run
   ```

   O backend estará disponível em `http://localhost:8080`. A documentação da API estará disponível em `http://localhost:8080/swagger-ui/index.html`.

Não é necessário utilizar PostgreSQL ou qualquer container. Essa aplicação utiliza um banco de dados em memória (H2) que é inicializado automaticamente com dados de exemplo a cada execução.

Altere os scripts dentro do diretório `src/main/resources/db/migration` caso queira modificar os dados iniciais ou criar mais dados (novos usuários, transações, categorias, etc.).

## Executando o frontend

Cada grupo deve preencher essa seção. Na versão inicial, o projeto é executado com os seguintes comandos:

1. Navegue até a pasta `financas-webapp`:

   ```bash
   cd financas-webapp
   ```

2. Instale as dependências do projeto:

   ```bash
   npm install
   ```

3. Inicie a aplicação frontend:

   ```bash
   npm run dev
   ```

O frontend estará disponível em `http://localhost:5173`.
