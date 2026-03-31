-- =========================================
-- Migração v26: Vincular Unidades Armazenadoras com Cadastros
-- =========================================
-- Esta migração integra as unidades armazenadoras com a tabela cadastros,
-- eliminando duplicação de dados e usando cadastros do tipo "Armazem"

-- 1. Adicionar coluna cadastro_id na tabela unidades_armazenadoras
ALTER TABLE unidades_armazenadoras 
ADD COLUMN IF NOT EXISTS cadastro_id UUID REFERENCES cadastros(id) ON DELETE RESTRICT;

-- 2. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_unidades_armazenadoras_cadastro_id 
ON unidades_armazenadoras(cadastro_id);

-- 3. Comentários para documentação
COMMENT ON COLUMN unidades_armazenadoras.cadastro_id IS 'Referência ao cadastro geral (tipo Armazem) que contém nome, endereço, etc.';

-- Nota: Os campos nome, sigla, endereco, uf, cidade ficam mantidos para retrocompatibilidade
-- mas devem ser considerados deprecated. Usar os dados do cadastro vinculado.
