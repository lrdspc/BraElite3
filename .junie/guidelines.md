# Brasilit PWA - Development Guidelines

Este documento contém informações importantes para o desenvolvimento do projeto Brasilit PWA - Sistema de Vistorias Técnicas.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

- `client/`: Frontend React com TypeScript
  - `public/`: Arquivos estáticos e service worker
  - `src/`: Código-fonte do frontend
    - `components/`: Componentes React
    - `context/`: Contextos React
    - `hooks/`: Hooks personalizados
    - `lib/`: Funções utilitárias
    - `pages/`: Componentes de página
- `server/`: Backend Node.js com Express
  - `index.ts`: Ponto de entrada do servidor
  - `routes.ts`: Rotas da API
  - `storage.ts`: Gerenciamento de dados
  - `vite.ts`: Configuração do Vite para o servidor
- `shared/`: Código compartilhado entre cliente e servidor
  - `schema.ts`: Definições de esquema de dados

## Instruções de Build/Configuração

### Pré-requisitos

- Node.js 20.x
- npm 10.x ou superior

### Instalação

```bash
# Clone o repositório
git clone https://github.com/brasilit/pwa-vistorias.git
cd pwa-vistorias

# Instale as dependências
npm install
```

### Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o aplicativo para produção
  - Frontend: Compilado com Vite
  - Backend: Compilado com esbuild
- `npm run start`: Inicia o servidor em modo de produção
- `npm run check`: Executa a verificação de tipos TypeScript
- `npm run db:push`: Atualiza o banco de dados usando Drizzle Kit

### Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configuração. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Banco de dados
DATABASE_URL=postgres://user:password@localhost:5432/brasilit

# Servidor
PORT=5000
NODE_ENV=development

# Sessão
SESSION_SECRET=sua_chave_secreta_aqui
```

## Informações de Teste

### Configuração de Testes

O projeto utiliza Vitest como framework de testes. A configuração está em `vitest.config.ts` e `vitest.setup.ts`.

### Executando Testes

```bash
# Executa todos os testes uma vez
npm test

# Executa os testes em modo de observação
npm run test:watch
```

### Adicionando Novos Testes

1. Crie arquivos de teste com a extensão `.test.ts` ou `.test.tsx`
2. Coloque os arquivos de teste próximos aos arquivos que estão sendo testados
3. Use a sintaxe do Vitest para escrever testes:

```typescript
import { describe, it, expect } from 'vitest';
import { minhaFuncao } from './arquivo-a-ser-testado';

describe('Nome do grupo de testes', () => {
  it('deve fazer algo específico', () => {
    const resultado = minhaFuncao(params);
    expect(resultado).toBe(valorEsperado);
  });
});
```

### Exemplo de Teste

Veja um exemplo de teste para as funções utilitárias de formatação de data:

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatDateTime } from './utils';

describe('Utilitários de formatação de data', () => {
  it('deve formatar a data corretamente', () => {
    const testDate = new Date('2025-04-21T10:30:00');
    expect(formatDate(testDate)).toBe('21/04/2025');
    
    // Teste com undefined
    expect(formatDate(undefined)).toBe('');
  });

  it('deve formatar a hora corretamente', () => {
    const testDate = new Date('2025-04-21T10:30:00');
    expect(formatTime(testDate)).toBe('10:30');
    
    // Teste com undefined
    expect(formatTime(undefined)).toBe('');
  });
});
```

## Informações Adicionais de Desenvolvimento

### Armazenamento Offline

O projeto utiliza IndexedDB (via biblioteca `idb`) para armazenamento offline. Os dados são sincronizados automaticamente quando a conexão é restabelecida.

### Service Worker

O service worker está configurado para:
- Armazenar em cache os recursos estáticos
- Permitir o funcionamento offline
- Sincronizar dados quando online

### Estilo de Código

O projeto utiliza:
- TypeScript para tipagem estática
- React com componentes funcionais e hooks
- Tailwind CSS para estilização
- shadcn/ui para componentes de UI

### Padrões de Desenvolvimento

1. **Componentes**: Use componentes funcionais com hooks
2. **Estado Global**: Use React Context para estado global
3. **Formulários**: Use react-hook-form com validação zod
4. **API Calls**: Use funções assíncronas com tratamento de erros
5. **Offline First**: Projete recursos considerando o uso offline

### Depuração

Para depurar o aplicativo:

1. **Frontend**: Use as ferramentas de desenvolvedor do navegador
   - React DevTools para componentes
   - Application tab para IndexedDB e Service Workers

2. **Backend**: Use logs para depurar o servidor
   ```typescript
   console.log('Debugging info:', data);
   ```

3. **Offline/Sync**: Monitore eventos de sincronização no console
   - Verifique erros de sincronização
   - Teste desconectando e reconectando à internet