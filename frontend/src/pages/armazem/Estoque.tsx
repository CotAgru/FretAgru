import { useEffect, useState, useMemo } from 'react'
import { BoxesIcon, ArrowUp, ArrowDown, ArrowUpDown, Filter } from 'lucide-react'
import { getRomaneiosArmazem, getUnidadesArmazenadoras, getProdutos, getCadastros, getAnosSafra } from '../../services/api'
import { fmtDec, fmtInt } from '../../utils/format'

type SortDir = 'asc' | 'desc'

interface EstoqueRow {
  depositante_id: string
  depositante_nome: string
  produto_id: string
  produto_nome: string
  entradas: number
  saidas: number
  saldo: number
  qtd_entradas: number
  qtd_saidas: number
}

export default function Estoque() {
  const [romaneios, setRomaneios] = useState<any[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [cadastros, setCadastros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unidadeSel, setUnidadeSel] = useState('KG')
  const [filtroProduto, setFiltroProduto] = useState('')
  const [filtroDepositante, setFiltroDepositante] = useState('')
  const [sort, setSort] = useState<{ col: string; dir: SortDir }>({ col: 'saldo', dir: 'desc' })

  useEffect(() => {
    Promise.all([
      getRomaneiosArmazem(),
      getUnidadesArmazenadoras(),
      getProdutos(),
      getCadastros(),
    ]).then(([r, u, p, c]) => {
      setRomaneios(r)
      setUnidades(u)
      setProdutos(p)
      setCadastros(c)
    }).finally(() => setLoading(false))
  }, [])

  const conv = (kg: number) => {
    if (unidadeSel === 'SC') return kg / 60
    if (unidadeSel === 'TN') return kg / 1000
    return kg
  }

  const estoqueData = useMemo(() => {
    const map: Record<string, EstoqueRow> = {}
    const ativos = romaneios.filter(r => r.status !== 'cancelado')

    ativos.forEach(r => {
      const key = `${r.depositante_id}_${r.produto_id}`
      if (!map[key]) {
        map[key] = {
          depositante_id: r.depositante_id,
          depositante_nome: r.depositante_nome || 'Sem depositante',
          produto_id: r.produto_id,
          produto_nome: r.produto_nome || 'Sem produto',
          entradas: 0, saidas: 0, saldo: 0, qtd_entradas: 0, qtd_saidas: 0,
        }
      }
      if (r.tipo === 'entrada') {
        map[key].entradas += r.peso_corrigido || 0
        map[key].qtd_entradas++
      } else if (r.tipo === 'saida') {
        map[key].saidas += r.peso_corrigido || 0
        map[key].qtd_saidas++
      }
    })

    return Object.values(map).map(v => ({ ...v, saldo: v.entradas - v.saidas }))
  }, [romaneios])

  const filtered = useMemo(() => {
    let data = [...estoqueData]
    if (filtroProduto) data = data.filter(d => d.produto_id === filtroProduto)
    if (filtroDepositante) data = data.filter(d => d.depositante_nome.toLowerCase().includes(filtroDepositante.toLowerCase()))
    return data
  }, [estoqueData, filtroProduto, filtroDepositante])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a: any, b: any) => {
      const va = a[sort.col], vb = b[sort.col]
      if (typeof va === 'number' && typeof vb === 'number') return sort.dir === 'asc' ? va - vb : vb - va
      return sort.dir === 'asc' ? String(va || '').localeCompare(String(vb || '')) : String(vb || '').localeCompare(String(va || ''))
    })
    return arr
  }, [filtered, sort])

  const totais = useMemo(() => ({
    entradas: filtered.reduce((s, r) => s + r.entradas, 0),
    saidas: filtered.reduce((s, r) => s + r.saidas, 0),
    saldo: filtered.reduce((s, r) => s + r.saldo, 0),
  }), [filtered])

  const SortHeader = ({ label, col }: { label: string; col: string }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100"
      onClick={() => setSort({ col, dir: sort.col === col && sort.dir === 'asc' ? 'desc' : 'asc' })}>
      <span className="flex items-center gap-1">
        {label}
        {sort.col === col ? (sort.dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </span>
    </th>
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>

  return (
    <div className="space-y-4">
      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-gray-50 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-3 mb-4 border-b border-gray-200 shadow-sm flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2"><BoxesIcon className="w-6 h-6 text-amber-600" /> Estoque por Depositante</h1>
        <div className="flex items-center gap-2">
          {['KG', 'SC', 'TN'].map(u => (
            <button key={u} onClick={() => setUnidadeSel(u)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${unidadeSel === u ? 'bg-amber-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Total Entradas</p>
          <p className="text-xl font-bold text-green-600">{fmtDec(conv(totais.entradas))} {unidadeSel}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Total Saídas</p>
          <p className="text-xl font-bold text-red-600">{fmtDec(conv(totais.saidas))} {unidadeSel}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Saldo em Estoque</p>
          <p className="text-xl font-bold text-amber-700">{fmtDec(conv(totais.saldo))} {unidadeSel}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-gray-600"><Filter className="w-4 h-4" /> Filtros:</div>
        <select value={filtroProduto} onChange={e => setFiltroProduto(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
          <option value="">Todos os produtos</option>
          {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <input value={filtroDepositante} onChange={e => setFiltroDepositante(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Buscar depositante..." />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50">
            <SortHeader label="Depositante" col="depositante_nome" />
            <SortHeader label="Produto" col="produto_nome" />
            <SortHeader label={`Entradas (${unidadeSel})`} col="entradas" />
            <SortHeader label="Qtd Ent." col="qtd_entradas" />
            <SortHeader label={`Saídas (${unidadeSel})`} col="saidas" />
            <SortHeader label="Qtd Saí." col="qtd_saidas" />
            <SortHeader label={`Saldo (${unidadeSel})`} col="saldo" />
          </tr></thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Sem dados de estoque</td></tr>
            ) : sorted.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{row.depositante_nome}</td>
                <td className="px-3 py-2">{row.produto_nome}</td>
                <td className="px-3 py-2 text-right text-green-600">{fmtDec(conv(row.entradas))}</td>
                <td className="px-3 py-2 text-center text-gray-400">{fmtInt(row.qtd_entradas)}</td>
                <td className="px-3 py-2 text-right text-red-600">{fmtDec(conv(row.saidas))}</td>
                <td className="px-3 py-2 text-center text-gray-400">{fmtInt(row.qtd_saidas)}</td>
                <td className="px-3 py-2 text-right font-bold">{fmtDec(conv(row.saldo))}</td>
              </tr>
            ))}
          </tbody>
          {sorted.length > 0 && (
            <tfoot><tr className="bg-gray-50 font-semibold border-t-2">
              <td className="px-3 py-2" colSpan={2}>TOTAL</td>
              <td className="px-3 py-2 text-right text-green-700">{fmtDec(conv(totais.entradas))}</td>
              <td className="px-3 py-2 text-center">{fmtInt(filtered.reduce((s, r) => s + r.qtd_entradas, 0))}</td>
              <td className="px-3 py-2 text-right text-red-700">{fmtDec(conv(totais.saidas))}</td>
              <td className="px-3 py-2 text-center">{fmtInt(filtered.reduce((s, r) => s + r.qtd_saidas, 0))}</td>
              <td className="px-3 py-2 text-right text-amber-700">{fmtDec(conv(totais.saldo))}</td>
            </tr></tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
