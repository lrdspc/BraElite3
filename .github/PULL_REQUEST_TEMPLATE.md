# Checklist para Pull Request

- [ ] O código foi testado no ambiente de preview (`beta`)?
- [ ] Se houve mudança no backend, o Supabase (staging) foi atualizado?
- [ ] O código está pronto para produção ou precisa de ajustes?
- [ ] O merge será feito de `beta` para `final` após aprovação?
- [ ] Todos os testes necessários foram realizados?

## Descrição
Descreva as principais mudanças deste PR, incluindo contexto e links para issues relevantes.

## Como testar
Inclua instruções claras para testar as alterações.

---

> **Atenção:** Após aprovação, lembre-se de:
> - Atualizar o Supabase produção (se necessário)
> - Fazer o merge para a branch `final` e push
> - Confirmar o deploy automático no Vercel para produção
