-- Orakulo CRM — Migrations Sprint 1
-- Executar no Supabase SQL Editor ou via MCP

-- Listas de prospecção (campanhas)
CREATE TABLE IF NOT EXISTS listas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  ativa BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa TEXT NOT NULL,
  categoria TEXT,
  telefone TEXT,
  decisor TEXT,
  status TEXT DEFAULT 'novo'
    CHECK (status IN ('novo','contactado','r1','diagnostico','r2','fechado','perdido')),
  origem TEXT DEFAULT 'manual',
  lista_id UUID REFERENCES listas(id) ON DELETE SET NULL,
  observacoes TEXT,
  ultimo_contato TIMESTAMPTZ,
  proximo_follow DATE,
  valor_contrato NUMERIC,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Auto-update atualizado_em
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER leads_atualizado_em
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

-- Interações (timeline de cada lead)
CREATE TABLE IF NOT EXISTS interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL
    CHECK (tipo IN ('call','note','status_change','meeting','doc_sent','whatsapp')),
  conteudo TEXT,
  audio_url TEXT,
  transcricao TEXT,
  duracao_segundos INTEGER,
  status_call TEXT
    CHECK (status_call IN ('atendeu','nao_atendeu','ocupado','caixa_postal','agendou')),
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Propostas
CREATE TABLE IF NOT EXISTS propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  pdf_url TEXT,
  conteudo_json JSONB,
  enviado BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Métricas WhatsApp (recebidas do n8n via webhook)
CREATE TABLE IF NOT EXISTS metricas_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disparos INTEGER DEFAULT 0,
  respostas INTEGER DEFAULT 0,
  data DATE DEFAULT CURRENT_DATE,
  payload_raw JSONB
);

-- Storage buckets (executar separado no dashboard ou via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('calls', 'calls', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reunioes', 'reunioes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('propostas', 'propostas', false);

-- RLS (Row Level Security) — usuário único, simplificado
ALTER TABLE listas ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_whatsapp ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário autenticado tem acesso total
CREATE POLICY "auth_all_listas" ON listas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_leads" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_interacoes" ON interacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_propostas" ON propostas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_metricas" ON metricas_whatsapp FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_lista_id_idx ON leads(lista_id);
CREATE INDEX IF NOT EXISTS leads_proximo_follow_idx ON leads(proximo_follow);
CREATE INDEX IF NOT EXISTS interacoes_lead_id_idx ON interacoes(lead_id);
CREATE INDEX IF NOT EXISTS interacoes_criado_em_idx ON interacoes(criado_em DESC);
