/**
 * setup-workflow.ts
 * 
 * Este arquivo contém as funções para configuração do fluxo de trabalho
 * entre VS Code, GitHub, Supabase e Vercel, conforme descrito no README.md.
 * 
 * Data de criação: 21 de abril de 2025
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Interfaces para tipagem
interface SupabaseConfig {
  staging_url: string;
  staging_anon_key: string;
  staging_project_id: string;
  production_url: string;
  production_anon_key: string;
  production_project_id: string;
}

interface WorkflowConfig {
  github_repo: string;
  beta_branch: string;
  final_branch: string;
  vercel_team?: string;
  vercel_project_name: string;
}

/**
 * Verifica se as ferramentas necessárias estão instaladas no sistema
 * @returns {boolean} Retorna true se todas as ferramentas estiverem disponíveis
 */
function verificarFerramentes(): boolean {
  try {
    console.log('🔍 Verificando ferramentas necessárias...');
    
    // Verificar Git
    const gitVersion = execSync('git --version').toString().trim();
    console.log(`✅ Git detectado: ${gitVersion}`);
    
    // Verificar Node e NPM
    const nodeVersion = execSync('node --version').toString().trim();
    const npmVersion = execSync('npm --version').toString().trim();
    console.log(`✅ Node.js detectado: ${nodeVersion}`);
    console.log(`✅ NPM detectado: ${npmVersion}`);
    
    // Verificar se Supabase CLI está instalado
    try {
      const supabaseVersion = execSync('supabase --version').toString().trim();
      console.log(`✅ Supabase CLI detectado: ${supabaseVersion}`);
    } catch (error) {
      console.error('❌ Supabase CLI não encontrado.');
      console.log('   Para instalar: npm install -g supabase');
      return false;
    }
    
    // Verificar se Vercel CLI está instalado
    try {
      const vercelVersion = execSync('vercel --version').toString().trim();
      console.log(`✅ Vercel CLI detectado: ${vercelVersion}`);
    } catch (error) {
      console.error('❌ Vercel CLI não encontrado.');
      console.log('   Para instalar: npm install -g vercel');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar ferramentas:', error);
    return false;
  }
}

/**
 * Configura o arquivo .env com as credenciais do Supabase para desenvolvimento local
 * @param {SupabaseConfig} config - Configurações do Supabase
 */
function configurarEnvLocal(config: SupabaseConfig): void {
  try {
    console.log('📝 Configurando arquivo .env para desenvolvimento local...');
    
    // Conteúdo do arquivo .env
    const envContent = `# Ambiente de Desenvolvimento Local - Supabase Staging
SUPABASE_URL=${config.staging_url}
SUPABASE_ANON_KEY=${config.staging_anon_key}
SUPABASE_PROJECT_ID=${config.staging_project_id}

# As seguintes variáveis são para referência, NÃO utilizadas no desenvolvimento local
# PRODUCTION_SUPABASE_URL=${config.production_url}
# PRODUCTION_SUPABASE_ANON_KEY=${config.production_anon_key}
# PRODUCTION_SUPABASE_PROJECT_ID=${config.production_project_id}

# Adicione outras variáveis de ambiente específicas do projeto abaixo
`;
    
    // Criar o arquivo .env
    fs.writeFileSync('.env', envContent);
    console.log('✅ Arquivo .env criado com sucesso.');
    
    // Verificar se .env está no .gitignore
    let gitignoreContent = '';
    try {
      gitignoreContent = fs.readFileSync('.gitignore', 'utf-8');
    } catch (error) {
      gitignoreContent = '';
    }
    
    if (!gitignoreContent.includes('.env')) {
      fs.appendFileSync('.gitignore', '\n# Variáveis de Ambiente\n.env\n');
      console.log('✅ .env adicionado ao .gitignore.');
    }
    
  } catch (error) {
    console.error('Erro ao configurar arquivo .env:', error);
  }
}

/**
 * Configura o repositório Git com as branches beta e final
 * @param {WorkflowConfig} config - Configuração do fluxo de trabalho
 */
function configurarGit(config: WorkflowConfig): void {
  try {
    console.log('🔄 Configurando repositório Git...');
    
    // Verificar se o repositório já está inicializado
    const gitInitializado = fs.existsSync('.git');
    
    if (!gitInitializado) {
      console.log('Inicializando repositório Git...');
      execSync('git init');
      execSync(`git remote add origin ${config.github_repo}`);
      console.log(`✅ Repositório Git inicializado e conectado a: ${config.github_repo}`);
    } else {
      console.log('✅ Repositório Git já inicializado.');
      
      // Verificar se o remote já está configurado corretamente
      try {
        const remoteUrl = execSync('git remote get-url origin').toString().trim();
        if (remoteUrl !== config.github_repo) {
          execSync(`git remote set-url origin ${config.github_repo}`);
          console.log(`✅ URL do repositório remoto atualizada para: ${config.github_repo}`);
        }
      } catch (error) {
        execSync(`git remote add origin ${config.github_repo}`);
        console.log(`✅ Remote 'origin' configurado para: ${config.github_repo}`);
      }
    }
    
    // Criar branch final (se não existir)
    try {
      execSync(`git show-ref --verify --quiet refs/heads/${config.final_branch}`);
      console.log(`✅ Branch '${config.final_branch}' já existe.`);
    } catch (error) {
      execSync(`git checkout -b ${config.final_branch}`);
      console.log(`✅ Branch '${config.final_branch}' criada.`);
    }
    
    // Criar branch beta (se não existir)
    try {
      execSync(`git show-ref --verify --quiet refs/heads/${config.beta_branch}`);
      console.log(`✅ Branch '${config.beta_branch}' já existe.`);
    } catch (error) {
      execSync(`git checkout -b ${config.beta_branch}`);
      console.log(`✅ Branch '${config.beta_branch}' criada.`);
    }
    
    // Voltar para a branch beta para desenvolvimento
    execSync(`git checkout ${config.beta_branch}`);
    console.log(`✅ Mudou para a branch '${config.beta_branch}' para desenvolvimento.`);
    
  } catch (error) {
    console.error('Erro ao configurar repositório Git:', error);
  }
}

/**
 * Cria um script para sincronizar migrações Supabase entre ambientes
 */
function criarScriptMigracoes(): void {
  try {
    console.log('📄 Criando script de sincronização de migrações...');
    
    const scriptContent = `#!/usr/bin/env node
/**
 * sync-migrations.js
 * 
 * Script para sincronizar migrações Supabase entre ambientes (staging e produção).
 * Deve ser executado após testes bem-sucedidos no ambiente de staging.
 * 
 * Uso: 
 * - Para aplicar migrações ao ambiente de staging: 
 *   node sync-migrations.js staging
 * 
 * - Para aplicar migrações ao ambiente de produção: 
 *   node sync-migrations.js production
 */

const { execSync } = require('child_process');
require('dotenv').config();

const args = process.argv.slice(2);
const env = args[0];

if (!env || (env !== 'staging' && env !== 'production')) {
  console.error('Erro: Especifique o ambiente (staging ou production)');
  console.log('Uso: node sync-migrations.js [staging|production]');
  process.exit(1);
}

// IDs dos projetos Supabase
const STAGING_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const PRODUCTION_PROJECT_ID = process.env.PRODUCTION_SUPABASE_PROJECT_ID;

if (env === 'staging' && !STAGING_PROJECT_ID) {
  console.error('Erro: SUPABASE_PROJECT_ID não definido no arquivo .env');
  process.exit(1);
}

if (env === 'production' && !PRODUCTION_PROJECT_ID) {
  console.error('Erro: PRODUCTION_SUPABASE_PROJECT_ID não definido no arquivo .env');
  process.exit(1);
}

try {
  console.log(\`Aplicando migrações ao ambiente de \${env}...\`);
  
  const projectId = env === 'staging' ? STAGING_PROJECT_ID : PRODUCTION_PROJECT_ID;
  
  // Aplicar migrações
  execSync(\`supabase migration up --project-ref \${projectId}\`, { stdio: 'inherit' });
  
  console.log('✅ Migrações aplicadas com sucesso.');
} catch (error) {
  console.error(\`❌ Erro ao aplicar migrações: \${error.message}\`);
  process.exit(1);
}
`;
    
    // Criar o script
    fs.writeFileSync('sync-migrations.js', scriptContent);
    console.log('✅ Script sync-migrations.js criado com sucesso.');
    
    // Adicionar o script ao package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      packageJson.scripts['migrate:staging'] = 'node sync-migrations.js staging';
      packageJson.scripts['migrate:production'] = 'node sync-migrations.js production';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Scripts adicionados ao package.json.');
    }
    
  } catch (error) {
    console.error('Erro ao criar script de migrações:', error);
  }
}

