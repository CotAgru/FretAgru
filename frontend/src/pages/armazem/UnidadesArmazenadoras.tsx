import { useEffect, useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, X, Warehouse, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUnidadesArmazenadoras, createUnidadeArmazenadora, updateUnidadeArmazenadora, deleteUnidadeArmazenadora, getEstruturas, createEstrutura, updateEstrutura, deleteEstrutura, getProdutos, getCadastros, createCadastro } from '../../services/api'
import { fmtDec } from '../../utils/format'
import SearchableSelect from '../../components/SearchableSelect'

type SortDir = 'asc' | 'desc'

const TIPOS_UNIDADE = ['armazem', 'silo', 'tulha']
const TIPOS_ESTRUTURA = ['silo', 'armazem_graneleiro', 'tulha', 'big_bag']

export default function UnidadesArmazenadoras() {
  const [unidades, setUnidades] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [cadastros, setCadastros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showEstruturas, setShowEstruturas] = useState<string | null>(null)
  const [estruturas, setEstruturas] = useState<any[]>([])
  const [showEstModal, setShowEstModal] = useState(false)
  const [editEstId, setEditEstId] = useState<string | null>(null)
  const [sort, setSort] = useState<{ col: string; dir: SortDir }>({ col: 'nome', dir: 'asc' })
  const [showNovoArmazemModal, setShowNovoArmazemModal] = useState(false)

  const [form, setForm] = useState({ cadastro_id: '', sigla: '', capacidade_total_tons: '', tipo: 'armazem' })
  const [estForm, setEstForm] = useState({ nome: '', tipo: 'silo', capacidade_tons: '', produto_atual_id: '', observacoes: '' })
  const [novoArmazemForm, setNovoArmazemForm] = useState({ nome: '', uf: 'GO', cidade: '', logradouro: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [u, p, c] = await Promise.all([getUnidadesArmazenadoras(), getProdutos(), getCadastros()])
      setUnidades(u)
      setProdutos(p)
      setCadastros(c)
    } catch (e: any) { toast.error(e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const loadEstruturas = async (unidadeId: string) => {
    try {
      const data = await getEstruturas(unidadeId)
      setEstruturas(data)
    } catch (e: any) { toast.error(e.message) }
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ cadastro_id: '', sigla: '', capacidade_total_tons: '', tipo: 'armazem' })
    setShowModal(true)
  }

  const openEdit = (u: any) => {
    setEditId(u.id)
    setForm({
      cadastro_id: u.cadastro_id || '',
      sigla: u.sigla || '',
      capacidade_total_tons: u.capacidade_total_tons ? String(u.capacidade_total_tons) : '',
      tipo: u.tipo || 'armazem',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.cadastro_id) return toast.error('Selecione um armazém')
    try {
      const payload = {
        cadastro_id: form.cadastro_id,
        sigla: form.sigla || null,
        tipo: form.tipo,
        capacidade_total_tons: form.capacidade_total_tons ? parseFloat(form.capacidade_total_tons.replace(',', '.')) : null,
      }
      if (editId) {
        await updateUnidadeArmazenadora(editId, payload)
        toast.success('Unidade atualizada')
      } else {
        await createUnidadeArmazenadora(payload)
        toast.success('Unidade criada')
      }
      setShowModal(false)
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta unidade?')) return
    try {
      await deleteUnidadeArmazenadora(id)
      toast.success('Unidade excluída')
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  const openEstruturas = (unidadeId: string) => {
    setShowEstruturas(unidadeId)
    loadEstruturas(unidadeId)
  }

  const openCreateEst = () => {
    setEditEstId(null)
    setEstForm({ nome: '', tipo: 'silo', capacidade_tons: '', produto_atual_id: '', observacoes: '' })
    setShowEstModal(true)
  }

  const openEditEst = (e: any) => {
    setEditEstId(e.id)
    setEstForm({
      nome: e.nome || '',
      tipo: e.tipo || 'silo',
      capacidade_tons: e.capacidade_tons ? String(e.capacidade_tons) : '',
      produto_atual_id: e.produto_atual_id || '',
      observacoes: e.observacoes || '',
    })
    setShowEstModal(true)
  }

  const handleSaveEst = async () => {
    if (!estForm.nome.trim()) return toast.error('Nome é obrigatório')
    try {
      const payload = {
        ...estForm,
        unidade_id: showEstruturas,
        capacidade_tons: estForm.capacidade_tons ? parseFloat(estForm.capacidade_tons.replace(',', '.')) : null,
        produto_atual_id: estForm.produto_atual_id || null,
      }
      if (editEstId) {
        await updateEstrutura(editEstId, payload)
        toast.success('Estrutura atualizada')
      } else {
        await createEstrutura(payload)
        toast.success('Estrutura criada')
      }
      setShowEstModal(false)
      loadEstruturas(showEstruturas!)
    } catch (e: any) { toast.error(e.message) }
  }

  const handleDeleteEst = async (id: string) => {
    if (!confirm('Excluir esta estrutura?')) return
    try {
      await deleteEstrutura(id)
      toast.success('Estrutura excluída')
      loadEstruturas(showEstruturas!)
    } catch (e: any) { toast.error(e.message) }
  }

  const handleSaveNovoArmazem = async () => {
    if (!novoArmazemForm.nome.trim()) return toast.error('Nome é obrigatório')
    if (!novoArmazemForm.uf) return toast.error('UF é obrigatória')
    if (!novoArmazemForm.cidade) return toast.error('Cidade é obrigatória')
    try {
      const novoCadastro = await createCadastro({
        nome: novoArmazemForm.nome,
        uf: novoArmazemForm.uf,
        cidade: novoArmazemForm.cidade,
        logradouro: novoArmazemForm.logradouro || null,
        tipos: ['Armazem'],
        tipo_pessoa: 'juridica',
        ativo: true,
      })
      toast.success('Armazém cadastrado com sucesso!')
      setShowNovoArmazemModal(false)
      setNovoArmazemForm({ nome: '', uf: 'GO', cidade: '', logradouro: '' })
      await load()
      setForm({ ...form, cadastro_id: novoCadastro.id })
    } catch (e: any) { toast.error(e.message) }
  }

  const armazensDisponiveis = cadastros.filter((c: any) => (c.tipos || []).includes('Armazem'))

  const sorted = useMemo(() => {
    const arr = [...unidades]
    arr.sort((a: any, b: any) => {
      const va = a[sort.col], vb = b[sort.col]
      if (typeof va === 'number' && typeof vb === 'number') return sort.dir === 'asc' ? va - vb : vb - va
      return sort.dir === 'asc' ? String(va || '').localeCompare(String(vb || '')) : String(vb || '').localeCompare(String(va || ''))
    })
    return arr
  }, [unidades, sort])

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2"><Warehouse className="w-6 h-6 text-amber-600" /> Unidades Armazenadoras</h1>
        <button onClick={openCreate} className="flex items-center gap-1 bg-amber-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-amber-700">
          <Plus className="w-4 h-4" /> Nova Unidade
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50">
            <SortHeader label="Nome" col="nome" />
            <SortHeader label="Sigla" col="sigla" />
            <SortHeader label="Cidade" col="cidade" />
            <SortHeader label="UF" col="uf" />
            <SortHeader label="Tipo" col="tipo" />
            <SortHeader label="Capacidade (TN)" col="capacidade_total_tons" />
            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Ações</th>
          </tr></thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhuma unidade cadastrada</td></tr>
            ) : sorted.map(u => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{u.cadastro_nome || u.nome}</td>
                <td className="px-3 py-2">{u.sigla}</td>
                <td className="px-3 py-2">{u.cadastro_cidade || u.cidade}</td>
                <td className="px-3 py-2">{u.cadastro_uf || u.uf}</td>
                <td className="px-3 py-2 capitalize">{u.tipo}</td>
                <td className="px-3 py-2 text-right">{u.capacidade_total_tons ? fmtDec(u.capacidade_total_tons) : '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEstruturas(u.id)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Estruturas">
                      <Warehouse className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Unidade */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editId ? 'Editar' : 'Nova'} Unidade</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Armazém *</label>
                  <button onClick={() => setShowNovoArmazemModal(true)} className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Novo Armazém
                  </button>
                </div>
                <SearchableSelect
                  options={armazensDisponiveis.map(c => ({ value: c.id, label: c.nome_fantasia || c.nome }))}
                  value={form.cadastro_id}
                  onChange={(val) => setForm({ ...form, cadastro_id: val })}
                  placeholder="Selecione um armazém..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sigla</label>
                  <input value={form.sigla} onChange={e => setForm({ ...form, sigla: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {TIPOS_UNIDADE.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade Total (Toneladas)</label>
                <input value={form.capacidade_total_tons} onChange={e => setForm({ ...form, capacidade_total_tons: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: 5.000" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Estruturas */}
      {showEstruturas && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Estruturas — {unidades.find(u => u.id === showEstruturas)?.cadastro_nome || unidades.find(u => u.id === showEstruturas)?.nome}</h2>
              <div className="flex items-center gap-2">
                <button onClick={openCreateEst} className="flex items-center gap-1 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-700">
                  <Plus className="w-4 h-4" /> Nova
                </button>
                <button onClick={() => setShowEstruturas(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Nome</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Tipo</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Capacidade (TN)</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Produto Atual</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Ações</th>
                </tr></thead>
                <tbody>
                  {estruturas.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-gray-400">Nenhuma estrutura</td></tr>
                  ) : estruturas.map(e => (
                    <tr key={e.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{e.nome}</td>
                      <td className="px-3 py-2 capitalize">{e.tipo?.replace('_', ' ')}</td>
                      <td className="px-3 py-2 text-right">{e.capacidade_tons ? fmtDec(e.capacidade_tons) : '-'}</td>
                      <td className="px-3 py-2">{e.produto_nome || '-'}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEditEst(e)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteEst(e.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Armazém */}
      {showNovoArmazemModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Novo Armazém</h2>
              <button onClick={() => setShowNovoArmazemModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input value={novoArmazemForm.nome} onChange={e => setNovoArmazemForm({ ...novoArmazemForm, nome: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: Armazém Central" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF *</label>
                  <input value={novoArmazemForm.uf} onChange={e => setNovoArmazemForm({ ...novoArmazemForm, uf: e.target.value.toUpperCase() })} maxLength={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                  <input value={novoArmazemForm.cidade} onChange={e => setNovoArmazemForm({ ...novoArmazemForm, cidade: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input value={novoArmazemForm.logradouro} onChange={e => setNovoArmazemForm({ ...novoArmazemForm, logradouro: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: Rua Principal, 123" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowNovoArmazemModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSaveNovoArmazem} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">Cadastrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar/Editar Estrutura */}
      {showEstModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editEstId ? 'Editar' : 'Nova'} Estrutura</h2>
              <button onClick={() => setShowEstModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input value={estForm.nome} onChange={e => setEstForm({ ...estForm, nome: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder='Ex: Silo 1' />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={estForm.tipo} onChange={e => setEstForm({ ...estForm, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {TIPOS_ESTRUTURA.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade (TN)</label>
                  <input value={estForm.capacidade_tons} onChange={e => setEstForm({ ...estForm, capacidade_tons: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produto Atual</label>
                <select value={estForm.produto_atual_id} onChange={e => setEstForm({ ...estForm, produto_atual_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Vazio</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={estForm.observacoes} onChange={e => setEstForm({ ...estForm, observacoes: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowEstModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSaveEst} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
