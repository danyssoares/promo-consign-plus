import { ReactNode } from "react";
import { Home, FileText, Package, LogOut } from "lucide-react";
import { useMobileDetection } from "@/hooks/useMobileDetection";

interface MobileLayoutProps {
  children: ReactNode;
  showTabbar?: boolean;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const MobileLayout = ({ children, showTabbar = false, currentTab, onTabChange }: MobileLayoutProps) => {
  const { isMobile, isPWA } = useMobileDetection();
  
  // Sempre mostra a tabbar em dispositivos móveis ou quando explicitamente solicitado
  const shouldShowTabbar = showTabbar || isMobile || isPWA;

  return (
    <div className="min-h-screen bg-background max-w-sm mx-auto relative">
      <div className={shouldShowTabbar ? "pb-20" : ""}>{children}</div>
      {shouldShowTabbar && <Tabbar currentTab={currentTab} onTabChange={onTabChange} />}
    </div>
  );
};

const Tabbar = ({ currentTab, onTabChange }: { currentTab?: string; onTabChange?: (tab: string) => void }) => {
  const tabs = [
    { id: "home", label: "Início", icon: Home },
    { id: "contratos", label: "Contratos", icon: FileText },
    { id: "produtos", label: "Produtos", icon: Package },
    { id: "sair", label: "Sair", icon: LogOut },
  ];

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-card border-t border-border">
      <div className="flex items-center justify-around py-3">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`pc-tabbar-item ${currentTab === tab.id ? "active" : ""}`}
            >
              <IconComponent size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};