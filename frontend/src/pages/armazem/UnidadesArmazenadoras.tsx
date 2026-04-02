import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Warehouse, Plus, Pencil, MapPin, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCadastros, getUnidadesArmazenadoras } from '../../services/api'
import { fmtInt } from '../../utils/format'

export default function UnidadesArmazenadoras() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [armazens, setArmazens] = useState<any[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [cadastros, unidadesData] = await Promise.all([
          getCadastros(),
          getUnidadesArmazenadoras()
        ])
        
        // Filtrar apenas cadastros do tipo Armazem
        const armazensCadastrados = cadastros.filter((c: any) => 
          (c.tipos || []).includes('Armazem')
        )
        
        // Enriquecer com dados de unidades armazenadoras
        const armazensComUnidade = armazensCadastrados.map((arm: any) => {
          const unidade = unidadesData.find((u: any) => u.cadastro_id === arm.id)
          return {
            ...arm,
            unidade_sigla: unidade?.sigla,
            unidade_tipo: unidade?.tipo,
            unidade_capacidade: unidade?.capacidade_total_tons
          }
        })
        
        setArmazens(armazensComUnidade)
        setUnidades(unidadesData)
      } catch (err: any) {
        toast.error('Erro ao carregar armazéns: ' + (err?.message || ''))
      } finally {
        setLoading(false)
      }
    }
    
    load()
  }, [])
  
  const handleNovoCadastro = () => {
    navigate('/cadastros?novo=armazem')
  }
  
  const handleEditar = (armazemId: string) => {
    navigate(`/cadastros?editar=${armazemId}`)
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-blue-600" /> 
            Unidades Armazenadoras
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os armazéns cadastrados no sistema
          </p>
        </div>
        <button 
          onClick={handleNovoCadastro}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" /> 
          <span className="hidden sm:inline">Cadastrar Novo</span> Armazém
        </button>
      </div>

      {armazens.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Warehouse className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum armazém cadastrado</h3>
          <p className="text-gray-500 mb-4">
            Cadastre seu primeiro armazém para começar a gestão de armazenagem.
          </p>
          <button 
            onClick={handleNovoCadastro}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Cadastrar Primeiro Armazém
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Sigla</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Cidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">UF</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Capacidade (ton)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {armazens.map((arm: any) => (
                  <tr key={arm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {arm.nome_fantasia || arm.nome}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {arm.unidade_sigla || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {arm.cidade}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{arm.uf}</td>
                    <td className="px-4 py-3">
                      {arm.unidade_tipo ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {arm.unidade_tipo}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      {arm.unidade_capacidade ? fmtInt(arm.unidade_capacidade) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditar(arm.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar armazém"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
            Total: <strong>{armazens.length}</strong> {armazens.length === 1 ? 'armazém' : 'armazéns'} cadastrado{armazens.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Warehouse className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Cadastro Integrado
            </h4>
            <p className="text-sm text-blue-700">
              Os armazéns agora são gerenciados através da tela de <strong>Cadastros</strong>. 
              Ao cadastrar um novo armazém, você terá acesso aos campos específicos de Sigla, Tipo e Capacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
