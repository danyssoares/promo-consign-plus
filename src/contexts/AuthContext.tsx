import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserData } from '@/services/loginService';

interface AuthContextType {
  usuarioLogado: UserData | null;
  authorizationData: string | null;
  colaborador: any;
  listaMatriculasColaborador: any[];
  setUsuarioLogado: (usuario: UserData | null) => void;
  setAuthorizationData: (auth: string | null) => void;
  setColaborador: (colaborador: any) => void;
  setListaMatriculasColaborador: (lista: any[]) => void;
  getAuthorizationData: () => string | null;
  getUsuarioLogado: () => UserData | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuarioLogado, setUsuarioLogadoState] = useState<UserData | null>(null);
  const [authorizationData, setAuthorizationDataState] = useState<string | null>(null);
  const [colaborador, setColaboradorState] = useState<any>(null);
  const [listaMatriculasColaborador, setListaMatriculasColaboradorState] = useState<any[]>([]);

  const setUsuarioLogado = (usuario: UserData | null) => {
    setUsuarioLogadoState(usuario);
    if (usuario) {
      localStorage.setItem('userData', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('userData');
    }
  };

  const setAuthorizationData = (auth: string | null) => {
    setAuthorizationDataState(auth);
    if (auth) {
      localStorage.setItem('authToken', auth);
    } else {
      localStorage.removeItem('authToken');
    }
  };

  const setColaborador = (colabData: any) => {
    setColaboradorState(colabData);
  };

  const setListaMatriculasColaborador = (lista: any[]) => {
    setListaMatriculasColaboradorState(lista);
  };

  const getAuthorizationData = () => {
    return authorizationData || localStorage.getItem('authToken');
  };

  const getUsuarioLogado = () => {
    if (usuarioLogado) return usuarioLogado;
    
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  const logout = () => {
    setUsuarioLogado(null);
    setAuthorizationData(null);
    setColaborador(null);
    setListaMatriculasColaborador([]);
  };

  const value: AuthContextType = {
    usuarioLogado,
    authorizationData,
    colaborador,
    listaMatriculasColaborador,
    setUsuarioLogado,
    setAuthorizationData,
    setColaborador,
    setListaMatriculasColaborador,
    getAuthorizationData,
    getUsuarioLogado,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};