import { ArrowLeft, FileText } from "lucide-react";
import { useState } from "react";

interface Contract {
  id: string;
  name: string;
  rubric: string;
  value: number;
  status: "active" | "inactive";
}

export const ContractsScreen = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<"ativos" | "inativos" | "todos">("ativos");

  const contracts: Contract[] = [
    { id: "1", name: "Contrato 1", rubric: "Rubrica 1: R$ 350,00", value: 350.00, status: "active" },
    { id: "2", name: "Contrato 2", rubric: "Rubrica 2: R$ 420,00", value: 420.00, status: "active" },
    { id: "3", name: "Contrato 3", rubric: "Rubrica 3: R$ 280,00", value: 280.00, status: "active" },
    { id: "4", name: "Contrato 4", rubric: "Rubrica 4: R$ 500,00", value: 500.00, status: "active" },
    { id: "5", name: "Contrato 5", rubric: "Rubrica 5: R$ 300,00", value: 300.00, status: "active" },
  ];

  const filteredContracts = contracts.filter(contract => {
    if (activeTab === "ativos") return contract.status === "active";
    if (activeTab === "inativos") return contract.status === "inactive";
    return true;
  });

  return (
    <div className="pc-container max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <button onClick={onBack}>
          <ArrowLeft className="text-foreground" size={24} />
        </button>
        <h1 className="pc-text-title">Extrato</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {[
          { key: "ativos", label: "Ativos" },
          { key: "inativos", label: "Inativos" },
          { key: "todos", label: "Todos" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="w-8 h-0.5 bg-accent rounded-full mx-auto mt-1" />
            )}
          </button>
        ))}
      </div>

      {/* Contracts Title */}
      <h2 className="pc-text-body font-semibold mb-4">Contratos Ativos</h2>

      {/* Contracts List */}
      <div className="space-y-3">
        {filteredContracts.map((contract) => (
          <div key={contract.id} className="pc-card">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="p-2 bg-secondary rounded-lg">
                <FileText className="text-muted-foreground" size={20} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="pc-text-body font-medium">
                  {contract.name}
                </div>
                <div className="pc-text-caption">
                  {contract.rubric}
                </div>
              </div>

              {/* Value */}
              <div className="pc-text-value">
                R$ {contract.value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};