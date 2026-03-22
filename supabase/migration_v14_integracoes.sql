-- ============================================================
-- iAgru — Migration v14: Integrações Externas
-- Tabela para armazenar tokens e configurações de integrações
-- ============================================================

-- 1. Tabela de integrações
CREATE TABLE IF NOT EXISTS integracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provedor TEXT NOT NULL, -- 'aegro', 'irancho', etc.
  token TEXT, -- Token de API (criptografado futuramente)
  farm_id TEXT, -- ID da fazenda no sistema externo
  farm_nome TEXT, -- Nome da fazenda (para exibição)
  status TEXT DEFAULT 'desconectado', -- 'conectado', 'desconectado', 'erro'
  ultimo_sync TIMESTAMPTZ,
  config JSONB DEFAULT '{}', -- Configurações extras (catalog_id, etc.)
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_integracoes_updated_at BEFORE UPDATE ON integracoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. RLS
ALTER TABLE integracoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all integracoes" ON integracoes;
CREATE POLICY "Allow all integracoes" ON integracoes FOR ALL USING (true) WITH CHECK (true);

-- 3. Índice
CREATE INDEX IF NOT EXISTS idx_integracoes_provedor ON integracoes(provedor);
