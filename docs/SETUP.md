# Guia de Setup e Desenvolvimento

## Requisitos

- Node.js 18 ou superior
- npm ou yarn

## Instalação Inicial

```bash
# Clonar repositório (se aplicável)
git clone <repository-url>
cd khromaAcademy

# Instalar dependências
npm install
```

## Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev
```
Inicia o servidor de desenvolvimento Vite na porta 3000 (configurável).

### Build
```bash
npm run build
```
Cria uma build de produção otimizada na pasta `dist/`.

### Preview
```bash
npm run preview
```
Visualiza a build de produção localmente.

### Linting
```bash
npm run lint
```
Executa o ESLint para verificar problemas no código.

### Formatação
```bash
npm run format
```
Formata o código usando Prettier.

### Type Check
```bash
npm run type-check
```
Verifica tipos TypeScript sem gerar arquivos.

## Estrutura de Desenvolvimento

### Adicionar Novo Componente

1. Criar pasta em `src/components/NomeComponente/`
2. Criar `NomeComponente.ts` e `NomeComponente.css`
3. Exportar classe do componente
4. Importar em `app.ts` e inicializar

### Adicionar Novo Serviço

1. Criar arquivo em `src/services/NomeServico.ts`
2. Implementar classe com padrão singleton
3. Exportar instância: `export const nomeServico = new NomeServico()`

### Adicionar Novos Estilos

1. Criar arquivo em `src/styles/nome.css`
2. Importar em `src/styles/index.css`

## Configurações

### TypeScript (`tsconfig.json`)
- Modo strict habilitado
- Path aliases configurados (`@/*`)
- Target: ES2020

### Vite (`vite.config.ts`)
- Root: `./src`
- Public dir: `../public`
- Build output: `../dist`
- Aliases configurados

### ESLint (`.eslintrc.json`)
- Regras recomendadas do TypeScript
- Avisos para `any`
- Console warnings apenas

## Debugging

### Chrome DevTools
- Breakpoints em arquivos TypeScript
- Source maps habilitados automaticamente

### Logs
- Use `console.warn()` ou `console.error()` para logs importantes
- Evite `console.log()` em produção

## Troubleshooting

### Erro de módulos não encontrados
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problemas de tipos TypeScript
```bash
# Verificar tipos
npm run type-check
```

### Build falhando
```bash
# Limpar dist e rebuild
rm -rf dist
npm run build
```

## Workflow Recomendado

1. Criar branch para feature
2. Desenvolver com `npm run dev`
3. Verificar tipos: `npm run type-check`
4. Formatar código: `npm run format`
5. Testar build: `npm run build && npm run preview`
6. Commit e push

## Dados de Desenvolvimento

Os dados padrão estão em:
- `public/disciplinas.json` - Dados iniciais
- `localStorage` - Dados salvos pelo usuário (precedência)

