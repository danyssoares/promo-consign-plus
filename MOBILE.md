# PromoConsign Plus - Mobile

Este documento fornece instruções para construir e executar o aplicativo PromoConsign Plus em dispositivos móveis Android e iOS.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js e npm
- Android Studio (para Android)
- Xcode (para iOS, apenas Mac)
- Capacitor CLI

## Estrutura do Projeto

O projeto já está configurado com Capacitor para suportar builds mobile. As principais pastas são:

- `src/`: Código fonte React/TypeScript
- `android/`: Projeto Android nativo
- `ios/`: Projeto iOS nativo
- `public/`: Arquivos estáticos, incluindo ícones e manifest PWA

## Desenvolvimento

### Executando em ambiente de desenvolvimento

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev
```

### Build para mobile

```bash
# Build do projeto web
npm run build

# Sincronizar com plataformas mobile
npm run build:mobile
```

### Executando no Android

```bash
# Abrir projeto Android no Android Studio
npm run open:android
```

### Executando no iOS

```bash
# Abrir projeto iOS no Xcode (apenas Mac)
npm run open:ios
```

## PWA (Progressive Web App)

O aplicativo também pode ser instalado como PWA em navegadores modernos:

1. Acesse o aplicativo em um navegador mobile
2. Procure a opção "Adicionar à tela inicial" no menu do navegador
3. O app será instalado com ícone na tela inicial

## Configuração

### Configuração do Capacitor

O arquivo `capacitor.config.ts` contém as configurações do Capacitor:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.azfinis.promoconsignplus',
  appName: 'PromoConsignPlus',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

### Ícones e Splash Screens

Para atualizar os ícones e splash screens:

1. Substitua os arquivos em `public/` com seus novos assets
2. Execute `npx cap sync` para atualizar as plataformas

## Plugins Capacitor

O projeto já inclui os plugins base do Capacitor:

- `@capacitor/core`
- `@capacitor/android`
- `@capacitor/ios`

Para adicionar novos plugins, instale-os via npm e execute `npx cap sync`.

## Troubleshooting

### Problemas com Android

1. Certifique-se de que o Android Studio está atualizado
2. Verifique se as variáveis de ambiente estão configuradas corretamente
3. Execute `npx cap update android` para atualizar as dependências

### Problemas com iOS

1. Apenas disponível em sistemas Mac
2. Certifique-se de que o Xcode está instalado
3. Execute `npx cap update ios` para atualizar as dependências

### Problemas com PWA

1. Verifique se o service worker está registrado corretamente
2. Confirme que o manifest.json está configurado corretamente
3. Teste em navegadores modernos (Chrome, Firefox, Safari)