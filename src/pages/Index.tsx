
import { useState } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { ForgotPasswordScreen } from "@/components/ForgotPasswordScreen";
import { Dashboard } from "@/components/Dashboard";
import { ContractsScreen } from "@/components/ContractsScreen";
import { ContractDetail } from "@/components/ContractDetail";
import { MobileLayout } from "@/components/MobileLayout";

type Screen = "login" | "forgot-password" | "dashboard" | "contracts" | "contract-detail";

interface Contract {
  id: string;
  name: string;
  rubric: string;
  value: number;
  status: "active" | "inactive";
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [previousTab, setPreviousTab] = useState<string>("ativos");

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
        setPreviousTab("ativos"); // Reset to active contracts tab on logout
        setCurrentScreen("login");
        break;
    }
  };

  const handleContractClick = (contract: Contract, currentTab: string) => {
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
