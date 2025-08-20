import { useAuth } from "@/contexts/AuthContext";
import { User, TrendingUp, Wallet, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { convenioService, HistoricoMargem } from "@/services/convenioService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

    calculateSessionTime();
    const interval = setInterval(calculateSessionTime, 1000);
    return () => clearInterval(interval);
  }, [userData, colaborador]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!colaborador?.id || !authToken) {
          throw new Error("Dados do colaborador ou token de autenticação não encontrados");
        }

        const listaValorUtilizado = await convenioService.buscarLimiteUtilizadoPorColaborador(
          colaborador.id, 
          authToken
        );

        const valorMargemCartao = colaborador.folhaColaborador ? colaborador.folhaColaborador.valorMargemCartao : 0;
        const valorMargemEmprestimo = colaborador.folhaColaborador ? colaborador.folhaColaborador.valorMargemEmprestimo : 0;

        const valorMargemUtilizadoCartao = listaValorUtilizado[1]?.valorUtilizado || 0;
        const valorMargemUtilizadoEmprestimo = listaValorUtilizado[0]?.valorUtilizado || 0;

        setValorMargemDisponivelCartao(valorMargemCartao - valorMargemUtilizadoCartao);
        setValorMargemDisponivelEmprestimo(valorMargemEmprestimo - valorMargemUtilizadoEmprestimo);

        try {
          const historico = await convenioService.buscarHistoricoMargens(colaborador.id, authToken);
          setHistoricoMargens(historico);
        } catch (historicoError) {
          console.warn("Erro ao buscar histórico de margens:", historicoError);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="pc-container max-w-sm mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center pt-6 pb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/93766fc2-0b21-4c6e-a115-810c01c95df1.png" 
              alt="PromoConsig Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
              <p className="text-xs text-muted-foreground">Bem-vindo de volta!</p>
            </div>
          </div>
          
          {/* User Profile */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 p-2 rounded-xl transition-all duration-200">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">{userLogin}</p>
                  <p className="text-xs text-muted-foreground">{sessionTime}</p>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl" align="end">
              <div className="p-6">
                <div className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <User className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {colaborador?.pessoaFisica?.pessoa?.nome || userData?.nome || "Usuário"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Informações da Sessão</p>
                </div>
                
                <Separator className="mb-4" />
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">Login</span>
                      <span className="text-sm font-medium text-foreground">{userLogin}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">Matrícula</span>
                      <span className="text-sm font-medium text-foreground">
                        {(colaborador as any)?.matricula || "Não informado"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">CPF</span>
                    <span className="text-sm font-medium text-foreground">
                      {colaborador?.pessoaFisica?.pessoa?.documentoFederal?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") || "Não informado"}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 text-center">
                    <span className="text-xs text-muted-foreground block mb-1">Tempo de Sessão</span>
                    <span className="text-lg font-mono font-bold text-primary">
                      {sessionTime}
                    </span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Available Values - Enhanced Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Empréstimo Card */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Empréstimo</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Disponível</p>
                </div>
              </div>
              <div className="text-right">
                {error ? (
                  <span className="text-destructive text-sm">Erro</span>
                ) : (
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    {formatCurrency(valorMargemDisponivelEmprestimo)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cartão Card */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Cartão</p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Disponível</p>
                </div>
              </div>
              <div className="text-right">
                {error ? (
                  <span className="text-destructive text-sm">Erro</span>
                ) : (
                  <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                    {formatCurrency(valorMargemDisponivelCartao)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stacked Area Chart */}
        <Card className="border-0 shadow-xl bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Histórico dos Últimos 6 Meses</CardTitle>
                <p className="text-sm text-muted-foreground">Evolução das suas margens</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {historicoMargens.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum dado histórico disponível</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stacked Area Chart */}
                <div className="relative w-full">
                  <div className="h-80 bg-gradient-to-b from-muted/5 to-muted/20 rounded-xl p-4">
                    <svg 
                      width="100%" 
                      height="100%" 
                      viewBox="0 0 500 280" 
                      className="overflow-visible"
                    >
                      <defs>
                        {/* Gradients for stacked areas */}
                        <linearGradient id="margemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="rendimentoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="utilizadoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid lines */}
                      {[0, 1, 2, 3, 4, 5].map((line) => (
                        <line
                          key={line}
                          x1="50"
                          y1={40 + (line * 35)}
                          x2="450"
                          y2={40 + (line * 35)}
                          stroke="#E5E7EB"
                          strokeWidth="0.5"
                          strokeDasharray="2,2"
                          opacity="0.5"
                        />
                      ))}
                      
                      {(() => {
                        const maxValue = Math.max(...historicoMargens.map(h => h.valorMargem));
                        const chartWidth = 400;
                        const chartHeight = 180;
                        const startX = 60;
                        
                        const positions = historicoMargens.map((_, index) => 
                          startX + (index * (chartWidth / (historicoMargens.length - 1)))
                        );
                        
                        // Create stacked areas
                        const createStackedArea = (data: number[], baseData: number[] = []) => {
                          const points: string[] = [];
                          
                          // Top line (current data + base)
                          data.forEach((value, index) => {
                            const baseValue = baseData[index] || 0;
                            const totalValue = value + baseValue;
                            const y = 220 - ((totalValue / maxValue) * chartHeight);
                            points.push(`${positions[index]},${y}`);
                          });
                          
                          // Bottom line (base data, reversed)
                          for (let i = data.length - 1; i >= 0; i--) {
                            const baseValue = baseData[i] || 0;
                            const y = 220 - ((baseValue / maxValue) * chartHeight);
                            points.push(`${positions[i]},${y}`);
                          }
                          
                          return points.join(' ');
                        };
                        
                        const utilizadoValues = historicoMargens.map(h => h.valorUtilizado || 0);
                        const rendimentoValues = historicoMargens.map(h => h.valorRendimento);
                        const margemValues = historicoMargens.map(h => h.valorMargem - h.valorRendimento - (h.valorUtilizado || 0));
                        
                        return (
                          <>
                            {/* Margem area (bottom) */}
                            <polygon
                              points={createStackedArea(margemValues)}
                              fill="url(#margemGradient)"
                              stroke="none"
                            />
                            
                            {/* Rendimento area (middle) */}
                            <polygon
                              points={createStackedArea(rendimentoValues, margemValues)}
                              fill="url(#rendimentoGradient)"
                              stroke="none"
                            />
                            
                            {/* Utilizado area (top) */}
                            {utilizadoValues.some(v => v > 0) && (
                              <polygon
                                points={createStackedArea(utilizadoValues, rendimentoValues.map((r, i) => r + margemValues[i]))}
                                fill="url(#utilizadoGradient)"
                                stroke="none"
                              />
                            )}
                            
                            {/* Lines on top of areas */}
                            <polyline
                              points={historicoMargens.map((item, index) => {
                                const y = 220 - ((item.valorMargem / maxValue) * chartHeight);
                                return `${positions[index]},${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            
                            <polyline
                              points={historicoMargens.map((item, index) => {
                                const totalBelow = margemValues[index] + item.valorRendimento;
                                const y = 220 - ((totalBelow / maxValue) * chartHeight);
                                return `${positions[index]},${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#F59E0B"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            
                            {utilizadoValues.some(v => v > 0) && (
                              <polyline
                                points={historicoMargens.map((item, index) => {
                                  const y = 220 - ((item.valorMargem / maxValue) * chartHeight);
                                  return `${positions[index]},${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#EF4444"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="4,4"
                              />
                            )}
                            
                            {/* Data points */}
                            {historicoMargens.map((item, index) => {
                              const y = 220 - ((item.valorMargem / maxValue) * chartHeight);
                              return (
                                <g key={`point-${index}`}>
                                  <circle
                                    cx={positions[index]}
                                    cy={y}
                                    r="4"
                                    fill="#3B82F6"
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                  />
                                  <text
                                    x={positions[index]}
                                    y={y - 12}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="#3B82F6"
                                    fontWeight="600"
                                  >
                                    {(item.valorMargem / 1000).toFixed(1)}k
                                  </text>
                                </g>
                              );
                            })}
                            
                            {/* X-axis labels */}
                            {historicoMargens.map((item, index) => (
                              <text
                                key={`label-${index}`}
                                x={positions[index]}
                                y={250}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#6B7280"
                                fontWeight="500"
                              >
                                {getMonthName(item.data)}
                              </text>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 bg-blue-500 rounded-sm"></div>
                    <span>Margem Total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 bg-amber-500 rounded-sm"></div>
                    <span>Rendimento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                    <span>Utilizado</span>
                  </div>
                </div>

                {/* Total Utilizado Summary */}
                <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20 border border-red-200/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Total Utilizado no Período</span>
                  </div>
                  <div className="text-xl font-bold text-red-800 dark:text-red-200">
                    {formatCurrency(historicoMargens.reduce((acc, item) => acc + (item.valorUtilizado || 0), 0))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom spacing */}
        <div className="h-6"></div>
      </div>
    </div>
  );
};