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

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case "home":
        setCurrentScreen("dashboard");
        break;
      case "extrato":
        setCurrentScreen("extract");
        break;
      case "cartoes":
        setCurrentScreen("contracts");
        break;
      case "suporte":
        // Pode ser implementado futuramente
        console.log("Suporte clicado");
        break;
    }
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
          <MobileLayout showTabbar currentTab="home" onTabChange={handleTabChange}>
            <Dashboard />
          </MobileLayout>
        );
      
      case "extract":
        return (
          <MobileLayout showTabbar currentTab="extrato" onTabChange={handleTabChange}>
            <ExtractScreen 
              onBack={() => setCurrentScreen("dashboard")}
              onTransactionClick={handleTransactionClick}
            />
          </MobileLayout>
        );
      
      case "transaction-detail":
        return (
          <MobileLayout showTabbar currentTab="extrato" onTabChange={handleTabChange}>
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
          <MobileLayout showTabbar currentTab="cartoes" onTabChange={handleTabChange}>
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
    </div>
  );
};

export default Index;
