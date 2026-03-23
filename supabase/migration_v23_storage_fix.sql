-- Migration v23 FIX: Limpar e recriar buckets e políticas
-- Execute no Supabase Dashboard > SQL Editor

-- =====================================================
-- LIMPAR policies antigas (se existirem)
-- =====================================================
DROP POLICY IF EXISTS "Allow public upload contratosdevenda" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read contratosdevenda" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete contratosdevenda" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload contratosdecompra" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read contratosdecompra" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete contratosdecompra" ON storage.objects;

-- =====================================================
-- Criar buckets (se não existirem)
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('contratosdevenda-img', 'contratosdevenda-img', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('contratosdecompra-img', 'contratosdecompra-img', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Criar políticas de upload e leitura
-- =====================================================

-- contratosdevenda-img
CREATE POLICY "Allow public upload contratosdevenda" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contratosdevenda-img');

CREATE POLICY "Allow public read contratosdevenda" ON storage.objects
  FOR SELECT USING (bucket_id = 'contratosdevenda-img');

CREATE POLICY "Allow public delete contratosdevenda" ON storage.objects
  FOR DELETE USING (bucket_id = 'contratosdevenda-img');

-- contratosdecompra-img
CREATE POLICY "Allow public upload contratosdecompra" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contratosdecompra-img');

CREATE POLICY "Allow public read contratosdecompra" ON storage.objects
  FOR SELECT USING (bucket_id = 'contratosdecompra-img');

CREATE POLICY "Allow public delete contratosdecompra" ON storage.objects
  FOR DELETE USING (bucket_id = 'contratosdecompra-img');
