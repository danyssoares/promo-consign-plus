import { useAuth } from "@/contexts/AuthContext";
export const Dashboard = () => {
  const {
    getUsuarioLogado
  } = useAuth();
  const userData = getUsuarioLogado();

  // Extrair login do objeto Global se existir
  const userLogin = (userData as any)?.Global?.login || userData?.login || userData?.nome || "Usuário";
  const months = ["Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const marginData = [40, 65, 30, 80, 45, 70];
  const creditData = [60, 45, 70, 55, 85, 40];
  return <div className="pc-container space-y-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center pt-4 mb-6">
        <img src="/lovable-uploads/93766fc2-0b21-4c6e-a115-810c01c95df1.png" alt="PromoConsig Logo" className="h-12 w-auto" />
        
        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="pc-text-caption font-medium text-muted-foreground text-xs">
              {userLogin.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="pc-text-body text-foreground text-xs font-medium">{userLogin}</span>
        </div>
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
        <div className="h-32 flex items-end justify-between gap-2 p-3 bg-muted/10 rounded-lg">
          {marginData.map((height, index) => <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col items-center justify-end h-20">
                <span className="pc-text-caption text-primary font-medium mb-1">
                  {height}%
                </span>
                <div className="bg-gradient-to-t from-primary to-primary/60 w-full rounded-t-sm transition-all duration-300 hover:from-primary/80 hover:to-primary/40" style={{
              height: `${height}%`,
              minWidth: '20px'
            }} />
              </div>
              <span className="pc-text-caption text-muted-foreground text-xs font-medium">
                {months[index]}
              </span>
            </div>)}
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
        <div className="h-32 flex items-end justify-between gap-2 p-3 bg-muted/10 rounded-lg">
          {creditData.map((height, index) => <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col items-center justify-end h-20">
                <span className="pc-text-caption text-accent-foreground font-medium mb-1">
                  {height}%
                </span>
                <div className="bg-gradient-to-t from-accent to-accent/60 w-full rounded-t-sm transition-all duration-300 hover:from-accent/80 hover:to-accent/40" style={{
              height: `${height}%`,
              minWidth: '20px'
            }} />
              </div>
              <span className="pc-text-caption text-muted-foreground text-xs font-medium">
                {months[index]}
              </span>
            </div>)}
        </div>
      </div>
    </div>;
};