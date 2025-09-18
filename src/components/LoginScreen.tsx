import { Eye, EyeOff, Fingerprint } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loginService, UserData } from "@/services/loginService";
import { colaboradorService, MatriculaData } from "@/services/colaboradorService";
import { useToast } from "@/hooks/use-toast";
import { SelectMatriculaModal } from "@/components/SelectMatriculaModal";
import { BiometricService } from "@/services/biometricService";

export const LoginScreen = ({ onLogin, onForgotPassword }: { 
  onLogin: () => void;
  onForgotPassword: () => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMatriculaModal, setShowMatriculaModal] = useState(false);
  const [matriculas, setMatriculas] = useState<MatriculaData[]>([]);
  const [documentoFederal, setDocumentoFederal] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [showBiometricSaveDialog, setShowBiometricSaveDialog] = useState(false);
  
  const { setUsuarioLogado, setAuthorizationData, setLastLogin, getLastLogin, setColaborador, getUsuarioLogado } = useAuth();
  const { toast } = useToast();

  // Carregar último login salvo
  useEffect(() => {
    const lastLoginSaved = getLastLogin();
    if (lastLoginSaved) {
      setUsername(lastLoginSaved);
    }
  }, [getLastLogin]);

  // Verificar disponibilidade da biometria
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const available = await BiometricService.isBiometricAvailable();
        setIsBiometricAvailable(available);
        
        if (available) {
          const enabled = await BiometricService.isBiometricEnabled(username);
          setIsBiometricEnabled(enabled);
        }
      } catch (error) {
        console.error('Erro ao verificar biometria:', error);
      }
    };

    checkBiometricAvailability();
  }, [username]);

  const handleSelectMatricula = async (matricula: MatriculaData) => {
    try {
      // Verificar se temos os dados necessários
      if (!documentoFederal || !authToken || !userData) {
        toast({
          title: "Erro",
          description: "Dados insuficientes para continuar.",
          variant: "destructive",
        });
        return;
      }

      // Chamar a API para buscar os detalhes do colaborador com a matrícula selecionada
      const colaboradorDetalhe = await colaboradorService.buscarColaboradorPorMatricula(
        documentoFederal, 
        matricula.codigoMatricula, 
        authToken
      );
      
      if (colaboradorDetalhe) {
        // Salvar dados do colaborador no contexto
        setColaborador(colaboradorDetalhe as any);
        
        // Atualizar o nome do usuário logado
        /*const updatedUserData = {
          ...userData,
          nome: colaboradorDetalhe.nome
        };
        setUsuarioLogado(updatedUserData);*/
        
        // Fechar o modal
        setShowMatriculaModal(false);
        
        // Continuar com o fluxo de login
        await completeLogin();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível obter os dados do colaborador.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar matrícula:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao selecionar a matrícula.",
        variant: "destructive",
      });
    }
  };

  const handleCancelMatricula = () => {
    setShowMatriculaModal(false);
    setIsLoading(false);
  };

  const handleBiometricLogin = async () => {
    if (!isBiometricAvailable) {
      toast({
        title: "Biometria não disponível",
        description: "A biometria não está disponível neste dispositivo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await BiometricService.biometricLogin();
      
      if (!result) {
        toast({
          title: "Erro no login biométrico",
          description: "Não foi possível realizar o login com biometria.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { userData: biometricUserData, authToken: biometricAuthToken, documentoFederal: biometricDocumento, matriculas: biometricMatriculas } = result;

      // Armazenar dados temporariamente
      setUserData(biometricUserData);
      setAuthToken(biometricAuthToken);
      
      // Store auth data
      setUsuarioLogado(biometricUserData);
      setAuthorizationData(biometricAuthToken);
      setLastLogin(biometricUserData.login); // Salvar último login usado

      // Verificar se temos documento federal e matrículas
      if (biometricDocumento && biometricMatriculas) {
        setDocumentoFederal(biometricDocumento);
        
        if (biometricMatriculas && Array.isArray(biometricMatriculas)) {
          if (biometricMatriculas.length === 0) {
            // Nenhuma matrícula encontrada
            toast({
              title: "Nenhuma matrícula encontrada",
              description: "Não foi possível encontrar matrículas para este colaborador.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          } else if (biometricMatriculas.length === 1) {
            // Apenas uma matrícula, selecionar automaticamente
            const matricula = biometricMatriculas[0];
            const colaboradorDetalhe = await colaboradorService.buscarColaboradorPorMatricula(
              biometricDocumento, 
              matricula.codigoMatricula, 
              biometricAuthToken
            );
            
            if (colaboradorDetalhe) {
              // Salvar dados do colaborador no contexto
              setColaborador(colaboradorDetalhe as any);
              
              // Atualizar o nome do usuário logado
              const updatedUserData = {
                ...biometricUserData,
                nome: colaboradorDetalhe.nome
              };
              setUsuarioLogado(updatedUserData);
              
              // Continuar com o fluxo de login
              await completeLogin(updatedUserData);
            } else {
              toast({
                title: "Colaborador não encontrado",
                description: "Não foi possível encontrar os dados do colaborador.",
                variant: "destructive",
              });
              setIsLoading(false);
              return;
            }
          } else {
            // Mais de uma matrícula, abrir modal para seleção
            setMatriculas(biometricMatriculas);
            setShowMatriculaModal(true);
            // Não continuar o fluxo ainda, aguardar seleção do usuário
            return;
          }
        } else {
          // Caso não tenha a propriedade matriculas ou não seja um array
          toast({
            title: "Nenhuma matrícula encontrada",
            description: "Não foi possível encontrar matrículas para este colaborador.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        // Se não houver documento federal, continuar com o fluxo normal
        await completeLogin(biometricUserData);
      }
    } catch (error) {
      console.error('Erro no login biométrico:', error);
      toast({
        title: "Erro no login biométrico",
        description: error instanceof Error ? error.message : "Erro desconhecido ao realizar login com biometria",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const completeLogin = async (userDataParam?: UserData) => {
    try {
      // Verificar se temos os dados do usuário
      const currentUserData = userDataParam || userData;
      if (!currentUserData) {
        // Tentar obter os dados do usuário do contexto
        const authUserData = getUsuarioLogado();
        if (!authUserData) {
          toast({
            title: "Erro",
            description: "Dados do usuário não encontrados.",
            variant: "destructive",
          });
          return;
        }
      }

      // Step 4: Check if user needs to accept terms
      if (currentUserData && !currentUserData.isAceiteValido) {
        // For now, we'll skip the acceptance modal and proceed
        // You can implement the modal later if needed
        toast({
          title: "Aviso",
          description: "Termos de aceite pendentes. Implementar modal de aceite.",
        });
      }

      // Step 5: Redirect to dashboard
      onLogin();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: "Erro",
        description: "Verifique os campos inválidos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Get login token
      const loginResponse = await loginService.getLogin(username, password);
      
      // Verificar se o token foi retornado
      if (!loginResponse.access_token) {
        toast({
          title: "Acesso negado",
          description: "Não foi possível autenticar o usuário.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Step 2: Get user data
      const userDataResponse = await loginService.buscarDadosUsuarioLogado(`bearer ${loginResponse.access_token}`);
      
      // Armazenar dados temporariamente
      setUserData(userDataResponse);
      setAuthToken(loginResponse.access_token);
      
      // Step 3: Store auth data
      setUsuarioLogado(userDataResponse);
      setAuthorizationData(loginResponse.access_token);
      setLastLogin(username); // Salvar último login usado

      // Verificar se deve oferecer salvamento biométrico
      const biometricAvailable = await BiometricService.isBiometricAvailable();
      const biometricAlreadyEnabled = await BiometricService.isBiometricEnabled();
      
      if (biometricAvailable && !biometricAlreadyEnabled) {
        // Mostrar diálogo para perguntar se quer salvar dados para biometria
        setShowBiometricSaveDialog(true);
      }

      // Step 4: Verificar se o campo documentoFederal existe e não é nulo/vazio
      const documento = userDataResponse?.pessoaFisica?.pessoa?.documentoFederal;
      
      if (documento && documento !== null && documento !== undefined && documento !== '') {
        // Limpar caracteres especiais do documento
        const documentoLimpo = documento.replace(/[.\-/]/g, '');
        setDocumentoFederal(documentoLimpo);
        
        // Buscar dados do colaborador
        const matriculas = await colaboradorService.buscarPorMatricula(documentoLimpo, loginResponse.access_token);
        
        if (matriculas) {
          // Verificar se o colaborador tem matrículas
          if (matriculas && Array.isArray(matriculas)) {
            if (matriculas.length === 0) {
              // Nenhuma matrícula encontrada
              toast({
                title: "Nenhuma matrícula encontrada",
                description: "Não foi possível encontrar matrículas para este colaborador.",
                variant: "destructive",
              });
              setIsLoading(false);
              return;
            } else if (matriculas.length === 1) {
              // Apenas uma matrícula, selecionar automaticamente
              const matricula = matriculas[0];
              const colaboradorDetalhe = await colaboradorService.buscarColaboradorPorMatricula(
                documentoLimpo, 
                matricula.codigoMatricula, 
                loginResponse.access_token
              );
              
              if (colaboradorDetalhe) {
                // Salvar dados do colaborador no contexto
                setColaborador(colaboradorDetalhe as any);
                
                // Atualizar o nome do usuário logado
                const updatedUserData = {
                  ...userDataResponse,
                  nome: colaboradorDetalhe.nome
                };
                setUsuarioLogado(updatedUserData);
                
                // Continuar com o fluxo de login
                await completeLogin(updatedUserData);
              } else {
                toast({
                  title: "Colaborador não encontrado",
                  description: "Não foi possível encontrar os dados do colaborador.",
                  variant: "destructive",
                });
                setIsLoading(false);
                return;
              }
            } else {
              // Mais de uma matrícula, abrir modal para seleção
              setMatriculas(matriculas);
              setShowMatriculaModal(true);
              // Não continuar o fluxo ainda, aguardar seleção do usuário
              return;
            }
          } else {
            // Caso não tenha a propriedade matriculas ou não seja um array
            toast({
              title: "Nenhuma matrícula encontrada",
              description: "Não foi possível encontrar matrículas para este colaborador.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        } else {
          // Colaborador não encontrado
          toast({
            title: "Colaborador não encontrado",
            description: "Não foi possível encontrar os dados do colaborador.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        // Se não houver documento federal, continuar com o fluxo normal
        await completeLogin(userDataResponse);
      }

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSaveBiometricCredentials = async (save: boolean) => {
    setShowBiometricSaveDialog(false);
    
    if (save) {
      try {
        await BiometricService.saveCredentials(username, password);
        setIsBiometricEnabled(true);
        toast({
          title: "Biometria configurada",
          description: "Seus dados foram salvos para login com biometria.",
        });
      } catch (error) {
        console.error('Erro ao salvar credenciais biométricas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível configurar a biometria.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center pc-container max-w-sm mx-auto">
      <div className="mb-12 text-center">
        <div className="mb-6 flex justify-center">
          <img 
            src="/lovable-uploads/93766fc2-0b21-4c6e-a115-810c01c95df1.png" 
            alt="PromoConsig Logo" 
            className="h-16 w-auto"
          />
        </div>
        <h2 className="pc-text-title mb-8">Bem-vindo de volta</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block pc-text-body mb-2">Nome de usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pc-input w-full"
            placeholder="Digite seu usuário"
          />
        </div>

        <div>
          <label className="block pc-text-body mb-2">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pc-input w-full pr-12"
              placeholder="Digite sua senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button 
            type="button"
            onClick={onForgotPassword}
            className="text-muted-foreground pc-text-caption underline"
          >
            Esqueceu a senha?
          </button>
        </div>

        <button 
          onClick={handleLogin} 
          disabled={isLoading}
          className="pc-btn-primary w-full disabled:opacity-50"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>

        <div className="text-center pc-text-caption text-muted-foreground">
          Ou entrar com
        </div>

        {isBiometricAvailable && isBiometricEnabled && (
          <button 
            onClick={handleBiometricLogin}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 pc-btn-secondary ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Fingerprint size={20} />
            Biometria
          </button>
        )}
      </div>

      <SelectMatriculaModal
        matriculas={matriculas}
        onSelect={handleSelectMatricula}
        onCancel={handleCancelMatricula}
        isOpen={showMatriculaModal}
      />

      {/* Dialog para salvar credenciais biométricas */}
      {showBiometricSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <Fingerprint size={48} className="text-primary mx-auto mb-4" />
              <h3 className="pc-text-title mb-2">Configurar Biometria</h3>
              <p className="pc-text-body text-muted-foreground">
                Deseja salvar seus dados para fazer login mais rápido usando sua biometria?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSaveBiometricCredentials(false)}
                className="flex-1 pc-btn-secondary"
              >
                Agora não
              </button>
              <button
                onClick={() => handleSaveBiometricCredentials(true)}
                className="flex-1 pc-btn-primary"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
