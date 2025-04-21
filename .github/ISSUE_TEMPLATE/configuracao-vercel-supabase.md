---
name: Configuração de Vercel e Supabase
about: Checklist para configuração dos ambientes de deploy
labels: ['infra', 'workflow']
---

# Checklist de Configuração

- [ ] Vercel está conectado ao repositório GitHub
- [ ] Deploy automático configurado para as branches `beta` (preview) e `final` (produção)
- [ ] Variáveis de ambiente específicas por branch configuradas no Vercel
- [ ] Dois projetos Supabase criados: um para staging (branch beta) e outro para produção (branch final)
- [ ] Credenciais do Supabase corretamente adicionadas nas variáveis do Vercel
- [ ] Documentação atualizada no README.md

## Instruções

1. Acesse o painel do Vercel e conecte este repositório.
2. Em "Git", configure deploy automático para as branches `beta` e `final`.
3. Em "Environment Variables", adicione as variáveis de cada ambiente.
4. No Supabase, crie dois projetos (staging e produção) e anote as URLs/keys.
5. Atualize este checklist conforme concluir cada etapa.

---

> Consulte o README.md para detalhes do fluxo e links úteis.
