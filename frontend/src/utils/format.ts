// =============================================================
// iAgru - Utilitários de Formatação Padrão do Ecossistema
// Regras:
//   Números: ponto "." para milhar, vírgula "," para decimal
//   Datas:   DD/MM/AAAA
//   Moeda:   R$ 1.234,56
// =============================================================

/** Formatar número inteiro com separador de milhar (pt-BR): 45000 → "45.000" */
export const fmtInt = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined || v === '') return ''
  const n = typeof v === 'number' ? v : parseInt(String(v).replace(/\./g, '').replace(',', '.'), 10)
  if (isNaN(n)) return ''
  return n.toLocaleString('pt-BR')
}

/** Formatar número decimal com separador de milhar e vírgula decimal (pt-BR): 1234.5 → "1.234,50" */
export const fmtDec = (v: string | number | null | undefined, decimals = 2): string => {
  if (v === null || v === undefined || v === '') return ''
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\./g, '').replace(',', '.'))
  if (isNaN(n)) return ''
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/** Formatar percentual: 12.5 → "12,50%" */
export const fmtPerc = (v: string | number | null | undefined): string => {
  const formatted = fmtDec(v, 2)
  return formatted ? `${formatted}%` : ''
}

/** Formatar moeda BRL: 1234.5 → "R$ 1.234,50" */
export const fmtBRL = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined || v === '') return ''
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\./g, '').replace(',', '.'))
  if (isNaN(n)) return ''
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Formatar kg com separador de milhar: 45000 → "45.000" */
export const fmtKg = fmtInt

/** Parse kg formatado → number: "45.000" → 45000 */
export const parseKg = (v: string): number | null => {
  if (!v) return null
  const n = parseInt(v.replace(/\./g, ''), 10)
  return isNaN(n) ? null : n
}

/** Parse percentual/decimal formatado → number: "12,50" → 12.5 */
export const parseDecimal = (v: string): number | null => {
  if (!v) return null
  const n = parseFloat(v.replace(/\./g, '').replace(',', '.'))
  return isNaN(n) ? null : n
}

/**
 * Formatar data para DD/MM/AAAA.
 * Aceita: Date, ISO string (YYYY-MM-DD), timestamp string, etc.
 */
export const fmtData = (v: string | Date | null | undefined): string => {
  if (!v) return ''
  // Se já está no formato DD/MM/AAAA, retorna como está
  if (typeof v === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(v)) return v

  let date: Date
  if (v instanceof Date) {
    date = v
  } else if (typeof v === 'string') {
    // Formato YYYY-MM-DD (sem timezone issues)
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split('-').map(Number)
      date = new Date(y, m - 1, d)
    } else {
      date = new Date(v)
    }
  } else {
    return ''
  }
  if (isNaN(date.getTime())) return typeof v === 'string' ? v : ''
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/** Formatar data+hora: DD/MM/AAAA HH:mm */
export const fmtDataHora = (v: string | Date | null | undefined): string => {
  if (!v) return ''
  const date = v instanceof Date ? v : new Date(v)
  if (isNaN(date.getTime())) return typeof v === 'string' ? v : ''
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

/** Formatar distância em km: 350 → "350 km" */
export const fmtKm = (v: string | number | null | undefined): string => {
  const formatted = fmtInt(v)
  return formatted ? `${formatted} km` : ''
}
