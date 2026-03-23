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

    // 1. Transferir vínculos de ordens_carregamento
    const { error: errorOrdens } = await supabase
      .from('ordens_carregamento')
      .update({ fornecedor_id: keepId })
      .eq('fornecedor_id', removeId)

    if (errorOrdens && errorOrdens.code !== 'PGRST116') { // PGRST116 = sem registros encontrados (OK)
      console.error('Erro ao transferir ordens:', errorOrdens)
      throw new Error('Erro ao transferir ordens de carregamento')
    }

    // 2. Transferir vínculos de romaneios (se existir)
    const { error: errorRomaneios } = await supabase
      .from('romaneios')
      .update({ fornecedor_id: keepId })
      .eq('fornecedor_id', removeId)

    if (errorRomaneios && errorRomaneios.code !== 'PGRST116') {
      console.error('Erro ao transferir romaneios:', errorRomaneios)
      // Não vamos bloquear se a tabela não existir
    }

    // 3. Transferir vínculos de precos_contratados (se existir)
    const { error: errorPrecos } = await supabase
      .from('precos_contratados')
      .update({ cadastro_id: keepId })
      .eq('cadastro_id', removeId)

    if (errorPrecos && errorPrecos.code !== 'PGRST116') {
      console.error('Erro ao transferir preços:', errorPrecos)
      // Não vamos bloquear se a tabela não existir
    }

    // 4. Transferir veículos vinculados (se for motorista)
    const { error: errorVeiculos } = await supabase
      .from('veiculos')
      .update({ cadastro_id: keepId })
      .eq('cadastro_id', removeId)

    if (errorVeiculos && errorVeiculos.code !== 'PGRST116') {
      console.error('Erro ao transferir veículos:', errorVeiculos)
      throw new Error('Erro ao transferir veículos')
    }

    // 5. Transferir motoristas vinculados à transportadora (se for transportadora)
    const { error: errorMotoristas } = await supabase
      .from('cadastros')
      .update({ transportador_id: keepId })
      .eq('transportador_id', removeId)

    if (errorMotoristas && errorMotoristas.code !== 'PGRST116') {
      console.error('Erro ao transferir motoristas:', errorMotoristas)
      throw new Error('Erro ao transferir motoristas vinculados')
    }

    // 6. Desativar o cadastro removido
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
