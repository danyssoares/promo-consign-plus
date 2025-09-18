
import { useState } from "react";
import logo from "@/assets/logo.png";

export const ForgotPasswordScreen = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center pc-container max-w-sm mx-auto">
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <img 
              src={logo} 
              alt="PromoConsig Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h2 className="pc-text-title mb-8">E-mail enviado!</h2>
        </div>

        <div className="text-center space-y-6">
          <p className="pc-text-body text-muted-foreground">
            Os dados para recuperar sua senha foram enviados por e-mail.
          </p>
          
          <button onClick={onBack} className="pc-btn-primary w-full">
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center pc-container max-w-sm mx-auto">
      <div className="mb-12 text-center">
        <div className="mb-6 flex justify-center">
          <img 
            src={logo} 
            alt="PromoConsig Logo" 
            className="h-16 w-auto"
          />
        </div>
        <h2 className="pc-text-title mb-8">Esqueceu a senha?</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block pc-text-body mb-2">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pc-input w-full"
            placeholder="Digite seu e-mail"
            required
          />
        </div>

        <button type="submit" className="pc-btn-primary w-full">
          Enviar
        </button>

        <div className="text-center">
          <button 
            type="button"
            onClick={onBack}
            className="text-muted-foreground pc-text-caption underline"
          >
            Voltar ao login
          </button>
        </div>
      </form>
    </div>
  );
};
