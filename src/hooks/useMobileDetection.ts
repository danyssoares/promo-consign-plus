import { useEffect, useState } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Verifica se está rodando em um dispositivo móvel
    const mobileCheck = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      // Verifica dispositivos Android
      if (/android/i.test(userAgent)) {
        return true;
      }
      
      // Verifica dispositivos iOS
      if (/iPad|iPhone|iPod/.test(userAgent) || 
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return true;
      }
      
      // Verifica outros dispositivos móveis
      return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    };

    // Verifica se está rodando como PWA
    const pwaCheck = () => {
      return window.matchMedia('(display-mode: standalone)').matches || 
             (window.navigator as any).standalone === true ||
             document.referrer.includes('android-app://');
    };

    setIsMobile(mobileCheck());
    setIsPWA(pwaCheck());
  }, []);

  return { isMobile, isPWA };
};