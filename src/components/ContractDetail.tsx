import { ArrowLeft } from "lucide-react";

interface Contract {
  id: string;
  name: string;
  rubric: string;
  value: number;
  status: "active" | "inactive";
}

export const ContractDetail = ({ contract, onBack }: { 
  contract: Contract; 
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
        <div className="space-y-4">
          {/* Contract Name */}
          <div className="flex justify-between items-center">
            <span className="pc-text-caption">Nome do Contrato</span>
            <span className="pc-text-body font-medium">{contract.name}</span>
          </div>
          
          {/* Contract Value */}
          <div className="flex justify-between items-center">
            <span className="pc-text-caption">Valor do Contrato</span>
            <span className="pc-text-value">R$ {contract.value.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</span>
          </div>
          
          {/* Rubric */}
          <div className="flex justify-between items-center">
            <span className="pc-text-caption">Rubrica</span>
            <span className="pc-text-body font-medium">{contract.rubric}</span>
          </div>
          
          {/* Status */}
          <div className="flex justify-between items-center">
            <span className="pc-text-caption">Status</span>
            <span className={`pc-text-body font-medium ${
              contract.status === "active" ? "pc-text-highlight" : "text-muted-foreground"
            }`}>
              {contract.status === "active" ? "Ativo" : "Inativo"}
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