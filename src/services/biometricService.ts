import { Preferences } from '@capacitor/preferences';
import { loginService, UserData } from '@/services/loginService';
import { colaboradorService } from '@/services/colaboradorService';

// Interface para armazenar credenciais de forma segura
interface BiometricCredentials {
  username: string;
  password: string;
}

// Chave para armazenamento seguro
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export class BiometricService {
  // Verifica se a biometria está disponível no dispositivo
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      // Em um ambiente real, aqui verificaríamos se a biometria está disponível
      // Por enquanto, retornamos true para simular que está disponível
      return true;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade de biometria:', error);
      return false;
    }
  }

  // Salva as credenciais para login biométrico
  static async saveCredentials(username: string, password: string): Promise<void> {
    try {
      // Em um ambiente real, usaríamos um plugin de biometria para salvar de forma segura
      // Por enquanto, vamos salvar em Preferences com uma implementação básica
      const credentials: BiometricCredentials = { username, password };
      await Preferences.set({
        key: BIOMETRIC_CREDENTIALS_KEY,
        value: JSON.stringify(credentials)
      });
      
      // Marcar que o login biométrico está habilitado
      await Preferences.set({
        key: BIOMETRIC_ENABLED_KEY,
        value: 'true'
      });
    } catch (error) {
      console.error('Erro ao salvar credenciais biométricas:', error);
      throw error;
    }
  }

  // Recupera as credenciais salvas
  static async getCredentials(): Promise<BiometricCredentials | null> {
    try {
      const { value } = await Preferences.get({ key: BIOMETRIC_CREDENTIALS_KEY });
      if (value) {
        return JSON.parse(value) as BiometricCredentials;
      }
      return null;
    } catch (error) {
      console.error('Erro ao recuperar credenciais biométricas:', error);
      return null;
    }
  }

  // Remove as credenciais salvas
  static async removeCredentials(): Promise<void> {
    try {
      await Preferences.remove({ key: BIOMETRIC_CREDENTIALS_KEY });
      await Preferences.remove({ key: BIOMETRIC_ENABLED_KEY });
    } catch (error) {
      console.error('Erro ao remover credenciais biométricas:', error);
      throw error;
    }
  }

  // Verifica se o login biométrico está habilitado
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: BIOMETRIC_ENABLED_KEY });
      return value === 'true';
    } catch (error) {
      console.error('Erro ao verificar se biometria está habilitada:', error);
      return false;
    }
  }

  // Realiza o login usando credenciais biométricas
  static async biometricLogin(): Promise<{ 
    userData: UserData; 
    authToken: string; 
    documentoFederal?: string;
    matriculas?: any[];
  } | null> {
    try {
      // Verificar se biometria está habilitada
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        return null;
      }

      // Recuperar credenciais
      const credentials = await this.getCredentials();
      if (!credentials) {
        return null;
      }

      // Realizar login com as credenciais salvas
      const loginResponse = await loginService.getLogin(
        credentials.username, 
        credentials.password
      );

      if (!loginResponse.access_token) {
        throw new Error('Não foi possível autenticar o usuário');
      }

      // Obter dados do usuário
      const userDataResponse = await loginService.buscarDadosUsuarioLogado(
        `bearer ${loginResponse.access_token}`
      );

      // Verificar se o campo documentoFederal existe
      const documento = userDataResponse?.pessoaFisica?.pessoa?.documentoFederal;
      let documentoFederal: string | undefined;
      let matriculas: any[] | undefined;

      if (documento && documento !== null && documento !== undefined && documento !== '') {
        // Limpar caracteres especiais do documento
        documentoFederal = documento.replace(/[.\-/]/g, '');
        
        // Buscar matrículas do colaborador
        matriculas = await colaboradorService.buscarPorMatricula(
          documentoFederal, 
          loginResponse.access_token
        );
      }

      return {
        userData: userDataResponse,
        authToken: loginResponse.access_token,
        documentoFederal,
        matriculas
      };
    } catch (error) {
      console.error('Erro no login biométrico:', error);
      // Remover credenciais inválidas
      await this.removeCredentials();
      throw error;
    }
  }
}