/**
 * Cria um exemplo básico de GitHub Actions workflow para aplicar migrações automaticamente
 */
function criarGitHubWorkflows(): void {
  try {
    console.log('🔄 Criando GitHub Actions workflows...');
    
    // Criar pasta .github/workflows se não existir
    const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }
    
    // Workflow para ambiente de staging (beta)
    const stagingWorkflow = `name: Deploy to Staging

on:
  push:
    branches: [ beta ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Supabase CLI
        run: npm install -g supabase@latest
        
      - name: Apply Supabase migrations
        run: |
          supabase login --token \${{ secrets.SUPABASE_ACCESS_TOKEN }}
          supabase migration up --project-ref \${{ secrets.SUPABASE_STAGING_PROJECT_ID }}
        
      # O deploy na Vercel é automático pela integração
      # Esta etapa apenas confirma que o workflow foi executado
      - name: Notify deployment
        run: echo "✅ Staging deployment process completed"
`;
    
    // Workflow para ambiente de produção (final)
    const productionWorkflow = `name: Deploy to Production

on:
  push:
    branches: [ final ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Supabase CLI
        run: npm install -g supabase@latest
        
      - name: Apply Supabase migrations
        run: |
          supabase login --token \${{ secrets.SUPABASE_ACCESS_TOKEN }}
          supabase migration up --project-ref \${{ secrets.SUPABASE_PRODUCTION_PROJECT_ID }}
        
      # O deploy na Vercel é automático pela integração
      # Esta etapa apenas confirma que o workflow foi executado
      - name: Notify deployment
        run: echo "✅ Production deployment process completed"
`;
    
    // Escrever os arquivos de workflow
    fs.writeFileSync(path.join(workflowsDir, 'staging-deploy.yml'), stagingWorkflow);
    fs.writeFileSync(path.join(workflowsDir, 'production-deploy.yml'), productionWorkflow);
    
    console.log('✅ GitHub Actions workflows criados com sucesso.');
    console.log('   Lembre-se de configurar os seguintes secrets no seu repositório GitHub:');
    console.log('   - SUPABASE_ACCESS_TOKEN');
    console.log('   - SUPABASE_STAGING_PROJECT_ID');
    console.log('   - SUPABASE_PRODUCTION_PROJECT_ID');
    
  } catch (error) {
    console.error('Erro ao criar GitHub Actions workflows:', error);
  }
}

