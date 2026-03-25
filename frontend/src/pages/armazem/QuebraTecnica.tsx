import { useEffect, useState, useMemo } from 'react'
import { TrendingDown, Play, ArrowUp, ArrowDown, ArrowUpDown, AlertTriangle, Calculator } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRomaneiosArmazem, getUnidadesArmazenadoras, getProdutos, getCadastros, getQuebraTecnica, calcularQuebraTecnica } from '../../services/api'
import { fmtDec, fmtInt, fmtData } from '../../utils/format'

type SortDir = 'asc' | 'desc'

interface SaldoDepositante {
  depositante_id: string
  depositante_nome: string
  produto_id: string
  produto_nome: string
  saldo_kg: number
  ultima_entrada: string | null
}

export default function QuebraTecnica() {
  const [romaneios, setRomaneios] = useState<any[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [cadastros, setCadastros] = useState<any[]>([])
  const [quebras, setQuebras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [unidadeSel, setUnidadeSel] = useState('KG')
  const [unidadeArmId, setUnidadeArmId] = useState('')
  const [taxaDiaria, setTaxaDiaria] = useState('0,01')
  const [sort, setSort] = useState<{ col: string; dir: SortDir }>({ col: 'saldo_kg', dir: 'desc' })
  const [sortQ, setSortQ] = useState<{ col: string; dir: SortDir }>({ col: 'data_calculo', dir: 'desc' })

  const load = async () => {
    setLoading(true)
    try {
      const [r, u, p, c, q] = await Promise.all([
        getRomaneiosArmazem(), getUnidadesArmazenadoras(), getProdutos(), getCadastros(), getQuebraTecnica(),
      ])
      setRomaneios(r)
      setUnidades(u)
      setProdutos(p)
      setCadastros(c)
      setQuebras(q)
    } catch (e: any) { toast.error(e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const conv = (kg: number) => {
    if (unidadeSel === 'SC') return kg / 60
    if (unidadeSel === 'TN') return kg / 1000
    return kg
  }

  // Calcular saldo atual por depositante × produto
  const saldos = useMemo(() => {
    const map: Record<string, SaldoDepositante> = {}
    const ativos = romaneios.filter(r => r.status !== 'cancelado')

    ativos.forEach(r => {
      const key = `${r.depositante_id}_${r.produto_id}`
      if (!map[key]) {
        map[key] = {
          depositante_id: r.depositante_id,
          depositante_nome: r.depositante_nome || 'Sem depositante',
          produto_id: r.produto_id,
          produto_nome: r.produto_nome || 'Sem produto',
          saldo_kg: 0,
          ultima_entrada: null,
        }
      }
      if (r.tipo === 'entrada') {
        map[key].saldo_kg += r.peso_corrigido || 0
        if (!map[key].ultima_entrada || r.data_emissao > map[key].ultima_entrada) {
          map[key].ultima_entrada = r.data_emissao
        }
      } else if (r.tipo === 'saida') {
        map[key].saldo_kg -= r.peso_corrigido || 0
      }
    })

    // Subtrair quebras já aplicadas
    quebras.forEach(q => {
      const key = `${q.depositante_id}_${q.produto_id}`
      if (map[key]) {
        map[key].saldo_kg -= q.quebra_kg || 0
      }
    })

    return Object.values(map).filter(s => s.saldo_kg > 0)
  }, [romaneios, quebras])

  const sortedSaldos = useMemo(() => {
    const arr = [...saldos]
    arr.sort((a: any, b: any) => {
      const va = a[sort.col], vb = b[sort.col]
      if (typeof va === 'number' && typeof vb === 'number') return sort.dir === 'asc' ? va - vb : vb - va
      return sort.dir === 'asc' ? String(va || '').localeCompare(String(vb || '')) : String(vb || '').localeCompare(String(va || ''))
    })
    return arr
  }, [saldos, sort])

  const sortedQuebras = useMemo(() => {
    const arr = [...quebras]
    arr.sort((a: any, b: any) => {
      const va = a[sortQ.col], vb = b[sortQ.col]
      if (typeof va === 'number' && typeof vb === 'number') return sortQ.dir === 'asc' ? va - vb : vb - va
      return sortQ.dir === 'asc' ? String(va || '').localeCompare(String(vb || '')) : String(vb || '').localeCompare(String(va || ''))
    })
    return arr
  }, [quebras, sortQ])

  const totalSaldo = saldos.reduce((s, r) => s + r.saldo_kg, 0)
  const totalQuebraAcumulada = quebras.reduce((s, q) => s + (q.quebra_kg || 0), 0)

  const handleCalcular = async () => {
    if (saldos.length === 0) return toast.error('Nenhum saldo para calcular quebra')
    const taxa = parseFloat(taxaDiaria.replace(',', '.'))
    if (isNaN(taxa) || taxa <= 0) return toast.error('Taxa diária inválida')

    setCalculating(true)
    try {
      const hoje = new Date().toISOString().split('T')[0]
      let count = 0
      for (const s of saldos) {
        if (s.saldo_kg <= 0) continue
        const quebraKg = s.saldo_kg * (taxa / 100)
        await calcularQuebraTecnica({
          unidade_id: unidadeArmId || unidades[0]?.id,
          depositante_id: s.depositante_id,
          produto_id: s.produto_id,
          data_calculo: hoje,
          saldo_anterior: s.saldo_kg,
          taxa_diaria: taxa,
          quebra_kg: quebraKg,
          saldo_apos: s.saldo_kg - quebraKg,
        })
        count++
      }
      toast.success(`Quebra técnica calculada para ${count} posições`)
      load()
    } catch (e: any) { toast.error(e.message) }
    setCalculating(false)
  }

  const SortHeader = ({ label, col, sortState, setSortState }: { label: string; col: string; sortState: any; setSortState: any }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100"
      onClick={() => setSortState({ col, dir: sortState.col === col && sortState.dir === 'asc' ? 'desc' : 'asc' })}>
      <span className="flex items-center gap-1">
        {label}
        {sortState.col === col ? (sortState.dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </span>
    </th>
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>

  return (
    <div className="space-y-6">
      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-gray-50 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-3 mb-4 border-b border-gray-200 shadow-sm flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-amber-600" /> Quebra Técnica
        </h1>
        <div className="flex items-center gap-2">
          {['KG', 'SC', 'TN'].map(u => (
            <button key={u} onClick={() => setUnidadeSel(u)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${unidadeSel === u ? 'bg-amber-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Saldo Total em Estoque</p>
          <p className="text-xl font-bold text-amber-700">{fmtDec(conv(totalSaldo))} {unidadeSel}</p>
          <p className="text-xs text-gray-400">{fmtInt(saldos.length)} posições</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Quebra Acumulada</p>
          <p className="text-xl font-bold text-red-600">{fmtDec(conv(totalQuebraAcumulada))} {unidadeSel}</p>
          <p className="text-xs text-gray-400">{fmtInt(quebras.length)} cálculos realizados</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Quebra Diária Estimada</p>
          <p className="text-xl font-bold text-orange-600">{fmtDec(conv(totalSaldo * (parseFloat(taxaDiaria.replace(',', '.')) || 0.01) / 100))} {unidadeSel}</p>
          <p className="text-xs text-gray-400">à taxa de {taxaDiaria}%/dia</p>
        </div>
      </div>

      {/* Painel de Cálculo */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Calcular Quebra Técnica do Dia
        </h2>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidade Armazenadora</label>
            <select value={unidadeArmId} onChange={e => setUnidadeArmId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[200px]">
              <option value="">Todas</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Taxa Diária (%)</label>
            <input value={taxaDiaria} onChange={e => setTaxaDiaria(e.target.value)} className="border rounded-lg px-3 py-2 text-sm w-24" />
          </div>
          <button onClick={handleCalcular} disabled={calculating}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50">
            {calculating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Play className="w-4 h-4" />}
            {calculating ? 'Calculando...' : 'Calcular Quebra Hoje'}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-700">
          <AlertTriangle className="w-3 h-3" />
          Aplica a taxa sobre o saldo atual de cada depositante × produto. Recomenda-se executar 1× por dia.
        </div>
      </div>

      {/* Saldos Atuais */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Saldo Atual por Depositante × Produto</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50">
              <SortHeader label="Depositante" col="depositante_nome" sortState={sort} setSortState={setSort} />
              <SortHeader label="Produto" col="produto_nome" sortState={sort} setSortState={setSort} />
              <SortHeader label={`Saldo (${unidadeSel})`} col="saldo_kg" sortState={sort} setSortState={setSort} />
              <SortHeader label="Última Entrada" col="ultima_entrada" sortState={sort} setSortState={setSort} />
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Quebra/Dia Est.</th>
            </tr></thead>
            <tbody>
              {sortedSaldos.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-400">Nenhum saldo em estoque</td></tr>
              ) : sortedSaldos.map((s, i) => {
                const quebraDia = s.saldo_kg * (parseFloat(taxaDiaria.replace(',', '.')) || 0.01) / 100
                return (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{s.depositante_nome}</td>
                    <td className="px-3 py-2">{s.produto_nome}</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmtDec(conv(s.saldo_kg))}</td>
                    <td className="px-3 py-2">{s.ultima_entrada ? fmtData(s.ultima_entrada) : '-'}</td>
                    <td className="px-3 py-2 text-right text-red-500">{fmtDec(conv(quebraDia))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico de Quebras */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Histórico de Quebras Calculadas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50">
              <SortHeader label="Data" col="data_calculo" sortState={sortQ} setSortState={setSortQ} />
              <SortHeader label="Depositante" col="depositante_nome" sortState={sortQ} setSortState={setSortQ} />
              <SortHeader label="Produto" col="produto_nome" sortState={sortQ} setSortState={setSortQ} />
              <SortHeader label={`Saldo Anterior (${unidadeSel})`} col="saldo_anterior" sortState={sortQ} setSortState={setSortQ} />
              <SortHeader label="Taxa (%)" col="taxa_diaria" sortState={sortQ} setSortState={setSortQ} />
              <SortHeader label={`Quebra (${unidadeSel})`} col="quebra_kg" sortState={sortQ} setSortState={setSortQ} />
              <SortHeader label={`Saldo Após (${unidadeSel})`} col="saldo_apos" sortState={sortQ} setSortState={setSortQ} />
            </tr></thead>
            <tbody>
              {sortedQuebras.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-gray-400">Nenhuma quebra calculada ainda</td></tr>
              ) : sortedQuebras.map(q => (
                <tr key={q.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{fmtData(q.data_calculo)}</td>
                  <td className="px-3 py-2">{q.depositante_nome}</td>
                  <td className="px-3 py-2">{q.produto_nome}</td>
                  <td className="px-3 py-2 text-right">{fmtDec(conv(q.saldo_anterior))}</td>
                  <td className="px-3 py-2 text-right">{fmtDec(q.taxa_diaria)}%</td>
                  <td className="px-3 py-2 text-right text-red-600 font-medium">{fmtDec(conv(q.quebra_kg))}</td>
                  <td className="px-3 py-2 text-right">{fmtDec(conv(q.saldo_apos))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
