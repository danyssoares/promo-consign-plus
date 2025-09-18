import { useAuth } from "@/contexts/AuthContext";
import { User, CreditCard, Banknote, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { convenioService, LimiteUtilizado } from "@/services/convenioService";
import { colaboradorService, GraficoFolhaColaborador } from "@/services/colaboradorService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import logo from "@/assets/logo.png";

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
  const [chartData, setChartData] = useState<GraficoFolhaColaborador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState<string>("00:00:00");
  const [selectedData, setSelectedData] = useState<GraficoFolhaColaborador | null>(null);

  // Extrair login do objeto Global se existir
  const userLogin = (userData as { Global?: { login?: string } })?.Global?.login || (userData as { login?: string })?.login || (userData as { nome?: string })?.nome || "Usuário";
  
  // Calcular total utilizado no período
  const totalUtilizadoPeriodo = chartData.reduce((total, item) => total + item.valorUtilizado, 0);

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

        const valorMargemUtilizadoCartao = listaValorUtilizado[1]?.valorUtilizado || 0;
        const valorMargemUtilizadoEmprestimo = listaValorUtilizado[0]?.valorUtilizado || 0;

        if (listaValorUtilizado.length >= 2) {
          setValorMargemDisponivelCartao(valorMargemCartao - valorMargemUtilizadoCartao);
          setValorMargemDisponivelEmprestimo(valorMargemEmprestimo - valorMargemUtilizadoEmprestimo);
        } else {
          setValorMargemDisponivelCartao(0);
          setValorMargemDisponivelEmprestimo(0);
        }

        // Buscar dados do gráfico
        const graficoData = await colaboradorService.buscarGraficoFolhaColaborador(
          colaborador.id,
          6, // 6 meses fixo conforme solicitado
          authToken
        );
        
        setChartData(graficoData);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Falha ao carregar os dados do dashboard");
        setValorMargemDisponivelCartao(0);
        setValorMargemDisponivelEmprestimo(0);
        // Manter dados mockados em caso de erro
        setChartData([
          {
            valorRendimento: 1234.55,
            valorUtilizado: 0,
            valorMargem: 2323.00,
            data: "03/25"
          },
          {
            valorRendimento: 1460.00,
            valorUtilizado: 0,
            valorMargem: 3026.00,
            data: "04/25"
          },
          {
            valorRendimento: 1234.55,
            valorUtilizado: 0.00,
            valorMargem: 2849.00,
            data: "05/25"
          },
          {
            valorRendimento: 1100.00,
            valorUtilizado: 0.00,
            valorMargem: 2926.00,
            data: "06/25"
          },
          {
            valorRendimento: 1234.55,
            valorUtilizado: 0.00,
            valorMargem: 3023.00,
            data: "07/25"
          },
          {
            valorRendimento: 1900.00,
            valorUtilizado: 0.00,
            valorMargem: 2849.00,
            data: "08/25"
          }
        ]);
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
        <img src={logo} alt="PromoConsig Logo" className="h-12 w-auto" />
        
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
                       {colaborador?.pessoaFisica?.pessoa?.nome || colaborador?.id || "Não informado"}
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

      {/* Cards dos valores disponíveis */}
      <div className="grid grid-cols-1 gap-4">
        {/* Margem Consignável Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Margem Consignável
            </CardTitle>
            <Banknote className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {error ? (
                <span className="text-destructive">Erro ao carregar</span>
              ) : (
                `R$ ${valorMargemDisponivelEmprestimo.toLocaleString('pt-BR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}`
              )}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Valor disponível para empréstimo
            </p>
          </CardContent>
        </Card>

        {/* Cartão de Crédito Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Cartão de Crédito
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {error ? (
                <span className="text-destructive">Erro ao carregar</span>
              ) : (
                `R$ ${valorMargemDisponivelCartao.toLocaleString('pt-BR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}`
              )}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Limite disponível para cartão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Stacked Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span>Evolução Financeira</span>
              <span className="text-sm font-normal text-muted-foreground">Últimos 6 meses</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
                onClick={(event) => {
                  if (event && event.activePayload && event.activePayload[0]) {
                    setSelectedData(event.activePayload[0].payload as GraficoFolhaColaborador);
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorRendimento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E4193" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1E4193" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorMargem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F7DB14" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F7DB14" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorUtilizado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="data" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                />
                 <Legend 
                   formatter={(value) => 
                     value === 'valorUtilizado' ? 'Utilizado' :
                     value === 'valorRendimento' ? 'Rendimento' : 'Margem'
                   }
                   wrapperStyle={{ fontSize: '10px', textAlign: 'center', width: '100%', display: 'flex', justifyContent: 'center' }}
                   iconType="circle"
                   iconSize={8}
                 />
                <Area
                  type="monotone"
                  dataKey="valorUtilizado"
                  stackId="1"
                  stroke="#DC2626"
                  fill="url(#colorUtilizado)"
                  strokeWidth={2}
                  dot={{ fill: '#DC2626', r: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="valorRendimento"
                  stackId="1"
                  stroke="#1E4193"
                  fill="url(#colorRendimento)"
                  strokeWidth={2}
                  dot={{ fill: '#1E4193', r: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="valorMargem"
                  stackId="1"
                  stroke="#F7DB14"
                  fill="url(#colorMargem)"
                  strokeWidth={2}
                  dot={{ fill: '#F7DB14', r: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Total Utilizado no Período */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-center">
            <p className="text-xs font-medium text-orange-700 mb-1">
              Total Utilizado no Período
            </p>
            <p className="text-lg font-bold text-orange-900">
              R$ {totalUtilizadoPeriodo.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};