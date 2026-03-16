-- =============================================
-- MIGRATION V5: Tabela operacoes + vinculo com ordens e romaneios
-- =============================================

-- 1) Criar tabela operacoes
CREATE TABLE IF NOT EXISTS operacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,                          -- Ex: "Colheita Soja 24/25"
  descricao TEXT,
  data_inicio DATE,
  data_fim DATE,
  status TEXT NOT NULL DEFAULT 'ativa',        -- ativa, encerrada, cancelada
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Adicionar operacao_id na tabela ordens_carregamento
ALTER TABLE ordens_carregamento
  ADD COLUMN IF NOT EXISTS operacao_id UUID REFERENCES operacoes(id) ON DELETE SET NULL;

-- 3) Adicionar operacao_id na tabela romaneios
ALTER TABLE romaneios
  ADD COLUMN IF NOT EXISTS operacao_id UUID REFERENCES operacoes(id) ON DELETE SET NULL;

-- 4) Indices
CREATE INDEX IF NOT EXISTS idx_ordens_operacao ON ordens_carregamento(operacao_id);
CREATE INDEX IF NOT EXISTS idx_romaneios_operacao ON romaneios(operacao_id);

-- 5) RLS (caso esteja ativo)
ALTER TABLE operacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operacoes" ON operacoes;
CREATE POLICY "Allow all operacoes" ON operacoes FOR ALL USING (true) WITH CHECK (true);
