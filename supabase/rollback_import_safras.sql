-- Desfazer importação de safras do Aegro
-- Deleta safras que foram importadas (possuem aegro_crop_key)
DELETE FROM safras WHERE aegro_crop_key IS NOT NULL;

-- Limpar culturas e anos_safra que possam ter sido criados automaticamente
-- (executar manualmente se necessário, verificando antes quais são)
-- DELETE FROM culturas WHERE nome NOT IN ('Soja', 'Milho', 'Sorgo', 'Feijão', 'Algodão', 'Trigo', 'Café', 'Cana-de-Açúcar');
-- DELETE FROM ano_safra WHERE nome NOT IN ('24/25', '25/26');
