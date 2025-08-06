import { useState } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { ExtractScreen } from "@/components/ExtractScreen";
import { TransactionDetail } from "@/components/TransactionDetail";
import { ContractsScreen } from "@/components/ContractsScreen";
import { MobileLayout } from "@/components/MobileLayout";

type Screen = "login" | "dashboard" | "extract" | "transaction-detail" | "contracts";

interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  date: string;
  time: string;
  amount: number;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleLogin = () => {
    setCurrentScreen("dashboard");
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setCurrentScreen("transaction-detail");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return <LoginScreen onLogin={handleLogin} />;
      
      case "dashboard":
        return (
          <MobileLayout showTabbar currentTab="home">
            <Dashboard />
          </MobileLayout>
        );
      
      case "extract":
        return (
          <MobileLayout showTabbar currentTab="extrato">
            <ExtractScreen 
              onBack={() => setCurrentScreen("dashboard")}
              onTransactionClick={handleTransactionClick}
            />
          </MobileLayout>
        );
      
      case "transaction-detail":
        return (
          <MobileLayout showTabbar currentTab="extrato">
            {selectedTransaction && (
              <TransactionDetail 
                transaction={selectedTransaction}
                onBack={() => setCurrentScreen("extract")}
              />
            )}
          </MobileLayout>
        );
      
      case "contracts":
        return (
          <MobileLayout showTabbar currentTab="cartoes">
            <ContractsScreen onBack={() => setCurrentScreen("dashboard")} />
          </MobileLayout>
        );
      
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      
      {/* Demo Navigation Buttons (for testing) */}
      {currentScreen !== "login" && (
        <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
          <button 
            onClick={() => setCurrentScreen("dashboard")}
            className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs"
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentScreen("extract")}
            className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs"
          >
            Extrato
          </button>
          <button 
            onClick={() => setCurrentScreen("contracts")}
            className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs"
          >
            Contratos
          </button>
          <button 
            onClick={() => setCurrentScreen("login")}
            className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-xs"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
