import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center pc-container max-w-sm mx-auto">
      <div className="mb-12 text-center">
        <div className="mb-6 flex justify-center">
          <img 
            src="/lovable-uploads/93766fc2-0b21-4c6e-a115-810c01c95df1.png" 
            alt="PromoConsig Logo" 
            className="h-16 w-auto"
          />
        </div>
        <h2 className="pc-text-title mb-8">Bem-vindo de volta</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block pc-text-body mb-2">Nome de usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pc-input w-full"
            placeholder="Digite seu usuário"
          />
        </div>

        <div>
          <label className="block pc-text-body mb-2">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pc-input w-full pr-12"
              placeholder="Digite sua senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button className="text-muted-foreground pc-text-caption underline">
            Esqueceu a senha?
          </button>
        </div>

        <button onClick={onLogin} className="pc-btn-primary w-full">
          Entrar
        </button>

        <div className="text-center pc-text-caption text-muted-foreground">
          Ou entrar com
        </div>

        <button className="pc-btn-secondary w-full flex items-center justify-center gap-2">
          <span>👆</span>
          Biometria
        </button>
      </div>
    </div>
  );
};