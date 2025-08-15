# Guia Rápido para Desenvolvimento Mobile

## Desenvolvimento Local

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Rodar em modo desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Build para produção**:
   ```bash
   npm run build
   ```

## Desenvolvimento Mobile

1. **Build mobile completo**:
   ```bash
   npm run build:mobile
   ```

2. **Abrir projeto Android**:
   ```bash
   npm run open:android
   ```

3. **Abrir projeto iOS** (apenas no Mac):
   ```bash
   npm run open:ios
   ```

4. **Build e abrir Android automaticamente**:
   ```bash
   npm run mobile
   ```

## Estrutura de Pastas

- `src/`: Código fonte da aplicação
- `public/`: Arquivos estáticos
- `dist/`: Build de produção
- `android/`: Projeto Android nativo
- `ios/`: Projeto iOS nativo

## Dicas Importantes

1. **Sempre execute `npm run build:mobile` após mudanças no código** para atualizar os apps nativos
2. **Use `npm run mobile` para desenvolvimento rápido no Android**
3. **Para iOS, é necessário um Mac com Xcode instalado**
4. **O PWA funciona em qualquer navegador moderno**