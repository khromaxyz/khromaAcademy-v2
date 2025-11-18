# Content Generation Agent

Este agente gera conteúdo educacional do zero para submódulos.

## Fluxo do Agente

### Agente de Geração de Conteúdo
**Arquivo:** `gemini-prompt-content-generation.md`

**Função:** Gera conteúdo educacional completo em Markdown para um submódulo específico.

**Entrada:**
- Informações da disciplina (título, tipo, descrição)
- Informações do módulo e submódulo
- Contexto opcional
- Lista de disciplinas existentes (para evitar duplicação)
- Prompt opcional do usuário

**Saída:**
- Conteúdo educacional completo em Markdown

**Parâmetros:**
- `disciplineId`: string
- `disciplineTitle`: string
- `disciplineType`: string
- `disciplineDescription`: string
- `moduleTitle`: string
- `subModuleTitle`: string
- `subModuleDescription`: string | undefined
- `context`: string | undefined
- `existingDisciplines`: Array<{ id: string; title: string; code: string; syllabus: string[] }>
- `userPrompt`: string | undefined

**Exemplo de Saída:**
```markdown
## Busca Sequencial

A busca sequencial é um algoritmo simples que percorre um array elemento por elemento até encontrar o valor desejado.

### Conceitos Principais

O algoritmo começa no primeiro elemento e compara cada elemento com o valor buscado...

### Exemplo Prático

Considere o array [5, 2, 8, 1, 9, 3] e o valor buscado 8...
```

## Características Importantes

- **Geração do Zero:** Cria conteúdo educacional completo sem base em PDF
- **Contexto de Disciplinas:** Considera disciplinas existentes para evitar duplicação
- **Tipo de Disciplina:** Adapta conteúdo baseado no tipo (algoritmos, matemática, etc.)
- **Markdown Rico:** Gera conteúdo formatado com títulos, listas, código, tabelas

## Uso no Código

**Serviço:** `src/services/geminiService.ts`

- `generateSubModuleContent()` - Usa `content-generation-agent/gemini-prompt-content-generation.md`

**Componente:** Usado em vários lugares do sistema para gerar conteúdo quando não há PDF disponível.

