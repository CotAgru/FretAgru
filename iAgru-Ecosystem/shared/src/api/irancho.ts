import axios from 'axios';
import { Produtor, Maquinario, Fornecedor } from '../types';

export interface Animal {
  id: string;
  brinco: string;
  raca: string;
  sexo: 'macho' | 'femea';
  dataNascimento: Date;
  peso: number;
  status: 'ativo' | 'vendido' | 'morto';
  lote?: string;
}

export interface Lote {
  id: string;
  nome: string;
  tipo: 'recria' | 'engorda' | 'matriz' | 'reprodutores';
  quantidade: number;
  pesoMedio: number;
  dataEntrada: Date;
  piquet?: string;
}

export interface Manejo {
  id: string;
  tipo: 'medicamento' | 'vacina' | 'suplemento' | 'outro';
  data: Date;
  animais: string[];
  produto: string;
  dosagem: string;
  custo: number;
}

export interface Piquet {
  id: string;
  nome: string;
  area: number;
  forragem: string;
  capacidade: number;
  ocupacao: number;
}

export class IranchoAPI {
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
      console.error(`Erro na API Irancho - ${endpoint}:`, error);
      throw error;
    }
  }

  // Produtores
  async getProdutores(): Promise<Produtor[]> {
    return this.request('/api/v1/produtores');
  }

  // Animais
  async getAnimais(produtorId?: string): Promise<Animal[]> {
    const params = produtorId ? `?produtor_id=${produtorId}` : '';
    return this.request(`/api/v1/animais${params}`);
  }

  async getAnimal(id: string): Promise<Animal> {
    return this.request(`/api/v1/animais/${id}`);
  }

  async getAnimaisPorLote(loteId: string): Promise<Animal[]> {
    return this.request(`/api/v1/animais?lote_id=${loteId}`);
  }

  // Lotes
  async getLotes(produtorId?: string): Promise<Lote[]> {
    const params = produtorId ? `?produtor_id=${produtorId}` : '';
    return this.request(`/api/v1/lotes${params}`);
  }

  async getLote(id: string): Promise<Lote> {
    return this.request(`/api/v1/lotes/${id}`);
  }

  // Manejos
  async getManejos(dataInicio: Date, dataFim: Date, loteId?: string): Promise<Manejo[]> {
    let params = `?data_inicio=${dataInicio.toISOString()}&data_fim=${dataFim.toISOString()}`;
    if (loteId) params += `&lote_id=${loteId}`;
    return this.request(`/api/v1/manejos${params}`);
  }

  async getManejosPorTipo(tipo: string, dataInicio: Date, dataFim: Date): Promise<Manejo[]> {
    const params = `?tipo=${tipo}&data_inicio=${dataInicio.toISOString()}&data_fim=${dataFim.toISOString()}`;
    return this.request(`/api/v1/manejos${params}`);
  }

  // Piquets
  async getPiquets(produtorId?: string): Promise<Piquet[]> {
    const params = produtorId ? `?produtor_id=${produtorId}` : '';
    return this.request(`/api/v1/piquets${params}`);
  }

  // Maquinário
  async getMaquinario(produtorId?: string): Promise<Maquinario[]> {
    const params = produtorId ? `?produtor_id=${produtorId}` : '';
    return this.request(`/api/v1/maquinario${params}`);
  }

  // Financeiro
  async getDespesas(dataInicio: Date, dataFim: Date, categoria?: string) {
    let params = `?data_inicio=${dataInicio.toISOString()}&data_fim=${dataFim.toISOString()}`;
    if (categoria) params += `&categoria=${categoria}`;
    return this.request(`/api/v1/financeiro/despesas${params}`);
  }

  async getReceitas(dataInicio: Date, dataFim: Date) {
    const params = `?data_inicio=${dataInicio.toISOString()}&data_fim=${dataFim.toISOString()}`;
    return this.request(`/api/v1/financeiro/receitas${params}`);
  }

  // Relatórios
  async getRelatorioDesempenho(loteId: string, dataInicio: Date, dataFim: Date) {
    const params = `?lote_id=${loteId}&data_inicio=${dataInicio.toISOString()}&data_fim=${dataFim.toISOString()}`;
    return this.request(`/api/v1/relatorios/desempenho${params}`);
  }

  async getRelatorioEstoque(produtorId?: string) {
    const params = produtorId ? `?produtor_id=${produtorId}` : '';
    return this.request(`/api/v1/relatorios/estoque${params}`);
  }

  async getRelatorioCustoMedio(loteId: string) {
    return this.request(`/api/v1/relatorios/custo-medio?lote_id=${loteId}`);
  }
}
