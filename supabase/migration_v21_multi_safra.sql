-- Migration v21: Multi-Safra em Operações, Contratos e Romaneios
-- Junction tables para permitir múltiplas safras por registro
-- Execute no Supabase Dashboard > SQL Editor

-- =====================================================
-- PASSO 1: Junction table operacao_safras
-- =====================================================
CREATE TABLE IF NOT EXISTS operacao_safras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operacao_id UUID NOT NULL REFERENCES operacoes(id) ON DELETE CASCADE,
  safra_id UUID NOT NULL REFERENCES safras(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(operacao_id, safra_id)
);

ALTER TABLE operacao_safras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operacao_safras" ON operacao_safras;
CREATE POLICY "Allow all operacao_safras" ON operacao_safras FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_operacao_safras_op ON operacao_safras(operacao_id);
CREATE INDEX IF NOT EXISTS idx_operacao_safras_safra ON operacao_safras(safra_id);

-- =====================================================
-- PASSO 2: Junction table contrato_venda_safras
-- =====================================================
CREATE TABLE IF NOT EXISTS contrato_venda_safras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_venda_id UUID NOT NULL REFERENCES contratos_venda(id) ON DELETE CASCADE,
  safra_id UUID NOT NULL REFERENCES safras(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contrato_venda_id, safra_id)
);

ALTER TABLE contrato_venda_safras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all contrato_venda_safras" ON contrato_venda_safras;
CREATE POLICY "Allow all contrato_venda_safras" ON contrato_venda_safras FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cv_safras_contrato ON contrato_venda_safras(contrato_venda_id);
CREATE INDEX IF NOT EXISTS idx_cv_safras_safra ON contrato_venda_safras(safra_id);

-- Migrar dados existentes de safra_id para junction
INSERT INTO contrato_venda_safras (contrato_venda_id, safra_id)
SELECT id, safra_id FROM contratos_venda WHERE safra_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Remover coluna safra_id (agora usa junction)
ALTER TABLE contratos_venda DROP COLUMN IF EXISTS safra_id;

-- =====================================================
-- PASSO 3: Junction table contrato_compra_safras
-- =====================================================
CREATE TABLE IF NOT EXISTS contrato_compra_safras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_compra_insumo_id UUID NOT NULL REFERENCES contratos_compra_insumo(id) ON DELETE CASCADE,
  safra_id UUID NOT NULL REFERENCES safras(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contrato_compra_insumo_id, safra_id)
);

ALTER TABLE contrato_compra_safras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all contrato_compra_safras" ON contrato_compra_safras;
CREATE POLICY "Allow all contrato_compra_safras" ON contrato_compra_safras FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cc_safras_contrato ON contrato_compra_safras(contrato_compra_insumo_id);
CREATE INDEX IF NOT EXISTS idx_cc_safras_safra ON contrato_compra_safras(safra_id);

-- Migrar dados existentes de safra_id para junction
INSERT INTO contrato_compra_safras (contrato_compra_insumo_id, safra_id)
SELECT id, safra_id FROM contratos_compra_insumo WHERE safra_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Remover coluna safra_id (agora usa junction)
ALTER TABLE contratos_compra_insumo DROP COLUMN IF EXISTS safra_id;

-- =====================================================
-- PASSO 4: Junction table romaneio_safras
-- =====================================================
CREATE TABLE IF NOT EXISTS romaneio_safras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  romaneio_id UUID NOT NULL REFERENCES romaneios(id) ON DELETE CASCADE,
  safra_id UUID NOT NULL REFERENCES safras(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(romaneio_id, safra_id)
);

ALTER TABLE romaneio_safras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all romaneio_safras" ON romaneio_safras;
CREATE POLICY "Allow all romaneio_safras" ON romaneio_safras FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_rom_safras_romaneio ON romaneio_safras(romaneio_id);
CREATE INDEX IF NOT EXISTS idx_rom_safras_safra ON romaneio_safras(safra_id);