/**
 * Função principal para configurar todo o ambiente de trabalho
 */
async function configurarAmbiente() {
  console.log('🚀 Iniciando configuração do ambiente de trabalho...');
  
  // Verificar ferramentas necessárias
  if (!verificarFerramentes()) {
    console.error('❌ Por favor, instale todas as ferramentas necessárias e tente novamente.');
    return;
  }
  
  // Solicitar informações do usuário (em um ambiente real, isso seria interativo)
  const workflowConfig: WorkflowConfig = {
    github_repo: 'https://github.com/seu-usuario/seu-repositorio.git',
    beta_branch: 'beta',
    final_branch: 'final',
    vercel_project_name: 'braelite3'
  };
  
  const supabaseConfig: SupabaseConfig = {
    staging_url: 'https://sua-url-staging.supabase.co',
    staging_anon_key: 'sua-chave-staging',
    staging_project_id: 'id-projeto-staging',
    production_url: 'https://sua-url-producao.supabase.co',
    production_anon_key: 'sua-chave-producao',
    production_project_id: 'id-projeto-producao'
  };
  
  // Configurar Git
  configurarGit(workflowConfig);
  
  // Configurar .env local
  configurarEnvLocal(supabaseConfig);
  
  // Criar script de migrações
  criarScriptMigracoes();
  
  // Criar GitHub Actions workflows
  criarGitHubWorkflows();
  
  console.log('\n✅ Configuração concluída com sucesso!');
  console.log('📋 Próximos passos:');
  console.log('1. Substitua os valores genéricos no arquivo .env com suas credenciais reais do Supabase.');
  console.log('2. Faça o login na Vercel CLI com "vercel login" e configure seu projeto.');
  console.log('3. Configure os secrets necessários no GitHub para os workflows de CI/CD.');
  console.log('4. Faça seu primeiro commit e push para a branch beta: "git add . && git commit -m \'Configuração inicial\' && git push -u origin beta"');
  console.log('\nPara mais informações, consulte o README.md.');
}

// Executar a configuração
configurarAmbiente().catch(console.error);
