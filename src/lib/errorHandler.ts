// Utilitário para tratamento centralizado de erros da API

export interface ApiErrorResponse {
  error?: string;
  error_description?: string;
  message?: string;
  [key: string]: unknown;
}

export class ApiErrorHandler {
  /**
   * Decodifica caracteres HTML em uma string
   */
  static decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  /**
   * Extrai a mensagem de erro apropriada da resposta da API
   * Prioriza error_description se estiver presente, senão usa error ou message
   */
  static extractErrorMessage(errorResponse: ApiErrorResponse | string): string {
    if (typeof errorResponse === 'string') {
      return this.decodeHtmlEntities(errorResponse);
    }

    // Verificar se tem error_description (prioridade)
    if (errorResponse.error_description && typeof errorResponse.error_description === 'string') {
      return this.decodeHtmlEntities(errorResponse.error_description);
    }

    // Verificar se tem error
    if (errorResponse.error && typeof errorResponse.error === 'string') {
      return this.decodeHtmlEntities(errorResponse.error);
    }

    // Verificar se tem message
    if (errorResponse.message && typeof errorResponse.message === 'string') {
      return this.decodeHtmlEntities(errorResponse.message);
    }

    // Fallback para mensagem genérica
    return 'Ocorreu um erro inesperado';
  }

  /**
   * Processa resposta de erro da API e extrai mensagem apropriada
   */
  static async handleApiError(response: Response): Promise<string> {
    try {
      // Tentar parsear como JSON
      const errorData = await response.json() as ApiErrorResponse;
      return this.extractErrorMessage(errorData);
    } catch (jsonError) {
      // Se não conseguir parsear como JSON, tentar como texto
      try {
        const errorText = await response.text();
        return this.decodeHtmlEntities(errorText) || `Erro HTTP ${response.status}`;
      } catch (textError) {
        // Fallback para status HTTP
        return `Erro HTTP ${response.status}: ${response.statusText}`;
      }
    }
  }

  /**
   * Wrapper para fetch que automaticamente trata erros da API
   */
  static async fetchWithErrorHandling(
    input: RequestInfo | URL, 
    init?: RequestInit
  ): Promise<Response> {
    try {
      const response = await fetch(input, init);
      
      if (!response.ok) {
        const errorMessage = await this.handleApiError(response);
        throw new Error(errorMessage);
      }
      
      return response;
    } catch (error) {
      // Se o erro já foi processado, re-lançar
      if (error instanceof Error) {
        throw error;
      }
      
      // Fallback para erros não tratados
      throw new Error('Erro de conexão com o servidor');
    }
  }
}