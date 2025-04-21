# Fluxo de Desenvolvimento - Brasilit PWA

Este documento descreve o fluxo de desenvolvimento do projeto usando VS Code, GitHub, Supabase (backend e autenticação) e Vercel (frontend). O fluxo é otimizado para sincronizar essas ferramentas, com duas branches principais: `beta` (testes) e `final` (produção).

## Ferramentas

- **VS Code:** Editor para alterações no código.
- **GitHub:** Controle de versão, com branches `beta` (testes) e `final` (produção).
- **Supabase:** Backend, banco de dados e autenticação.
- **Vercel:** Hospedagem do frontend, com deploys automáticos.

## Fluxo de Trabalho Detalhado

### 1. Desenvolvimento no VS Code

1. Certifique-se de que o projeto está conectado ao repositório do GitHub (via Git).
2. Comece na branch beta para fazer suas alterações:
   ```bash
   git checkout beta
   ```
3. Faça suas mudanças, teste localmente (se possível), e commite:
   ```bash
   git add .
   git commit -m "Minhas alterações no beta"
   git push origin beta
   ```

### 2. GitHub como hub central

O GitHub é o coração do controle de versão. Após o push para a branch beta, o código está no repositório remoto. Você pode usar pull requests (PRs) para revisar o código, mas assumimos que está trabalhando solo ou com um time pequeno por agora.

### 3. Vercel para deploy automático da beta

Configure o Vercel para monitorar a branch beta:

1. No painel do Vercel, conecte seu repositório do GitHub.
2. Vá em "Settings" > "Git" e defina a branch beta como a "Preview Branch".
3. Isso faz com que todo push para beta gere um deploy de pré-visualização (ex.: brasilit-beta-xyz.vercel.app).
4. O Vercel detecta automaticamente as configurações do projeto e faz o build.
5. Teste o deploy da beta no Vercel para garantir que tudo funciona como esperado.

### 4. Supabase: integração com o backend

Se suas alterações afetam o Supabase (ex.: novas tabelas, APIs ou mudanças no schema), atualize o Supabase manualmente ou via CLI:

```bash
supabase db push
```

Faça isso antes ou depois do deploy no Vercel, dependendo se o frontend depende dessas mudanças. Se o Supabase só fornece APIs (sem ajustes), ele já estará pronto para o Vercel consumir os endpoints.

### 5. Promoção para a branch final

Quando a beta estiver testada e aprovada:

```bash
git checkout final
git merge beta
git push origin final
```

Configure o Vercel para usar a branch final como a "Production Branch" (em "Settings" > "Git"). Todo push para final vai direto para produção (ex.: brasilit.vercel.app).

## Ciclo completo

VS Code → GitHub (beta) → Vercel (preview) → Supabase (se necessário) → GitHub (final) → Vercel (produção).

## Por que Este Fluxo?

- **Separação clara:** Entre ambiente de teste (`beta`) e produção (`final`)
- **Deploy automático:** O Vercel puxa direto do GitHub sem precisar subir manualmente
- **Supabase como apoio:** Só atualize quando o backend mudar, mantendo o GitHub como "fonte da verdade"
- **Simplicidade:** Evita passos desnecessários e usa integrações nativas entre as ferramentas

## Dicas e Boas Práticas

- **Teste local:** Use `supabase start` para o backend e `vercel dev` para o frontend
- **Automatize:** Configure GitHub Actions para rodar `supabase db push` em pushes para beta ou final
- **Segurança:** Adicione `.env` ao `.gitignore` para proteger chaves do Supabase
