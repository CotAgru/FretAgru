// Tipos compartilhados do ecossistema iAgru

export interface Produtor {
  id: string;
  nome: string;
  cpfCnpj: string;
  propriedade: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
}

export interface Cultura {
  id: string;
  nome: string;
  codigo: string;
  unidadeMedida: 'sc' | 'kg' | 'ton';
}

export interface Talhao {
  id: string;
  nome: string;
  area: number;
  cultura: Cultura;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
}

export interface Safra {
  id: string;
  ano: number;
  inicio: Date;
  fim: Date;
  status: 'planejamento' | 'andamento' | 'concluida';
}

export interface Insumo {
  id: string;
  nome: string;
  tipo: 'fertilizante' | 'defensivo' | 'semente' | 'outro';
  unidade: 'kg' | 'l' | 'un';
}

export interface Maquinario {
  id: string;
  nome: string;
  tipo: 'trator' | 'colhedora' | 'pulverizador' | 'plantadeira' | 'outro';
  marca: string;
  modelo: string;
  ano: number;
}

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  tipo: 'insumos' | 'maquinario' | 'servicos' | 'transporte';
  contato: string;
}

export interface Integracao {
  sistema: 'aegro' | 'irancho' | 'outro';
  apiKey: string;
  endpoint: string;
  ativa: boolean;
  ultimaSincronizacao?: Date;
}

// Tipos específicos para cada sistema
export interface Frete {
  id: string;
  tipo: 'insumos' | 'colheita' | 'produtos';
  origem: string;
  destino: string;
  produto: string;
  quantidade: number;
  valor: number;
  transportadora: Fornecedor;
  dataSolicitacao: Date;
  dataEntrega?: Date;
  status: 'solicitado' | 'em_transito' | 'entregue' | 'cancelado';
}

export interface ContratoFuturo {
  id: string;
  produto: string;
  quantidade: number;
  preco: number;
  dataVencimento: Date;
  dataContrato: Date;
  tipo: 'compra' | 'venda';
  bolsa: string;
  status: 'ativo' | 'encerrado' | 'cancelado';
}

export interface Armazenamento {
  id: string;
  silo: string;
  capacidade: number;
  ocupacao: number;
  produto: string;
  qualidade: {
    umidade: number;
    impurezas: number;
    classificacao: string;
  };
  dataEntrada: Date;
  dataSaida?: Date;
}
