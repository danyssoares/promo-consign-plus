import { useState, useEffect } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenScreenProps {
  onBack: () => void;
}

export const TokenScreen = ({ onBack }: TokenScreenProps) => {
  const [token, setToken] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(60);

  const generateToken = () => {
    const newToken = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setToken(newToken);
    setTimeRemaining(60);
  };

  useEffect(() => {
    // Gerar token inicial
    generateToken();
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          generateToken();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Token de Acesso</h1>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-lg">Token Temporário</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-mono font-bold text-primary mb-4 tracking-wider">
              {token}
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Válido por:
            </div>
            <div className="text-lg font-semibold text-destructive">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              Um novo token será gerado automaticamente quando este expirar.
            </div>
          </CardContent>
        </Card>

        <div className="w-full max-w-sm">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground text-center">
            <p className="mb-2">ℹ️ <strong>Como usar:</strong></p>
            <p>Este token temporário pode ser usado para autenticação em sistemas externos ou validação de identidade.</p>
          </div>
        </div>
      </div>
    </div>
  );
};