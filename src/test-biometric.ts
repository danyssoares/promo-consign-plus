import { BiometricService } from '@/services/biometricService';

async function testBiometricService() {
  try {
    console.log('Testando serviço de biometria...');
    
    // Testar disponibilidade
    const isAvailable = await BiometricService.isBiometricAvailable();
    console.log('Biometria disponível:', isAvailable);
    
    // Testar tipo de biometria
    const biometricType = await BiometricService.getBiometricType();
    console.log('Tipo de biometria:', biometricType);
    
    // Testar se está habilitada
    const isEnabled = await BiometricService.isBiometricEnabled();
    console.log('Biometria habilitada:', isEnabled);
    
    console.log('Teste concluído com sucesso!');
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testBiometricService();