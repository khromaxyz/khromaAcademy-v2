# System Instructions e Prompts

Esta pasta contém todos os arquivos de instruções do sistema e templates de prompts usados pelo assistente de IA para criação de disciplinas.

## Arquivos

### System Instructions e Templates

- **`gemini-system-instruction-discipline-creator.md`**: Arquivo completo que contém TUDO em um só lugar:
  - **System Instruction**: Instruções principais do sistema para o assistente de criação de disciplinas. Define o comportamento e as diretrizes gerais (antes do primeiro `---`).
  - **Template de Prompt para Geração**: Template usado para gerar a estrutura inicial de uma disciplina (entre o primeiro e segundo `---`).
  - **Template de Prompt para Modificação**: Template usado para modificar uma estrutura existente (entre o segundo e terceiro `---`).
  - **Template de Prompt para Contexto Completo**: Template usado para gerar um contexto completo e detalhado da disciplina (após o terceiro `---`).
  
  **Estrutura do arquivo:**
  ```
  [System Instruction]
  ---
  [Template de Prompt para Geração]
  ---
  [Template de Prompt para Modificação]
  ---
  [Template de Prompt para Contexto Completo]
  ```
  
  **Placeholders no template de geração:**
  - `{{NOME}}` - Nome da disciplina
  - `{{CURSO}}` - Curso
  - `{{PERIODO}}` - Período
  - `{{EMENTA}}` - Ementa/descrição
  - `{{CONTEXTO_ADICIONAL}}` - Contexto adicional fornecido pelo usuário
  - `{{DISCIPLINAS_EXISTENTES}}` - Lista de disciplinas existentes no sistema
  - `{{CORES_DISPONIVEIS}}` - Paleta de cores disponíveis
  
  **Placeholders no template de modificação:**
  - `{{ESTRUTURA_ATUAL}}` - Estrutura atual da disciplina em JSON
  - `{{INSTRUCAO_USUARIO}}` - Instrução do usuário para modificação
  
  **Placeholders no template de contexto completo:**
  - `{{NOME}}` - Nome da disciplina
  - `{{CURSO}}` - Curso
  - `{{PERIODO}}` - Período
  - `{{EMENTA}}` - Ementa/descrição
  - `{{CONTEXTO_ADICIONAL}}` - Contexto adicional fornecido pelo usuário
  - `{{DISCIPLINAS_EXISTENTES}}` - Lista de disciplinas existentes no sistema
  - `{{ESTRUTURA_SYLLABUS}}` - Estrutura do syllabus gerado (lista numerada de tópicos)

### Outros System Instructions

- **`gemini-system-instruction.md`**: System instruction padrão do chatbot
- **`gemini-system-instruction-tutor.md`**: System instruction para persona "Tutor"
- **`gemini-system-instruction-professor.md`**: System instruction para persona "Professor"
- **`gemini-system-instruction-amigo.md`**: System instruction para persona "Amigo"

## Como Editar

Todos os arquivos podem ser editados diretamente. As alterações serão aplicadas na próxima vez que o assistente for usado.

### Dicas para Edição

1. **System Instructions**: Definem o comportamento geral do assistente. Seja claro e específico sobre o que você espera.

2. **Templates de Prompts**: Use placeholders `{{NOME_DO_PLACEHOLDER}}` para valores que serão substituídos dinamicamente. Mantenha a estrutura clara e as instruções específicas.

3. **Formato JSON**: Se o prompt pede uma resposta em JSON, inclua exemplos claros do formato esperado.

4. **Teste após editar**: Sempre teste as alterações para garantir que funcionam como esperado.

## Fallback

Se algum arquivo não puder ser carregado, o sistema usará prompts padrão hardcoded no código como fallback. Isso garante que o sistema continue funcionando mesmo se houver problemas com os arquivos.

