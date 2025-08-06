import { ArrowLeft } from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  date: string;
  time: string;
  amount: number;
}

export const TransactionDetail = ({ 
  transaction, 
  onBack 
}: { 
  transaction: Transaction;
  onBack: () => void;
}) => {
  return (
    <div className="pc-container max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <button onClick={onBack}>
          <ArrowLeft className="text-foreground" size={24} />
        </button>
        <h1 className="pc-text-title">Detalhes da Operação</h1>
      </div>

      {/* Transaction Details Card */}
      <div className="pc-card space-y-6">
        <h2 className="pc-text-title">Dados da Operação</h2>

        <div className="space-y-4">
          {/* Data de Aquisição */}
          <div className="flex justify-between items-center">
            <span className="pc-text-body text-muted-foreground">Data de Aquisição</span>
            <span className="pc-text-body font-medium">15 de Março de 2023</span>
          </div>

          {/* Valor da Parcela */}
          <div className="flex justify-between items-center">
            <span className="pc-text-body text-muted-foreground">Valor da Parcela</span>
            <span className="pc-text-value">R$ 350,00</span>
          </div>

          {/* Total de Parcelas */}
          <div className="flex justify-between items-center">
            <span className="pc-text-body text-muted-foreground">Total de Parcelas</span>
            <span className="text-accent font-semibold text-lg">60</span>
          </div>

          {/* Parcelas Pagas */}
          <div className="flex justify-between items-center">
            <span className="pc-text-body text-muted-foreground">Parcelas Pagas</span>
            <span className="text-accent font-semibold text-lg">12</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between pc-text-caption text-muted-foreground">
            <span>Progresso</span>
            <span>20%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300" 
              style={{ width: "20%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};