-- FretAgru v2 - Dados iniciais (seed)
-- Execute apos o migration.sql

-- Cadastros (tabela unificada: fazendas, armazens, transportadoras, motoristas etc.)
INSERT INTO cadastros (cpf_cnpj, nome, nome_fantasia, telefone1, telefone2, uf, cidade, tipos, latitude, longitude) VALUES
  ('12.345.678/0001-90', 'Fazenda Santa Maria Ltda', 'Fazenda Santa Maria', '(64)99999-1111', NULL, 'GO', 'Rio Verde', ARRAY['Fazenda'], -17.7927, -50.9192),
  ('98.765.432/0001-10', 'Fazenda Boa Esperanca S/A', 'Fazenda Boa Esperanca', '(64)99999-2222', NULL, 'GO', 'Jatai', ARRAY['Fazenda'], -17.8819, -51.7144),
  ('11.222.333/0001-44', 'Caramuru Alimentos S/A', 'Caramuru Alimentos', '(64)3611-2000', '(64)3611-2001', 'GO', 'Itumbiara', ARRAY['Armazem', 'Industria'], -18.4097, -49.2153),
  ('22.333.444/0001-55', 'Armazem Central Rio Verde Ltda', 'Armazem Central', '(64)99999-3333', NULL, 'GO', 'Rio Verde', ARRAY['Armazem'], -17.7948, -50.9286),
  ('33.444.555/0001-66', 'Transportes Silva Ltda', 'Transportes Silva', '(64)99999-4444', '(64)3621-5555', 'GO', 'Rio Verde', ARRAY['Transportadora'], NULL, NULL),
  ('44.555.666/0001-77', 'Rodograos Transportes Ltda', 'Rodograos', '(62)99999-5555', NULL, 'GO', 'Goiania', ARRAY['Transportadora'], NULL, NULL),
  ('55.666.777/0001-88', 'Joao Caminhoneiro ME', 'Joao Caminhoneiro', '(64)99999-6666', NULL, 'GO', 'Rio Verde', ARRAY['Motorista', 'Transportadora'], NULL, NULL),
  ('66.777.888/0001-99', 'Calcario Montividiu Ltda', 'Calcario Montividiu', '(64)99999-7777', NULL, 'GO', 'Montividiu', ARRAY['Fornecedor', 'Industria'], -17.4441, -51.1728),
  ('77.888.999/0001-00', 'Terminal Portuario Santos', 'Terminal Santos', '(13)3219-0000', NULL, 'SP', 'Santos', ARRAY['Porto'], -23.9536, -46.3346);

-- Produtos
INSERT INTO produtos (nome, tipo, unidade_medida) VALUES
  ('Soja em Grao', 'Grao', 'ton'),
  ('Milho em Grao', 'Grao', 'ton'),
  ('Sorgo em Grao', 'Grao', 'ton'),
  ('Feijao', 'Grao', 'sc'),
  ('Calcario', 'Insumo', 'ton'),
  ('Gesso Agricola', 'Insumo', 'ton'),
  ('Fertilizante MAP', 'Insumo', 'ton'),
  ('Fertilizante KCl', 'Insumo', 'ton'),
  ('Fertilizante Formulado', 'Insumo', 'ton');

-- Veiculos (tipos ANTT com eixos e peso pauta)
INSERT INTO veiculos (cadastro_id, placa, tipo_caminhao, eixos, peso_pauta_kg, marca, modelo, ano)
SELECT c.id, v.placa, v.tipo_caminhao, v.eixos, v.peso_pauta_kg, v.marca, v.modelo, v.ano
FROM (VALUES
  ('Transportes Silva', 'ABC1D23', 'Carreta', 6, 37000, 'Scania', 'R450', 2022),
  ('Transportes Silva', 'DEF4G56', 'Bitrem', 7, 42000, 'Volvo', 'FH 540', 2023),
  ('Rodograos', 'GHI7J89', 'Rodotrem', 9, 57000, 'Mercedes-Benz', 'Actros 2651', 2021),
  ('Rodograos', 'JKL0M12', 'Carreta', 6, 37000, 'DAF', 'XF 530', 2023),
  ('Joao Caminhoneiro', 'MNO3P45', 'Truck', 3, 14000, 'Volkswagen', 'Constellation 24.280', 2019)
) AS v(transportadora, placa, tipo_caminhao, eixos, peso_pauta_kg, marca, modelo, ano)
JOIN cadastros c ON c.nome_fantasia = v.transportadora;

-- Precos contratados
INSERT INTO precos_contratados (origem_id, destino_id, produto_id, fornecedor_id, valor, unidade_preco, distancia_km)
SELECT o.id, d.id, p.id, f.id, pc.valor, pc.unidade_preco, pc.distancia_km
FROM (VALUES
  ('Fazenda Santa Maria', 'Armazem Central', 'Soja em Grao', 'Transportes Silva', 45.00, 'R$/ton', 15),
  ('Fazenda Santa Maria', 'Caramuru Alimentos', 'Soja em Grao', 'Rodograos', 120.00, 'R$/ton', 250),
  ('Fazenda Boa Esperanca', 'Armazem Central', 'Milho em Grao', 'Transportes Silva', 55.00, 'R$/ton', 90),
  ('Calcario Montividiu', 'Fazenda Santa Maria', 'Calcario', 'Joao Caminhoneiro', 35.00, 'R$/ton', 40),
  ('Calcario Montividiu', 'Fazenda Boa Esperanca', 'Gesso Agricola', 'Joao Caminhoneiro', 35.00, 'R$/ton', 40)
) AS pc(origem_nome, destino_nome, produto_nome, fornecedor_nome, valor, unidade_preco, distancia_km)
JOIN cadastros o ON o.nome_fantasia = pc.origem_nome
JOIN cadastros d ON d.nome_fantasia = pc.destino_nome
JOIN produtos p ON p.nome = pc.produto_nome
JOIN cadastros f ON f.nome_fantasia = pc.fornecedor_nome;
