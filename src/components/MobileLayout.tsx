import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
  showTabbar?: boolean;
  currentTab?: string;
}

export const MobileLayout = ({ children, showTabbar = false, currentTab }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background max-w-sm mx-auto relative">
      <div className={showTabbar ? "pb-20" : ""}>{children}</div>
      {showTabbar && <Tabbar currentTab={currentTab} />}
    </div>
  );
};

const Tabbar = ({ currentTab }: { currentTab?: string }) => {
  const tabs = [
    { id: "home", label: "Início", icon: "🏠" },
    { id: "extrato", label: "Extrato", icon: "📊" },
    { id: "cartoes", label: "Cartões", icon: "💳" },
    { id: "suporte", label: "Suporte", icon: "❓" },
  ];

  const handleTabClick = (tabId: string) => {
    // In a real app, this would use navigation
    console.log("Navigate to:", tabId);
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`pc-tabbar-item ${currentTab === tab.id ? "active" : ""}`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};