import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  date: string;
  time: string;
  amount: number;
}

export const ExtractScreen = ({ onBack, onTransactionClick }: { 
  onBack: () => void;
  onTransactionClick: (transaction: Transaction) => void;
}) => {
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "expense",
      description: "Pagamento de...",
      date: "20 de março",
      time: "10:30",
      amount: -1200.00
    },
    {
      id: "2",
      type: "income",
      description: "Transferência recebida",
      date: "15 de março",
      time: "14:45",
      amount: 2500.00
    },
    {
      id: "3",
      type: "expense",
      description: "Pagamento de...",
      date: "10 de março",
      time: "09:15",
      amount: -1200.00
    },
    {
      id: "4",
      type: "income",
      description: "Transferência recebida",
      date: "05 de março",
      time: "16:00",
      amount: 2500.00
    },
    {
      id: "5",
      type: "expense",
      description: "Pagamento de...",
      date: "01 de março",
      time: "11:20",
      amount: -1200.00
    }
  ];

  return (
    <div className="pc-container max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <button onClick={onBack}>
          <ArrowLeft className="text-foreground" size={24} />
        </button>
        <h1 className="pc-text-title">Extrato</h1>
      </div>

      {/* Transactions Title */}
      <h2 className="pc-text-body font-semibold mb-4">Transações</h2>

      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <button
            key={transaction.id}
            onClick={() => onTransactionClick(transaction)}
            className="pc-card w-full text-left hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className={`p-2 rounded-full ${
                transaction.type === "income" 
                  ? "bg-primary/10" 
                  : "bg-accent/20"
              }`}>
                {transaction.type === "income" ? (
                  <ArrowDownRight className="text-primary" size={16} />
                ) : (
                  <ArrowUpRight className="text-accent-foreground" size={16} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="pc-text-body font-medium">
                  {transaction.description}
                </div>
                <div className="pc-text-caption">
                  {transaction.date} • {transaction.time}
                </div>
              </div>

              {/* Amount */}
              <div className={`${
                transaction.amount > 0 
                  ? "pc-text-value-positive" 
                  : "pc-text-value-negative"
              }`}>
                {transaction.amount > 0 ? "+" : ""}R$ {Math.abs(transaction.amount).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};