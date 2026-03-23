import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { keepId, removeId } = req.body

    if (!keepId || !removeId) {
      return res.status(400).json({ error: 'keepId e removeId são obrigatórios' })
    }

    if (keepId === removeId) {
      return res.status(400).json({ error: 'keepId e removeId não podem ser iguais' })
    }

    // Helper: transferir FK de uma tabela, ignorando erros se tabela/coluna não existir
    const transferFK = async (tabela, coluna) => {
      try {
        const { error } = await supabase.from(tabela).update({ [coluna]: keepId }).eq(coluna, removeId)
        if (error && error.code !== 'PGRST116' && error.code !== '42P01' && error.code !== '42703') {
          console.error(`Erro ao transferir ${tabela}.${coluna}:`, error)
        }
      } catch (e) {
        console.error(`Exceção ao transferir ${tabela}.${coluna}:`, e)
      }
    }

    // 1. Ordens de carregamento
    await transferFK('ordens_carregamento', 'origem_id')
    await transferFK('ordens_carregamento', 'destino_id')
    await transferFK('ordens_carregamento', 'transportador_id')
    await transferFK('ordens_carregamento', 'motorista_id')

    // 2. Ordem transportadores
    await transferFK('ordem_transportadores', 'transportador_id')
    await transferFK('ordem_transportadores', 'motorista_id')

    // 3. Romaneios (todos os campos que referenciam cadastros)
    await transferFK('romaneios', 'origem_id')
    await transferFK('romaneios', 'destinatario_id')
    await transferFK('romaneios', 'produtor_id')
    await transferFK('romaneios', 'motorista_id')
    await transferFK('romaneios', 'transportadora_id')

    // 4. Preços contratados
    await transferFK('precos_contratados', 'origem_id')
    await transferFK('precos_contratados', 'destino_id')
    await transferFK('precos_contratados', 'fornecedor_id')

    // 5. Veículos
    await transferFK('veiculos', 'cadastro_id')

    // 6. Cadastros (motoristas vinculados à transportadora)
    await transferFK('cadastros', 'transportador_id')

    // 7. Contratos de venda
    await transferFK('contratos_venda', 'comprador_id')
    await transferFK('contratos_venda', 'corretor_id')
    await transferFK('contratos_venda', 'local_entrega_id')

    // 8. Contratos de compra de insumo
    await transferFK('contratos_compra_insumo', 'fornecedor_id')

    // 9. Desativar o cadastro removido
    const obsAntigas = await getObservacoes(removeId)
    const { error: errorDesativar } = await supabase
      .from('cadastros')
      .update({ 
        ativo: false,
        observacoes: `[MESCLADO com cadastro ${keepId}]${obsAntigas || ''}`
      })
      .eq('id', removeId)

    if (errorDesativar) {
      console.error('Erro ao desativar cadastro:', errorDesativar)
      throw new Error('Erro ao desativar cadastro removido')
    }

    // Retornar sucesso
    return res.status(200).json({
      success: true,
      message: 'Cadastros mesclados com sucesso',
      keepId,
      removeId
    })

  } catch (err) {
    console.error('Erro ao mesclar cadastros:', err)
    return res.status(500).json({ 
      error: err.message || 'Erro ao mesclar cadastros'
    })
  }
}

// Helper para obter observações atuais
async function getObservacoes(cadastroId) {
  const { data } = await supabase
    .from('cadastros')
    .select('observacoes')
    .eq('id', cadastroId)
    .single()
  
  return data?.observacoes ? ` ${data.observacoes}` : ''
}
