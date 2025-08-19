
import { useState } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { ForgotPasswordScreen } from "@/components/ForgotPasswordScreen";
import { Dashboard } from "@/components/Dashboard";
import { ContractsScreen } from "@/components/ContractsScreen";
import { ContractDetail } from "@/components/ContractDetail";
import { MobileLayout } from "@/components/MobileLayout";

type Screen = "login" | "forgot-password" | "dashboard" | "contracts" | "contract-detail";

// Definindo a interface do contrato com os campos corretos
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

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [selectedContract, setSelectedContract] = useState<ContractDisplay | null>(null);
  const [previousTab, setPreviousTab] = useState<string>("aprovados");

  const handleLogin = () => {
    setCurrentScreen("dashboard");
  };

  const handleForgotPassword = () => {
    setCurrentScreen("forgot-password");
  };

  const handleBackToLogin = () => {
    setCurrentScreen("login");
  };

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case "home":
        setCurrentScreen("dashboard");
        break;
      case "contratos":
        setCurrentScreen("contracts");
        break;
      case "suporte":
        // Pode ser implementado futuramente
        console.log("Suporte clicado");
        break;
      case "sair":
        setPreviousTab("aprovados"); // Reset to approved contracts tab on logout
        setCurrentScreen("login");
        break;
    }
  };

  const handleContractClick = (contract: ContractDisplay, currentTab: string) => {
    setSelectedContract(contract);
    setPreviousTab(currentTab);
    setCurrentScreen("contract-detail");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return (
          <LoginScreen 
            onLogin={handleLogin} 
            onForgotPassword={handleForgotPassword}
          />
        );
      
      case "forgot-password":
        return (
          <ForgotPasswordScreen 
            onBack={handleBackToLogin}
          />
        );
      
      case "dashboard":
        return (
          <MobileLayout showTabbar currentTab="home" onTabChange={handleTabChange}>
            <Dashboard />
          </MobileLayout>
        );
      
      case "contracts":
        return (
          <MobileLayout showTabbar currentTab="contratos" onTabChange={handleTabChange}>
            <ContractsScreen 
              onBack={() => setCurrentScreen("dashboard")}
              onContractClick={handleContractClick}
              initialTab={previousTab}
            />
          </MobileLayout>
        );
      
      case "contract-detail":
        return (
          <MobileLayout showTabbar currentTab="contratos" onTabChange={handleTabChange}>
            {selectedContract && (
              <ContractDetail 
                contract={selectedContract}
                onBack={() => setCurrentScreen("contracts")}
              />
            )}
          </MobileLayout>
        );
      
      default:
        return (
          <LoginScreen 
            onLogin={handleLogin} 
            onForgotPassword={handleForgotPassword}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
    </div>
  );
};

export default Index;
