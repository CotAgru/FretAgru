-- Migration v22: Adicionar RLS para unidades_medida e tipos_contrato
-- Execute no Supabase Dashboard > SQL Editor

-- =====================================================
-- RLS para unidades_medida
-- =====================================================
ALTER TABLE unidades_medida ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all unidades_medida" ON unidades_medida;
CREATE POLICY "Allow all unidades_medida" ON unidades_medida 
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- RLS para tipos_contrato
-- =====================================================
ALTER TABLE tipos_contrato ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all tipos_contrato" ON tipos_contrato;
CREATE POLICY "Allow all tipos_contrato" ON tipos_contrato 
  FOR ALL USING (true) WITH CHECK (true);
