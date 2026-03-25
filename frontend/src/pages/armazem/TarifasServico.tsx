import { useEffect, useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, X, Receipt, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTarifasArmazenagem, createTarifaArmazenagem, updateTarifaArmazenagem, deleteTarifaArmazenagem, getTarifaItens, createTarifaItem, updateTarifaItem, deleteTarifaItem, getUnidadesArmazenadoras, getProdutos, getAnosSafra } from '../../services/api'
import { fmtDec, fmtBRL } from '../../utils/format'

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

const UNIDADES_COBRANCA = [
  'R$/ton', 'R$/ton/quinzena', 'R$/unidade', 'R$/amostra', 'R$/ton/ponto',
]

const FORMAS = [
  { value: '', label: 'Todos' },
  { value: 'granel', label: 'Granel' },
  { value: 'ensacado', label: 'Ensacado' },
  { value: 'enfardado', label: 'Enfardado' },
  { value: 'big_bag', label: 'Big Bag' },
]

export default function TarifasServico() {
  const [tarifas, setTarifas] = useState<any[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [anosSafra, setAnosSafra] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [itens, setItens] = useState<any[]>([])
  const [loadingItens, setLoadingItens] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editItemId, setEditItemId] = useState<string | null>(null)
  const [sort, setSort] = useState<{ col: string; dir: SortDir }>({ col: 'nome', dir: 'asc' })

  const [form, setForm] = useState({
    nome: '', unidade_id: '', ano_safra_id: '', vigencia_inicio: '', vigencia_fim: '', observacoes: '',
  })

  const [itemForm, setItemForm] = useState({
    categoria: 'recebimento', descricao: '', produto_id: '', forma_armazenamento: '',
    valor: '', unidade_cobranca: 'R$/ton', observacoes: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const [t, u, p, a] = await Promise.all([
        getTarifasArmazenagem(), getUnidadesArmazenadoras(), getProdutos(), getAnosSafra(),
      ])
      setTarifas(t)
      setUnidades(u)
      setProdutos(p)
      setAnosSafra(a)
    } catch (e: any) { toast.error(e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const loadItens = async (tarifaId: string) => {
    setLoadingItens(true)
    try {
      const data = await getTarifaItens(tarifaId)
      setItens(data)
    } catch (e: any) { toast.error(e.message) }
    setLoadingItens(false)
  }

  const toggleExpand = (id: string) => {
    if (expandedId === id) { setExpandedId(null) }
    else { setExpandedId(id); loadItens(id) }
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ nome: '', unidade_id: '', ano_safra_id: '', vigencia_inicio: '', vigencia_fim: '', observacoes: '' })
    setShowModal(true)
  }

  const openEdit = (t: any) => {
    setEditId(t.id)
    setForm({
      nome: t.nome || '', unidade_id: t.unidade_id || '', ano_safra_id: t.ano_safra_id || '',
      vigencia_inicio: t.vigencia_inicio || '', vigencia_fim: t.vigencia_fim || '', observacoes: t.observacoes || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) return toast.error('Nome é obrigatório')
    try {
      const payload = { ...form, unidade_id: form.unidade_id || null, ano_safra_id: form.ano_safra_id || null }
      if (editId) {
        await updateTarifaArmazenagem(editId, payload)
        toast.success('Tarifa atualizada')
      } else {
        await createTarifaArmazenagem(payload)
        toast.success('Tarifa criada')
      }
      setShowModal(false)
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta tarifa e todos os seus itens?')) return
    try {
      await deleteTarifaArmazenagem(id)
      toast.success('Tarifa excluída')
      if (expandedId === id) setExpandedId(null)
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  const openCreateItem = () => {
    setEditItemId(null)
    setItemForm({ categoria: 'recebimento', descricao: '', produto_id: '', forma_armazenamento: '', valor: '', unidade_cobranca: 'R$/ton', observacoes: '' })
    setShowItemModal(true)
  }

  const openEditItem = (item: any) => {
    setEditItemId(item.id)
    setItemForm({
      categoria: item.categoria || 'recebimento',
      descricao: item.descricao || '',
      produto_id: item.produto_id || '',
      forma_armazenamento: item.forma_armazenamento || '',
      valor: item.valor != null ? String(item.valor).replace('.', ',') : '',
      unidade_cobranca: item.unidade_cobranca || 'R$/ton',
      observacoes: item.observacoes || '',
    })
    setShowItemModal(true)
  }

  const handleSaveItem = async () => {
    if (!itemForm.descricao.trim()) return toast.error('Descrição é obrigatória')
    if (!itemForm.valor) return toast.error('Valor é obrigatório')
    try {
      const payload = {
        ...itemForm,
        tarifa_id: expandedId,
        valor: parseFloat(itemForm.valor.replace(/\./g, '').replace(',', '.')),
        produto_id: itemForm.produto_id || null,
        forma_armazenamento: itemForm.forma_armazenamento || null,
      }
      if (editItemId) {
        await updateTarifaItem(editItemId, payload)
        toast.success('Item atualizado')
      } else {
        await createTarifaItem(payload)
        toast.success('Item criado')
      }
      setShowItemModal(false)
      loadItens(expandedId!)
    } catch (e: any) { toast.error(e.message) }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Excluir este item?')) return
    try {
      await deleteTarifaItem(id)
      toast.success('Item excluído')
      loadItens(expandedId!)
    } catch (e: any) { toast.error(e.message) }
  }

  const sorted = useMemo(() => {
    const arr = [...tarifas]
    arr.sort((a: any, b: any) => {
      const va = a[sort.col], vb = b[sort.col]
      if (typeof va === 'number' && typeof vb === 'number') return sort.dir === 'asc' ? va - vb : vb - va
      return sort.dir === 'asc' ? String(va || '').localeCompare(String(vb || '')) : String(vb || '').localeCompare(String(va || ''))
    })
    return arr
  }, [tarifas, sort])

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2"><Receipt className="w-6 h-6 text-amber-600" /> Tarifas de Serviço</h1>
        <button onClick={openCreate} className="flex items-center gap-1 bg-amber-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-amber-700">
          <Plus className="w-4 h-4" /> Nova Tarifa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50">
            <th className="w-8"></th>
            <SortHeader label="Nome" col="nome" />
            <SortHeader label="Unidade" col="unidade_nome" />
            <SortHeader label="Ano Safra" col="ano_safra_nome" />
            <SortHeader label="Vigência" col="vigencia_inicio" />
            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Ações</th>
          </tr></thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhuma tarifa cadastrada</td></tr>
            ) : sorted.map(t => (
              <>
                <tr key={t.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(t.id)}>
                  <td className="px-2 py-2 text-center">
                    {expandedId === t.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </td>
                  <td className="px-3 py-2 font-medium">{t.nome}</td>
                  <td className="px-3 py-2">{t.unidade_nome || 'Todas'}</td>
                  <td className="px-3 py-2">{t.ano_safra_nome || '-'}</td>
                  <td className="px-3 py-2">{t.vigencia_inicio && t.vigencia_fim ? `${new Date(t.vigencia_inicio).toLocaleDateString('pt-BR')} — ${new Date(t.vigencia_fim).toLocaleDateString('pt-BR')}` : '-'}</td>
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
                {expandedId === t.id && (
                  <tr key={`${t.id}-itens`}>
                    <td colSpan={6} className="bg-amber-50/50 px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">Itens da Tarifa ({itens.length})</h3>
                        <button onClick={openCreateItem} className="flex items-center gap-1 bg-amber-600 text-white px-2 py-1 rounded text-xs hover:bg-amber-700">
                          <Plus className="w-3 h-3" /> Novo Item
                        </button>
                      </div>
                      {loadingItens ? (
                        <div className="text-center py-2"><div className="animate-spin inline-block rounded-full h-5 w-5 border-b-2 border-amber-600" /></div>
                      ) : itens.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-2">Nenhum item</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead><tr className="border-b">
                              <th className="px-2 py-1 text-left font-semibold text-gray-600">Categoria</th>
                              <th className="px-2 py-1 text-left font-semibold text-gray-600">Descrição</th>
                              <th className="px-2 py-1 text-left font-semibold text-gray-600">Produto</th>
                              <th className="px-2 py-1 text-left font-semibold text-gray-600">Forma</th>
                              <th className="px-2 py-1 text-right font-semibold text-gray-600">Valor</th>
                              <th className="px-2 py-1 text-left font-semibold text-gray-600">Unidade</th>
                              <th className="px-2 py-1 text-center font-semibold text-gray-600 w-20">Ações</th>
                            </tr></thead>
                            <tbody>
                              {itens.map(item => (
                                <tr key={item.id} className="border-b hover:bg-white">
                                  <td className="px-2 py-1 capitalize">{CATEGORIAS.find(c => c.value === item.categoria)?.label || item.categoria}</td>
                                  <td className="px-2 py-1">{item.descricao}</td>
                                  <td className="px-2 py-1">{item.produto_nome || 'Todos'}</td>
                                  <td className="px-2 py-1 capitalize">{item.forma_armazenamento?.replace('_', ' ') || 'Todos'}</td>
                                  <td className="px-2 py-1 text-right font-medium">{fmtBRL(item.valor)}</td>
                                  <td className="px-2 py-1">{item.unidade_cobranca}</td>
                                  <td className="px-2 py-1 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button onClick={() => openEditItem(item)} className="p-0.5 text-blue-500 hover:bg-blue-50 rounded"><Pencil className="w-3 h-3" /></button>
                                      <button onClick={() => handleDeleteItem(item.id)} className="p-0.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tarifa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editId ? 'Editar' : 'Nova'} Tarifa</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: Tabela COOPERVAP Safra 25/26" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Armazenadora</label>
                  <select value={form.unidade_id} onChange={e => setForm({ ...form, unidade_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Todas</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ano Safra</label>
                  <select value={form.ano_safra_id} onChange={e => setForm({ ...form, ano_safra_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Todos</option>
                    {anosSafra.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vigência Início</label>
                  <input type="date" value={form.vigencia_inicio} onChange={e => setForm({ ...form, vigencia_inicio: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vigência Fim</label>
                  <input type="date" value={form.vigencia_fim} onChange={e => setForm({ ...form, vigencia_fim: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
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

      {/* Modal Item */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editItemId ? 'Editar' : 'Novo'} Item de Tarifa</h2>
              <button onClick={() => setShowItemModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <select value={itemForm.categoria} onChange={e => setItemForm({ ...itemForm, categoria: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input value={itemForm.descricao} onChange={e => setItemForm({ ...itemForm, descricao: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: Milho - Recebimento até 14% umidade" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                  <select value={itemForm.produto_id} onChange={e => setItemForm({ ...itemForm, produto_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Todos</option>
                    {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Armazenamento</label>
                  <select value={itemForm.forma_armazenamento} onChange={e => setItemForm({ ...itemForm, forma_armazenamento: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {FORMAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
                  <input value={itemForm.valor} onChange={e => setItemForm({ ...itemForm, valor: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: 49,38" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Cobrança *</label>
                  <select value={itemForm.unidade_cobranca} onChange={e => setItemForm({ ...itemForm, unidade_cobranca: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {UNIDADES_COBRANCA.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={itemForm.observacoes} onChange={e => setItemForm({ ...itemForm, observacoes: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowItemModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSaveItem} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
