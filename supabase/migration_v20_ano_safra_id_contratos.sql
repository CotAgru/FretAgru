-- Migration v20: Trocar ano_safra INTEGER por ano_safra_id UUID FK em contratos
-- O campo ano_safra (integer) estava errado - deve referenciar a tabela ano_safra do /safra
-- Execute no Supabase Dashboard > SQL Editor

-- PASSO 1: Adicionar coluna ano_safra_id em contratos_venda
ALTER TABLE contratos_venda 
ADD COLUMN IF NOT EXISTS ano_safra_id UUID REFERENCES ano_safra(id) ON DELETE SET NULL;

COMMENT ON COLUMN contratos_venda.ano_safra_id IS 'FK para tabela ano_safra (ex: 24/25, 25/26)';

-- PASSO 2: Adicionar coluna ano_safra_id em contratos_compra_insumo
ALTER TABLE contratos_compra_insumo 
ADD COLUMN IF NOT EXISTS ano_safra_id UUID REFERENCES ano_safra(id) ON DELETE SET NULL;

COMMENT ON COLUMN contratos_compra_insumo.ano_safra_id IS 'FK para tabela ano_safra (ex: 24/25, 25/26)';

-- PASSO 3: Migrar dados existentes (tentar vincular pelo ano inteiro ao nome do ano_safra)
-- Ex: ano_safra=2025 -> procura ano_safra com nome contendo '24/25' ou '25/26'
-- Como a lógica é ambígua, apenas registrar para migração manual se necessário

-- PASSO 4: Remover coluna ano_safra INTEGER (não mais usada)
ALTER TABLE contratos_venda DROP COLUMN IF EXISTS ano_safra;
ALTER TABLE contratos_compra_insumo DROP COLUMN IF EXISTS ano_safra;

-- PASSO 5: Remover coluna ano de safras (era usada para extrair anos únicos, não mais necessária)
-- ALTER TABLE safras DROP COLUMN IF EXISTS ano;
-- Mantemos por segurança, mas não será mais usada no frontend

-- PASSO 6: Índices
CREATE INDEX IF NOT EXISTS idx_cv_ano_safra ON contratos_venda(ano_safra_id);
CREATE INDEX IF NOT EXISTS idx_cci_ano_safra ON contratos_compra_insumo(ano_safra_id);
