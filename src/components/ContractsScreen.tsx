import { ArrowLeft, FileText, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { contratoService, ContratoHistorico } from "@/services/contratoService";

interface ContractDisplay {
  id: string; // Número do Contrato
  nomeTipoRubrica: string; // Modalidade
  rubricaNome: string; // Produto
  parcelas: number; // Quantidade de Parcelas
  valorParcelaFormatado: string; // Valor da Parcela (já formatado)
  total: number; // Valor Solicitado
  situacao: string;
  status: "active" | "inactive";
}

export const ContractsScreen = ({
  onBack,
  onContractClick,
  initialTab = "ativos"
}: {
  onBack: () => void;
  onContractClick: (contract: ContractDisplay, currentTab: string) => void;
  initialTab?: string;
}) => {
  const { getAuthorizationData, colaborador, getUsuarioLogado } = useAuth();
  const [activeTab, setActiveTab] = useState<"ativos" | "inativos" | "todos">(initialTab as any);
  const [contracts, setContracts] = useState<ContractDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contract history when component mounts
  useEffect(() => {
    const fetchContractHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const authToken = getAuthorizationData();
        const usuarioLogado = getUsuarioLogado();
        
        // Check if we have the required data
        if (!colaborador?.id || !usuarioLogado?.id || !authToken) {
          // Tentar novamente após um pequeno delay para garantir que os dados estejam disponíveis
          setTimeout(async () => {
            const retryAuth = getAuthorizationData();
            const retryUsuario = getUsuarioLogado();
            
            if (!colaborador?.id || !retryUsuario?.id || !retryAuth) {
              throw new Error("Dados do colaborador, usuário ou token de autenticação não encontrados");
            }

            // Fetch contract history
            const contratoHistorico = await contratoService.buscarHistoricoPorColaborador(
              colaborador.id,
              retryUsuario.id,
              retryAuth
            );

            // Transform the API response to match our display interface
            const transformedContracts: ContractDisplay[] = contratoHistorico.map((contrato: ContratoHistorico) => ({
              id: contrato.id || "",
              nomeTipoRubrica: contrato.nomeTipoRubrica || "Não informado",
              rubricaNome: contrato.rubricaNome || "Não informado",
              parcelas: contrato.parcelas || 0,
              valorParcelaFormatado: contrato.valorParcelaFormatado || "R$ 0,00",
              total: contrato.total || 0,
              situacao: contrato.situacao || "",
              status: contrato.situacao === 'Aprovado' ? "active" : "inactive"
            }));

            setContracts(transformedContracts);
          }, 500);
          return;
        }

        // Fetch contract history
        const contratoHistorico = await contratoService.buscarHistoricoPorColaborador(
          colaborador.id,
          usuarioLogado.id,
          authToken
        );

        // Transform the API response to match our display interface
        const transformedContracts: ContractDisplay[] = contratoHistorico.map((contrato: ContratoHistorico) => ({
          id: contrato.id || "",
          nomeTipoRubrica: contrato.nomeTipoRubrica || "Não informado",
          rubricaNome: contrato.rubricaNome || "Não informado",
          parcelas: contrato.parcelas || 0,
          valorParcelaFormatado: contrato.valorParcelaFormatado || "R$ 0,00",
          total: contrato.total || 0,
          situacao: contrato.situacao || "",
          status: contrato.situacao === 'Aprovado' ? "active" : "inactive"
        }));

        setContracts(transformedContracts);
      } catch (err) {
        console.error("Erro ao buscar histórico de contratos:", err);
        setError("Falha ao carregar os contratos");
        // Fallback to dummy data in case of error
        setContracts([
          {
            id: "CT123456",
            nomeTipoRubrica: "Consignado",
            rubricaNome: "Empréstimo Pessoal",
            parcelas: 24,
            valorParcelaFormatado: "R$ 350,00",
            total: 8400.00,
            situacao: "Aprovado",
            status: "active"
          },
          {
            id: "CT789012", 
            nomeTipoRubrica: "Consignado",
            rubricaNome: "Cartão de Crédito",
            parcelas: 12,
            valorParcelaFormatado: "R$ 420,00",
            total: 5040.00,
            situacao: "Aprovado",
            status: "active"
          },
          {
            id: "CT345678",
            nomeTipoRubrica: "Consignado",
            rubricaNome: "Empréstimo Pessoal",
            parcelas: 36,
            valorParcelaFormatado: "R$ 280,00",
            total: 10080.00,
            situacao: "Cancelado",
            status: "inactive"
          },
          {
            id: "CT901234",
            nomeTipoRubrica: "Consignado",
            rubricaNome: "Cartão de Crédito",
            parcelas: 18,
            valorParcelaFormatado: "R$ 500,00",
            total: 9000.00,
            situacao: "Aprovado",
            status: "active"
          },
          {
            id: "CT567890",
            nomeTipoRubrica: "Consignado",
            rubricaNome: "Empréstimo Pessoal",
            parcelas: 12,
            valorParcelaFormatado: "R$ 300,00",
            total: 3600.00,
            situacao: "Negado",
            status: "inactive"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchContractHistory();
  }, []);

  const filteredContracts = contracts.filter(contract => {
    if (activeTab === "ativos") return contract.situacao === "Aprovado";
    if (activeTab === "inativos") return contract.situacao === "Cancelado" || contract.situacao === "Negado";
    return true; // todos
  });

  if (loading) {
    return (
      <div className="pc-container max-w-sm mx-auto flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando contratos...</p>
        </div>
      </div>
    );
  }

  return <div className="pc-container max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <button onClick={onBack}>
          <ArrowLeft className="text-foreground" size={24} />
        </button>
        <h1 className="pc-text-title">Contratos</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="pc-card bg-destructive/10 border-destructive/20 mb-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {[{
        key: "ativos",
        label: "Ativos"
      }, {
        key: "inativos",
        label: "Inativos"
      }, {
        key: "todos",
        label: "Todos"
      }].map(tab => <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {tab.label}
            {activeTab === tab.key && <div className="w-8 h-0.5 bg-accent rounded-full mx-auto mt-1" />}
          </button>)}
      </div>

      {/* Contracts Title */}
      <h2 className="pc-text-body font-semibold mb-4">
        {activeTab === "ativos" ? "Contratos Ativos" : 
         activeTab === "inativos" ? "Contratos Inativos" : 
         "Todos os Contratos"}
      </h2>

      {/* Contracts List */}
      <div className="space-y-3">
        {filteredContracts.length === 0 ? (
          <div className="pc-card text-center py-8">
            <Circle className="mx-auto text-muted-foreground mb-2" size={48} />
            <p className="pc-text-body text-muted-foreground">
              {activeTab === "ativos" ? "Nenhum contrato ativo encontrado" : 
               activeTab === "inativos" ? "Nenhum contrato inativo encontrado" : 
               "Nenhum contrato encontrado"}
            </p>
          </div>
        ) : (
          filteredContracts.map(contract => 
            <button
              key={contract.id}
              onClick={() => {
                console.log("Contract clicked:", contract);
                onContractClick(contract, activeTab);
              }}
              className="pc-card w-full text-left hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="p-2 bg-secondary rounded-lg">
                  <FileText 
                    className={`${activeTab === "todos" 
                      ? (contract.status === "active" ? "text-green-500" : "text-red-500")
                      : "text-muted-foreground"
                    }`} 
                    size={20} 
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="pc-text-body font-medium">
                      Nº: {contract.id}
                    </div>
                    <div className="pc-text-caption text-xs text-muted-foreground">
                      {contract.situacao}
                    </div>
                  </div>
                  <div className="pc-text-caption mt-1">
                    {contract.rubricaNome}
                  </div>
                  <div className="pc-text-caption text-xs mt-1">
                    ({contract.nomeTipoRubrica})
                  </div>
                  {contract.parcelas > 0 && (
                    <div className="pc-text-caption text-xs mt-1">
                      {contract.parcelas} de {contract.valorParcelaFormatado}
                    </div>
                  )}
                </div>

                {/* Value */}
                <div className="pc-text-value text-right">
                  R$ {contract.total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
            </button>
          )
        )}
      </div>
    </div>;
};