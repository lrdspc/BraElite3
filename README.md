# Brasilit PWA - Sistema de Vistorias Técnicas

Um aplicativo web progressivo (PWA) desenvolvido para a Brasilit, permitindo que técnicos realizem vistorias de campo com recursos offline robustos e funcionalidades avançadas.

## Principais Funcionalidades

- ✅ **Operação Offline**: Funcionamento completo em áreas sem conexão com sincronização automática ao retornar online
- 📱 **Design Mobile-First**: Interface otimizada para dispositivos móveis, com suporte completo a tablets e desktops
- 📋 **Workflow de Inspeção**: Processo guiado em etapas para coleta de dados estruturada
- 📷 **Captura de Evidências**: Fotos com marcações e anotações durante as vistorias
- 📍 **Geolocalização**: Registro automático de coordenadas e preenchimento de endereços
- 📊 **Relatórios Detalhados**: Geração automática de relatórios com todas as evidências coletadas
- 🔄 **Sincronização**: Sistema robusto de sincronização com o servidor principal

## Tecnologias

- **Frontend**: React.js com TypeScript
- **UI**: Tailwind CSS com componentes shadcn/ui
- **Armazenamento Local**: IndexedDB para persistência offline
- **PWA**: Suporte total a recursos PWA (Service Workers, Cache API, etc)
- **Backend**: Node.js com Express
- **Dados**: Suporte a PostgreSQL e armazenamento em memória para desenvolvimento

## Fluxo de Deploy e Branches

Este projeto utiliza um fluxo de trabalho moderno com branches dedicadas para ambientes de staging e produção, integração contínua com Vercel e ambientes separados no Supabase.

### Fluxograma ASCII

```
+---------------+
| Start         |
+---------------+
      |
      v
+---------------+
| Edit in Cursor|
+---------------+
      |
      v
+---------------+
| Commit to beta|
+---------------+
      |
      v
+---------------+
| Push to beta  |
+---------------+
      |
      v
+---------------+
| Update Supabase staging (if needed) |
+---------------+
      |
      v
+---------------+
| Vercel deploys preview |
+---------------+
      |
      v
+---------------+
| Test preview  |
+---------------+
      |
      v
+---------------+
| On approval:  |
| - Update Supabase production (if needed) |
| - Merge to final |
| - Push to final |
+---------------+
      |
      v
+---------------+
| Vercel deploys production |
+---------------+
      |
      v
+---------------+
| End           |
+---------------+
```

### Resumo do Processo

1. Edite o código localmente (Cursor, VS Code, etc).
2. Commit e push para a branch `beta`.
3. O Vercel faz deploy automático no ambiente de preview.
4. Se houver mudanças no backend, atualize o Supabase staging.
5. Teste o preview.
6. Após aprovação:
   - Atualize o Supabase produção (se necessário).
   - Faça merge de `beta` para `final`.
   - Push para `final`.
7. O Vercel faz deploy automático em produção.

### Dicas de Configuração

- **Vercel**: Configure deploys automáticos para as branches `beta` e `final` e variáveis de ambiente específicas por branch.
- **Supabase**: Use um projeto para staging (branch beta) e outro para produção (branch final). Atualize os ambientes conforme mudanças no backend.
- **GitHub**: Utilize Pull Requests para promover código de `beta` para `final`.

## Pré-requisitos

- Node.js 20.x
- npm 10.x ou superior

## Instalação

```bash
# Clone o repositório
git clone https://github.com/brasilit/pwa-vistorias.git
cd pwa-vistorias

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## Uso em Produção

Para compilar o aplicativo para produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados no diretório `dist`.

## Contribuição

1. Faça o fork do projeto
2. Crie sua branch de funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit de suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Envie para o branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Todos os direitos reservados à Brasilit © 2025. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Para questões relacionadas ao projeto, entre em contato com a equipe de desenvolvimento da Brasilit.

## Troubleshooting

### Erro de conexão ao iniciar o servidor

Se você encontrar um erro como `Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:5000`, tente:

1. Modificar o endereço de binding para `localhost` em vez de `0.0.0.0`
2. Usar uma porta diferente (como 3000 ou 8080)
3. Verificar se não há outros serviços usando a mesma porta
4. Usar uma versão LTS do Node.js (como a 20.x recomendada)
