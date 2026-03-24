import { useEffect, useState, useMemo, useCallback } from 'react'
import { Truck, Scale, TrendingUp, DollarSign, FileText, Loader2, Filter, X, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronRight, MapPin, BarChart3 } from 'lucide-react'
import { getCadastros, getVeiculos, getProdutos, getPrecos, getOrdens, getRomaneios, getOperacoes, getAnosSafra, getSafras } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts'
import { fmtInt, fmtDec, fmtBRL } from '../utils/format'

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d', '#ea580c', '#6366f1']
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

type ViewMode = 'transportadora' | 'placa' | 'motorista'
type SortDir = 'asc' | 'desc' | null

const cadNome = (id: string, cadastros: any[]) => {
  const c = cadastros.find((x: any) => x.id === id)
  return c?.nome_fantasia || c?.nome || '-'
}

export default function Dashboard() {
  const [cadastros, setCadastros] = useState<any[]>([])
  const [veiculos, setVeiculos] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [precos, setPrecos] = useState<any[]>([])
  const [ordens, setOrdens] = useState<any[]>([])
  const [romaneios, setRomaneios] = useState<any[]>([])
  const [operacoes, setOperacoes] = useState<any[]>([])
  const [anosSafra, setAnosSafra] = useState<any[]>([])
  const [safras, setSafras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros globais
  const [filtroAnoSafra, setFiltroAnoSafra] = useState<string>('')
  const [filtroSafra, setFiltroSafra] = useState<string>('')
  const [filtroOrigem, setFiltroOrigem] = useState<string>('')
  const [filtroDestino, setFiltroDestino] = useState<string>('')
  const [filtroTransportadora, setFiltroTransportadora] = useState<string>('')
  const [filtroMotorista, setFiltroMotorista] = useState<string>('')
  const [filtroPlaca, setFiltroPlaca] = useState<string>('')
  const [filtroProduto, setFiltroProduto] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Visão de tabela
  const [viewMode, setViewMode] = useState<ViewMode>('transportadora')
  const [sortKey, setSortKey] = useState<string>('vlrTotal')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Seções colapsáveis
  const [secaoGraficos, setSecaoGraficos] = useState(true)
  const [secaoTabela, setSecaoTabela] = useState(true)
  const [secaoRotas, setSecaoRotas] = useState(true)

  useEffect(() => {
    Promise.all([
      getCadastros().catch(() => []),
      getVeiculos().catch(() => []),
      getProdutos().catch(() => []),
      getPrecos().catch(() => []),
      getOrdens().catch(() => []),
      getRomaneios().catch(() => []),
      getOperacoes().catch(() => []),
      getAnosSafra().catch(() => []),
      getSafras().catch(() => []),
    ]).then(([c, v, p, pr, o, r, ops, as_, sf]) => {
      setCadastros(c); setVeiculos(v); setProdutos(p); setPrecos(pr)
      setOrdens(o); setRomaneios(r); setOperacoes(ops); setAnosSafra(as_); setSafras(sf)
      setLoading(false)
    })
  }, [])

  // Calcular valor unitário frete por kg de um romaneio
  const calcVlrUnitKg = useCallback((item: any): number => {
    if (!item.ordem_id) return 0
    const ordem = ordens.find((o: any) => o.id === item.ordem_id)
    if (!ordem?.preco_id) return 0
    const preco = precos.find((p: any) => p.id === ordem.preco_id)
    if (!preco?.valor) return 0
    switch (preco.unidade_preco) {
      case 'R$/ton': return preco.valor / 1000
      case 'R$/sc': return preco.valor / 60
      default: return 0
    }
  }, [ordens, precos])

  // Calcular valor total frete de um romaneio (peso_liquido × vlr_unit)
  const calcVlrFrete = useCallback((item: any): number => {
    const pesoKg = item.peso_liquido || 0
    if (!pesoKg) return 0
    const vlrUnit = calcVlrUnitKg(item)
    return pesoKg * vlrUnit
  }, [calcVlrUnitKg])

  // Aplicar filtros globais
  const filteredRomaneios = useMemo(() => {
    return romaneios.filter((r: any) => {
      if (filtroAnoSafra && r.ano_safra_id !== filtroAnoSafra) return false
      if (filtroSafra) {
        const safraIds = r.safra_ids || []
        if (!safraIds.includes(filtroSafra)) return false
      }
      if (filtroOrigem && r.origem_id !== filtroOrigem) return false
      if (filtroDestino && r.destinatario_id !== filtroDestino) return false
      if (filtroTransportadora && r.transportadora_id !== filtroTransportadora) return false
      if (filtroMotorista && r.motorista_id !== filtroMotorista) return false
      if (filtroPlaca) {
        const veic = veiculos.find((v: any) => v.id === r.veiculo_id)
        if (!veic || veic.placa !== filtroPlaca) return false
      }
      if (filtroProduto && r.produto_id !== filtroProduto) return false
      return true
    })
  }, [romaneios, filtroAnoSafra, filtroSafra, filtroOrigem, filtroDestino, filtroTransportadora, filtroMotorista, filtroPlaca, filtroProduto, veiculos])

  const activeFiltersCount = [filtroAnoSafra, filtroSafra, filtroOrigem, filtroDestino, filtroTransportadora, filtroMotorista, filtroPlaca, filtroProduto].filter(Boolean).length

  const clearFilters = () => {
    setFiltroAnoSafra(''); setFiltroSafra(''); setFiltroOrigem(''); setFiltroDestino('')
    setFiltroTransportadora(''); setFiltroMotorista(''); setFiltroPlaca(''); setFiltroProduto('')
  }

  // KPIs
  const kpis = useMemo(() => {
    const totalViagens = filteredRomaneios.length
    const volSDesc = filteredRomaneios.reduce((s: number, r: any) => s + (r.peso_liquido || 0), 0)
    const volCDesc = filteredRomaneios.reduce((s: number, r: any) => s + (r.peso_corrigido || r.peso_liquido || 0), 0)
    const vlrTotal = filteredRomaneios.reduce((s: number, r: any) => s + calcVlrFrete(r), 0)
    const vlrUnitMedio = volSDesc > 0 ? (vlrTotal / volSDesc) * 1000 : 0 // R$/ton
    return { totalViagens, volSDesc, volCDesc, vlrTotal, vlrUnitMedio }
  }, [filteredRomaneios, calcVlrFrete])

  // Listas para filtros
  const transportadorasList = useMemo(() => cadastros.filter((c: any) => (c.tipos || []).includes('Transportadora')), [cadastros])
  const motoristasList = useMemo(() => cadastros.filter((c: any) => (c.tipos || []).includes('Motorista')), [cadastros])
  const origensList = useMemo(() => {
    const ids = new Set(romaneios.map((r: any) => r.origem_id).filter(Boolean))
    return cadastros.filter((c: any) => ids.has(c.id))
  }, [cadastros, romaneios])
  const destinosList = useMemo(() => {
    const ids = new Set(romaneios.map((r: any) => r.destinatario_id).filter(Boolean))
    return cadastros.filter((c: any) => ids.has(c.id))
  }, [cadastros, romaneios])
  const placasList = useMemo(() => {
    const ids = new Set(romaneios.map((r: any) => r.veiculo_id).filter(Boolean))
    return veiculos.filter((v: any) => ids.has(v.id))
  }, [veiculos, romaneios])

  // Dados agrupados por visão (transportadora/placa/motorista)
  const tabelaDados = useMemo(() => {
    const mapa: Record<string, { key: string; label: string; viagens: number; volSDesc: number; volCDesc: number; vlrTotal: number }> = {}
    filteredRomaneios.forEach((r: any) => {
      let groupKey = ''
      let groupLabel = ''
      if (viewMode === 'transportadora') {
        groupKey = r.transportadora_id || '_sem'
        groupLabel = r.transportadora_id ? cadNome(r.transportadora_id, cadastros) : 'Sem Transportadora'
      } else if (viewMode === 'placa') {
        const veic = veiculos.find((v: any) => v.id === r.veiculo_id)
        groupKey = r.veiculo_id || '_sem'
        groupLabel = veic?.placa || 'Sem Placa'
      } else {
        groupKey = r.motorista_id || '_sem'
        groupLabel = r.motorista_id ? cadNome(r.motorista_id, cadastros) : 'Sem Motorista'
      }
      if (!mapa[groupKey]) mapa[groupKey] = { key: groupKey, label: groupLabel, viagens: 0, volSDesc: 0, volCDesc: 0, vlrTotal: 0 }
      mapa[groupKey].viagens++
      mapa[groupKey].volSDesc += (r.peso_liquido || 0)
      mapa[groupKey].volCDesc += (r.peso_corrigido || r.peso_liquido || 0)
      mapa[groupKey].vlrTotal += calcVlrFrete(r)
    })
    let arr = Object.values(mapa)
    // Calcular vlrUnitMedio (R$/ton)
    const arrWithUnit = arr.map(item => ({
      ...item,
      vlrUnitMedio: item.volSDesc > 0 ? (item.vlrTotal / item.volSDesc) * 1000 : 0
    }))
    // Ordenação
    if (sortKey && sortDir) {
      arrWithUnit.sort((a: any, b: any) => {
        const va = sortKey === 'label' ? a.label.toLowerCase() : a[sortKey]
        const vb = sortKey === 'label' ? b.label.toLowerCase() : b[sortKey]
        if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
        return sortDir === 'asc' ? va - vb : vb - va
      })
    }
    return arrWithUnit
  }, [filteredRomaneios, viewMode, cadastros, veiculos, calcVlrFrete, sortKey, sortDir])

  // Dados agrupados por rota (origem → destino)
  const rotasDados = useMemo(() => {
    const mapa: Record<string, { rota: string; origId: string; destId: string; viagens: number; volSDesc: number; volCDesc: number; vlrTotal: number }> = {}
    filteredRomaneios.forEach((r: any) => {
      const origNome = r.origem_id ? cadNome(r.origem_id, cadastros) : 'N/D'
      const destNome = r.destinatario_id ? cadNome(r.destinatario_id, cadastros) : 'N/D'
      const key = `${r.origem_id || ''}_${r.destinatario_id || ''}`
      if (!mapa[key]) mapa[key] = { rota: `${origNome} → ${destNome}`, origId: r.origem_id, destId: r.destinatario_id, viagens: 0, volSDesc: 0, volCDesc: 0, vlrTotal: 0 }
      mapa[key].viagens++
      mapa[key].volSDesc += (r.peso_liquido || 0)
      mapa[key].volCDesc += (r.peso_corrigido || r.peso_liquido || 0)
      mapa[key].vlrTotal += calcVlrFrete(r)
    })
    return Object.values(mapa).sort((a, b) => b.vlrTotal - a.vlrTotal)
  }, [filteredRomaneios, cadastros, calcVlrFrete])

  // Peso transportado por mês
  const pesoMensal = useMemo(() => {
    const mapa: Record<string, { sDesc: number; cDesc: number }> = {}
    filteredRomaneios.forEach((r: any) => {
      const dt = r.data_saida_origem || r.data_emissao || r.created_at
      if (!dt) return
      const d = new Date(dt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!mapa[key]) mapa[key] = { sDesc: 0, cDesc: 0 }
      mapa[key].sDesc += (r.peso_liquido || 0)
      mapa[key].cDesc += (r.peso_corrigido || r.peso_liquido || 0)
    })
    return Object.entries(mapa)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([k, v]) => {
        const [y, m] = k.split('-')
        return { mes: `${MESES[parseInt(m) - 1]}/${y.slice(2)}`, sDesc: Math.round(v.sDesc / 1000), cDesc: Math.round(v.cDesc / 1000) }
      })
  }, [filteredRomaneios])

  // Valor frete mensal
  const freteMensal = useMemo(() => {
    const mapa: Record<string, number> = {}
    filteredRomaneios.forEach((r: any) => {
      const dt = r.data_saida_origem || r.data_emissao || r.created_at
      if (!dt) return
      const d = new Date(dt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      mapa[key] = (mapa[key] || 0) + calcVlrFrete(r)
    })
    return Object.entries(mapa)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([k, v]) => {
        const [y, m] = k.split('-')
        return { mes: `${MESES[parseInt(m) - 1]}/${y.slice(2)}`, valor: Math.round(v * 100) / 100 }
      })
  }, [filteredRomaneios, calcVlrFrete])

  // Peso por produto
  const pesoPorProduto = useMemo(() => {
    const mapa: Record<string, { nome: string; peso: number }> = {}
    filteredRomaneios.forEach((r: any) => {
      const prod = r.produto_id ? produtos.find((p: any) => p.id === r.produto_id) : null
      const nome = prod?.nome || r.produto || 'Outros'
      if (!mapa[nome]) mapa[nome] = { nome, peso: 0 }
      mapa[nome].peso += (r.peso_liquido || 0)
    })
    return Object.values(mapa).sort((a, b) => b.peso - a.peso).slice(0, 8)
      .map(item => ({ name: item.nome, value: Math.round(item.peso / 1000) }))
  }, [filteredRomaneios, produtos])

  // Status das ordens
  const statusOrdens = useMemo(() => {
    const mapa: Record<string, number> = {}
    ordens.forEach((o: any) => { mapa[o.status] = (mapa[o.status] || 0) + 1 })
    const labels: Record<string, string> = { pendente: 'Pendente', em_andamento: 'Em Andamento', concluido: 'Concluído', cancelado: 'Cancelado' }
    return Object.entries(mapa).map(([k, v]) => ({ name: labels[k] || k, value: v }))
  }, [ordens])

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc')
      if (sortDir === 'desc') setSortKey('')
    } else {
      setSortKey(key); setSortDir('desc')
    }
  }

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ArrowUpDown className="w-3 h-3 text-gray-300" />
    if (sortDir === 'asc') return <ArrowUp className="w-3 h-3 text-green-600" />
    return <ArrowDown className="w-3 h-3 text-green-600" />
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}: <span className="font-semibold">{p.dataKey === 'valor' ? fmtBRL(p.value) : `${fmtInt(p.value)} ton`}</span>
          </p>
        ))}
      </div>
    )
  }

  const FilterSelect = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="min-w-[160px]">
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white">
        <option value="">Todos</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  const SectionHeader = ({ title, open, toggle, icon: Icon }: { title: string; open: boolean; toggle: () => void; icon: any }) => (
    <button onClick={toggle} className="flex items-center gap-2 mb-3 group">
      {open ? <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-green-600" /> : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />}
      <Icon className="w-4 h-4 text-green-600" />
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
    </button>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-500">Carregando BI...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">BI Fretes</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${activeFiltersCount > 0 ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />
            Filtros {activeFiltersCount > 0 && <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFiltersCount}</span>}
          </button>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 border border-red-200">
              <X className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 animate-in fade-in">
          <div className="flex flex-wrap gap-3">
            <FilterSelect label="Ano Safra" value={filtroAnoSafra} onChange={setFiltroAnoSafra}
              options={anosSafra.map(a => ({ value: a.id, label: a.nome }))} />
            <FilterSelect label="Safra" value={filtroSafra} onChange={setFiltroSafra}
              options={safras.filter(s => !filtroAnoSafra || s.ano_safra_id === filtroAnoSafra).map(s => ({ value: s.id, label: s.nome }))} />
            <FilterSelect label="Produto" value={filtroProduto} onChange={setFiltroProduto}
              options={produtos.map(p => ({ value: p.id, label: p.nome }))} />
            <FilterSelect label="Origem" value={filtroOrigem} onChange={setFiltroOrigem}
              options={origensList.map(c => ({ value: c.id, label: c.nome_fantasia || c.nome }))} />
            <FilterSelect label="Destino" value={filtroDestino} onChange={setFiltroDestino}
              options={destinosList.map(c => ({ value: c.id, label: c.nome_fantasia || c.nome }))} />
            <FilterSelect label="Transportadora" value={filtroTransportadora} onChange={setFiltroTransportadora}
              options={transportadorasList.map(c => ({ value: c.id, label: c.nome_fantasia || c.nome }))} />
            <FilterSelect label="Motorista" value={filtroMotorista} onChange={setFiltroMotorista}
              options={motoristasList.map(c => ({ value: c.id, label: c.nome }))} />
            <FilterSelect label="Placa" value={filtroPlaca} onChange={v => setFiltroPlaca(v)}
              options={placasList.map(v => ({ value: v.placa, label: v.placa }))} />
          </div>
        </div>
      )}

      {/* Cards KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Viagens</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{fmtInt(kpis.totalViagens)}</p>
            </div>
            <div className="bg-teal-500 p-2.5 rounded-lg"><FileText className="w-5 h-5 text-white" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Vol. s/Desc (ton)</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{fmtDec(kpis.volSDesc / 1000, 1)}</p>
            </div>
            <div className="bg-green-600 p-2.5 rounded-lg"><Scale className="w-5 h-5 text-white" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Vol. c/Desc (ton)</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{fmtDec(kpis.volCDesc / 1000, 1)}</p>
            </div>
            <div className="bg-blue-600 p-2.5 rounded-lg"><TrendingUp className="w-5 h-5 text-white" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Vlr Unit Médio (R$/ton)</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{fmtBRL(kpis.vlrUnitMedio)}</p>
            </div>
            <div className="bg-orange-500 p-2.5 rounded-lg"><DollarSign className="w-5 h-5 text-white" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Vlr Total a Receber</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{fmtBRL(kpis.vlrTotal)}</p>
            </div>
            <div className="bg-emerald-600 p-2.5 rounded-lg"><Truck className="w-5 h-5 text-white" /></div>
          </div>
        </div>
      </div>

      {/* Seção: Gráficos */}
      <SectionHeader title="Gráficos" open={secaoGraficos} toggle={() => setSecaoGraficos(!secaoGraficos)} icon={BarChart3} />
      {secaoGraficos && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Volume transportado por mês */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Volume Transportado por Mês (ton)</h3>
              {pesoMensal.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={pesoMensal}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="sDesc" name="s/Desc (ton)" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cDesc" name="c/Desc (ton)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-400 text-sm text-center py-12">Sem dados</p>}
            </div>

            {/* Valor frete mensal */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Valor Frete por Mês</h3>
              {freteMensal.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={freteMensal}>
                    <defs>
                      <linearGradient id="colorFrete" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${fmtInt(v)}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="valor" name="Frete" stroke="#16a34a" fill="url(#colorFrete)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-400 text-sm text-center py-12">Sem dados</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Peso por produto */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Volume por Produto (ton)</h3>
              {pesoPorProduto.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pesoPorProduto} cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2} dataKey="value"
                      label={({ name, value }) => `${name}: ${fmtInt(value)}`}>
                      {pesoPorProduto.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${fmtInt(v)} ton`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-400 text-sm text-center py-12">Sem dados</p>}
            </div>

            {/* Status ordens */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Status das Ordens</h3>
              {statusOrdens.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusOrdens} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {statusOrdens.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-400 text-sm text-center py-12">Sem ordens</p>}
            </div>
          </div>
        </>
      )}

      {/* Seção: Tabela analítica por Transportadora/Placa/Motorista */}
      <SectionHeader title="Análise por Transportadora / Placa / Motorista" open={secaoTabela} toggle={() => setSecaoTabela(!secaoTabela)} icon={Truck} />
      {secaoTabela && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          {/* Tabs de visão */}
          <div className="flex border-b border-gray-200">
            {([['transportadora', 'Transportadora'], ['placa', 'Placa'], ['motorista', 'Motorista']] as [ViewMode, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setViewMode(key)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${viewMode === key ? 'text-green-700 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100" onClick={() => toggleSort('label')}>
                    <div className="flex items-center gap-1">{viewMode === 'transportadora' ? 'Transportadora' : viewMode === 'placa' ? 'Placa' : 'Motorista'} <SortIcon colKey="label" /></div>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100" onClick={() => toggleSort('viagens')}>
                    <div className="flex items-center gap-1 justify-end">Viagens <SortIcon colKey="viagens" /></div>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100" onClick={() => toggleSort('volSDesc')}>
                    <div className="flex items-center gap-1 justify-end">Vol. s/Desc (ton) <SortIcon colKey="volSDesc" /></div>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100" onClick={() => toggleSort('volCDesc')}>
                    <div className="flex items-center gap-1 justify-end">Vol. c/Desc (ton) <SortIcon colKey="volCDesc" /></div>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100" onClick={() => toggleSort('vlrUnitMedio')}>
                    <div className="flex items-center gap-1 justify-end">Vlr Unit (R$/ton) <SortIcon colKey="vlrUnitMedio" /></div>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100" onClick={() => toggleSort('vlrTotal')}>
                    <div className="flex items-center gap-1 justify-end">Vlr Total <SortIcon colKey="vlrTotal" /></div>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tabelaDados.map((row) => (
                  <tr key={row.key} className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (viewMode === 'transportadora' && row.key !== '_sem') { setFiltroTransportadora(row.key); setShowFilters(true) }
                      if (viewMode === 'motorista' && row.key !== '_sem') { setFiltroMotorista(row.key); setShowFilters(true) }
                      if (viewMode === 'placa' && row.key !== '_sem') {
                        const veic = veiculos.find(v => v.id === row.key)
                        if (veic) { setFiltroPlaca(veic.placa); setShowFilters(true) }
                      }
                    }}>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.label}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtInt(row.viagens)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtDec(row.volSDesc / 1000, 2)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtDec(row.volCDesc / 1000, 2)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtBRL(row.vlrUnitMedio)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">{fmtBRL(row.vlrTotal)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{kpis.vlrTotal > 0 ? fmtDec((row.vlrTotal / kpis.vlrTotal) * 100, 1) + '%' : '-'}</td>
                  </tr>
                ))}
                {tabelaDados.length > 0 && (
                  <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                    <td className="px-4 py-3 text-gray-800">TOTAL</td>
                    <td className="px-4 py-3 text-right text-gray-800">{fmtInt(tabelaDados.reduce((s, r) => s + r.viagens, 0))}</td>
                    <td className="px-4 py-3 text-right text-gray-800">{fmtDec(tabelaDados.reduce((s, r) => s + r.volSDesc, 0) / 1000, 2)}</td>
                    <td className="px-4 py-3 text-right text-gray-800">{fmtDec(tabelaDados.reduce((s, r) => s + r.volCDesc, 0) / 1000, 2)}</td>
                    <td className="px-4 py-3 text-right text-gray-800">{fmtBRL(kpis.vlrUnitMedio)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{fmtBRL(tabelaDados.reduce((s, r) => s + r.vlrTotal, 0))}</td>
                    <td className="px-4 py-3 text-right text-gray-800">100%</td>
                  </tr>
                )}
              </tbody>
            </table>
            {tabelaDados.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Sem dados para os filtros selecionados</p>}
          </div>
        </div>
      )}

      {/* Seção: Análise por Rota (Origem → Destino) */}
      <SectionHeader title="Análise por Rota (Origem → Destino)" open={secaoRotas} toggle={() => setSecaoRotas(!secaoRotas)} icon={MapPin} />
      {secaoRotas && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Rota</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Viagens</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Vol. s/Desc (ton)</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Vol. c/Desc (ton)</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Vlr Total</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rotasDados.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (row.origId) setFiltroOrigem(row.origId)
                      if (row.destId) setFiltroDestino(row.destId)
                      setShowFilters(true)
                    }}>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.rota}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtInt(row.viagens)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtDec(row.volSDesc / 1000, 2)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtDec(row.volCDesc / 1000, 2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">{fmtBRL(row.vlrTotal)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{kpis.vlrTotal > 0 ? fmtDec((row.vlrTotal / kpis.vlrTotal) * 100, 1) + '%' : '-'}</td>
                  </tr>
                ))}
                {rotasDados.length > 0 && (
                  <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                    <td className="px-4 py-3 text-gray-800">TOTAL</td>
                    <td className="px-4 py-3 text-right text-gray-800">{fmtInt(rotasDados.reduce((s, r) => s + r.viagens, 0))}</td>
                    <td className="px-4 py-3 text-right text-gray-800">{fmtDec(rotasDados.reduce((s, r) => s + r.volSDesc, 0) / 1000, 2)}</td>
                    <td className="px-4 py-3 text-right text-gray-800">{fmtDec(rotasDados.reduce((s, r) => s + r.volCDesc, 0) / 1000, 2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{fmtBRL(rotasDados.reduce((s, r) => s + r.vlrTotal, 0))}</td>
                    <td className="px-4 py-3 text-right text-gray-800">100%</td>
                  </tr>
                )}
              </tbody>
            </table>
            {rotasDados.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Sem dados para os filtros selecionados</p>}
          </div>
        </div>
      )}
    </div>
  )
}
