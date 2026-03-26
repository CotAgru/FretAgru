import axios from 'axios';
import { Produtor, Cultura, Talhao, Safra } from '../types';

export class AegroAPI {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: any = {}) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      return response.data;
    } catch (error) {
      console.error(`Erro na API Aegro - ${endpoint}:`, error);
      throw error;
    }
  }

  // Produtores
  async getProdutores(): Promise<Produtor[]> {
    return this.request('/api/v1/produtores');
  }

  async getProdutor(id: string): Promise<Produtor> {
    return this.request(`/api/v1/produtores/${id}`);
  }

  // Culturas
  async getCulturas(): Promise<Cultura[]> {
    return this.request('/api/v1/culturas');
  }

  // Talhões
  async getTalhoes(produtorId?: string): Promise<Talhao[]> {
    const params = produtorId ? `?produtor_id=${produtorId}` : '';
    return this.request(`/api/v1/talhoes${params}`);
  }

  async getTalhao(id: string): Promise<Talhao> {
    return this.request(`/api/v1/talhoes/${id}`);
  }

  // Safras
  async getSafras(produtorId?: string): Promise<Safra[]> {
    const params = produtorId ? `?produtor_id=${produtorId}` : '';
    return this.request(`/api/v1/safras${params}`);
  }

  async getSafra(id: string): Promise<Safra> {
    return this.request(`/api/v1/safras/${id}`);
  }

  // Financeiro
  async getFluxoCaixa(safraId: string, dataInicio: Date, dataFim: Date) {
    const params = `?safra_id=${safraId}&data_inicio=${dataInicio.toISOString()}&data_fim=${dataFim.toISOString()}`;
    return this.request(`/api/v1/financeiro/fluxo-caixa${params}`);
  }

  async getCentrosCusto(safraId?: string) {
    const params = safraId ? `?safra_id=${safraId}` : '';
    return this.request(`/api/v1/financeiro/centros-custo${params}`);
  }

  // Produção
  async getProducao(safraId: string) {
    return this.request(`/api/v1/producao?safra_id=${safraId}`);
  }

  async getColheita(talhaoId: string) {
    return this.request(`/api/v1/producao/colheita?talhao_id=${talhaoId}`);
  }

  // Estoque
  async getEstoque(produtorId?: string) {
    const params = produtorId ? `?produtor_id=${produtorId}` : '';
    return this.request(`/api/v1/estoque${params}`);
  }

  // Notas Fiscais
  async getNotasFiscais(dataInicio: Date, dataFim: Date, tipo?: string) {
    const params = `?data_inicio=${dataInicio.toISOString()}&data_fim=${dataFim.toISOString()}`;
    const tipoParam = tipo ? `&tipo=${tipo}` : '';
    return this.request(`/api/v1/fiscal/notas-fiscais${params}${tipoParam}`);
  }
}
