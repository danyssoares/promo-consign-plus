import { ReactNode } from "react";
import { Home, FileText, HelpCircle, LogOut } from "lucide-react";

interface MobileLayoutProps {
  children: ReactNode;
  showTabbar?: boolean;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const MobileLayout = ({ children, showTabbar = false, currentTab, onTabChange }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background max-w-sm mx-auto relative">
      <div className={showTabbar ? "pb-20" : ""}>{children}</div>
      {showTabbar && <Tabbar currentTab={currentTab} onTabChange={onTabChange} />}
    </div>
  );
};

const Tabbar = ({ currentTab, onTabChange }: { currentTab?: string; onTabChange?: (tab: string) => void }) => {
  const tabs = [
    { id: "home", label: "Início", icon: Home },
    { id: "contratos", label: "Contratos", icon: FileText },
    { id: "suporte", label: "Suporte", icon: HelpCircle },
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