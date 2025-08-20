import { environment } from '@/lib/environment';
import { IpDetection } from '@/lib/ipDetection';

export interface ColaboradorData {
  id: string;
  nome: string;
  matricula: string;
  cpf: string;
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

export class ColaboradorService {
  private ipExterno = '';

  private async getClientIp(): Promise<string> {
    if (!this.ipExterno) {
      this.ipExterno = await IpDetection.getClientIp();
    }
    return this.ipExterno;
  }

  async buscarPorMatricula(matricula: string, authorization: string): Promise<ColaboradorData | null> {
    // Get client IP for headers
    const clientIp = await this.getClientIp();
    
    const headers = {
      'Authorization': `Bearer ${authorization}`,
      'Content-Type': 'application/json',
      'X-Forwarded-For-Private': clientIp,
      'X-Forwarded-For': clientIp
    };

    try {
      const response = await fetch(`${environment.consigApiUrl}/colaborador/buscarPorMatricula/${matricula}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Colaborador não encontrado
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
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
      const response = await fetch(`${environment.consigApiUrl}/colaborador/buscarColaborador/${documento}/${codigoMatricula}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Colaborador não encontrado
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch colaborador detalhe data: ${error}`);
    }
  }
}

export const colaboradorService = new ColaboradorService();