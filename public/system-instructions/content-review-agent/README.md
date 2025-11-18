# Content Review Agent

Este agente revisa conteúdo existente de disciplinas, adicionando elementos interativos, visuais e didáticos.

## Fluxo do Agente (Multi-Etapas)

### 1. Agente de Análise (Primeiro)
**Arquivo:** `gemini-prompt-content-analysis.md`

**Função:** Analisa o conteúdo e identifica oportunidades para elementos interativos, inserindo placeholders descritivos.

**Entrada:**
- Conteúdo original do submódulo
- Informações da disciplina (título, tipo)
- Informações do módulo e submódulo
- Bibliotecas recomendadas disponíveis
- Prompt opcional do usuário
- Contexto dos submódulos anteriores

**Saída:**
- Conteúdo em Markdown com placeholders inseridos no formato:
  ```
  <!-- PLACEHOLDER: [TIPO] - [descrição detalhada] -->
  ```

**Parâmetros:**
- `disciplineTitle`: string
- `disciplineType`: string
- `moduleTitle`: string
- `subModuleTitle`: string
- `currentContent`: string - Conteúdo original
- `userPrompt`: string | undefined
- `previousSubModulesContext`: Array<{ title: string; content: string }> | undefined

**Exemplo de Saída:**
```markdown
## Busca Binária

A busca binária é um algoritmo eficiente...

<!-- PLACEHOLDER: GSAP - Animação passo-a-passo do algoritmo de busca binária. Deve mostrar: comparação com elemento do meio, divisão do array, escolha da metade esquerda/direita. Array exemplo: [1,3,5,7,9,11,13,15]. Elemento buscado: 7. Duração estimada: 2-3 segundos -->

A complexidade é O(log n).
```

### 2. Agente de Implementação (Segundo)
**Arquivo:** `gemini-prompt-content-implementation.md`

**Função:** Implementa os placeholders gerando código HTML completo e funcional.

**Entrada:**
- Placeholder descritivo no formato:
  ```
  <!-- PLACEHOLDER: [TIPO] - [descrição] -->
  ```

**Saída:**
- Arquivo HTML completo começando com `<!DOCTYPE html>`
- Inclui imports de bibliotecas via CDN
- Código funcional e pronto para execução

**Parâmetros:**
- Placeholder como string

**Exemplo de Entrada:**
```
<!-- PLACEHOLDER: PLOTLY - Gráfico de linha mostrando função quadrática. Dados: x de 0 a 10, y = x² -->
```

**Exemplo de Saída:**
```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
  ...
</head>
<body>
  <div class="interactive-element interactive-plotly">
    ...
  </div>
</body>
</html>
```

### 3. Agente de Revisão (Legado - Opcional)
**Arquivo:** `gemini-prompt-content-review.md`

**Função:** Revisão completa de conteúdo em uma única etapa (método antigo).

**Nota:** Este agente é mantido para compatibilidade, mas o fluxo recomendado é usar Análise + Implementação em etapas separadas.

## Ordem de Execução Recomendada

1. **Análise** → Gera conteúdo com placeholders
2. **Revisão pelo Usuário** → Usuário revisa logs e confirma
3. **Implementação** → Para cada placeholder, gera HTML completo

## Características Importantes

- **Multi-Etapas:** Processo dividido em análise e implementação
- **Revisão Intermediária:** Usuário pode revisar antes de implementar
- **Placeholders Descritivos:** Cada placeholder contém detalhes suficientes para implementação
- **HTML Completo:** Implementação gera arquivos HTML autossuficientes

## Uso no Código

**Serviço:** `src/services/geminiService.ts`

- `analyzeSubModuleContent()` - Usa `content-review-agent/gemini-prompt-content-analysis.md`
- `reviewSubModuleContent()` - Usa `content-review-agent/gemini-prompt-content-review.md`

**Componente:** `src/components/AgentsPanel/ContentReviewAgent/ContentReviewAgent.ts`

## Tipos de Placeholders Suportados

- `THREE_JS` - Visualizações 3D
- `PLOTLY` - Gráficos interativos avançados
- `CHART_JS` - Gráficos simples
- `MERMAID` - Diagramas
- `CYTOSCAPE` - Grafos interativos
- `MATTER` - Simulações de física
- `MONACO` - Editores de código
- `QUIZ` - Quizzes interativos
- `FABRIC` - Canvas interativo
- `GSAP` - Animações
- `TIPPY` - Tooltips

