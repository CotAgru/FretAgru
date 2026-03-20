-- =============================================================
-- ROLLBACK URGENTE - Restaurar acesso anônimo + autenticado
-- Execute IMEDIATAMENTE no SQL Editor do Supabase
-- Seus dados NÃO foram apagados, apenas o acesso foi bloqueado
-- =============================================================

-- Remover as políticas que bloqueiam acesso anônimo
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'cadastros','veiculos','produtos','precos_contratados',
      'operacoes','ordens_carregamento','ordem_transportadores',
      'romaneios','ano_safra','tipos_nf','tipos_ticket','tipos_caminhao'
    ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated full access" ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for anon" ON %I', tbl);
    EXECUTE format(
      'CREATE POLICY "Allow all access" ON %I FOR ALL USING (true) WITH CHECK (true)',
      tbl
    );
  END LOOP;
END $$;
