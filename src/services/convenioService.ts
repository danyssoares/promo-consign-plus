import { environment } from '@/lib/environment';
import { IpDetection } from '@/lib/ipDetection';

export interface LimiteUtilizado {
  id: number;
  descricao: string;
  valorUtilizado: number;
  valorTotal: number;
  percentualUtilizado: number;
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
      return data.map((item: any) => ({
        ...item,
        valorUtilizado: item.valorUtilizado !== undefined ? item.valorUtilizado : 0,
        valorTotal: item.valorTotal !== undefined ? item.valorTotal : 0,
        percentualUtilizado: item.percentualUtilizado !== undefined ? item.percentualUtilizado : 0
      }));
    } catch (error) {
      throw new Error(`Failed to fetch limites utilizados: ${error}`);
    }
  }
}

export const convenioService = new ConvenioService();