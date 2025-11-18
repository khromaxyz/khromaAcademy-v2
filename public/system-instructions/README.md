# System Instructions e Prompts

Esta pasta contém todos os arquivos de instruções do sistema e templates de prompts organizados por agente.

## Estrutura de Pastas

Cada agente possui sua própria pasta com seus prompts e um README explicativo:

### 📁 `pdf-to-docs-agent/`
Agente que transforma documentos PDF em conteúdo educacional estruturado.
- **Fluxo:** Estrutura → Conteúdo
- **Ver README:** `pdf-to-docs-agent/README.md`

### 📁 `content-review-agent/`
Agente que revisa conteúdo existente adicionando elementos interativos.
- **Fluxo:** Análise → Implementação
- **Ver README:** `content-review-agent/README.md`

### 📁 `content-generation-agent/`
Agente que gera conteúdo educacional do zero.
- **Fluxo:** Geração direta
- **Ver README:** `content-generation-agent/README.md`

### 📁 `discipline-creator-agent/`
Agente que cria e modifica estruturas completas de disciplinas.
- **Fluxo:** Geração → Modificação
- **Ver README:** `discipline-creator-agent/README.md`

### 📁 `chatbot-personality/`
Agente que define diferentes personalidades para o chatbot.
- **Fluxo:** Seleção de personalidade → Resposta adaptada
- **Ver README:** `chatbot-personality/README.md`

## Como Editar Prompts

Todos os prompts são arquivos Markdown que podem ser editados diretamente. As alterações são aplicadas automaticamente sem necessidade de recompilação ou reinicialização do sistema.

### Características do Sistema

- ✅ **Edição em Markdown:** Edite diretamente os arquivos `.md`
- ✅ **Aplicação Automática:** Alterações são carregadas automaticamente
- ✅ **Sem Recompilação:** Não é necessário rebuild do projeto
- ✅ **Organização por Agente:** Cada agente tem sua própria pasta
- ✅ **Documentação Completa:** Cada pasta tem README explicando o fluxo

### Estrutura de um README de Agente

Cada README contém:
- Descrição do agente
- Fluxo de execução (ordem dos agentes)
- Entrada e saída de cada etapa
- Parâmetros aceitos
- Exemplos de uso
- Referências no código

## Fallback

Se algum arquivo não puder ser carregado, o sistema usará prompts padrão hardcoded no código como fallback. Isso garante que o sistema continue funcionando mesmo se houver problemas com os arquivos.

## Convenções de Nomenclatura

- Arquivos de prompts: `gemini-prompt-[nome].md`
- Arquivos de system instructions: `gemini-system-instruction-[nome].md`
- Pastas: `[nome-do-agente]-agent/` ou `[nome-do-agente]/`
