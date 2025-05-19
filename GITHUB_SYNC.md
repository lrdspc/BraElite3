# Sincronização com GitHub

## Estrutura de Branches

O projeto utiliza uma estrutura simplificada com duas branches principais:

- `beta`: Ambiente de desenvolvimento e testes
- `final`: Ambiente de produção

## Fluxo de Trabalho

1. **Desenvolvimento na `beta`**
   - Todo desenvolvimento acontece na branch `beta`
   - Alterações são testadas e validadas neste ambiente

2. **Promoção para Produção**
   - Após validação, as alterações são promovidas para `final` via Pull Request
   - Revisão de código é obrigatória
   - Merge apenas após aprovação

## Comandos Úteis

- **Clonar Repositório**:
  ```bash
  git clone [url-do-repositório]
  cd [nome-do-projeto]
  ```

- **Mudar para Branch Beta**:
  ```bash
  git checkout beta
  ```

- **Atualizar Branch Local**:
  ```bash
  git pull origin beta
  ```

- **Commitar Alterações**:
  ```bash
  git add .
  git commit -m "tipo: mensagem"
  ```

- **Enviar Alterações**:
  ```bash
  git push origin beta
  ```

- **Verificar Status**:
  ```bash
  git status
  ```

- **Ver Histórico**:
  ```bash
  git log
  ```

## Boas Práticas

1. **Commits Frequentes**:
   - Faça commits pequenos e frequentes
   - Cada commit deve ter uma única responsabilidade
   - Use mensagens claras e descritivas

2. **Sincronização**:
   - Mantenha sua branch atualizada
   - Resolva conflitos localmente
   - Teste antes de push

3. **Pull Requests**:
   - Descreva claramente as mudanças
   - Adicione contexto necessário
   - Responda a feedbacks

## Convenções de Commit

Use prefixos para categorizar suas alterações:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## Resolução de Problemas

1. **Conflitos de Merge**:
   ```bash
   git pull origin beta
   # Resolva os conflitos no editor
   git add .
   git commit -m "fix: Resolve conflitos"
   ```

2. **Reverter Commit**:
   ```bash
   git reset --hard HEAD~1
   # Ou
   git revert [hash-do-commit]
   ```

3. **Limpar Branch Local**:
   ```bash
   git clean -fd
   git reset --hard origin/beta
   ```

## Suporte

Para questões ou problemas:
1. Consulte esta documentação
2. Abra uma issue no GitHub
3. Contate a equipe de desenvolvimento