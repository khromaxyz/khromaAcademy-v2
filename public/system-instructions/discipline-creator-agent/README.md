# Discipline Creator Agent

Este agente cria e modifica estruturas completas de disciplinas educacionais.

## Fluxo do Agente

### 1. System Instruction Principal
**Arquivo:** `gemini-system-instruction-discipline-creator.md`

**Função:** Define o comportamento e diretrizes gerais do assistente de criação de disciplinas.

**Conteúdo:**
- Instruções sobre como criar disciplinas
- Diretrizes de estrutura
- Regras de formatação
- Templates de prompts (separados por `---`)

### 2. Agente de Geração de Disciplina
**Arquivo:** `gemini-prompt-discipline-generation.md` (ou parte do arquivo principal)

**Função:** Gera estrutura completa de uma disciplina nova.

**Entrada:**
- Nome da disciplina
- Curso
- Período
- Ementa/descrição
- Contexto adicional do usuário
- Lista de disciplinas existentes
- Paleta de cores disponíveis

**Saída:**
- JSON com estrutura completa da disciplina:
  - Título, código, descrição
  - Lista de módulos (cada um com lista de submódulos)
  - Cor sugerida
  - Posição sugerida
  - Pré-requisitos (se houver)

**Parâmetros:**
- `nome`: string
- `curso`: string
- `periodo`: string
- `ementa`: string
- `contextoAdicional`: string | undefined
- `disciplinasExistentes`: Array<{ id: string; title: string; code: string }>
- `coresDisponiveis`: string[]

**Exemplo de Saída:**
```json
{
  "title": "Algoritmos e Estruturas de Dados",
  "code": "AED-001",
  "description": "Disciplina sobre algoritmos fundamentais...",
  "modules": [
    {
      "id": "mod-1",
      "title": "Busca e Ordenação",
      "order": 1,
      "subModules": [
        {
          "id": "submod-1",
          "title": "Busca Sequencial",
          "order": 1
        }
      ]
    }
  ],
  "color": "#41FF41",
  "position": { "x": 100, "y": 100 },
  "prerequisites": []
}
```

### 3. Agente de Modificação de Disciplina
**Arquivo:** `gemini-prompt-discipline-modification.md` (ou parte do arquivo principal)

**Função:** Modifica uma estrutura existente de disciplina.

**Entrada:**
- Estrutura atual da disciplina (JSON)
- Instrução do usuário para modificação

**Saída:**
- JSON com estrutura modificada

**Parâmetros:**
- `estruturaAtual`: object - Estrutura JSON atual
- `instrucaoUsuario`: string - O que o usuário quer modificar

**Exemplo de Entrada:**
```json
{
  "estruturaAtual": { ... },
  "instrucaoUsuario": "Adicione um módulo sobre 'Grafos' após o módulo de 'Árvores'"
}
```

## Ordem de Execução

1. **Geração** → Cria nova disciplina do zero
2. **Modificação** → Ajusta disciplina existente conforme solicitação

## Características Importantes

- **Estrutura Completa:** Gera/modifica toda a estrutura de módulos e submódulos
- **JSON Estruturado:** Respostas sempre em JSON válido
- **Pré-requisitos Inteligentes:** Sugere pré-requisitos apenas quando há conexão lógica
- **Cores e Posicionamento:** Sugere cores e posições para visualização

## Uso no Código

**Serviço:** `src/services/geminiService.ts`

- `loadSystemInstruction()` - Carrega `discipline-creator-agent/gemini-system-instruction-discipline-creator.md`
- Usa templates internos para geração e modificação

**Componente:** `src/components/AdminPanel/AIAssistant.ts`

## Estrutura do Arquivo Principal

O arquivo `gemini-system-instruction-discipline-creator.md` contém múltiplas seções separadas por `---`:

1. **System Instruction** (antes do primeiro `---`)
2. **Template de Geração** (entre primeiro e segundo `---`)
3. **Template de Modificação** (entre segundo e terceiro `---`)
4. **Template de Contexto Completo** (após terceiro `---`)

