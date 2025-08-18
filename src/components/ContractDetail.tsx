import { ArrowLeft, Calendar, CreditCard, User, Building, FileText, ChevronDown } from "lucide-react";
import { useState } from "react";

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
  status: "Pago" | "Pendente" | "Vencido";
}

export const ContractDetail = ({ contract, onBack }: { 
  contract: ContractDisplay; 
  onBack: () => void;
}) => {
  const [showParcelas, setShowParcelas] = useState(false);

  // Mock data - em produção estes dados viriam da API
  const mockData = {
    consignataria: "Banco PromoConsig",
    nome: "João da Silva Santos",
    convenio: "Prefeitura Municipal",
    colaborador: "João da Silva Santos",
    data: "15/03/2024",
    parcelasPagas: 8,
    cetMensal: "2,15%",
    valorPresente: 7200.50
  };

  // Mock parcelas data
  const parcelas: Parcela[] = Array.from({ length: contract.parcelas }, (_, i) => ({
    numero: i + 1,
    data: new Date(2024, 2 + i, 15).toLocaleDateString('pt-BR'),
    valor: parseFloat(contract.valorParcelaFormatado.replace('R$ ', '').replace(',', '.')),
    status: i < 8 ? "Pago" : "Pendente"
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago": return "text-green-600";
      case "Pendente": return "text-yellow-600";
      case "Vencido": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

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
                <span className="pc-text-body font-medium text-xs">{mockData.consignataria}</span>
              </div>
              <div className="space-y-1">
                <span className="pc-text-caption block">Nº Contrato</span>
                <span className="pc-text-body font-medium text-xs">{contract.id}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="pc-text-caption block">Nome</span>
              <span className="pc-text-body font-medium">{mockData.nome}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="pc-text-caption block">Convênio</span>
                <span className="pc-text-body font-medium text-xs">{mockData.convenio}</span>
              </div>
              <div className="space-y-1">
                <span className="pc-text-caption block">Data</span>
                <span className="pc-text-body font-medium text-xs">{mockData.data}</span>
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
                  contract.status === "active" ? "text-green-600" : "text-red-600"
                }`}>
                  {contract.situacao}
                </span>
              </div>
              <div className="space-y-1">
                <span className="pc-text-caption block">CET Mensal</span>
                <span className="pc-text-body font-medium text-xs">{mockData.cetMensal}</span>
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
                <span className="pc-text-body font-medium text-xs">{contract.valorParcelaFormatado}</span>
              </div>
              <div className="space-y-1">
                <span className="pc-text-caption block">Qtde Parcelas</span>
                <span className="pc-text-body font-medium text-xs">{contract.parcelas}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="pc-text-caption block">Pagas</span>
                <span className="pc-text-body font-medium text-xs text-green-600">{mockData.parcelasPagas}</span>
              </div>
              <div className="space-y-1">
                <span className="pc-text-caption block">Valor Presente</span>
                <span className="pc-text-body font-medium text-xs">R$ {mockData.valorPresente.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</span>
              </div>
            </div>

            {/* Valor Solicitado destacado */}
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <div className="text-center space-y-1">
                <span className="pc-text-caption block text-primary">Valor Solicitado</span>
                <span className="pc-text-value text-2xl text-primary">R$ {contract.total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Parcelas */}
        <div className="pc-card">
          <button
            onClick={() => setShowParcelas(!showParcelas)}
            className="flex items-center justify-between w-full mb-4"
          >
            <div className="flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              <h2 className="pc-text-body font-semibold">Parcelas ({contract.parcelas})</h2>
            </div>
            <ChevronDown className={`text-muted-foreground transition-transform ${showParcelas ? 'rotate-180' : ''}`} size={20} />
          </button>

          {showParcelas && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {parcelas.map((parcela) => (
                <div key={parcela.numero} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};