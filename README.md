# README.md - Fluxo de Desenvolvimento

Este documento descreve como sincronizar o desenvolvimento do projeto usando VS Code, GitHub, Supabase (backend e autenticação) e Vercel (frontend). O fluxo é projetado para ser claro, utilizando duas branches principais: `beta` (testes/staging) e `final` (produção).

*(Nota: Embora usemos `final` aqui, `main` é o nome padrão e mais comum para a branch de produção em muitos projetos.)*

## Ferramentas

*   **VS Code:** Editor para desenvolvimento e alterações no código.
*   **GitHub:** Repositório central para controle de versão, com branches `beta` (testes/staging) e `final` (produção).
*   **Supabase:** Backend como serviço (BaaS), fornecendo banco de dados e autenticação via email.
*   **Vercel:** Plataforma para hospedagem e deploy contínuo do frontend.

## Configuração Inicial

1.  **VS Code:**
    *   Clone o repositório do GitHub: `git clone <url-do-repositorio>`
    *   Navegue até a pasta: `cd <nome-do-repositorio>`
    *   Instale as dependências do projeto (ex: `npm install` ou `yarn install`).
    *   Configure variáveis de ambiente locais em um arquivo `.env` para conectar ao Supabase durante o desenvolvimento (ex.: `SUPABASE_URL` e `SUPABASE_ANON_KEY`). **Adicione `.env` ao seu arquivo `.gitignore`!**
    *   Instale extensões úteis: GitLens, Prettier, ESLint, e a extensão oficial do Supabase (se disponível/aplicável).
    *   Instale a [Supabase CLI](https://supabase.com/docs/guides/cli) para gerenciamento do banco de dados local e migrações.

2.  **Supabase:**
    *   Crie **dois projetos** no painel do Supabase:
        *   Um para **Staging** (associado à branch `beta`).
        *   Um para **Produção** (associado à branch `final`).
    *   Em **ambos** os projetos:
        *   Habilite a autenticação por email (e outros provedores, se necessário) na seção "Authentication".
        *   Configure as URLs de redirecionamento (`Site URL`, `Additional Redirect URLs`) em "Authentication" -> "URL Configuration".
        *   Personalize os templates de email em "Authentication" -> "Templates".
    *   Guarde as **URLs** e as chaves **`anon key`** de API para cada um dos projetos (Staging e Produção). Elas serão usadas nas variáveis de ambiente.
    *   Localmente, conecte a CLI ao seu projeto (use o de staging para desenvolvimento): `supabase login`, depois `supabase link --project-ref <staging-project-id>`.

3.  **Vercel:**
    *   Conecte seu repositório GitHub ao Vercel.
    *   Configure as **Variáveis de Ambiente** no painel do seu projeto Vercel ("Settings" -> "Environment Variables"):
        *   **Production Environment:** Adicione `SUPABASE_URL` e `SUPABASE_ANON_KEY` com os valores do seu projeto Supabase de **Produção**.
        *   **Preview Environment:** Adicione `SUPABASE_URL` e `SUPABASE_ANON_KEY` com os valores do seu projeto Supabase de **Staging**. Aplique essas variáveis à branch `beta`.
        *   *(Opcional) Development Environment:* Pode configurar variáveis para o comando `vercel dev`, mas geralmente o `.env` local é usado.*
    *   Configure as **Branches de Deploy** ("Settings" -> "Git"):
        *   **Production Branch:** Defina como `final`.
        *   **Preview Branches:** Certifique-se de que `beta` esteja incluída ou que todas as branches (exceto a de produção) gerem previews.

## Fluxo de Trabalho Detalhado

1.  **Desenvolvimento Local (VS Code):**
    *   Certifique-se de estar na branch `beta`: `git checkout beta`. Se estiver iniciando uma nova funcionalidade, crie uma branch a partir da `beta`: `git checkout -b feature/nome-da-feature beta`.
    *   Faça as alterações necessárias no código.
    *   Teste localmente usando o servidor de desenvolvimento (ex: `npm run dev`) e, se necessário, o ambiente Supabase local (`supabase start`).
    *   **Se houver alterações no Schema do Banco de Dados:**
        *   Gere um novo arquivo de migração: `supabase migration new nome_descritivo_da_migracao`.
        *   Edite o arquivo SQL gerado em `supabase/migrations` com suas alterações `CREATE TABLE`, `ALTER TABLE`, etc.
        *   Aplique a migração localmente (se estiver usando Supabase local): `supabase db reset` (cuidado, apaga dados locais!) ou aplique manualmente.
    *   Adicione e commite suas alterações e os novos arquivos de migração: `git add .`, `git commit -m "feat: Descrição das mudanças"`.
    *   Envie sua branch para o GitHub: `git push origin feature/nome-da-feature` (ou `git push origin beta` se trabalhou diretamente nela).

2.  **Revisão e Merge para `beta` (GitHub):**
    *   Se usou uma branch de feature, abra um **Pull Request** (PR) no GitHub de `feature/nome-da-feature` para `beta`.
    *   Revise o código, discuta as alterações.
    *   Após a aprovação, faça o merge do PR para a branch `beta`.

3.  **Deploy de Staging (Vercel & Supabase):**
    *   O merge/push para `beta` aciona automaticamente um **Deploy de Preview** na Vercel.
    *   A Vercel construirá o frontend usando as variáveis de ambiente do Supabase de **Staging**.
    *   **Aplique as Migrações no Supabase Staging:**
        *   Use a CLI conectada ao projeto de Staging: `supabase migration up --project-ref <staging-project-id>` (ou configure uma GitHub Action para fazer isso automaticamente no merge para `beta`).
    *   Acesse a URL de preview da Vercel (ex: `meu-projeto-git-beta-org.vercel.app`) e teste exaustivamente a aplicação com o backend de Staging.

4.  **Aprovação e Promoção para Produção:**
    *   Se os testes no ambiente de Staging/Preview forem bem-sucedidos:
        *   Abra um **Pull Request** no GitHub de `beta` para `final`.
        *   Revise as alterações que serão enviadas para produção.
        *   Após a aprovação, faça o merge do PR para a branch `final`.

5.  **Deploy de Produção (Vercel & Supabase):**
    *   O merge/push para `final` aciona automaticamente um **Deploy de Produção** na Vercel.
    *   A Vercel construirá o frontend usando as variáveis de ambiente do Supabase de **Produção**.
    *   **Aplique as Migrações no Supabase Produção:**
        *   Use a CLI apontando para o projeto de Produção: `supabase migration up --project-ref <production-project-id>` (ou configure uma GitHub Action para isso no merge para `final`). **Faça isso com cuidado!**
    *   Acesse a URL de produção (ex: `meu-projeto.vercel.app`) e verifique se tudo está funcionando como esperado.

## Fluxograma ASCII

```
+--------------------------------+
| Início                         |
+--------------------------------+
          |
          v
+--------------------------------+
| 1. Editar no VS Code           |
|    (em branch `beta` ou feature) |
+--------------------------------+
          |
          v
+--------------------------------+
| 2. Commit & Push (feature/beta)|
|    (Inclui Migrações SQL)      |
+--------------------------------+
          |
          v
+--------------------------------+
| 3. Merge para `beta` (via PR)  |
+--------------------------------+
          |
          |------------------------>+--------------------------------+
          |                         | 4. Vercel: Deploy Preview      |
          |                         |    (Automático, usa Supabase Staging)|
          |                         +--------------------------------+
          |                                         |
          v                                         v
+--------------------------------+      +--------------------------------+
| 5. Supabase: Aplicar Migrações |      | 6. Testar URL de Preview       |
|    no Staging (`migration up`) |      +--------------------------------+
+--------------------------------+
          |
          v
+--------------------------------+
| 7. Testes OK? --------------NO--> (Volta ao passo 1)
+--------------------------------+
          | YES
          v
+--------------------------------+
| 8. Merge `beta` para `final`   |
|    (via PR)                    |
+--------------------------------+
          |
          |------------------------>+--------------------------------+
          |                         | 9. Vercel: Deploy Produção     |
          |                         |    (Automático, usa Supabase Prod) |
          |                         +--------------------------------+
          |                                         |
          v                                         v
+--------------------------------+      +--------------------------------+
| 10. Supabase: Aplicar Migrações|      | 11. Verificar URL de Produção  |
|     na Produção (`migration up`)|      +--------------------------------+
+--------------------------------+
          |
          v
+--------------------------------+
| Fim                            |
+--------------------------------+
```

## Por que este Fluxo?

*   **Controle de Versão Centralizado:** O GitHub atua como a fonte da verdade para o código, facilitando a colaboração e o rastreamento.
*   **Isolamento de Ambientes:** Projetos Supabase separados para Staging e Produção garantem que testes não afetem dados reais e vice-versa.
*   **Deploy Contínuo Automatizado:** A integração GitHub + Vercel automatiza os deploys para Preview e Produção, agilizando a entrega.
*   **Gerenciamento de Schema Estruturado:** O uso de `supabase migration` permite versionar e aplicar alterações de banco de dados de forma consistente entre ambientes.
*   **Segurança:** Variáveis de ambiente e chaves de API são gerenciadas fora do código, através das configurações da Vercel e do arquivo `.env` local (ignorado pelo Git).

## Dicas Adicionais

*   **Teste Local Completo:** Use `supabase start` para rodar um ambiente Supabase completo localmente e `vercel dev` para simular o ambiente Vercel, testando o frontend e backend juntos antes do push.
*   **Autenticação:** Revise e personalize os templates de email (confirmação, recuperação de senha) no painel do Supabase para uma melhor experiência do usuário.
*   **Automação com GitHub Actions:** Crie workflows (`.github/workflows/`) para:
    *   Rodar linters e testes a cada push/PR.
    *   Aplicar migrações do Supabase automaticamente (`supabase migration up --project-ref ${{ secrets.SUPABASE_STAGING_PROJECT_ID }}`) quando um PR for mesclado em `beta`.
    *   Aplicar migrações do Supabase (`supabase migration up --project-ref ${{ secrets.SUPABASE_PRODUCTION_PROJECT_ID }}`) quando um PR for mesclado em `final`. (Use segredos do GitHub para armazenar os IDs dos projetos e o `SUPABASE_ACCESS_TOKEN`).
*   **Segurança:** Nunca, jamais, commite arquivos `.env` ou chaves de API diretamente no código. Use sempre variáveis de ambiente e o `.gitignore`.

Este fluxo estabelece um processo robusto e escalável para o desenvolvimento, teste e deploy do seu projeto.
