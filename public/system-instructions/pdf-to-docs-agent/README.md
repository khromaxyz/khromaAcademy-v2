# PDF to Docs Agent

Este agente transforma documentos PDF em conteúdo educacional estruturado.

## Fluxo do Agente

### 1. Agente de Estrutura (Primeiro)
**Arquivo:** `gemini-prompt-pdf-to-docs-structure.md`

**Função:** Analisa o PDF e gera a estrutura de módulos e submódulos.

**Entrada:**
- Nome do arquivo PDF
- Arquivo PDF em base64
- Prompt opcional do usuário

**Saída:**
- JSON com estrutura completa:
  - Título da disciplina
  - Código da disciplina
  - Descrição
  - Lista de módulos (cada um com lista de submódulos)
  - Cor sugerida
  - Posição sugerida

**Parâmetros:**
- `pdfName`: string - Nome do arquivo PDF
- `userPrompt`: string | undefined - Prompt opcional do usuário
- `pdfFiles`: Array<{ mimeType: string; data: string }> - PDFs em base64

**Exemplo de Saída:**
```json
{
  "title": "Algoritmos e Estruturas de Dados",
  "code": "AED-001",
  "description": "Disciplina sobre algoritmos...",
  "modules": [
    {
      "id": "mod-1",
      "title": "Busca e Ordenação",
      "description": "Módulo sobre algoritmos de busca...",
      "order": 1,
      "subModules": [
        {
          "id": "submod-1",
          "title": "Busca Sequencial",
          "description": "Algoritmo de busca sequencial...",
          "order": 1
        }
      ]
    }
  ],
  "color": "#41FF41",
  "position": { "x": 100, "y": 100 }
}
```

### 2. Agente de Conteúdo (Segundo)
**Arquivo:** `gemini-prompt-pdf-to-docs-content.md`

**Função:** Gera conteúdo educacional em Markdown para cada submódulo baseado no PDF.

**Entrada:**
- Estrutura gerada pelo primeiro agente
- Conteúdo do PDF
- Contexto dos submódulos anteriores (para manter consistência)
- Informações do módulo e submódulo

**Saída:**
- Conteúdo em Markdown puro (sem JSON, sem metadados)

**Parâmetros:**
- `disciplineId`: string
- `disciplineTitle`: string
- `moduleTitle`: string
- `subModuleTitle`: string
- `subModuleDescription`: string | undefined
- `context`: string | undefined - Contexto dos submódulos anteriores
- `pdfFiles`: Array<{ mimeType: string; data: string }> - PDFs em base64

**Exemplo de Saída:**
```markdown
## Busca Sequencial

A busca sequencial é um algoritmo simples...

### Conceitos Principais

O algoritmo percorre o array elemento por elemento...
```

## Ordem de Execução

1. **Estrutura** → Gera estrutura completa da disciplina
2. **Conteúdo** → Para cada submódulo, gera conteúdo baseado no PDF

## Características Importantes

- **Contexto Progressivo:** O agente de conteúdo recebe contexto dos submódulos anteriores para manter consistência
- **Fidelidade ao PDF:** Todo conteúdo é baseado diretamente no PDF fornecido
- **Modularidade Proporcional:** A estrutura é proporcional ao conteúdo do PDF, não apenas ao número de páginas

## Uso no Código

**Serviço:** `src/services/geminiService.ts`

- `generatePDFStructure()` - Usa `pdf-to-docs-agent/gemini-prompt-pdf-to-docs-structure.md`
- `generatePDFSubModuleContent()` - Usa `pdf-to-docs-agent/gemini-prompt-pdf-to-docs-content.md`

**Componente:** `src/components/AgentsPanel/PDFToDocsAgent/PDFToDocsAgent.ts`

