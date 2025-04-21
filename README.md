# Fluxo de Desenvolvimento - Brasilit PWA

Este documento descreve o fluxo de desenvolvimento do projeto usando VS Code, GitHub, Supabase (backend e autenticação) e Vercel (frontend). O fluxo é otimizado para sincronizar essas ferramentas, com duas branches principais: `beta` (testes) e `final` (produção). É claro para desenvolvedores e sistemas automatizados.

## Ferramentas

* **VS Code:** Editor para alterações no código.
* **GitHub:** Controle de versão, com branches `beta` (testes) e `final` (produção).
* **Supabase:** Backend, banco de dados e autenticação.
* **Vercel:** Hospedagem do frontend, com deploys automáticos.

## Fluxo de Trabalho Detalhado

### 1. Desenvolvimento no VS Code

1. **Preparação Local:**
   * Clone o repositório: `git clone https://github.com/seu-usuario/BraElite3.git`
   * Instale dependências: `npm install`
   * Configure `.env` com variáveis do Supabase staging

2. **Desenvolvimento:**
   * Mude para branch beta: `git checkout beta`
   * Faça alterações e teste localmente
   * Commit e push:
     ```bash
     git add .
     git commit -m "feat: descrição da alteração"
     git push origin beta
     ```

### 2. Deploy Automático (Vercel)

1. **Deploy de Preview (beta):**
   * Push para `beta` dispara deploy automático
   * Vercel gera URL de preview: `brasilit-beta-xyz.vercel.app`
   * Usa variáveis de ambiente do Supabase staging

2. **Deploy de Produção (final):**
   * Merge de `beta` para `final` dispara deploy
   * Vercel atualiza `brasilit.vercel.app`
   * Usa variáveis de ambiente do Supabase produção

### 3. Gerenciamento do Supabase

1. **Alterações no Schema:**
   * Crie nova migração: `supabase migration new nome_migracao`
   * Edite o SQL em `supabase/migrations/`
   * Aplique no staging: `supabase db push`

2. **Promoção para Produção:**
   * Após testes em staging, aplique em produção:
   * `supabase db push --project-ref prod-xxx`

## Fluxo Completo

1. Desenvolvimento local (VS Code)
2. Push para `beta`
3. Deploy automático Vercel (preview)
4. Testes em staging
5. Merge para `final`
6. Deploy automático Vercel (produção)

## Por que Este Fluxo?

* **Separação clara:** Ambientes de teste (`beta`) e produção (`final`) distintos
* **Deploy automático:** Integração nativa Vercel + GitHub
* **Controle de banco:** Migrações Supabase versionadas
* **Simplicidade:** Fluxo linear e claro

## Dicas e Boas Práticas

* **Ambiente Local:**
  * Use `vercel dev` para testar frontend
  * Use `supabase start` para banco local
  * Sempre teste antes do push

* **Segurança:**
  * Nunca commite `.env`
  * Use secrets do GitHub para CI/CD
  * Mantenha tokens Supabase seguros

* **Automação:**
  * Configure GitHub Actions para:
    * Testes automatizados
    * Linting/formatação
    * Migrações Supabase

* **Documentação:**
  * Documente mudanças no schema
  * Mantenha README atualizado
  * Use commits semânticos
