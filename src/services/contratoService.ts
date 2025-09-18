import { environment } from '@/lib/environment';
import { IpDetection } from '@/lib/ipDetection';
import { ApiErrorHandler } from '@/lib/errorHandler';

export interface ContratoHistorico {
  id: string; // Número do Contrato
  nomeTipoRubrica: string; // Modalidade
  rubricaNome: string; // Produto
  parcelas: number; // Quantidade de Parcelas
  valorParcelaFormatado: string; // Valor da Parcela (já formatado)
  total: number; // Valor Solicitado
  situacao: 'Aprovado' | 'Cancelado' | 'Negado' | string;
  // Add other properties as needed based on the API response
  [key: string]: any;
}

export class ContratoService {
  private ipExterno = '';

  private async getClientIp(): Promise<string> {
    if (!this.ipExterno) {
      this.ipExterno = await IpDetection.getClientIp();
    }
    return this.ipExterno;
  }

  async buscarHistoricoPorColaborador(
    idColaborador: string,
    idUsuarioLogado: string,
    authorization: string
  ): Promise<ContratoHistorico[]> {
    // Get client IP for headers
    const clientIp = await this.getClientIp();

    const headers = {
      'Authorization': `Bearer ${authorization}`,
      'Content-Type': 'application/json',
      'X-Forwarded-For-Private': clientIp,
      'X-Forwarded-For': clientIp
    };

    try {
      const response = await ApiErrorHandler.fetchWithErrorHandling(
        `${environment.consigApiUrl}/contrato/buscarHistoricoPorColaborador/${idColaborador}/${idUsuarioLogado}`,
        {
          method: 'GET',
          headers
        }
      );

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(`Failed to fetch contrato history: ${error}`);
    }
  }
}

export const contratoService = new ContratoService();