import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Building2, CreditCard, Home, GraduationCap, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { convenioService, RubricaConvenio } from "@/services/convenioService";
import { colaboradorService } from "@/services/colaboradorService";

interface ProductsScreenProps {
  onBack: () => void;
}

// Definindo tipos para agrupamento
type RubricaGroup = {
  [key: string]: RubricaConvenio[];
};

// Ícones para diferentes tipos de rubricas (exemplo)
const rubricaIcons: Record<string, any> = {
  "Empréstimo": Banknote,
  "Cartão": CreditCard,
  "Mensalidade": Building2,
  "Habitacional": Home,
  "Estudantil": GraduationCap,
  // Adicione mais conforme necessário
};

// Cores para diferentes tipos de rubricas
const rubricaColors: Record<string, string> = {
  "Empréstimo": "bg-blue-100 text-blue-800",
  "Cartão": "bg-green-100 text-green-800",
  "Mensalidade": "bg-purple-100 text-purple-800",
  "Habitacional": "bg-orange-100 text-orange-800",
  "Estudantil": "bg-yellow-100 text-yellow-800",
  // Adicione mais conforme necessário
};

export const ProductsScreen = ({ onBack }: ProductsScreenProps) => {
  const { usuarioLogado, colaborador, getAuthorizationData, setColaborador } = useAuth();
  const [rubricas, setRubricas] = useState<RubricaConvenio[]>([]);
  const [groupedRubricas, setGroupedRubricas] = useState<RubricaGroup>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [margemCartao, setMargemCartao] = useState<number>(0);
  const [margemEmprestimo, setMargemEmprestimo] = useState<number>(0);
  const colaboradorAtualizadoRef = useRef(false);

  useEffect(() => {
    const fetchRubricas = async () => {
      try {
        // Verificar se temos os dados necessários
        if (!usuarioLogado || !colaborador || !colaborador.idParceiro) {
          setError("Dados do usuário ou colaborador não encontrados");
          setLoading(false);
          return;
        }

        const authData = getAuthorizationData();
        if (!authData) {
          setError("Dados de autenticação não encontrados");
          setLoading(false);
          return;
        }

        // Atualizar margens ao carregar a tela (apenas uma vez)
        if (!colaboradorAtualizadoRef.current) {
          try {
            // Verificar se temos o documento federal
            const documento = colaborador.pessoaFisica?.pessoa?.documentoFederal;
            if (documento) {
              // Limpar caracteres especiais do documento
              const documentoLimpo = documento.replace(/[.\-/]/g, '');
              
              // Buscar dados do colaborador usando o mesmo método do login
              const colaboradorAtualizado = await colaboradorService.buscarColaboradorPorMatricula(
                documentoLimpo,
                (colaborador as any)?.codigoMatricula,
                authData
              );
              
              if (colaboradorAtualizado) {
                // Atualizar o colaborador na global
                setColaborador(colaboradorAtualizado as any);

                // Atualizar os valores de margem
                const margemCartaoValue = colaboradorAtualizado.folhaColaborador?.valorMargemCartao || 0;
                const margemEmprestimoValue = colaboradorAtualizado.folhaColaborador?.valorMargemEmprestimo || 0;
                
                setMargemCartao(margemCartaoValue);
                setMargemEmprestimo(margemEmprestimoValue);
                
                // Marcar que o colaborador foi atualizado
                colaboradorAtualizadoRef.current = true;
              }
            }
          } catch (err) {
            console.error("Erro ao atualizar margens:", err);
          }
        }

        // Chamar a API
        const data = await convenioService.listarRubricaConvenioParceiro(
          colaborador.idParceiro,
          usuarioLogado.id,
          colaborador.id,
          authData
        );

        setRubricas(data);
        
        // Agrupar por descricaoRubricaTipo
        const grouped = data.reduce((acc: RubricaGroup, rubrica) => {
          const key = rubrica.descricaoRubricaTipo;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(rubrica);
          return acc;
        }, {});
        
        setGroupedRubricas(grouped);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar rubricas:", err);
        setError("Falha ao carregar os produtos. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchRubricas();
  }, [usuarioLogado, colaborador, getAuthorizationData, setColaborador]);

  const getIconForRubrica = (descricao: string) => {
    // Procurar um ícone correspondente ou usar um padrão
    for (const [key, Icon] of Object.entries(rubricaIcons)) {
      if (descricao.includes(key)) {
        return Icon;
      }
    }
    // Ícone padrão se não encontrar correspondência
    return Banknote;
  };

  const getColorForRubrica = (descricao: string) => {
    // Procurar uma cor correspondente ou usar uma padrão
    for (const [key, colorClass] of Object.entries(rubricaColors)) {
      if (descricao.includes(key)) {
        return colorClass;
      }
    }
    // Cor padrão se não encontrar correspondência
    return "bg-blue-100 text-blue-800";
  };

  // Função para obter o limite disponível com base no rubricaTipoId
  const getLimiteDisponivel = (rubrica: RubricaConvenio): number => {
    // TODO: Adicionar o campo rubricaTipoId na interface RubricaConvenio quando disponível
    // Por enquanto, vamos usar uma lógica de exemplo
    // Se rubricaTipoId == 2, usar margemCartao, senão usar margemEmprestimo
    // Como não temos o rubricaTipoId, vamos usar uma lógica baseada na descrição
    if (rubrica.descricaoRubricaTipo.includes("Cartão")) {
      return margemCartao;
    }
    return margemEmprestimo;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Produtos Disponíveis</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {loading ? (
          // Loading skeleton
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Card>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error message
          <div className="p-4">
            <Card>
              <CardContent className="p-6 text-center text-red-500">
                <p>{error}</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Products by category
          Object.entries(groupedRubricas).map(([rubricaTipo, rubricasList]) => {
            const IconComponent = getIconForRubrica(rubricaTipo);
            const colorClass = getColorForRubrica(rubricaTipo);
            
            return (
              <div key={rubricaTipo} className="space-y-3">
                <div className="flex items-center gap-2">
                  <IconComponent size={20} className="text-muted-foreground" />
                  <h2 className="text-lg font-medium">{rubricaTipo}</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {rubricasList.length}
                  </Badge>
                </div>
                
                {rubricasList.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-muted-foreground">
                        <IconComponent size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Nenhum produto disponível nesta categoria</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {rubricasList.map((rubrica, index) => {
                      const limiteDisponivel = getLimiteDisponivel(rubrica);
                      
                      return (
                        <Card key={`${rubricaTipo}-${index}`} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-base">{rubrica.nome}</CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Building2 size={14} />
                                  <span>{rubrica.nomeFantasiaConsignataria}</span>
                                </div>
                              </div>
                              <Badge className={colorClass}>
                                {rubricaTipo}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Convênio:</span>
                                <span className="text-sm font-medium">{rubrica.nomeConvenio}</span>
                              </div>
                              
                              <Separator />
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Limite Disponível:</span>
                                <span className="text-lg font-bold text-primary">
                                  {formatCurrency(limiteDisponivel)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};