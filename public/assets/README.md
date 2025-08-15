# Mobile Assets

Esta pasta contém os assets necessários para as versões mobile do aplicativo.

## Ícones Necessários

Para Android e iOS, são necessários os seguintes ícones:

### Android
- `android-chrome-192x192.png` (192x192)
- `android-chrome-512x512.png` (512x512)

### iOS
- `apple-touch-icon.png` (180x180)
- `apple-touch-startup-image.png` (varios tamanhos)

### PWA
- `favicon.ico`
- `manifest.json`

## Como Gerar os Ícones

1. Crie uma versão SVG do logo em alta resolução
2. Use uma ferramenta como o [Favicon.io](https://favicon.io/) ou [RealFaviconGenerator](https://realfavicongenerator.net/) para gerar todos os tamanhos necessários
3. Substitua os placeholders nesta pasta com os ícones reais
4. Execute `npx cap sync` para atualizar os apps mobile

## Estrutura de Pastas

```
public/
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── apple-touch-icon.png
├── favicon.ico
├── manifest.json
└── assets/
    └── icons/
        ├── icon-placeholder.html
        └── [outros ícones]
```

## Atualizando os Assets

Após substituir os ícones:

```bash
# Para web e PWA
npm run build

# Para mobile
npm run build:mobile
```