# Configuração dos Ambientes Vercel e Supabase

Este documento explica como configurar corretamente os ambientes Vercel e Supabase seguindo o fluxo de desenvolvimento definido no projeto.

## 1. Configuração do Supabase

### 1.1. Criação do Projeto

1. Acesse [https://app.supabase.io/](https://app.supabase.io/) e faça login
2. Clique em "New Project"
3. Preencha os dados do projeto:
   - Nome: `brasilit-app`
   - Senha de banco de dados: Crie uma senha forte
   - Região: Escolha a região mais próxima do Brasil (geralmente `us-east-1`)
4. Clique em "Create new project"

### 1.2. Configuração do Banco de Dados

1. Após a criação do projeto, vá para "SQL Editor"
2. Cole o conteúdo do arquivo `supabase/migrations/20250421_initial_schema.sql`
3. Clique em "Run" para criar as tabelas e configurações iniciais

### 1.3. Configuração da Autenticação

1. Vá para "Authentication" > "Settings"
2. Ative os provedores de autenticação desejados (Email, Google, etc.)
3. Configure as URLs de redirecionamento:
   - Site URL: `https://brasilit.vercel.app` (ou o domínio final)
   - Redirect URLs:
     - `https://brasilit.vercel.app/login`
     - `https://brasilit-beta.vercel.app/login`
     - `http://localhost:3000/login`

### 1.4. Obtenção das Credenciais

1. Vá para "Settings" > "API"
2. Copie:
   - URL do projeto
   - Anon Key (chave anônima)
   - Service Role Key (para uso no CI/CD)
3. Guarde essas informações para usar nas variáveis de ambiente

### 1.5. Migrações de Banco de Dados

Para gerenciar migrações:

```bash
# Conectar ao projeto Supabase
supabase link --project-ref SEU_PROJECT_ID

# Aplicar migrações
supabase db push

# Criar nova migração
supabase migration new nome_da_migracao

# A migração será criada em supabase/migrations/
```

## 2. Configuração do Vercel

### 2.1. Criação do Projeto

1. Acesse [https://vercel.com/](https://vercel.com/) e faça login
2. Clique em "New Project"
3. Importe o repositório do GitHub
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `./` (raiz)
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 2.2. Configuração das Branches

1. Vá para "Settings" > "Git"
2. Configure:
   - Production Branch: `final`
   - Preview Branches:
     - Ative "Preview branches different from Production branch"
     - Adicione a branch `beta`

### 2.3. Configuração das Variáveis de Ambiente

1. Vá para "Settings" > "Environment Variables"
2. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
   - Outras variáveis específicas do projeto
3. Configure os ambientes para cada variável:
   - Production: Variáveis para ambiente de produção
   - Preview: Variáveis para ambiente de testes
   - Development: Variáveis para ambiente local

## 3. Configuração do GitHub Actions

### 3.1. Configuração dos Secrets

Adicione os seguintes secrets no repositório GitHub (Settings > Secrets and Variables > Actions):

- `SUPABASE_ACCESS_TOKEN`: Token de acesso do Supabase (da sua conta)
- `SUPABASE_PROJECT_ID`: ID do projeto Supabase
- `VERCEL_TOKEN`: Token de API do Vercel
- `VERCEL_ORG_ID`: ID da organização no Vercel
- `VERCEL_PROJECT_ID`: ID do projeto no Vercel

### 3.2. Workflows

O projeto já está configurado com workflows para:

1. Teste e deploy automático no Vercel
2. Aplicação de migrações do Supabase

## 4. Desenvolvimento Local

### 4.1. Variáveis de Ambiente Locais

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis com valores do ambiente de desenvolvimento

### 4.2. Desenvolvimento com Supabase Local

Para usar o Supabase localmente:

```bash
# Inicia o Supabase localmente
supabase start

# Obtém as URLs e chaves locais
supabase status

# Para os serviços locais
supabase stop
```

### 4.3. Supabase CLI

Instale a CLI do Supabase para desenvolvimento:

```bash
# Windows (PowerShell)
iwr -useb https://cli.supabase.com/install.ps1 | iex

# macOS / Linux
curl -s https://cli.supabase.com/install.sh | bash
```

## 5. Fluxo de Trabalho

1. Desenvolva na branch `beta`
2. Teste no ambiente de preview gerado pelo Vercel
3. Quando tudo estiver pronto, mescle `beta` em `final`
4. O deploy para produção será automático
