-- Criação das tabelas iniciais do sistema de vistorias Brasilit
-- Migration: 20250421_initial_schema.sql

-- Habilitar as extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários (complementar à tabela auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'inspector',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de inspeções
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  inspector_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  inspection_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  conclusion TEXT,
  technical_opinion TEXT,
  weather_conditions TEXT,
  temperature DECIMAL,
  humidity DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de produtos utilizados em inspeções
CREATE TABLE IF NOT EXISTS public.inspection_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER,
  installation_date DATE,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de evidências (fotos, documentos)
CREATE TABLE IF NOT EXISTS public.evidences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  description TEXT,
  annotations JSON,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para sincronização offline
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  operation TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Políticas de segurança Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

-- Políticas: usuários autenticados podem ler todos os dados
CREATE POLICY "Usuários autenticados podem ler todos os usuários" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler todos os clientes" ON public.clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler todos os projetos" ON public.projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler todos os produtos" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler todas as inspeções" ON public.inspections
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas: usuários podem editar apenas dados associados a eles
CREATE POLICY "Usuários podem editar apenas suas próprias inspeções" ON public.inspections
  FOR UPDATE USING (auth.uid() = inspector_id);

CREATE POLICY "Usuários podem inserir novas inspeções" ON public.inspections
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para evidências
CREATE POLICY "Usuários podem ler todas as evidências" ON public.evidences
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem inserir evidências nas suas inspeções" ON public.evidences
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.inspections
    WHERE id = inspection_id AND inspector_id = auth.uid()
  ));

-- Gatilhos para atualizar timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o gatilho em todas as tabelas
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_clients_timestamp BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_projects_timestamp BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_inspections_timestamp BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_inspection_products_timestamp BEFORE UPDATE ON public.inspection_products
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_evidences_timestamp BEFORE UPDATE ON public.evidences
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_sync_queue_timestamp BEFORE UPDATE ON public.sync_queue
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
