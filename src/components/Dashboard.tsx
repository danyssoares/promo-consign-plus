import { Settings } from "lucide-react";

export const Dashboard = () => {
  const months = ["Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const marginData = [40, 65, 30, 80, 45, 70];
  const creditData = [60, 45, 70, 55, 85, 40];
  
  return (
    <div className="pc-container space-y-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center pt-4">
        <h1 className="pc-text-title">PromoConsig</h1>
        <Settings className="text-muted-foreground" size={24} />
      </div>

      {/* Margem Consignável Card */}
      <div className="pc-card">
        <h3 className="pc-text-body text-muted-foreground mb-2">Margem Consignável</h3>
        <div className="mb-4">
          <span className="pc-text-caption text-muted-foreground">Margem Disponível</span>
          <div className="pc-text-value">R$ 1.234,56</div>
          <span className="pc-text-caption text-muted-foreground">Total</span>
        </div>
        
        {/* Chart */}
        <div className="h-24 flex items-end justify-between mb-2">
          {marginData.map((height, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className="bg-primary/20 w-6 rounded-t"
                style={{ height: `${height}%` }}
              />
              <span className="pc-text-caption text-muted-foreground text-xs">
                {months[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cartão de Crédito Card */}
      <div className="pc-card">
        <h3 className="pc-text-body text-muted-foreground mb-2">Cartão de Crédito</h3>
        <div className="mb-4">
          <span className="pc-text-caption text-muted-foreground">Limite Disponível</span>
          <div className="pc-text-value">R$ 5.678,90</div>
          <span className="pc-text-caption text-muted-foreground">Total</span>
        </div>
        
        {/* Chart */}
        <div className="h-24 flex items-end justify-between mb-2">
          {creditData.map((height, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className="bg-accent/80 w-6 rounded-t"
                style={{ height: `${height}%` }}
              />
              <span className="pc-text-caption text-muted-foreground text-xs">
                {months[index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};