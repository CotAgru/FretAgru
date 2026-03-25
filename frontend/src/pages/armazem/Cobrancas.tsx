import { useEffect, useState, useMemo } from 'react'
import { CreditCard, Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, ArrowUpDown, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getCobrancas, createCobranca, updateCobranca, deleteCobranca,
  getUnidadesArmazenadoras, getProdutos, getCadastros, getTarifaItens, getTarifasArmazenagem,
  getRomaneiosArmazem,
} from '../../services/api'
import { fmtDec, fmtBRL, fmtData, fmtInt } from '../../utils/format'
import SearchableSelect from '../../components/SearchableSelect'
import Pagination from '../../components/Pagination'

type SortDir = 'asc' | 'desc'

const CATEGORIAS = [
  { value: 'recebimento', label: 'Recebimento' },
  { value: 'secagem', label: 'Secagem' },
  { value: 'estocagem', label: 'Estocagem' },
  { value: 'ad_valorem', label: 'Ad Valorem' },
  { value: 'expedicao', label: 'Expedição' },
  { value: 'transbordo', label: 'Transbordo' },
  { value: 'pesagem_avulsa', label: 'Pesagem Avulsa' },
  { value: 'classificacao', label: 'Classificação' },
  { value: 'expurgo', label: 'Expurgo' },
  { value: 'transgenia', label: 'Transgenia' },
  { value: 'taxa_permanencia', label: 'Taxa de Permanência' },
  { value: 'outros', label: 'Outros' },
]

