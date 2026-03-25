-- SilAgru v25 - Migration: Gestão de Armazenamento de Grãos
-- Execute APÓS todas as migrations anteriores (v1-v24)

-- =========================================
-- 1. Unidades Armazenadoras
-- =========================================
CREATE TABLE IF NOT EXISTS unidades_armazenadoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  sigla VARCHAR(20),
  endereco TEXT,
  uf VARCHAR(2),
  cidade VARCHAR(100),
  capacidade_total_tons REAL,
  tipo TEXT DEFAULT 'armazem',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- 2. Estruturas de Armazenamento (silos dentro da unidade)
-- =========================================
CREATE TABLE IF NOT EXISTS estruturas_armazenamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id UUID NOT NULL REFERENCES unidades_armazenadoras(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo TEXT DEFAULT 'silo',
  capacidade_tons REAL,
  produto_atual_id UUID REFERENCES produtos(id),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- 3. Tabelas de Desconto (cabeçalho)
-- =========================================
CREATE TABLE IF NOT EXISTS tabelas_desconto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  tipo_desconto TEXT NOT NULL,
  base_isenta REAL DEFAULT 0,
  ano_safra_id UUID REFERENCES ano_safra(id),
  vigencia_inicio DATE,
  vigencia_fim DATE,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- 4. Faixas de Desconto (linhas da tabela)
-- =========================================
CREATE TABLE IF NOT EXISTS faixas_desconto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela_id UUID NOT NULL REFERENCES tabelas_desconto(id) ON DELETE CASCADE,
  grau REAL NOT NULL,
  desconto REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- 5. Tarifas de Armazenagem (cabeçalho)
-- =========================================
CREATE TABLE IF NOT EXISTS tarifas_armazenagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id UUID REFERENCES unidades_armazenadoras(id),
  nome VARCHAR(200) NOT NULL,
  ano_safra_id UUID REFERENCES ano_safra(id),
  vigencia_inicio DATE,
  vigencia_fim DATE,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- 6. Itens de Tarifa
-- =========================================
CREATE TABLE IF NOT EXISTS tarifa_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarifa_id UUID NOT NULL REFERENCES tarifas_armazenagem(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  produto_id UUID REFERENCES produtos(id),
  forma_armazenamento TEXT,
  valor REAL NOT NULL,
  unidade_cobranca TEXT NOT NULL,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- 7. Romaneios de Armazém (Entrada/Saída)
-- =========================================
CREATE TABLE IF NOT EXISTS romaneios_armazem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL DEFAULT 'entrada',
  numero_romaneio SERIAL,
  unidade_id UUID NOT NULL REFERENCES unidades_armazenadoras(id),
  estrutura_id UUID REFERENCES estruturas_armazenamento(id),

  depositante_id UUID NOT NULL REFERENCES cadastros(id),
  produto_id UUID NOT NULL REFERENCES produtos(id),
  safra_id UUID REFERENCES safras(id),
  ano_safra_id UUID REFERENCES ano_safra(id),

  transportadora_id UUID REFERENCES cadastros(id),
  motorista_id UUID REFERENCES cadastros(id),
  veiculo_id UUID REFERENCES veiculos(id),
  placa VARCHAR(10),

  nfe_numero VARCHAR(50),
  nfe_serie VARCHAR(10),

  peso_bruto REAL,
  tara REAL,
  peso_liquido REAL,

  umidade_perc REAL,
  impureza_perc REAL,
  avariados_perc REAL,
  ardidos_perc REAL,
  esverdeados_perc REAL,
  partidos_perc REAL,
  quebrados_perc REAL,
  transgenia VARCHAR(50),

  umidade_desc REAL DEFAULT 0,
  impureza_desc REAL DEFAULT 0,
  avariados_desc REAL DEFAULT 0,
  ardidos_desc REAL DEFAULT 0,
  esverdeados_desc REAL DEFAULT 0,
  partidos_desc REAL DEFAULT 0,
  quebrados_desc REAL DEFAULT 0,
  desconto_total REAL DEFAULT 0,

  peso_corrigido REAL,

  data_emissao DATE,
  data_hora_entrada TIMESTAMPTZ,
  data_hora_saida TIMESTAMPTZ,

  romaneio_frete_id UUID,
  contrato_venda_id UUID,

  tarifa_id UUID REFERENCES tarifas_armazenagem(id),
  valor_recebimento REAL DEFAULT 0,
  valor_secagem REAL DEFAULT 0,

  status TEXT DEFAULT 'classificando',
  imagem_url TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- 8. Quebra Técnica
-- =========================================
CREATE TABLE IF NOT EXISTS quebra_tecnica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id UUID NOT NULL REFERENCES unidades_armazenadoras(id),
  depositante_id UUID NOT NULL REFERENCES cadastros(id),
  produto_id UUID NOT NULL REFERENCES produtos(id),
  safra_id UUID REFERENCES safras(id),
  data_calculo DATE NOT NULL,
  saldo_anterior REAL NOT NULL,
  taxa_diaria REAL NOT NULL DEFAULT 0.01,
  quebra_kg REAL NOT NULL,
  saldo_apos REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- 9. Cobranças de Armazenagem
-- =========================================
CREATE TABLE IF NOT EXISTS cobrancas_armazenagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id UUID NOT NULL REFERENCES unidades_armazenadoras(id),
  depositante_id UUID NOT NULL REFERENCES cadastros(id),
  produto_id UUID REFERENCES produtos(id),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  volume_base REAL,
  valor_unitario REAL,
  valor_total REAL,
  status TEXT DEFAULT 'aberto',
  data_vencimento DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- 10. Índices
-- =========================================
CREATE INDEX IF NOT EXISTS idx_estruturas_unidade ON estruturas_armazenamento(unidade_id);
CREATE INDEX IF NOT EXISTS idx_faixas_tabela ON faixas_desconto(tabela_id);
CREATE INDEX IF NOT EXISTS idx_tarifa_itens_tarifa ON tarifa_itens(tarifa_id);
CREATE INDEX IF NOT EXISTS idx_romaneios_armazem_unidade ON romaneios_armazem(unidade_id);
CREATE INDEX IF NOT EXISTS idx_romaneios_armazem_depositante ON romaneios_armazem(depositante_id);
CREATE INDEX IF NOT EXISTS idx_romaneios_armazem_produto ON romaneios_armazem(produto_id);
CREATE INDEX IF NOT EXISTS idx_romaneios_armazem_tipo ON romaneios_armazem(tipo);
CREATE INDEX IF NOT EXISTS idx_quebra_tecnica_depositante ON quebra_tecnica(depositante_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_depositante ON cobrancas_armazenagem(depositante_id);

-- =========================================
-- 11. Triggers updated_at
-- =========================================
CREATE TRIGGER trg_unidades_armazenadoras_updated_at BEFORE UPDATE ON unidades_armazenadoras FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_estruturas_armazenamento_updated_at BEFORE UPDATE ON estruturas_armazenamento FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tabelas_desconto_updated_at BEFORE UPDATE ON tabelas_desconto FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tarifas_armazenagem_updated_at BEFORE UPDATE ON tarifas_armazenagem FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_romaneios_armazem_updated_at BEFORE UPDATE ON romaneios_armazem FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_cobrancas_armazenagem_updated_at BEFORE UPDATE ON cobrancas_armazenagem FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =========================================
-- 12. RLS
-- =========================================
ALTER TABLE unidades_armazenadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE estruturas_armazenamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabelas_desconto ENABLE ROW LEVEL SECURITY;
ALTER TABLE faixas_desconto ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarifas_armazenagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarifa_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE romaneios_armazem ENABLE ROW LEVEL SECURITY;
ALTER TABLE quebra_tecnica ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobrancas_armazenagem ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON unidades_armazenadoras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON estruturas_armazenamento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tabelas_desconto FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON faixas_desconto FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tarifas_armazenagem FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tarifa_itens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON romaneios_armazem FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON quebra_tecnica FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON cobrancas_armazenagem FOR ALL USING (true) WITH CHECK (true);

-- Adicionar tipo 'Armazém' aos cadastros existentes se necessário
-- UPDATE cadastros SET tipos = array_append(tipos, 'Armazém') WHERE ... ;
