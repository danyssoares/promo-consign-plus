import { ArrowLeft, Calendar, CreditCard, User, Building, FileText, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { convenioService, ConvenioResponse, ContratoParcela } from "@/services/convenioService";

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

interface Parcela {
  numero: number;
  data: string;
  valor: number;
  valorPago?: number;
  status: string;
}

export const ContractDetail = ({ contract, onBack }: { 
  contract: ContractDisplay; 
  onBack: () => void;
}) => {
  const { getAuthorizationData } = useAuth();
  const [showParcelas, setShowParcelas] = useState(false);
  const [convenioData, setConvenioData] = useState<ConvenioResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar os dados do contrato quando o componente montar
  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const authToken = getAuthorizationData();
        
        if (!authToken) {
          throw new Error("Token de autenticação não encontrado");
        }

        // Buscar os detalhes do contrato usando o ID
        const data = await convenioService.buscarContrato(contract.id, authToken);
        setConvenioData(data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do contrato:", err);
        setError("Falha ao carregar os detalhes do contrato");
      } finally {
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [contract.id, getAuthorizationData]);

  const getStatusColor = (status: string) => {
    // Tratamento para os novos status vindos da API
    if (status === "Pago" || status === "Paga") return "text-green-600";
    if (status === "Vencido") return "text-red-600";
    if (status === "Pendente") return "text-yellow-600";
    if (status === "Paga parcialmente") return "text-yellow-600";
    if (status === "à vencer") return "text-blue-600";
    
    // Para qualquer outro status, usamos uma cor neutra
    return "text-muted-foreground";
  };

  // Função para formatar a data para o formato dd/MM/yyyy
  const formatDate = (dateString: string): string => {
    // Se já estiver no formato DD/MM/YYYY, garantir que o dia e mês tenham 2 dígitos
    const parts = dateString.split('/');
    if (parts.length === 3) {
      // Garantir que o dia e mês tenham 2 dígitos
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${day}/${month}/${year}`;
    }
    // Se for uma data em outro formato, tentar parsear
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  // Função para formatar a data para o formato MM/yyyy
  const formatParcelaDate = (dateString: string): string => {
    // Se estiver no formato yyyy-MM-dd, converter para MM/yyyy
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        return `${month}/${year}`;
      }
    }
    
    // Se já estiver no formato MM/YYYY, apenas formatar
    const parts = dateString.split('/');
    if (parts.length === 2) {
      // Garantir que o mês tenha 2 dígitos
      const month = parts[0].padStart(2, '0');
      const year = parts[1];
      return `${month}/${year}`;
    }
    
    return dateString;
  };

  // Se estiver carregando, mostrar um indicador
  if (loading) {
    return (
      <div className="pc-container max-w-sm mx-auto flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando detalhes do contrato...</p>
        </div>
      </div>
    );
  }

  // Se houver erro, mostrar mensagem
  if (error) {
    return (
      <div className="pc-container max-w-sm mx-auto">
        <div className="flex items-center gap-4 py-4">
          <button onClick={onBack}>
            <ArrowLeft className="text-foreground" size={24} />
          </button>
          <h1 className="pc-text-title">Detalhes do Contrato</h1>
        </div>
        <div className="pc-card bg-destructive/10 border-destructive/20 mb-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Se não tiver dados do convênio, mostrar mensagem
  if (!convenioData || !convenioData.contratos || convenioData.contratos.length === 0) {
    return (
      <div className="pc-container max-w-sm mx-auto">
        <div className="flex items-center gap-4 py-4">
          <button onClick={onBack}>
            <ArrowLeft className="text-foreground" size={24} />
          </button>
          <h1 className="pc-text-title">Detalhes do Contrato</h1>
        </div>
        <div className="pc-card">
          <p className="text-sm text-muted-foreground">Dados do contrato não encontrados</p>
        </div>
      </div>
    );
  }

  // Pegar o primeiro contrato (como especificado nos requisitos)
  const contrato = convenioData.contratos[0];
  
  // Formatar os dados para exibição
  const consignatariaNome = convenioData.convenioDTO?.consignataria?.nomeFantasia || "Não informado";
  const nomeConvenio = convenioData.convenioDTO?.nome || "Não informado";
  const nomeColaborador = contrato.colaborador?.pessoaFisica?.pessoa?.nome || "Não informado";
  const dataCriacao = contrato.dataHoraCriacao ? formatDate(contrato.dataHoraCriacao) : "Não informado";
  const qtdParcelasPagas = contrato.qtdParcelasPagas || 0;
  const valorTotalAutorizado = contrato.valorTotalAutorizado || 0;
  const cetMensal = contrato.contratoTaxa?.valorCetMensalAutorizado !== undefined && contrato.contratoTaxa?.valorCetMensalAutorizado !== null 
    ? contrato.contratoTaxa?.valorCetMensalAutorizado?.toFixed(2).replace('.', ',') + '%' 
    : "-";
  const valorPresente = contrato.valorPresente || 0;
  const situacao = contrato.contratoSituacaoTipo?.nome || "Não informado";
  const valorParcelaAutorizado = convenioData.valorParcelaAutorizado || 0;
  const qtdParcelasAutorizado = convenioData.qtdParcelasAutorizado || 0;
  
  // Calcular o status com base na situação
  const status = situacao === "Aprovado" ? "active" : "inactive";

  // Preparar as parcelas para exibição
  const parcelas: Parcela[] = contrato.contratosParcelas?.map((parcela: ContratoParcela) => ({
    numero: parcela.parcela,
    data: formatParcelaDate(parcela.dataMesAnoReferencia),
    valor: parcela.valorParcela,
    valorPago: parcela.valorPagoParcela,
    status: parcela.contratoParcelaSituacaoDTO?.nome || "à vencer"
  })) || [];

  return (
    <div className="pc-container max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <button onClick={onBack}>
          <ArrowLeft className="text-foreground" size={24} />
        </button>
        <h1 className="pc-text-title">Detalhes do Contrato</h1>
      </div>

      <div className="space-y-4">
        {/* Informações Gerais */}
        <div className="pc-card">
          <div className="flex items-center gap-2 mb-4">
            <Building className="text-primary" size={20} />
            <h2 className="pc-text-body font-semibold">Informações Gerais</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="pc-text-caption block">Consignatária</span>
                <span className="pc-text-body font-medium text-xs">{consignatariaNome}</span>
              </div>
              <div className="space-y-1">
                <span className="pc-text-caption block">Nº Contrato</span>
                <span className="pc-text-body font-medium text-xs">{contrato.id}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="pc-text-caption block">Colaborador</span>
              <span className="pc-text-body font-medium">{nomeColaborador}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="pc-text-caption block">Convênio</span>
                <span className="pc-text-body font-medium text-xs">{nomeConvenio}</span>
              </div>
              <div className="space-y-1">
                <span className="pc-text-caption block">Data da Solicitação</span>
                <span className="pc-text-body font-medium text-xs">{dataCriacao}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes do Produto */}
        <div className="pc-card">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-primary" size={20} />
            <h2 className="pc-text-body font-semibold">Produto</h2>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="pc-text-body font-medium">{contract.rubricaNome}</span>
              <div className="pc-text-caption text-muted-foreground">{contract.nomeTipoRubrica}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="pc-text-caption block">Situação</span>
                <span className={`pc-text-body font-medium text-xs ${
                  status === "active" ? "text-green-600" : "text-red-600"
                }`}>
                  {situacao}
                </span>
              </div>
              <div className="space-y-1">
                <span className="pc-text-caption block">CET Mensal</span>
                <span className="pc-text-body font-medium text-xs">{cetMensal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Valores e Parcelas */}
        <div className="pc-card">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-primary" size={20} />
            <h2 className="pc-text-body font-semibold">Valores e Parcelas</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="pc-text-caption block">Valor Parcela</span>
                <span className="pc-text-body font-medium text-xs">R$ {valorParcelaAutorizado.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</span>
              </div>
              <div className="space-y-1">
                <span className="pc-text-caption block">Qtde Parcelas</span>
                <span className="pc-text-body font-medium text-xs">{qtdParcelasAutorizado}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="pc-text-caption block">Pagas</span>
                <span className="pc-text-body font-medium text-xs text-green-600">{qtdParcelasPagas}</span>
              </div>
              <div className="space-y-1">
                <span className="pc-text-caption block">Valor Presente</span>
                <span className="pc-text-body font-medium text-xs">R$ {valorPresente.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</span>
              </div>
            </div>

            {/* Valor Solicitado destacado */}
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <div className="text-center space-y-1">
                <span className="pc-text-caption block text-primary">Valor Solicitado</span>
                <span className="pc-text-value text-2xl text-primary">R$ {valorTotalAutorizado.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Parcelas */}
        {parcelas.length > 0 && (
          <div className="pc-card">
            <button
              onClick={() => setShowParcelas(!showParcelas)}
              className="flex items-center justify-between w-full mb-4"
            >
              <div className="flex items-center gap-2">
                <Calendar className="text-primary" size={20} />
                <h2 className="pc-text-body font-semibold">Parcelas ({parcelas.length})</h2>
              </div>
              <ChevronDown className={`text-muted-foreground transition-transform ${showParcelas ? 'rotate-180' : ''}`} size={20} />
            </button>

            {showParcelas && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {parcelas.map((parcela) => (
                  <div key={parcela.numero} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="pc-text-body font-medium text-xs w-8">{parcela.numero}ª</span>
                        <div>
                          <div className="pc-text-body font-medium text-xs">{parcela.data}</div>
                          <div className="pc-text-caption text-xs">R$ {parcela.valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}</div>
                        </div>
                      </div>
                      <span className={`pc-text-caption font-medium text-xs ${getStatusColor(parcela.status)}`}>
                        {parcela.status}
                      </span>
                    </div>
                    
                    {/* Mostrar valor pago se existir */}
                    {parcela.valorPago !== undefined && parcela.valorPago !== null && (
                      <div className="mt-2 pt-2 border-t border-muted">
                        <div className="flex items-center justify-between">
                          <span className="pc-text-caption text-xs text-muted-foreground">Valor Pago:</span>
                          <span className="pc-text-caption font-medium text-xs text-green-600">
                            R$ {parcela.valorPago.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};