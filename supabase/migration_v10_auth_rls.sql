-- =============================================================
-- Migration v10: Autenticação com Supabase Auth + RLS por usuário
-- IMPORTANTE: Executar APÓS criar o primeiro usuário no Supabase Auth
-- =============================================================

-- PASSO 1: Remover políticas antigas (anon allow all)
-- Cadastros
DROP POLICY IF EXISTS "Allow all for anon" ON cadastros;
DROP POLICY IF EXISTS "Allow all for authenticated" ON cadastros;

-- Veículos
DROP POLICY IF EXISTS "Allow all for anon" ON veiculos;
DROP POLICY IF EXISTS "Allow all for authenticated" ON veiculos;

-- Produtos
DROP POLICY IF EXISTS "Allow all for anon" ON produtos;
DROP POLICY IF EXISTS "Allow all for authenticated" ON produtos;

-- Preços Contratados
DROP POLICY IF EXISTS "Allow all for anon" ON precos_contratados;
DROP POLICY IF EXISTS "Allow all for authenticated" ON precos_contratados;

-- Operações
DROP POLICY IF EXISTS "Allow all for anon" ON operacoes;
DROP POLICY IF EXISTS "Allow all for authenticated" ON operacoes;

-- Ordens de Carregamento
DROP POLICY IF EXISTS "Allow all for anon" ON ordens_carregamento;
DROP POLICY IF EXISTS "Allow all for authenticated" ON ordens_carregamento;

-- Ordem Transportadores
DROP POLICY IF EXISTS "Allow all for anon" ON ordem_transportadores;
DROP POLICY IF EXISTS "Allow all for authenticated" ON ordem_transportadores;

-- Romaneios
DROP POLICY IF EXISTS "Allow all for anon" ON romaneios;
DROP POLICY IF EXISTS "Allow all for authenticated" ON romaneios;

-- Ano Safra
DROP POLICY IF EXISTS "Allow all for anon" ON ano_safra;
DROP POLICY IF EXISTS "Allow all for authenticated" ON ano_safra;

-- Tipos NF
DROP POLICY IF EXISTS "Allow all for anon" ON tipos_nf;
DROP POLICY IF EXISTS "Allow all for authenticated" ON tipos_nf;

-- Tipos Ticket
DROP POLICY IF EXISTS "Allow all for anon" ON tipos_ticket;
DROP POLICY IF EXISTS "Allow all for authenticated" ON tipos_ticket;

-- Tipos Caminhão
DROP POLICY IF EXISTS "Allow all for anon" ON tipos_caminhao;
DROP POLICY IF EXISTS "Allow all for authenticated" ON tipos_caminhao;


-- PASSO 2: Criar políticas novas para usuários AUTENTICADOS
-- Todas as tabelas: full access para authenticated (todos os usuários logados compartilham dados)
-- Nota: Se futuramente precisar isolamento por usuário, adicionar coluna user_id e filtrar com auth.uid()

-- Cadastros
CREATE POLICY "Authenticated full access" ON cadastros
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Veículos
CREATE POLICY "Authenticated full access" ON veiculos
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Produtos
CREATE POLICY "Authenticated full access" ON produtos
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Preços Contratados
CREATE POLICY "Authenticated full access" ON precos_contratados
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Operações
CREATE POLICY "Authenticated full access" ON operacoes
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Ordens de Carregamento
CREATE POLICY "Authenticated full access" ON ordens_carregamento
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Ordem Transportadores
CREATE POLICY "Authenticated full access" ON ordem_transportadores
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Romaneios
CREATE POLICY "Authenticated full access" ON romaneios
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Ano Safra
CREATE POLICY "Authenticated full access" ON ano_safra
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Tipos NF
CREATE POLICY "Authenticated full access" ON tipos_nf
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Tipos Ticket
CREATE POLICY "Authenticated full access" ON tipos_ticket
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Tipos Caminhão
CREATE POLICY "Authenticated full access" ON tipos_caminhao
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Storage: política para bucket romaneios-img (se existir)
-- DROP POLICY IF EXISTS "Allow all for anon" ON storage.objects;
-- CREATE POLICY "Authenticated upload" ON storage.objects
--   FOR ALL USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- =============================================================
-- INSTRUÇÕES DE USO:
-- 1. Primeiro, crie um usuário no Supabase Dashboard:
--    Authentication > Users > Invite user (ou via sign up no app)
-- 2. Depois, execute este SQL no SQL Editor do Supabase
-- 3. ATENÇÃO: Após executar, o acesso anônimo será BLOQUEADO
--    Todos os usuários precisarão fazer login
-- =============================================================
