/**
 * Vercel Serverless Function — Proxy para API Aegro
 * Contorna o bloqueio de CORS fazendo a chamada server-side
 * 
 * Uso: POST /api/aegro-proxy
 * Body: { endpoint: "/farms", token: "aegro_..." }
 */

export default async function handler(req, res) {
  // CORS headers para permitir chamadas do frontend
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' })
  }

  const { endpoint, token: rawToken } = req.body || {}

  if (!endpoint || !rawToken) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: endpoint, token' })
  }

  // Sanitizar token: remover espaços, quebras de linha, tabs (comum ao copiar de email)
  const token = rawToken.replace(/[\s\r\n\t]/g, '')

  const AEGRO_BASE = 'https://api.aegro.com.br/api/v1'

  // Tentar diferentes formatos de autenticação
  const authHeaders = [
    { 'Authorization': `Bearer ${token}` },
    { 'Authorization': token },
    { 'x-api-key': token },
  ]

  let lastStatus = 0
  let lastDetail = ''

  for (const authHeader of authHeaders) {
    try {
      const response = await fetch(`${AEGRO_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      lastStatus = response.status
      const text = await response.text()
      lastDetail = text

      if (response.ok) {
        let data
        try {
          data = JSON.parse(text)
        } catch {
          data = text
        }
        return res.status(200).json(data)
      }

      // Se não for 401/403, retornar o erro (não tentar outro formato)
      if (response.status !== 401 && response.status !== 403) {
        return res.status(response.status).json({
          error: `Aegro API erro ${response.status}`,
          detail: text,
        })
      }
    } catch (err) {
      lastDetail = err.message
    }
  }

  return res.status(lastStatus || 500).json({
    error: `Aegro API erro ${lastStatus}: autenticação falhou com todos os formatos`,
    detail: lastDetail,
    hint: 'Verifique se o token está correto e não expirou. O token deve começar com aegro_',
    debug: {
      url: `${AEGRO_BASE}${endpoint}`,
      tokenPrefix: token.substring(0, 15) + '...',
      tokenLength: token.length,
    },
  })
}
