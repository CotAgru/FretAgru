import { useEffect, useState, useMemo } from 'react'
import { Users, CarFront, Package, DollarSign, ClipboardList, FileText, Scale, TrendingUp, Loader2 } from 'lucide-react'
import { getCadastros, getVeiculos, getProdutos, getPrecos, getOrdens, getRomaneios, getOperacoes } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts'
import { fmtInt, fmtDec } from '../utils/format'

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d', '#ea580c', '#6366f1']
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function Dashboard() {
  const [cadastros, setCadastros] = useState<any[]>([])
  const [veiculos, setVeiculos] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [precos, setPrecos] = useState<any[]>([])
  const [ordens, setOrdens] = useState<any[]>([])
  const [romaneios, setRomaneios] = useState<any[]>([])
  const [operacoes, setOperacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCadastros().catch(() => []),
      getVeiculos().catch(() => []),
      getProdutos().catch(() => []),
      getPrecos().catch(() => []),
      getOrdens().catch(() => []),
      getRomaneios().catch(() => []),
      getOperacoes().catch(() => []),
    ]).then(([c, v, p, pr, o, r, ops]) => {
      setCadastros(c); setVeiculos(v); setProdutos(p); setPrecos(pr)
      setOrdens(o); setRomaneios(r); setOperacoes(ops)
      setLoading(false)
    })
  }, [])

  // Peso total transportado (kg)
  const pesoTotal = useMemo(() =>
    romaneios.reduce((acc: number, r: any) => acc + (r.peso_liquido || 0), 0)
  , [romaneios])

  const pesoCorrigidoTotal = useMemo(() =>
    romaneios.reduce((acc: number, r: any) => acc + (r.peso_corrigido || r.peso_liquido || 0), 0)
  , [romaneios])

  // Romaneios por mês (peso líquido)
  const pesoMensal = useMemo(() => {
    const mapa: Record<string, number> = {}
    romaneios.forEach((r: any) => {
      const dt = r.data_saida_origem || r.data_emissao || r.created_at
      if (!dt) return
      const d = new Date(dt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      mapa[key] = (mapa[key] || 0) + (r.peso_liquido || 0)
    })
    return Object.entries(mapa)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([k, v]) => {
        const [y, m] = k.split('-')
        return { mes: `${MESES[parseInt(m) - 1]}/${y.slice(2)}`, peso: Math.round(v / 1000) }
      })
  }, [romaneios])

  // Status das ordens
  const statusOrdens = useMemo(() => {
    const mapa: Record<string, number> = {}
    ordens.forEach((o: any) => { mapa[o.status] = (mapa[o.status] || 0) + 1 })
    const labels: Record<string, string> = {
      pendente: 'Pendente', em_andamento: 'Em Andamento', concluido: 'Concluído', cancelado: 'Cancelado'
    }
    return Object.entries(mapa).map(([k, v]) => ({ name: labels[k] || k, value: v }))
  }, [ordens])

  // Peso por produto
  const pesoPorProduto = useMemo(() => {
    const mapa: Record<string, { nome: string; peso: number }> = {}
    romaneios.forEach((r: any) => {
      const pid = r.produto_id
      if (!pid) return
      const prod = produtos.find((p: any) => p.id === pid)
      const nome = prod?.nome || r.produto || 'Outros'
      if (!mapa[nome]) mapa[nome] = { nome, peso: 0 }
      mapa[nome].peso += (r.peso_liquido || 0)
    })
    return Object.values(mapa)
      .sort((a, b) => b.peso - a.peso)
      .slice(0, 8)
      .map(item => ({ name: item.nome, value: Math.round(item.peso / 1000) }))
  }, [romaneios, produtos])

  // Top rotas (origem → destino)
  const topRotas = useMemo(() => {
    const mapa: Record<string, { rota: string; qtd: number; peso: number }> = {}
    romaneios.forEach((r: any) => {
      const orig = r.origem_id ? cadastros.find((c: any) => c.id === r.origem_id)?.nome_fantasia || cadastros.find((c: any) => c.id === r.origem_id)?.nome : null
      const dest = r.destinatario_id ? cadastros.find((c: any) => c.id === r.destinatario_id)?.nome_fantasia || cadastros.find((c: any) => c.id === r.destinatario_id)?.nome : null
      if (!orig || !dest) return
      const key = `${orig} → ${dest}`
      if (!mapa[key]) mapa[key] = { rota: key, qtd: 0, peso: 0 }
      mapa[key].qtd++
      mapa[key].peso += (r.peso_liquido || 0)
    })
    return Object.values(mapa).sort((a, b) => b.qtd - a.qtd).slice(0, 5)
  }, [romaneios, cadastros])

  // Evolução diária (últimos 30 dias)
  const evolucaoDiaria = useMemo(() => {
    const mapa: Record<string, { romaneios: number; peso: number }> = {}
    romaneios.forEach((r: any) => {
      const dt = r.data_saida_origem || r.data_emissao || r.created_at
      if (!dt) return
      const d = new Date(dt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!mapa[key]) mapa[key] = { romaneios: 0, peso: 0 }
      mapa[key].romaneios++
      mapa[key].peso += (r.peso_liquido || 0)
    })
    return Object.entries(mapa)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([k, v]) => {
        const parts = k.split('-')
        return { dia: `${parts[2]}/${parts[1]}`, romaneios: v.romaneios, peso: Math.round(v.peso / 1000) }
      })
  }, [romaneios])

  const cards = [
    { label: 'Ordens', value: ordens.length, icon: ClipboardList, color: 'bg-orange-500' },
    { label: 'Romaneios', value: romaneios.length, icon: FileText, color: 'bg-teal-500' },
    { label: 'Peso Líquido (ton)', value: fmtDec(pesoTotal / 1000, 1), icon: Scale, color: 'bg-green-600' },
    { label: 'Peso Corrigido (ton)', value: fmtDec(pesoCorrigidoTotal / 1000, 1), icon: TrendingUp, color: 'bg-blue-600' },
    { label: 'Cadastros', value: cadastros.length, icon: Users, color: 'bg-purple-500' },
    { label: 'Veículos', value: veiculos.length, icon: CarFront, color: 'bg-rose-500' },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}: <span className="font-semibold">{fmtInt(p.value)}</span>
            {p.dataKey === 'peso' ? ' ton' : ''}
          </p>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-500">Carregando dashboard...</span>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{card.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráficos - linha 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Peso transportado por mês */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Peso Transportado por Mês (ton)</h3>
          {pesoMensal.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pesoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="peso" name="Peso (ton)" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">Sem dados de romaneios</p>
          )}
        </div>

        {/* Status das ordens */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Status das Ordens</h3>
          {statusOrdens.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusOrdens} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusOrdens.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">Sem ordens cadastradas</p>
          )}
        </div>
      </div>

      {/* Gráficos - linha 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Peso por produto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Peso por Produto (ton)</h3>
          {pesoPorProduto.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pesoPorProduto} cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name}: ${fmtInt(value)}`}>
                  {pesoPorProduto.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `${fmtInt(v)} ton`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">Sem dados</p>
          )}
        </div>

        {/* Top Rotas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Rotas (por quantidade de romaneios)</h3>
          {topRotas.length > 0 ? (
            <div className="space-y-3">
              {topRotas.map((rota, i) => (
                <div key={rota.rota}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate mr-2 font-medium">{rota.rota}</span>
                    <span className="text-gray-500 whitespace-nowrap">{rota.qtd} rom. · {fmtInt(Math.round(rota.peso / 1000))} ton</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${(rota.qtd / topRotas[0].qtd) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">Sem dados</p>
          )}
        </div>
      </div>

      {/* Gráfico - evolução diária */}
      {evolucaoDiaria.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolução Diária — Últimos 30 dias</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={evolucaoDiaria}>
              <defs>
                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area yAxisId="left" type="monotone" dataKey="peso" name="Peso (ton)" stroke="#16a34a" fill="url(#colorPeso)" strokeWidth={2} />
              <Area yAxisId="right" type="monotone" dataKey="romaneios" name="Romaneios" stroke="#2563eb" fill="url(#colorRom)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
