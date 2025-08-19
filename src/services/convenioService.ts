import { environment } from '@/lib/environment';
import { IpDetection } from '@/lib/ipDetection';

export interface LimiteUtilizado {
  id: number;
  descricao: string;
  valorUtilizado: number;
  valorTotal: number;
  percentualUtilizado: number;
}

// Interfaces para os dados do contrato
export interface Pessoa {
  nome: string;
}

export interface PessoaFisica {
  pessoa: Pessoa;
}

export interface Colaborador {
  pessoaFisica: PessoaFisica;
}

export interface ContratoParcelaSituacaoDTO {
  nome: string;
}

export interface ContratoParcela {
  parcela: number;
  dataMesAnoReferencia: string; // formato MM/YYYY
  valorParcela: number;
  contratoParcelaSituacaoDTO?: ContratoParcelaSituacaoDTO;
}

export interface ContratoSituacaoTipo {
  nome: string;
}

export interface ContratoTaxa {
  valorCetMensalAutorizado: number;
}

export interface Contrato {
  qtdParcelasAutorizado: number;
  valorParcelaAutorizado: number;
  contratoParcelas: any;
  id: string;
  colaborador: Colaborador;
  dataHoraCriacao: string; // formato DD/MM/YYYY
  qtdParcelasPagas: number;
  valorTotalAutorizado: number;
  contratoTaxa: ContratoTaxa;
  valorPresente: number;
  contratoSituacaoTipo: ContratoSituacaoTipo;
  contratosParcelas: ContratoParcela[];
}

export interface Consignataria {
  nomeFantasia: string;
}

export interface ConvenioDTO {
  consignataria: Consignataria;
  nome: string;
}

export interface ConvenioResponse {
  convenioDTO: ConvenioDTO;
  nome: string;
  contratos: Contrato[];
  valorParcelaAutorizado: number;
  qtdParcelasAutorizado: number;
}

export class ConvenioService {
  private ipExterno = '';

  private async getClientIp(): Promise<string> {
    if (!this.ipExterno) {
      this.ipExterno = await IpDetection.getClientIp();
    }
    return this.ipExterno;
  }

  async buscarLimiteUtilizadoPorColaborador(colaboradorId: string, authorization: string): Promise<LimiteUtilizado[]> {
    // Get client IP for headers
    const clientIp = await this.getClientIp();
    
    const headers = {
      'Authorization': `Bearer ${authorization}`,
      'Content-Type': 'application/json',
      'X-Forwarded-For-Private': clientIp,
      'X-Forwarded-For': clientIp
    };

    try {
      const response = await fetch(`${environment.consigApiUrl}/convenio/buscarLimiteUtilizadoPorColaborador/${colaboradorId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: unknown = await response.json();
      
      // Verificar se é um array
      if (!Array.isArray(data)) {
        throw new Error("Resposta inválida da API: esperava um array");
      }
      
      // Substituir valores undefined por zero
      return data.map((item) => ({
        ...item,
        valorUtilizado: item.valorUtilizado !== undefined ? item.valorUtilizado : 0,
        valorTotal: item.valorTotal !== undefined ? item.valorTotal : 0,
        percentualUtilizado: item.percentualUtilizado !== undefined ? item.percentualUtilizado : 0
      })) as LimiteUtilizado[];
    } catch (error) {
      throw new Error(`Failed to fetch limites utilizados: ${error}`);
    }
  }

  async buscarContrato(idContrato: string, authorization: string): Promise<ConvenioResponse> {
    // Get client IP for headers
    const clientIp = await this.getClientIp();
    
    const headers = {
      'Authorization': `Bearer ${authorization}`,
      'Content-Type': 'application/json',
      'X-Forwarded-For-Private': clientIp,
      'X-Forwarded-For': clientIp
    };

    try {
      const response = await fetch(`${environment.consigApiUrl}/convenio/buscarContrato/${idContrato}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: unknown = await response.json();
      
      // Type assertion for the response
      return data as ConvenioResponse;
    } catch (error) {
      throw new Error(`Failed to fetch contrato details: ${error}`);
    }
  }
}

export const convenioService = new ConvenioService();