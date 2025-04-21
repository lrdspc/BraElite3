# Configuração de Variáveis de Ambiente

## Vercel

- Configure deploy automático para as branches:
  - `beta` (preview/staging)
  - `final` (produção)
- Adicione variáveis de ambiente específicas por branch em:
  - Vercel > Project Settings > Environment Variables
- Exemplos de variáveis:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE`
  - Outras chaves sensíveis do seu projeto

## Supabase

- Crie dois projetos separados:
  - **Staging**: use as credenciais na branch `beta`
  - **Produção**: use as credenciais na branch `final`
- Documente as URLs e chaves de cada ambiente para referência da equipe.

## Integração com Supabase - Projeto "Bra-Elite"

### Variáveis de Ambiente

Adicione no Vercel as seguintes variáveis de ambiente, obtidas no painel do Supabase do projeto "Bra-Elite":

- `SUPABASE_URL` (URL do projeto)
- `SUPABASE_ANON_KEY` (chave pública)
- `SUPABASE_SERVICE_ROLE` (chave de service role, se necessário)

Configure-as separadamente para os ambientes:
- **Staging (`beta`)**: use as credenciais do Supabase para staging
- **Produção (`final`)**: use as credenciais do Supabase para produção

### Atualização do Supabase (Checklist)

- [ ] Se houver alterações no backend, execute:
  - Staging: `supabase db push` usando as credenciais do ambiente de staging
  - Produção: `supabase db push` usando as credenciais do ambiente de produção (apenas após aprovação dos testes)
- [ ] Documente toda alteração de schema/migração via Pull Request ou Issue

### Dicas
- Nunca use as chaves de produção em ambientes de teste.
- Mantenha os ambientes sincronizados, mas só promova para produção após validação.

---

> Consulte o README.md e os templates de PR/issue para garantir o fluxo correto.
> Consulte este documento e o README.md sempre que for necessário atualizar variáveis ou ambientes do Supabase.
