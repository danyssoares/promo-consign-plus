import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { loginService, UserData } from '@/services/loginService';
import { colaboradorService } from '@/services/colaboradorService';

// Interface para armazenar credenciais de forma segura (fallback web)
interface BiometricCredentials {
  username: string;
  password: string;
}

// Chaves para armazenamento
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export class BiometricService {
  // Verifica se a biometria está disponível no dispositivo
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const platform = Capacitor.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        const { isAvailable } = await NativeBiometric.isAvailable();
        return !!isAvailable;
      }
      // No web tratamos como indisponível
      return false;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade de biometria:', error);
      return false;
    }
  }

  // Salva as credenciais para login biométrico
  static async saveCredentials(username: string, password: string): Promise<void> {
    try {
      const platform = Capacitor.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        await NativeBiometric.setCredentials({
          username,
          password,
          // Usamos uma "server key" estável para o bundle
          server: BIOMETRIC_CREDENTIALS_KEY,
        });
      } else {
        // Fallback web (somente para desenvolvimento)
        const credentials: BiometricCredentials = { username, password };
        await Preferences.set({
          key: BIOMETRIC_CREDENTIALS_KEY,
          value: JSON.stringify(credentials),
        });
      }

      // Marcar que o login biométrico está habilitado
      await Preferences.set({
        key: BIOMETRIC_ENABLED_KEY,
        value: 'true',
      });
    } catch (error) {
      console.error('Erro ao salvar credenciais biométricas:', error);
      throw error;
    }
  }

  // Recupera as credenciais salvas
  static async getCredentials(): Promise<BiometricCredentials | null> {
    try {
      const platform = Capacitor.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        try {
          const creds = await NativeBiometric.getCredentials({ server: BIOMETRIC_CREDENTIALS_KEY });
          return { username: creds.username, password: creds.password };
        } catch {
          return null;
        }
      }

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
      const platform = Capacitor.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        try {
          await NativeBiometric.deleteCredentials({ server: BIOMETRIC_CREDENTIALS_KEY });
        } catch {
          // ignorar
        }
      }
      await Preferences.remove({ key: BIOMETRIC_CREDENTIALS_KEY });
      await Preferences.remove({ key: BIOMETRIC_ENABLED_KEY });
    } catch (error) {
      console.error('Erro ao remover credenciais biométricas:', error);
      throw error;
    }
  }

  // Verifica se o login biométrico está habilitado para o usuário atual
  static async isBiometricEnabled(currentUsername?: string): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: BIOMETRIC_ENABLED_KEY });
      if (value !== 'true') {
        return false;
      }

      // Se foi fornecido um username, verificar se corresponde ao salvo
      if (currentUsername) {
        const credentials = await this.getCredentials();
        return credentials?.username === currentUsername;
      }

      return true;
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

      // Autenticação biométrica nativa (Android/iOS)
      const platform = Capacitor.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        await NativeBiometric.verifyIdentity({
          reason: 'Confirme sua identidade para fazer login',
          title: 'Login com Biometria',
          cancelTitle: 'Cancelar',
          fallbackTitle: 'Usar senha',
        });
      } else {
        // Sem biometria no web
        return null;
      }

      // Recuperar credenciais salvas
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
        const colaboradorData = await colaboradorService.buscarPorMatricula(
          documentoFederal,
          loginResponse.access_token
        );
        matriculas = colaboradorData || [];
      }

      return {
        userData: userDataResponse,
        authToken: loginResponse.access_token,
        documentoFederal,
        matriculas,
      };
    } catch (error) {
      console.error('Erro no login biométrico:', error);
      // Remover credenciais inválidas
      await this.removeCredentials();
      // Repassar o erro original
      throw error;
    }
  }
}

