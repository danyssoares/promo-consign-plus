import { environment } from '@/lib/environment';
import { IpDetection } from '@/lib/ipDetection';
import { ApiErrorHandler } from '@/lib/errorHandler';

export interface ColaboradorData {
  id: string;
  nome: string;
  matricula: string;
  cpf: string;
  codigoMatricula: string; // Adicionar esta propriedade que vem da API
  matriculas?: MatriculaData[];
  // Adicione outras propriedades conforme necessário
  [key: string]: unknown;
}

export interface MatriculaData {
  codigoMatricula: string;
  // Adicione outras propriedades conforme necessário
  [key: string]: unknown;
}

export interface FolhaColaborador {
  valorMargemCartao: number;
  valorMargemEmprestimo: number;
}

export interface ColaboradorDetalheData {
  id: string;
  nome: string;
  matricula: string;
  cpf: string;
  folhaColaborador?: FolhaColaborador;
  // Adicione outras propriedades conforme necessário
  [key: string]: unknown;
}

// Interface para os dados do gráfico
export interface GraficoFolhaColaborador {
  valorRendimento: number;
  valorUtilizado: number;
  valorMargem: number;
  data: string;
}

export class ColaboradorService {
  private ipExterno = '';

  private async getClientIp(): Promise<string> {
    if (!this.ipExterno) {
      this.ipExterno = await IpDetection.getClientIp();
    }
    return this.ipExterno;
  }

  async buscarPorMatricula(matricula: string, authorization: string): Promise<ColaboradorData[] | null> {
    // Get client IP for headers
    const clientIp = await this.getClientIp();
    
    const headers = {
      'Authorization': `Bearer ${authorization}`,
      'Content-Type': 'application/json',
      'X-Forwarded-For-Private': clientIp,
      'X-Forwarded-For': clientIp
    };

    try {
      const response = await ApiErrorHandler.fetchWithErrorHandling(`${environment.consigApiUrl}/colaborador/buscarPorMatricula/${matricula}`, {
        method: 'GET',
        headers
      });

      // Tratamento especial para 404 - colaborador não encontrado
      if (response.status === 404) {
        return null;
      }

      return await response.json();
    } catch (error) {
      // Se for erro 404, retornar null sem lançar exceção
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error(`Failed to fetch colaborador data: ${error}`);
    }
  }

  async buscarColaboradorPorMatricula(documento: string, codigoMatricula: string, authorization: string): Promise<ColaboradorDetalheData | null> {
    // Get client IP for headers
    const clientIp = await this.getClientIp();
    
    const headers = {
      'Authorization': `Bearer ${authorization}`,
      'Content-Type': 'application/json',
      'X-Forwarded-For-Private': clientIp,
      'X-Forwarded-For': clientIp
    };

    try {
      const response = await ApiErrorHandler.fetchWithErrorHandling(`${environment.consigApiUrl}/colaborador/buscarColaborador/${documento}/${codigoMatricula}`, {
        method: 'GET',
        headers
      });

      // Tratamento especial para 404 - colaborador não encontrado
      if (response.status === 404) {
        return null;
      }

      return await response.json();
    } catch (error) {
      // Se for erro 404, retornar null sem lançar exceção
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw new Error(`Failed to fetch colaborador detalhe data: ${error}`);
    }
  }

  async buscarGraficoFolhaColaborador(colaboradorId: string, meses: number, authorization: string): Promise<GraficoFolhaColaborador[]> {
    // Get client IP for headers
    const clientIp = await this.getClientIp();
    
    const headers = {
      'Authorization': `Bearer ${authorization}`,
      'Content-Type': 'application/json',
      'X-Forwarded-For-Private': clientIp,
      'X-Forwarded-For': clientIp
    };

    try {
      const response = await ApiErrorHandler.fetchWithErrorHandling(`${environment.consigApiUrl}/colaborador/buscarGraficoFolhaColaborador/${colaboradorId}/${meses}`, {
        method: 'GET',
        headers
      });

      const data: unknown = await response.json();
      
      // Verificar se é um array
      if (!Array.isArray(data)) {
        throw new Error("Resposta inválida da API: esperava um array");
      }
      
      return data as GraficoFolhaColaborador[];
    } catch (error) {
      throw new Error(`Failed to fetch grafico folha colaborador data: ${error}`);
    }
  }
}

export const colaboradorService = new ColaboradorService();