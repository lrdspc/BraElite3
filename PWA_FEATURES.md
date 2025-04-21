# Brasilit PWA - Recursos e Implementação

Este documento descreve os recursos de Progressive Web App (PWA) implementados no projeto Brasilit Vistorias Técnicas, seguindo as melhores práticas da Microsoft.

## Recursos Implementados

### 1. Instalação Personalizada

- Implementamos o evento `beforeinstallprompt` para capturar e controlar o prompt de instalação
- Adicionamos um botão "Instalar" visível na interface do usuário
- O botão aparece automaticamente quando o navegador detecta que o aplicativo é instalável

```typescript
// Uso do botão de instalação
import { isInstallPromptAvailable, promptInstall } from '@/lib/pwa';

// Verificar se o prompt de instalação está disponível
const isAvailable = isInstallPromptAvailable();

// Mostrar o prompt de instalação quando o usuário clicar no botão
const handleInstallClick = async () => {
  const accepted = await promptInstall();
  // accepted será true se o usuário aceitou a instalação
};
```

### 2. Ícones de Alta Qualidade

- Fornecemos ícones em vários tamanhos (16x16 até 512x512) no manifesto
- Incluímos ícones SVG para melhor qualidade em qualquer tamanho
- Adicionamos ícones com `purpose: "maskable"` para adaptação a diferentes formatos de ícones

### 3. Modo Standalone e Janela Personalizada

- Configuramos `"display": "standalone"` no manifesto para uma experiência sem controles do navegador
- Implementamos `"display_override": ["window-controls-overlay"]` para personalizar a barra de título

### 4. Integração com o Sistema Operacional

#### Atalhos

- Definimos atalhos no manifesto para acesso rápido a funcionalidades principais:
  - Nova Vistoria
  - Minhas Vistorias
  - Dashboard

#### Compartilhamento

- Implementamos a Web Share API para compartilhar conteúdo
- Criamos o componente `ShareButton` para facilitar o compartilhamento

```typescript
// Uso do componente ShareButton
import ShareButton from '@/components/shared/ShareButton';

<ShareButton 
  title="Brasilit Vistorias" 
  text="Confira esta vistoria técnica" 
  url="https://exemplo.com/vistoria/123" 
/>
```

#### Badges

- Implementamos a Badging API para mostrar notificações no ícone do aplicativo
- Criamos o componente `NotificationBadge` para gerenciar badges

```typescript
// Uso do componente NotificationBadge
import NotificationBadge from '@/components/shared/NotificationBadge';

<NotificationBadge count={5}>
  <Button>
    <BellIcon />
  </Button>
</NotificationBadge>
```

#### Manipulação de Arquivos

- Configuramos `file_handlers` no manifesto para registrar o tipo de arquivo `.brinsp`
- O aplicativo pode ser definido como manipulador padrão para arquivos de vistoria

#### Manipulação de Links/Protocolos

- Configuramos `protocol_handlers` no manifesto para o protocolo personalizado `web+brasilit`
- Permite abrir o aplicativo a partir de links especiais

#### Widgets

- Implementamos suporte a widgets para dashboards (Windows 11 Widgets Board)
- Criamos um widget HTML personalizado em `widgets/dashboard.html`
- Adicionamos a configuração de widgets no manifesto

```typescript
// Registrar o widget provider
import { registerWidgetProvider } from '@/lib/pwa';

// Chamar esta função quando o usuário quiser adicionar o widget
const success = registerWidgetProvider();
```

### 5. Suporte Offline

- Implementamos um service worker robusto para caching de recursos estáticos
- Criamos uma página offline personalizada em `/offline.html`
- Implementamos diferentes estratégias de cache para diferentes tipos de conteúdo
- Adicionamos sincronização em segundo plano para dados offline

### 6. Armazenamento Local

- Utilizamos IndexedDB (via biblioteca `idb`) para armazenamento estruturado
- Implementamos uma fila de sincronização para operações offline
- Utilizamos Cache Storage para recursos estáticos

### 7. Capacidades Avançadas

- Implementamos APIs modernas como:
  - Web Share API para compartilhamento
  - Badging API para notificações
  - Clipboard API com fallback

### 8. Aparência Nativa

- Utilizamos `font-family: system-ui` para usar a fonte do sistema
- Implementamos suporte a temas claros e escuros com `prefers-color-scheme`
- Otimizamos a interface para diferentes dispositivos

### 9. UI/UX Otimizada

- Priorizamos tarefas principais na interface
- Implementamos alvos de toque grandes para melhor usabilidade em dispositivos móveis
- Adicionamos indicadores de carregamento e estados de esqueleto

### 10. Design Responsivo

- Utilizamos CSS Grid e Flexbox para layouts adaptáveis
- Implementamos media queries para diferentes tamanhos de tela
- Otimizamos imagens para diferentes resoluções

## Como Testar

1. **Instalação**: Acesse o aplicativo em um navegador compatível e clique no botão "Instalar"
2. **Offline**: Desconecte da internet e verifique se o aplicativo continua funcionando
3. **Compartilhamento**: Use os botões de compartilhamento para compartilhar conteúdo
4. **Notificações**: Teste o contador de notificações para ver o badge no ícone do aplicativo
5. **Widgets**: Em dispositivos Windows 11, tente adicionar o widget ao painel de widgets

## Compatibilidade

O aplicativo foi testado e é compatível com:
- Google Chrome (versão 90+)
- Microsoft Edge (versão 90+)
- Safari (versão 15+) - com suporte parcial
- Firefox (versão 90+) - com suporte parcial

## Recursos Adicionais

- [Documentação PWA da Microsoft](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/best-practices)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)