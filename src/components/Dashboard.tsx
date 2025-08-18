import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { convenioService, LimiteUtilizado } from "@/services/convenioService";

export const Dashboard = () => {
  const {
    getUsuarioLogado,
    getAuthorizationData,
    colaborador
  } = useAuth();
  const userData = getUsuarioLogado();
  const authToken = getAuthorizationData();

  const [valorMargemDisponivelCartao, setValorMargemDisponivelCartao] = useState<number>(0);
  const [valorMargemDisponivelEmprestimo, setValorMargemDisponivelEmprestimo] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Extrair login do objeto Global se existir
  const userLogin = (userData as { Global?: { login?: string } })?.Global?.login || (userData as { login?: string })?.login || (userData as { nome?: string })?.nome || "Usuário";
  const months = ["Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const marginData = [40, 65, 30, 80, 45, 70];
  const creditData = [60, 45, 70, 55, 85, 40];

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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="pc-text-body text-foreground text-xs font-medium">{userLogin}</span>
        </div>
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