import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { convenioService, LimiteUtilizado } from "@/services/convenioService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export const Dashboard = () => {
  const {
    getUsuarioLogado,
    getAuthorizationData,
    colaborador,
    getLastLogin
  } = useAuth();
  const userData = getUsuarioLogado();
  const authToken = getAuthorizationData();

  const [valorMargemDisponivelCartao, setValorMargemDisponivelCartao] = useState<number>(0);
  const [valorMargemDisponivelEmprestimo, setValorMargemDisponivelEmprestimo] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState<string>("00:00:00");

  // Extrair login do objeto Global se existir
  const userLogin = (userData as { Global?: { login?: string } })?.Global?.login || (userData as { login?: string })?.login || (userData as { nome?: string })?.nome || "Usuário";
  const months = ["Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const marginData = [40, 65, 30, 80, 45, 70];
  const creditData = [60, 45, 70, 55, 85, 40];

  // Calcular tempo de sessão
  useEffect(() => {
    const calculateSessionTime = () => {
      const lastLogin = getLastLogin();
      if (lastLogin) {
        const loginTime = new Date(lastLogin);
        const now = new Date();
        const diffMs = now.getTime() - loginTime.getTime();
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        setSessionTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        // Se não tiver lastLogin, usar o tempo desde que o componente foi montado
        const componentMountTime = sessionStorage.getItem('componentMountTime');
        if (!componentMountTime) {
          sessionStorage.setItem('componentMountTime', new Date().toISOString());
          setSessionTime("00:00:01");
        } else {
          const mountTime = new Date(componentMountTime);
          const now = new Date();
          const diffMs = now.getTime() - mountTime.getTime();
          
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          setSessionTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }
    };

    // Calcular imediatamente
    calculateSessionTime();
    
    // Atualizar a cada segundo
    const interval = setInterval(calculateSessionTime, 1000);
    
    return () => clearInterval(interval);
  }, [getLastLogin]);

  useEffect(() => {
    const fetchLimitesUtilizados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar se temos os dados necessários
        if (!colaborador?.id || !authToken) {
          throw new Error("Dados do colaborador ou token de autenticação não encontrados");
        }

        // Buscar limites utilizados
        const listaValorUtilizado = await convenioService.buscarLimiteUtilizadoPorColaborador(
          colaborador.id, 
          authToken
        );

        // Extrair os valores específicos
        const valorMargemCartao = colaborador.folhaColaborador ? colaborador.folhaColaborador.valorMargemCartao : 0;
        const valorMargemEmprestimo = colaborador.folhaColaborador ? colaborador.folhaColaborador.valorMargemEmprestimo : 0;
        if (listaValorUtilizado.length >= 2) {
          setValorMargemDisponivelCartao(valorMargemCartao - (listaValorUtilizado[1].valorUtilizado || 0));
          setValorMargemDisponivelEmprestimo(valorMargemEmprestimo - (listaValorUtilizado[0].valorUtilizado || 0));
        } else {
          setValorMargemDisponivelCartao(0);
          setValorMargemDisponivelEmprestimo(0);
        }
      } catch (err) {
        console.error("Erro ao buscar limites utilizados:", err);
        setError("Falha ao carregar os dados de margem utilizada");
        setValorMargemDisponivelCartao(0);
        setValorMargemDisponivelEmprestimo(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLimitesUtilizados();
  }, [colaborador, authToken]);

  if (loading) {
    return (
      <div className="pc-container space-y-6 max-w-sm mx-auto flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return <div className="pc-container space-y-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center pt-4 mb-6">
        <img src="/lovable-uploads/93766fc2-0b21-4c6e-a115-810c01c95df1.png" alt="PromoConsig Logo" className="h-12 w-auto" />
        
        {/* User Info */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="pc-text-body text-foreground text-xs font-medium">{userLogin}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-background border border-border shadow-lg" align="end">
            <div className="p-4">
              {/* Header */}
              <div className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="pc-text-body font-semibold text-foreground">
                  {colaborador?.pessoaFisica?.pessoa?.nome || userData?.nome || "Usuário"}
                </h3>
                <p className="pc-text-caption text-muted-foreground mt-1">
                  Informações da Sessão
                </p>
              </div>
              
              <Separator className="mb-4" />
              
              {/* Dados do usuário */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="pc-text-caption text-muted-foreground block">Login</span>
                    <span className="pc-text-body font-medium text-foreground text-sm">{userLogin}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="pc-text-caption text-muted-foreground block">Matrícula</span>
                    <span className="pc-text-body font-medium text-foreground text-sm">
                      {colaborador?.pessoaFisica?.pessoa?.id || colaborador?.matricula || "Não informado"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="pc-text-caption text-muted-foreground block">CPF</span>
                  <span className="pc-text-body font-medium text-foreground">
                    {colaborador?.pessoaFisica?.pessoa?.documentoFederal?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") || "Não informado"}
                  </span>
                </div>
                
                <Separator />
                
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <span className="pc-text-caption text-muted-foreground block mb-1">Tempo de Sessão</span>
                  <span className="pc-text-body font-mono font-semibold text-primary text-lg">
                    {sessionTime}
                  </span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Margem Consignável Card */}
      <div className="pc-card">
        <h3 className="pc-text-body text-muted-foreground mb-2">Margem Consignável</h3>
        <div className="mb-4">
          <span className="pc-text-caption text-muted-foreground">Margem Disponível</span>
          <div className="pc-text-value">
            {error ? (
              <span className="text-destructive">Erro ao carregar</span>
            ) : (
              `R$ ${valorMargemDisponivelEmprestimo.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`
            )}
          </div>
          {/*<span className="pc-text-caption text-muted-foreground">Total</span>*/}
        </div>
        
        {/* Chart */}
        <div className="h-32 flex items-end justify-between gap-2 p-3 bg-muted/10 rounded-lg">
          {marginData.map((height, index) => <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col items-center justify-end h-20">
                <span className="pc-text-caption text-primary font-medium mb-1">
                  {height}%
                </span>
                <div className="bg-gradient-to-t from-primary to-primary/60 w-full rounded-t-sm transition-all duration-300 hover:from-primary/80 hover:to-primary/40" style={{
              height: `${height}%`,
              minWidth: '20px'
            }} />
              </div>
              <span className="pc-text-caption text-muted-foreground text-xs font-medium">
                {months[index]}
              </span>
            </div>)}
        </div>
      </div>

      {/* Cartão de Crédito Card */}
      <div className="pc-card">
        <h3 className="pc-text-body text-muted-foreground mb-2">Cartão de Crédito</h3>
        <div className="mb-4">
          <span className="pc-text-caption text-muted-foreground">Limite Disponível</span>
          <div className="pc-text-value">
            {error ? (
              <span className="text-destructive">Erro ao carregar</span>
            ) : (
              `R$ ${valorMargemDisponivelCartao.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`
            )}
          </div>
          {/*<span className="pc-text-caption text-muted-foreground">Total</span>*/}
        </div>
        
        {/* Chart */}
        <div className="h-32 flex items-end justify-between gap-2 p-3 bg-muted/10 rounded-lg">
          {creditData.map((height, index) => <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col items-center justify-end h-20">
                <span className="pc-text-caption text-accent-foreground font-medium mb-1">
                  {height}%
                </span>
                <div className="bg-gradient-to-t from-accent to-accent/60 w-full rounded-t-sm transition-all duration-300 hover:from-accent/80 hover:to-accent/40" style={{
              height: `${height}%`,
              minWidth: '20px'
            }} />
              </div>
              <span className="pc-text-caption text-muted-foreground text-xs font-medium">
                {months[index]}
              </span>
            </div>)}
        </div>
      </div>
    </div>;
};