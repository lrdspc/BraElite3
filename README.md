# README.md - Fluxo de Desenvolvimento

Este documento descreve como sincronizar o desenvolvimento do projeto usando VS Code, GitHub, Supabase (backend e autenticação) e Vercel (frontend). O fluxo é projetado para ser claro, utilizando duas branches principais: `beta` (testes/staging) e `final` (produção).

*(Nota: Embora usemos `final` aqui, `main` é o nome padrão e mais comum para a branch de produção em muitos projetos.)*

## Estrutura de Branches

- `beta`: Branch de desenvolvimento e testes
  - Todas as novas features são desenvolvidas aqui
  - Ambiente de staging/testes
  - Deploy automático para preview na Vercel

- `final`: Branch de produção
  - Código estável e testado
  - Deploy automático para produção

## Fluxo de Trabalho

1. **Desenvolvimento (`beta`):**
   - Clone o repositório: `git clone [url-do-repo]`
   - Mude para a branch beta: `git checkout beta`
   - Desenvolva suas alterações
   - Commite e envie: 
     ```bash
     git add .
     git commit -m "feat: Descrição das mudanças"
     git push origin beta
     ```

2. **Deploy para Produção:**
   - Crie um Pull Request de `beta` para `final`
   - Após revisão e testes, faça o merge
   - O deploy para produção será automático

## Boas Práticas

1. **Commits:**
   - Faça commits frequentes e atômicos
   - Use mensagens descritivas seguindo Conventional Commits
   - Exemplo: `feat: Adiciona autenticação com Google`

2. **Pull Requests:**
   - Descreva claramente as mudanças
   - Adicione screenshots se houver mudanças visuais
   - Mencione issues relacionadas

3. **Sincronização:**
   - Mantenha sua branch atualizada:
     ```bash
     git pull origin beta
     ```
   - Resolva conflitos localmente antes de push

## Ambientes

1. **Local:**
   - Desenvolvimento inicial
   - Testes unitários
   - Supabase local (opcional)

2. **Staging (beta):**
   - Testes integrados
   - QA
   - Validação de features

3. **Produção (final):**
   - Ambiente live
   - Monitoramento
   - Backup automático

## Ferramentas e Integrações

- **GitHub Actions:** CI/CD automático
- **Vercel:** Deploy automático
- **Supabase:** Backend e autenticação

## Troubleshooting

1. **Conflitos de Merge:**
   ```bash
   git pull origin beta
   # Resolva conflitos em seu editor
   git add .
   git commit -m "fix: Resolve conflitos de merge"
   ```

2. **Reverter Mudanças:**
   ```bash
   git reset --hard HEAD~1  # Último commit
   git push origin beta --force  # Cuidado com force push!
   ```

## Suporte

Para questões ou problemas:
1. Verifique a documentação
2. Abra uma issue no GitHub
3. Contate a equipe de desenvolvimento