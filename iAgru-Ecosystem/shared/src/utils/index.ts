import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Formatação de datas
export const formatDate = (date: Date | string, pattern: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, pattern, { locale: ptBR });
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatCurrency = (value: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatArea = (value: number): string => {
  return `${formatNumber(value, 2)} ha`;
};

export const formatPeso = (value: number): string => {
  return `${formatNumber(value, 2)} kg`;
};

export const formatQuantidade = (value: number, unidade: string): string => {
  return `${formatNumber(value, 2)} ${unidade}`;
};

// Validações
export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

export const validateCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]/g, '');
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

// Cálculos agrícolas
export const calcularProdutividade = (area: number, producao: number): number => {
  if (area === 0) return 0;
  return producao / area;
};

export const calcularCustoPorHectare = (custoTotal: number, area: number): number => {
  if (area === 0) return 0;
  return custoTotal / area;
};

export const calcularMargem = (receita: number, custo: number): number => {
  if (receita === 0) return 0;
  return ((receita - custo) / receita) * 100;
};

export const calcularGanhoDePeso = (pesoInicial: number, pesoFinal: number, dias: number): number => {
  if (dias === 0) return 0;
  return (pesoFinal - pesoInicial) / dias;
};

// Geração de IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Cores para status
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ativo: 'green',
    inativo: 'red',
    pendente: 'yellow',
    concluido: 'blue',
    cancelado: 'gray',
    andamento: 'orange',
    entregue: 'green',
    em_transito: 'blue',
  };
  return colors[status] || 'gray';
};

// Exportações padrão do Brasil
export const getCulturasBrasil = () => [
  { nome: 'Soja', codigo: 'SOJA', unidadeMedida: 'sc' },
  { nome: 'Milho', codigo: 'MILHO', unidadeMedida: 'sc' },
  { nome: 'Sorgo', codigo: 'SORGO', unidadeMedida: 'sc' },
  { nome: 'Feijão', codigo: 'FEIJAO', unidadeMedida: 'sc' },
  { nome: 'Algodão', codigo: 'ALGODAO', unidadeMedida: 'sc' },
  { nome: 'Arroz', codigo: 'ARROZ', unidadeMedida: 'sc' },
  { nome: 'Trigo', codigo: 'TRIGO', unidadeMedida: 'sc' },
];

export const getEstadosBrasil = () => [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];
