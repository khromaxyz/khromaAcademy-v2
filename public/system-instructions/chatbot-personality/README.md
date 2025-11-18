# Chatbot Personality Agent

Este agente define diferentes personalidades para o chatbot, cada uma com seu próprio comportamento e estilo de comunicação.

## Fluxo do Agente

### Personalidades Disponíveis

#### 1. Personalidade Padrão
**Arquivo:** `gemini-system-instruction.md`

**Função:** Comportamento padrão do chatbot quando nenhuma personalidade específica é selecionada.

**Características:**
- Respostas equilibradas
- Tom profissional e educacional
- Foco em ajudar com o conteúdo

#### 2. Personalidade Tutor
**Arquivo:** `gemini-system-instruction-tutor.md`

**Função:** Comportamento de um tutor pessoal, mais próximo e didático.

**Características:**
- Tom mais amigável e encorajador
- Explicações passo-a-passo
- Foco em ajudar o aluno a aprender

#### 3. Personalidade Professor
**Arquivo:** `gemini-system-instruction-professor.md`

**Função:** Comportamento de um professor experiente, mais formal e acadêmico.

**Características:**
- Tom mais formal e acadêmico
- Explicações detalhadas e técnicas
- Foco em transmitir conhecimento completo

#### 4. Personalidade Amigo
**Arquivo:** `gemini-system-instruction-amigo.md`

**Função:** Comportamento de um amigo, mais casual e descontraído.

**Características:**
- Tom casual e descontraído
- Linguagem mais acessível
- Foco em tornar o aprendizado divertido

## Entrada

- Conteúdo da página atual (`{{CURRENT_PAGE_CONTENT}}`)
- Prompt do usuário (`{{USER_PROMPT}}`)
- Personalidade selecionada (determina qual arquivo carregar)

## Saída

- Resposta do chatbot adaptada à personalidade selecionada
- Contexto da página atual incluído automaticamente

## Parâmetros

- `currentPersona`: 'default' | 'tutor' | 'professor' | 'amigo'
- `userPrompt`: string - Pergunta ou comando do usuário
- `includeCurrentPage`: boolean - Se deve incluir conteúdo da página atual

## Placeholders no Template

- `{{CURRENT_PAGE_CONTENT}}` - Conteúdo da página atual (substituído automaticamente)
- `{{USER_PROMPT}}` - Prompt do usuário (substituído automaticamente)

## Características Importantes

- **Múltiplas Personalidades:** Cada personalidade tem seu próprio arquivo
- **Contexto Automático:** Inclui conteúdo da página atual automaticamente
- **Substituição de Placeholders:** Sistema substitui placeholders dinamicamente
- **Seleção Dinâmica:** Personalidade pode ser alterada em tempo real

## Uso no Código

**Componente:** `src/components/DisciplineContent/GeminiChatbot.ts`

- `loadSystemInstruction()` - Carrega o arquivo correto baseado em `currentPersona`
- Mapeamento:
  - `'tutor'` → `chatbot-personality/gemini-system-instruction-tutor.md`
  - `'professor'` → `chatbot-personality/gemini-system-instruction-professor.md`
  - `'amigo'` → `chatbot-personality/gemini-system-instruction-amigo.md`
  - Padrão → `chatbot-personality/gemini-system-instruction.md`

## Como Adicionar Nova Personalidade

1. Criar novo arquivo `gemini-system-instruction-[nome].md` nesta pasta
2. Adicionar lógica no componente para mapear a nova personalidade
3. Atualizar interface de seleção de personalidade

