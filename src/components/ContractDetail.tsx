import { ArrowLeft } from "lucide-react";

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

export const ContractDetail = ({ contract, onBack }: { 
  contract: ContractDisplay; 
  onBack: () => void;
}) => {
  return (
    <div className="pc-container max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <button onClick={onBack}>
          <ArrowLeft className="text-foreground" size={24} />
        </button>
        <h1 className="pc-text-title">Detalhes do Contrato</h1>
      </div>

      {/* Contract Details */}
      <div className="pc-card">
        <div className="space-y-6">
          {/* Contract ID */}
          <div className="space-y-1">
            <span className="pc-text-caption block">Número do Contrato</span>
            <span className="pc-text-body font-medium">{contract.id}</span>
          </div>
          
          {/* Modalidade and Produto */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <span className="pc-text-caption block">Modalidade</span>
              <span className="pc-text-body font-medium">{contract.nomeTipoRubrica}</span>
            </div>
            
            <div className="space-y-1">
              <span className="pc-text-caption block">Produto</span>
              <span className="pc-text-body font-medium">{contract.rubricaNome}</span>
            </div>
          </div>
          
          {/* Parcelas and Valor da Parcela */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="pc-text-caption block">Parcelas</span>
              <span className="pc-text-body font-medium">{contract.parcelas}</span>
            </div>
            
            <div className="space-y-1">
              <span className="pc-text-caption block">Valor Parcela</span>
              <span className="pc-text-body font-medium">{contract.valorParcelaFormatado}</span>
            </div>
          </div>
          
          {/* Valor Solicitado (Total) */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-center space-y-1">
              <span className="pc-text-caption block">Valor Solicitado</span>
              <span className="pc-text-value text-2xl">R$ {contract.total.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</span>
            </div>
          </div>
          
          {/* Status */}
          <div className="space-y-1">
            <span className="pc-text-caption block">Status</span>
            <span className={`pc-text-body font-medium ${
              contract.status === "active" ? "pc-text-highlight" : "text-muted-foreground"
            }`}>
              {contract.situacao}
            </span>
          </div>
          
          {/* Additional Info */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="pc-text-caption">Data de Início</span>
              <span className="pc-text-body font-medium">01 de janeiro</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="pc-text-caption">Vigência</span>
              <span className="pc-text-body font-medium">12 meses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};