# Sincronização com GitHub

Este documento explica como sincronizar as alterações do projeto Brasilit PWA com o GitHub.

## Configuração Atual

O projeto já está configurado para sincronização com o GitHub:

- Repositório Git inicializado: ✅
- Repositório remoto configurado: ✅ (https://github.com/lrdspc/BraElite3.git)
- Branch principal: `main`

## Como Sincronizar Alterações

Para sincronizar suas alterações com o GitHub, siga estes passos:

### 1. Verificar o Status

Verifique quais arquivos foram modificados:

```bash
git status
```

### 2. Adicionar Alterações

Adicione os arquivos modificados ao staging:

```bash
# Adicionar arquivos específicos
git add caminho/para/arquivo

# Adicionar todos os arquivos modificados
git add .
```

### 3. Commit das Alterações

Faça um commit com uma mensagem descritiva:

```bash
git commit -m "Descrição das alterações realizadas"
```

### 4. Enviar para o GitHub

Envie as alterações para o repositório remoto:

```bash
git push origin main
```

## Boas Práticas

1. **Commits Frequentes**: Faça commits pequenos e frequentes, cada um com uma única responsabilidade.
2. **Mensagens Claras**: Escreva mensagens de commit descritivas que expliquem o que foi alterado e por quê.
3. **Pull Antes de Push**: Sempre faça `git pull` antes de `git push` para evitar conflitos.
4. **Branches**: Para funcionalidades maiores, considere criar branches separados:
   ```bash
   git checkout -b nome-da-feature
   # Trabalhe na feature
   git push origin nome-da-feature
   ```

## Comandos Úteis

- **Verificar histórico de commits**:
  ```bash
  git log
  ```

- **Desfazer alterações não commitadas**:
  ```bash
  git checkout -- caminho/para/arquivo
  ```

- **Atualizar repositório local**:
  ```bash
  git pull origin main
  ```

- **Verificar diferenças**:
  ```bash
  git diff
  ```

## Resolução de Problemas

### Conflitos de Merge

Se ocorrerem conflitos durante um pull ou merge:

1. Abra os arquivos com conflitos (marcados com `<<<<<<<`, `=======`, `>>>>>>>`)
2. Edite os arquivos para resolver os conflitos
3. Adicione os arquivos resolvidos com `git add`
4. Complete o merge com `git commit`

### Autenticação

Se houver problemas de autenticação:

1. Verifique se você está usando um token de acesso pessoal ou chave SSH
2. Para GitHub, tokens de acesso pessoal são recomendados em vez de senhas

## Status Atual

Todas as alterações do projeto Brasilit PWA já foram sincronizadas com o GitHub. O repositório está atualizado.