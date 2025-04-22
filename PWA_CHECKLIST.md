# Checklist de Publicação e Manutenção PWA – BraElite3

## 1. Manifest e Assets
- [x] `manifest.json` válido, sem texto extra, com:
  - [x] `name`, `short_name`, `description`, `start_url`, `display`, `background_color`, `theme_color`, `scope`, `orientation`, `categories`, `lang`, `icons`, `screenshots`, `shortcuts`
- [x] Ícones em `/icons/` e screenshots em `/screenshots/`
- [x] Screenshots reais e atualizadas do app
- [x] Todos os caminhos do manifest conferidos (sem 404)

## 2. Service Worker
- [x] Fallback offline robusto (`offline.html`)
- [x] Estratégias de cache modernas (stale-while-revalidate, network first, etc.)
- [x] Atualização instantânea do SW (banner + skipWaiting)
- [x] Notificações push e background sync prontos (se aplicável)

## 3. Testes Automatizados
- [x] Teste E2E de fallback offline (`offline.spec.ts`)
- [x] Teste de instalação do PWA (`install.spec.ts`)
- [x] Teste de acessibilidade (`accessibility.spec.ts`)
- [ ] Teste de notificações push/background sync (opcional)

## 4. Monitoramento
- [x] Sentry integrado (erros JS e SW)
- [x] Web Vitals integrado (performance real)
- [ ] Dashboards revisados periodicamente

## 5. Acessibilidade
- [x] Teste automatizado com Axe
- [ ] Auditoria manual para casos complexos

## 6. SEO e Performance
- [x] URLs amigáveis, meta tags e schema.org (se aplicável)
- [x] Lighthouse score 90+ (PWA, Performance, Acessibilidade)

## 7. Publicação e Lojas
- [ ] Validar instalação em Android, iOS, Windows, ChromeOS
- [ ] Gerar screenshots para lojas (Play Store, Microsoft Store)
- [ ] Conferir requisitos específicos das lojas (ícones, descrições, privacidade)
- [ ] Testar atualização automática após deploy

## 8. Documentação
- [x] Estrutura de pastas e lógica PWA documentadas
- [x] Fluxo de atualização do SW explicado
- [ ] Instruções de build, deploy e rollback

---

## Como manter o padrão de excelência
- Rode os testes automatizados a cada PR e release
- Monitore Sentry e Web Vitals semanalmente
- Atualize screenshots e manifest sempre que mudar o visual do app
- Documente qualquer ajuste relevante na lógica do SW ou fluxo PWA
- Valide a instalação e funcionamento em dispositivos reais periodicamente

---

> Checklist baseado nas melhores práticas PWA/WebApp (Google, Mozilla, Microsoft, W3C) – atualizado em 2025.
