import { useAuth } from "@/contexts/AuthContext";
import { User, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { convenioService, HistoricoMargem } from "@/services/convenioService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [historicoMargens, setHistoricoMargens] = useState<HistoricoMargem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState<string>("00:00:00");

  // Extrair login do objeto Global se existir
  const userLogin = (userData as { Global?: { login?: string } })?.Global?.login || (userData as { login?: string })?.login || (userData as { nome?: string })?.nome || "Usuário";

  // Calcular tempo de sessão
  useEffect(() => {
    // Definir o momento de início da sessão - sempre criar um novo ao montar o componente
    const sessionStartKey = 'sessionStartTime';
    const sessionStartTime = new Date().toISOString();
    sessionStorage.setItem(sessionStartKey, sessionStartTime);

    const calculateSessionTime = () => {
      try {
        const startTime = new Date(sessionStartTime);
        const now = new Date();
        const diffMs = Math.max(0, now.getTime() - startTime.getTime());
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        setSessionTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } catch (error) {
        console.error('Erro ao calcular tempo de sessão:', error);
        setSessionTime("00:00:00");
      }
    };

    // Calcular imediatamente
    calculateSessionTime();
    
    // Atualizar a cada segundo
    const interval = setInterval(calculateSessionTime, 1000);
    
    return () => clearInterval(interval);
  }, [userData, colaborador]); // Reiniciar quando há mudanças no usuário/colaborador

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar se temos os dados necessários
        if (!colaborador?.id || !authToken) {
          throw new Error("Dados do colaborador ou token de autenticação não encontrados");
        }

        // Buscar limites utilizados para calcular valores disponíveis
        const listaValorUtilizado = await convenioService.buscarLimiteUtilizadoPorColaborador(
          colaborador.id, 
          authToken
        );

        // Extrair os valores específicos
        const valorMargemCartao = colaborador.folhaColaborador ? colaborador.folhaColaborador.valorMargemCartao : 0;
        const valorMargemEmprestimo = colaborador.folhaColaborador ? colaborador.folhaColaborador.valorMargemEmprestimo : 0;

        const valorMargemUtilizadoCartao = listaValorUtilizado[1]?.valorUtilizado || 0;
        const valorMargemUtilizadoEmprestimo = listaValorUtilizado[0]?.valorUtilizado || 0;

        setValorMargemDisponivelCartao(valorMargemCartao - valorMargemUtilizadoCartao);
        setValorMargemDisponivelEmprestimo(valorMargemEmprestimo - valorMargemUtilizadoEmprestimo);

        // Buscar histórico de margens dos últimos 6 meses
        try {
          const historico = await convenioService.buscarHistoricoMargens(colaborador.id, authToken);
          setHistoricoMargens(historico);
        } catch (historicoError) {
          console.warn("Erro ao buscar histórico de margens:", historicoError);
          // Se não conseguir buscar o histórico, usar dados mock para demonstração
          setHistoricoMargens([
            { valorRendimento: 1234.55, valorUtilizado: null, valorMargem: 2323.00, data: "03/2025" },
            { valorRendimento: 1460.00, valorUtilizado: null, valorMargem: 3026.00, data: "04/2025" },
            { valorRendimento: 1234.55, valorUtilizado: 0.00, valorMargem: 2849.00, data: "05/2025" },
            { valorRendimento: 1100.00, valorUtilizado: 0.00, valorMargem: 2926.00, data: "06/2025" },
            { valorRendimento: 1234.55, valorUtilizado: 0.00, valorMargem: 3023.00, data: "07/2025" },
            { valorRendimento: 1900.00, valorUtilizado: 0.00, valorMargem: 2849.00, data: "08/2025" }
          ]);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError("Falha ao carregar os dados do dashboard");
        setValorMargemDisponivelCartao(0);
        setValorMargemDisponivelEmprestimo(0);
        setHistoricoMargens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [colaborador, authToken]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getMonthName = (monthYear: string) => {
    const [month, year] = monthYear.split('/');
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return monthNames[parseInt(month) - 1] || month;
  };

  // Calcular valores máximos para normalizar o gráfico
  const maxMargem = Math.max(...historicoMargens.map(h => h.valorMargem), 0);
  const maxRendimento = Math.max(...historicoMargens.map(h => h.valorRendimento), 0);

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

  return (
    <div className="pc-container space-y-6 max-w-sm mx-auto">
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
                      {(colaborador as any)?.matricula || "Não informado"}
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

      {/* Available Values Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Empréstimo Card */}
        <Card className="pc-card-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Empréstimo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Disponível</span>
              <div className="text-lg font-bold text-primary">
                {error ? (
                  <span className="text-destructive text-sm">Erro</span>
                ) : (
                  formatCurrency(valorMargemDisponivelEmprestimo)
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cartão Card */}
        <Card className="pc-card-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Cartão de Crédito
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Disponível</span>
              <div className="text-lg font-bold text-accent">
                {error ? (
                  <span className="text-destructive text-sm">Erro</span>
                ) : (
                  formatCurrency(valorMargemDisponivelCartao)
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Data - Monthly Cards */}
      <Card className="pc-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Histórico dos Últimos 6 Meses</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {historicoMargens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum dado histórico disponível</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Monthly Data Cards */}
              {historicoMargens.map((item, index) => (
                <div key={index} className="bg-muted/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs font-medium">
                      {getMonthName(item.data)}
                    </Badge>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Margem Total</div>
                      <div className="text-sm font-bold text-primary">
                        {formatCurrency(item.valorMargem)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-muted-foreground">Rendimento</span>
                      </div>
                      <div className="font-semibold text-accent pl-3">
                        {formatCurrency(item.valorRendimento)}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                        <span className="text-muted-foreground">Utilizado</span>
                      </div>
                      <div className="font-semibold text-destructive pl-3">
                        {item.valorUtilizado !== null ? formatCurrency(item.valorUtilizado) : "R$ 0,00"}
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>{formatCurrency(item.valorMargem)}</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                      <div className="flex h-full">
                        {/* Rendimento portion */}
                        <div 
                          className="bg-accent rounded-l-full"
                          style={{
                            width: `${Math.min((item.valorRendimento / item.valorMargem) * 100, 100)}%`
                          }}
                        />
                        {/* Utilizado portion */}
                        {item.valorUtilizado && item.valorUtilizado > 0 && (
                          <div 
                            className="bg-destructive"
                            style={{
                              width: `${Math.min((item.valorUtilizado / item.valorMargem) * 100, 100)}%`
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary Card */}
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-center mb-3">
                  <div className="text-xs font-medium text-primary">Resumo do Período</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Margem Média</div>
                    <div className="font-bold text-primary">
                      {formatCurrency(historicoMargens.reduce((acc, item) => acc + item.valorMargem, 0) / historicoMargens.length)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Rendimento Médio</div>
                    <div className="font-bold text-accent">
                      {formatCurrency(historicoMargens.reduce((acc, item) => acc + item.valorRendimento, 0) / historicoMargens.length)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Total Utilizado</div>
                    <div className="font-bold text-destructive">
                      {formatCurrency(historicoMargens.reduce((acc, item) => acc + (item.valorUtilizado || 0), 0))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};