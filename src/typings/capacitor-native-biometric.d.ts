declare module '@capgo/capacitor-native-biometric' {
    export interface BiometricOptions {
      reason?: string;
      title?: string;
      cancelTitle?: string;
      fallbackTitle?: string;
    }
  
    export interface BiometricResult {
      isAvailable: boolean;
    }
  
    export interface Credentials {
      username: string;
      password: string;
      server: string;
    }
  
    export class NativeBiometric {
      static isAvailable(): Promise<BiometricResult>;
      static verifyIdentity(options?: BiometricOptions): Promise<void>;
      static setCredentials(credentials: Credentials): Promise<void>;
      static getCredentials(options: { server: string }): Promise<Credentials>;
      static deleteCredentials(options: { server: string }): Promise<void>;
    }
  }