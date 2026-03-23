-- Migration v23: Criar buckets de Storage e configurar políticas
-- Execute no Supabase Dashboard > SQL Editor

-- =====================================================
-- Buckets de Storage para anexos de contratos
-- =====================================================

-- Inserir buckets se não existirem
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('contratosdevenda-img', 'contratosdevenda-img', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('contratosdecompra-img', 'contratosdecompra-img', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- RLS Policies para Storage
-- =====================================================

-- Políticas para contratosdevenda-img
DROP POLICY IF EXISTS "Allow public upload contratosdevenda" ON storage.objects;
CREATE POLICY "Allow public upload contratosdevenda" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contratosdevenda-img');

DROP POLICY IF EXISTS "Allow public read contratosdevenda" ON storage.objects;
CREATE POLICY "Allow public read contratosdevenda" ON storage.objects
  FOR SELECT USING (bucket_id = 'contratosdevenda-img');

DROP POLICY IF EXISTS "Allow public delete contratosdevenda" ON storage.objects;
CREATE POLICY "Allow public delete contratosdevenda" ON storage.objects
  FOR DELETE USING (bucket_id = 'contratosdevenda-img');

-- Políticas para contratosdecompra-img
DROP POLICY IF EXISTS "Allow public upload contratosdecompra" ON storage.objects;
CREATE POLICY "Allow public upload contratosdecompra" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contratosdecompra-img');

DROP POLICY IF EXISTS "Allow public read contratosdecompra" ON storage.objects;
CREATE POLICY "Allow public read contratosdecompra" ON storage.objects
  FOR SELECT USING (bucket_id = 'contratosdecompra-img');

DROP POLICY IF EXISTS "Allow public delete contratosdecompra" ON storage.objects;
CREATE POLICY "Allow public delete contratosdecompra" ON storage.objects
  FOR DELETE USING (bucket_id = 'contratosdecompra-img');