const STATUS_OPTIONS = [
  { value: 'aberto', label: 'Aberto', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'pago', label: 'Pago', color: 'bg-green-100 text-green-700' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-700' },
]

export default function Cobrancas() {
  const [cobrancas, setCobrancas] = useState<any[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [cadastros, setCadastros] = useState<any[]>([])
  const [tarifas, setTarifas] = useState<any[]>([])
  const [romaneios, setRomaneios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showGerarModal, setShowGerarModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [sort, setSort] = useState<{ col: string; dir: SortDir }>({ col: 'created_at', dir: 'desc' })
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroDepositante, setFiltroDepositante] = useState('')
  const [generating, setGenerating] = useState(false)

  const [form, setForm] = useState<any>({
    unidade_id: '', depositante_id: '', produto_id: '', categoria: 'estocagem',
    descricao: '', periodo_inicio: '', periodo_fim: '', volume_base: '',
    valor_unitario: '', valor_total: '', status: 'aberto', data_vencimento: '', observacoes: '',
  })

  const [gerarForm, setGerarForm] = useState({
    unidade_id: '', tarifa_id: '', periodo_inicio: '', periodo_fim: '', data_vencimento: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const [c, u, p, ca, t, r] = await Promise.all([
        getCobrancas(), getUnidadesArmazenadoras(), getProdutos(),
        getCadastros(), getTarifasArmazenagem(), getRomaneiosArmazem(),
      ])
      setCobrancas(c)
      setUnidades(u)
      setProdutos(p)
      setCadastros(ca)
      setTarifas(t)
      setRomaneios(r)
    } catch (e: any) { toast.error(e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const depositanteOpts = useMemo(() => cadastros.map(c => ({ value: c.id, label: c.nome_fantasia || c.nome })), [cadastros])

  // Computar volume (saldo) por depositante × produto para período
  const saldosPeriodo = useMemo(() => {
    const map: Record<string, { depositante_id: string, depositante_nome: string, produto_id: string, produto_nome: string, volume: number }> = {}
    const ativos = romaneios.filter(r => r.status !== 'cancelado')
    ativos.forEach(r => {
      const key = `${r.depositante_id}_${r.produto_id}`
      if (!map[key]) {
        map[key] = {
          depositante_id: r.depositante_id,
          depositante_nome: r.depositante_nome || '',
          produto_id: r.produto_id,
          produto_nome: r.produto_nome || '',
          volume: 0,
        }
      }
      if (r.tipo === 'entrada') map[key].volume += r.peso_corrigido || 0
      else if (r.tipo === 'saida') map[key].volume -= r.peso_corrigido || 0
    })
    return Object.values(map).filter(s => s.volume > 0)
  }, [romaneios])

  const openCreate = () => {
    setEditId(null)
    setForm({
      unidade_id: unidades[0]?.id || '', depositante_id: '', produto_id: '', categoria: 'estocagem',
      descricao: '', periodo_inicio: '', periodo_fim: '', volume_base: '',
      valor_unitario: '', valor_total: '', status: 'aberto', data_vencimento: '', observacoes: '',
    })
    setShowModal(true)
  }

  const openEdit = (c: any) => {
    setEditId(c.id)
    setForm({
      unidade_id: c.unidade_id || '', depositante_id: c.depositante_id || '', produto_id: c.produto_id || '',
      categoria: c.categoria || 'estocagem', descricao: c.descricao || '',
      periodo_inicio: c.periodo_inicio || '', periodo_fim: c.periodo_fim || '',
      volume_base: c.volume_base != null ? String(c.volume_base) : '',
      valor_unitario: c.valor_unitario != null ? String(c.valor_unitario).replace('.', ',') : '',
      valor_total: c.valor_total != null ? String(c.valor_total).replace('.', ',') : '',
      status: c.status || 'aberto', data_vencimento: c.data_vencimento || '', observacoes: c.observacoes || '',
    })
    setShowModal(true)
  }

  const parseNum = (v: string): number | null => {
    if (!v) return null
    const n = parseFloat(v.replace(/\./g, '').replace(',', '.'))
    return isNaN(n) ? null : n
  }

  // Auto-calcular valor_total quando volume e valor_unitario mudam
  useEffect(() => {
    const vol = parseNum(form.volume_base)
    const unit = parseNum(form.valor_unitario)
    if (vol && unit) {
      // volume está em kg, valor pode ser R$/ton
      const total = (vol / 1000) * unit
      setForm((prev: any) => ({ ...prev, valor_total: total.toFixed(2).replace('.', ',') }))
    }
  }, [form.volume_base, form.valor_unitario])

  const handleSave = async () => {
    if (!form.unidade_id) return toast.error('Unidade é obrigatória')
    if (!form.depositante_id) return toast.error('Depositante é obrigatório')
    if (!form.categoria) return toast.error('Categoria é obrigatória')
    try {
      const payload = {
        ...form,
        volume_base: parseNum(form.volume_base),
        valor_unitario: parseNum(form.valor_unitario),
        valor_total: parseNum(form.valor_total),
        produto_id: form.produto_id || null,
        data_vencimento: form.data_vencimento || null,
      }
      if (editId) {
        await updateCobranca(editId, payload)
        toast.success('Cobrança atualizada')
      } else {
        await createCobranca(payload)
        toast.success('Cobrança criada')
      }
      setShowModal(false)
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta cobrança?')) return
    try {
      await deleteCobranca(id)
      toast.success('Cobrança excluída')
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  const openGerar = () => {
    setGerarForm({
      unidade_id: unidades[0]?.id || '',
      tarifa_id: tarifas[0]?.id || '',
      periodo_inicio: '',
      periodo_fim: '',
      data_vencimento: '',
    })
    setShowGerarModal(true)
  }

  const handleGerar = async () => {
    if (!gerarForm.tarifa_id) return toast.error('Selecione uma tarifa')
    if (!gerarForm.periodo_inicio || !gerarForm.periodo_fim) return toast.error('Informe o período')

    setGenerating(true)
    try {
      const itens = await getTarifaItens(gerarForm.tarifa_id)
      if (itens.length === 0) {
        toast.error('A tarifa selecionada não possui itens')
        setGenerating(false)
        return
      }

      let count = 0
      for (const saldo of saldosPeriodo) {
        for (const item of itens) {
          if (item.produto_id && item.produto_id !== saldo.produto_id) continue

          const volumeTons = saldo.volume / 1000
          const valorTotal = volumeTons * item.valor

          await createCobranca({
            unidade_id: gerarForm.unidade_id || unidades[0]?.id,
            depositante_id: saldo.depositante_id,
            produto_id: saldo.produto_id,
            categoria: item.categoria,
            descricao: `${item.descricao} — ${saldo.produto_nome}`,
            periodo_inicio: gerarForm.periodo_inicio,
            periodo_fim: gerarForm.periodo_fim,
            volume_base: saldo.volume,
            valor_unitario: item.valor,
            valor_total: valorTotal,
            status: 'aberto',
            data_vencimento: gerarForm.data_vencimento || null,
          })
          count++
        }
      }

      toast.success(`${count} cobranças geradas com sucesso`)
      setShowGerarModal(false)
      load()
    } catch (e: any) { toast.error(e.message) }
    setGenerating(false)
  }

  const filtered = useMemo(() => {
    let data = [...cobrancas]
    if (filtroStatus) data = data.filter(c => c.status === filtroStatus)
    if (filtroDepositante) data = data.filter(c => (c.depositante_nome || '').toLowerCase().includes(filtroDepositante.toLowerCase()))
    return data
  }, [cobrancas, filtroStatus, filtroDepositante])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a: any, b: any) => {
      const va = a[sort.col], vb = b[sort.col]
      if (typeof va === 'number' && typeof vb === 'number') return sort.dir === 'asc' ? va - vb : vb - va
      return sort.dir === 'asc' ? String(va || '').localeCompare(String(vb || '')) : String(vb || '').localeCompare(String(va || ''))
    })
    return arr
  }, [filtered, sort])

  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  const totais = useMemo(() => ({
    aberto: filtered.filter(c => c.status === 'aberto').reduce((s, c) => s + (c.valor_total || 0), 0),
    pago: filtered.filter(c => c.status === 'pago').reduce((s, c) => s + (c.valor_total || 0), 0),
    total: filtered.reduce((s, c) => s + (c.valor_total || 0), 0),
  }), [filtered])

  const SortHeader = ({ label, col }: { label: string; col: string }) => (
    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap"
      onClick={() => setSort({ col, dir: sort.col === col && sort.dir === 'asc' ? 'desc' : 'asc' })}>
      <span className="flex items-center gap-1">
        {label}
        {sort.col === col ? (sort.dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </span>
    </th>
  )

  const statusBadge = (s: string) => {
    const opt = STATUS_OPTIONS.find(o => o.value === s)
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt?.color || 'bg-gray-100 text-gray-700'}`}>{opt?.label || s}</span>
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2"><CreditCard className="w-6 h-6 text-amber-600" /> Cobranças de Armazenagem</h1>
        <div className="flex gap-2">
          <button onClick={openGerar} className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">
            <CheckCircle className="w-4 h-4" /> Gerar em Lote
          </button>
          <button onClick={openCreate} className="flex items-center gap-1 bg-amber-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-amber-700">
            <Plus className="w-4 h-4" /> Nova Cobrança
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2"><Clock className="w-4 h-4 text-yellow-600" /><p className="text-xs text-gray-500">Total em Aberto</p></div>
          <p className="text-xl font-bold text-yellow-700">{fmtBRL(totais.aberto)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /><p className="text-xs text-gray-500">Total Pago</p></div>
          <p className="text-xl font-bold text-green-700">{fmtBRL(totais.pago)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2"><CreditCard className="w-4 h-4 text-gray-600" /><p className="text-xs text-gray-500">Total Geral</p></div>
          <p className="text-xl font-bold text-gray-700">{fmtBRL(totais.total)}</p>
          <p className="text-xs text-gray-400">{fmtInt(filtered.length)} cobranças</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-1.5 text-sm">
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input value={filtroDepositante} onChange={e => { setFiltroDepositante(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Buscar depositante..." />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50">
            <SortHeader label="Período" col="periodo_inicio" />
            <SortHeader label="Depositante" col="depositante_nome" />
            <SortHeader label="Categoria" col="categoria" />
            <SortHeader label="Descrição" col="descricao" />
            <SortHeader label="Volume (kg)" col="volume_base" />
            <SortHeader label="Valor Unit." col="valor_unitario" />
            <SortHeader label="Valor Total" col="valor_total" />
            <SortHeader label="Vencimento" col="data_vencimento" />
            <SortHeader label="Status" col="status" />
            <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Ações</th>
          </tr></thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-400">Nenhuma cobrança encontrada</td></tr>
            ) : paged.map((c: any) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-2 py-2 whitespace-nowrap text-xs">
                  {c.periodo_inicio && c.periodo_fim ? `${fmtData(c.periodo_inicio)} — ${fmtData(c.periodo_fim)}` : '-'}
                </td>
                <td className="px-2 py-2 truncate max-w-[120px]">{c.depositante_nome}</td>
                <td className="px-2 py-2 capitalize text-xs">{CATEGORIAS.find(cat => cat.value === c.categoria)?.label || c.categoria}</td>
                <td className="px-2 py-2 truncate max-w-[150px]">{c.descricao || '-'}</td>
                <td className="px-2 py-2 text-right">{c.volume_base ? fmtDec(c.volume_base) : '-'}</td>
                <td className="px-2 py-2 text-right">{c.valor_unitario ? fmtBRL(c.valor_unitario) : '-'}</td>
                <td className="px-2 py-2 text-right font-semibold">{c.valor_total ? fmtBRL(c.valor_total) : '-'}</td>
                <td className="px-2 py-2 whitespace-nowrap">{c.data_vencimento ? fmtData(c.data_vencimento) : '-'}</td>
                <td className="px-2 py-2">{statusBadge(c.status)}</td>
                <td className="px-2 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={page} totalItems={sorted.length} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editId ? 'Editar' : 'Nova'} Cobrança</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unidade *</label>
                  <select value={form.unidade_id} onChange={e => setForm({ ...form, unidade_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categoria *</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Depositante *</label>
                <SearchableSelect options={depositanteOpts} value={form.depositante_id} onChange={v => setForm({ ...form, depositante_id: v })} placeholder="Buscar depositante..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Produto</label>
                  <select value={form.produto_id} onChange={e => setForm({ ...form, produto_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Todos</option>
                    {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Período Início</label>
                  <input type="date" value={form.periodo_inicio} onChange={e => setForm({ ...form, periodo_inicio: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Período Fim</label>
                  <input type="date" value={form.periodo_fim} onChange={e => setForm({ ...form, periodo_fim: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Volume Base (kg)</label>
                  <input value={form.volume_base} onChange={e => setForm({ ...form, volume_base: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valor Unit. (R$/ton)</label>
                  <input value={form.valor_unitario} onChange={e => setForm({ ...form, valor_unitario: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valor Total (R$)</label>
                  <input value={form.valor_total} onChange={e => setForm({ ...form, valor_total: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Data Vencimento</label>
                  <input type="date" value={form.data_vencimento} onChange={e => setForm({ ...form, data_vencimento: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerar em Lote */}
      {showGerarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Gerar Cobranças em Lote</h2>
              <button onClick={() => setShowGerarModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-gray-500">Gera cobranças para todos os depositantes com saldo, aplicando os itens da tarifa selecionada sobre o volume em estoque (R$/ton × volume).</p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tarifa *</label>
                <select value={gerarForm.tarifa_id} onChange={e => setGerarForm({ ...gerarForm, tarifa_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Selecione...</option>
                  {tarifas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unidade Armazenadora</label>
                <select value={gerarForm.unidade_id} onChange={e => setGerarForm({ ...gerarForm, unidade_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Todas</option>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Período Início *</label>
                  <input type="date" value={gerarForm.periodo_inicio} onChange={e => setGerarForm({ ...gerarForm, periodo_inicio: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Período Fim *</label>
                  <input type="date" value={gerarForm.periodo_fim} onChange={e => setGerarForm({ ...gerarForm, periodo_fim: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Vencimento</label>
                <input type="date" value={gerarForm.data_vencimento} onChange={e => setGerarForm({ ...gerarForm, data_vencimento: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-700">
                {saldosPeriodo.length} depositantes com saldo serão cobrados.
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowGerarModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleGerar} disabled={generating} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                {generating ? 'Gerando...' : 'Gerar Cobranças'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
