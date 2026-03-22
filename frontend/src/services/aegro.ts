/**
 * Serviço de integração com a API do Aegro
 * Documentação: https://api.aegro.com.br
 * Base URL: https://api.aegro.com.br/api/v1
 * Auth: Bearer Token
 */

const AEGRO_BASE_URL = 'https://api.aegro.com.br/api/v1'

async function aegroFetch(endpoint: string, token: string, options?: RequestInit) {
  const resp = await fetch(`${AEGRO_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Aegro API erro ${resp.status}: ${text || resp.statusText}`)
  }
  return resp.json()
}

// Testar conexão — busca as farms vinculadas ao token
export async function aegroTestConnection(token: string): Promise<{ success: boolean; farms: any[]; error?: string }> {
  try {
    const farms = await aegroFetch('/farms', token)
    return { success: true, farms: Array.isArray(farms) ? farms : [] }
  } catch (err: any) {
    return { success: false, farms: [], error: err.message }
  }
}

// Buscar fazendas
export async function aegroGetFarms(token: string): Promise<any[]> {
  return aegroFetch('/farms', token)
}

// Buscar safras (crops) de uma fazenda
export async function aegroGetCrops(token: string, farmId: string): Promise<any[]> {
  return aegroFetch(`/farms/${farmId}/crops`, token)
}

// Buscar elementos (produtos/insumos) — via catálogo
export async function aegroGetElements(token: string, catalogId: string): Promise<any[]> {
  return aegroFetch(`/catalogs/${catalogId}/elements`, token)
}

// Buscar catálogos de uma fazenda
export async function aegroGetCatalogs(token: string, farmId: string): Promise<any[]> {
  return aegroFetch(`/farms/${farmId}/catalogs`, token)
}
