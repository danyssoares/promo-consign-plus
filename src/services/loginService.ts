import { environment } from '@/lib/environment';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface UserData {
  id: string;
  nome: string;
  email: string;
  isAceiteValido: boolean;
  // Add other user properties as needed
}

export class LoginService {
  private ipExterno = ''; // You may need to implement IP detection

  async getLogin(
    nome: string, 
    senha: string, 
    captcha: string = '', 
    captchaId: any = null, 
    exibirCaptcha: boolean = false, 
    revalidarLogin: boolean = false
  ): Promise<LoginResponse> {
    let param = `client_id=${environment.clientId}&password=${encodeURIComponent(senha)}&username=${encodeURIComponent(nome)}&grant_type=password&scope=read%20write&client_secret=${environment.clientSecret}`;
    
    if (exibirCaptcha) {
      param += `&captchaId=${captchaId}&captcha_code=${captcha}`;
    }
    
    if (revalidarLogin) {
      param += '&revalidarLogin=S';
    }
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': 'Basic Y29uc2lnbmFkby13ZWItYXBwOjEyMzQ1Ng==',
      'X-Forwarded-For-Private': this.ipExterno,
      'X-Forwarded-For': this.ipExterno,
      'ignoreToken': 'true'
    };

    try {
      const response = await fetch(`${environment.apiUrl}/oauth/token`, {
        method: 'POST',
        headers,
        body: param
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Login failed: ${error}`);
    }
  }

  async buscarDadosUsuarioLogado(authorization: string): Promise<UserData> {
    const headers = {
      'Authorization': authorization,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(`${environment.apiUrl}/user/me`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch user data: ${error}`);
    }
  }

  async salvarAceite(aceite: string): Promise<any> {
    // Implement this method based on your API
    return Promise.resolve({});
  }

  logout(): void {
    // Clear stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
}

export const loginService = new LoginService();