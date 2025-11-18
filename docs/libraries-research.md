# Pesquisa de Bibliotecas para Elementos Interativos

## Bibliotecas Já Implementadas no Projeto

### Visualizações e Gráficos
- **Plotly.js** (`plotly.js-dist-min` v3.2.0): Gráficos interativos avançados (linha, barra, scatter, 3D, heatmaps)
- **Chart.js** (v4.5.1): Gráficos simples e responsivos (linha, barra, pizza, radar)
- **Mermaid** (v11.12.1): Diagramas e fluxogramas (sequência, fluxo, Gantt, etc.)

### Visualizações 3D e Simulações
- **Three.js** (v0.181.0): Visualizações 3D interativas
- **Matter.js** (v0.20.0): Simulações de física 2D
- **p5.js** (v2.0.5): Biblioteca de código criativo e visualizações

### Grafos e Redes
- **Cytoscape.js** (v3.33.1): Visualização de grafos interativos

### Editores e Código
- **Monaco Editor** (v0.54.0): Editor de código avançado (VS Code editor)
- **Fabric.js** (v6.7.1): Canvas interativo para desenho e manipulação

### Matemática
- **KaTeX** (v0.16.25): Renderização de fórmulas matemáticas
- **Math.js** (v15.1.0): Biblioteca de matemática computacional

### Markdown
- **markdown-it** (v14.1.0): Parser de Markdown
- **markdown-it-katex** (v2.0.3): Plugin para fórmulas matemáticas no Markdown

---

## Bibliotecas Adicionais Recomendadas

### Visualizações Avançadas

#### D3.js
- **Versão:** v7.8.5 (última estável)
- **Uso:** Visualizações de dados customizadas, gráficos complexos, mapas, hierarquias
- **Quando usar:** 
  - Estrutura de Dados: Visualizar árvores, heaps, estruturas hierárquicas
  - Grafos: Visualizações force-directed, layouts customizados
  - Algoritmos: Visualizar execução passo-a-passo
- **Exemplo de uso:** `data-d3='{"type":"tree","data":{...}}'`
- **Instalação:** `npm install d3 @types/d3`

#### Observable Plot
- **Versão:** v0.6.11
- **Uso:** Gráficos declarativos e interativos, visualizações estatísticas
- **Quando usar:** Cálculo, estatística, análise de dados
- **Instalação:** `npm install @observablehq/plot`

#### Vega-Lite
- **Versão:** v5.15.1
- **Uso:** Visualizações declarativas baseadas em especificações JSON
- **Quando usar:** Quando precisar de visualizações complexas com especificações JSON
- **Instalação:** `npm install vega-lite vega`

### Animações

#### GSAP (GreenSock Animation Platform)
- **Versão:** v3.12.5
- **Uso:** Animações profissionais, transições suaves, timelines
- **Quando usar:**
  - Algoritmos: Animar execução passo-a-passo
  - Estrutura de Dados: Animar inserção/remoção de elementos
  - Visualizações: Transições suaves entre estados
- **Exemplo de uso:** `data-gsap='{"animation":"fadeIn","duration":1}'`
- **Instalação:** `npm install gsap`
- **Nota:** Já está sendo usado via CDN no teste1.html, mas deve ser instalado via npm

#### Lottie
- **Versão:** v5.12.2
- **Uso:** Animações JSON (After Effects), ícones animados
- **Quando usar:** Animações decorativas, feedback visual
- **Instalação:** `npm install lottie-web`

### Matemática Avançada

#### Desmos API
- **Uso:** Gráficos matemáticos interativos, calculadora gráfica
- **Quando usar:** Cálculo, funções, equações
- **Nota:** API externa, não requer instalação npm
- **Exemplo:** `<iframe src="https://www.desmos.com/calculator/..." />`

#### MathJax
- **Versão:** v3.2.2
- **Uso:** Renderização avançada de matemática (complementa KaTeX)
- **Quando usar:** Quando KaTeX não suporta alguma sintaxe específica
- **Instalação:** `npm install mathjax`

### Gráficos Avançados

#### ECharts
- **Versão:** v5.4.3
- **Uso:** Gráficos interativos avançados, dashboards
- **Quando usar:** Visualizações complexas, múltiplos gráficos, dashboards
- **Exemplo:** `data-echarts='{"type":"line","data":{...}}'`
- **Instalação:** `npm install echarts`

#### Recharts
- **Versão:** v2.10.3
- **Uso:** Gráficos React-like (pode ser adaptado para vanilla)
- **Nota:** Requer React, pode não ser ideal para este projeto

### Simulações e Física

#### Cannon.js
- **Versão:** v0.20.0
- **Uso:** Física 3D, simulações de corpos rígidos
- **Quando usar:** Física, mecânica, simulações 3D complexas
- **Instalação:** `npm install cannon @types/cannon`

#### Phaser.js
- **Versão:** v3.80.1
- **Uso:** Jogos educacionais, simulações interativas, gamificação
- **Quando usar:** Criar jogos educacionais, simulações gamificadas
- **Instalação:** `npm install phaser @types/phaser`

### Interatividade

#### Tippy.js
- **Versão:** v6.3.7
- **Uso:** Tooltips avançados, popovers, dropdowns
- **Quando usar:** Explicações contextuais, dicas, informações adicionais
- **Exemplo:** `data-tippy="Explicação detalhada"`
- **Instalação:** `npm install tippy.js @tippyjs/react` (ou core)

#### SortableJS
- **Versão:** v1.15.2
- **Uso:** Drag-and-drop, ordenação interativa
- **Quando usar:** 
  - Algoritmos: Ordenação interativa
  - Estrutura de Dados: Reorganizar elementos
  - Exercícios: Arrastar e soltar
- **Instalação:** `npm install sortablejs @types/sortablejs`

### Visualizações de Código

#### Prism.js
- **Versão:** v1.29.0
- **Uso:** Syntax highlighting avançado
- **Nota:** Já mencionado no contexto, verificar se está implementado
- **Instalação:** `npm install prismjs`

#### CodeMirror
- **Versão:** v6.0.1
- **Uso:** Editor de código alternativo ao Monaco (mais leve)
- **Quando usar:** Editores de código mais simples, quando Monaco for pesado demais
- **Instalação:** `npm install codemirror @types/codemirror`

### Timelines e Sequências

#### Timeline.js (Vis.js Timeline)
- **Versão:** v7.7.3 (via vis-timeline)
- **Uso:** Linhas do tempo interativas, cronologias
- **Quando usar:** História da computação, evolução de algoritmos, cronologias
- **Instalação:** `npm install vis-timeline`

#### Vis.js
- **Versão:** v9.1.9
- **Uso:** Visualizações de rede, grafos, timelines, datasets
- **Quando usar:** Grafos, redes, visualizações de dados complexas
- **Instalação:** `npm install vis-network vis-timeline vis-data`

### Mapas Mentais e Hierarquias

#### D3.js Force-Directed Graphs
- **Uso:** Grafos force-directed, mapas mentais interativos
- **Nota:** Parte do D3.js, não requer instalação separada
- **Quando usar:** Mapas mentais, hierarquias, relações complexas

---

## Mapeamento por Tipo de Disciplina

### Estrutura de Dados
**Bibliotecas Recomendadas:**
- Three.js (visualizações 3D de estruturas)
- D3.js (árvores, grafos, hierarquias)
- GSAP (animações de inserção/remoção)
- Cytoscape.js (visualização de grafos)
- SortableJS (reorganização interativa)
- Mermaid (diagramas de estrutura)

**Elementos Típicos:**
- Visualizações 3D de árvores, pilhas, filas
- Animações de operações (push, pop, insert, delete)
- Diagramas interativos de estruturas
- Exercícios de drag-and-drop para construir estruturas

### Ponteiros e Memória
**Bibliotecas Recomendadas:**
- D3.js (diagramas de memória, visualizações de endereços)
- Mermaid (diagramas de fluxo de memória)
- GSAP (animações de ponteiros seguindo referências)
- Tippy.js (tooltips explicando endereços de memória)

**Elementos Típicos:**
- Visualizações de memória com endereços
- Diagramas de ponteiros apontando para variáveis
- Animações de dereferenciação
- Exercícios interativos de manipulação de ponteiros

### Teoria dos Grafos
**Bibliotecas Recomendadas:**
- Cytoscape.js (grafos interativos principais)
- D3.js (force-directed graphs, layouts customizados)
- Vis.js (visualizações de rede)
- GSAP (animações de algoritmos de grafos)
- Mermaid (diagramas de grafos estáticos)

**Elementos Típicos:**
- Grafos interativos com zoom, pan, drag
- Visualizações de algoritmos (DFS, BFS, Dijkstra)
- Animações passo-a-passo de algoritmos
- Exercícios de construção de grafos

### Cálculo e Matemática
**Bibliotecas Recomendadas:**
- Plotly.js (gráficos de funções 3D)
- Desmos API (calculadora gráfica interativa)
- Three.js (superfícies 3D, funções multivariáveis)
- KaTeX/MathJax (fórmulas matemáticas)
- ECharts (gráficos estatísticos)
- Observable Plot (visualizações estatísticas)

**Elementos Típicos:**
- Gráficos interativos de funções
- Visualizações 3D de superfícies
- Calculadoras gráficas embutidas
- Animações de limites, derivadas, integrais
- Exercícios interativos de cálculo

### Algoritmos
**Bibliotecas Recomendadas:**
- GSAP (animações passo-a-passo)
- D3.js (visualizações de execução)
- Chart.js/Plotly.js (gráficos de complexidade)
- SortableJS (demonstrações de ordenação)
- Monaco Editor (editor de código com execução)

**Elementos Típicos:**
- Visualizações passo-a-passo de algoritmos
- Gráficos de complexidade temporal/espacial
- Animações de comparação de algoritmos
- Exercícios interativos de implementação
- Simulações de execução

### Física e Mecânica
**Bibliotecas Recomendadas:**
- Matter.js (física 2D - já implementado)
- Cannon.js (física 3D)
- Three.js (visualizações 3D)
- Phaser.js (simulações gamificadas)
- Plotly.js (gráficos de movimento)
- GSAP (animações de movimento)

**Elementos Típicos:**
- Simulações de física interativas
- Visualizações 3D de sistemas físicos
- Gráficos de movimento, velocidade, aceleração
- Exercícios de simulação de fenômenos físicos

---

## Prioridade de Instalação

### Alta Prioridade (Essenciais)
1. **D3.js** - Visualizações customizadas essenciais
2. **GSAP** - Animações profissionais
3. **ECharts** - Gráficos avançados
4. **Tippy.js** - Tooltips e interatividade

### Média Prioridade (Muito Úteis)
5. **SortableJS** - Drag-and-drop
6. **Cannon.js** - Física 3D
7. **Vis.js** - Timelines e redes
8. **Prism.js** - Syntax highlighting (se não estiver implementado)

### Baixa Prioridade (Opcionais)
9. **Phaser.js** - Jogos educacionais (pode ser pesado)
10. **Lottie** - Animações JSON (decorativo)
11. **CodeMirror** - Editor alternativo (Monaco já existe)
12. **MathJax** - Matemática avançada (KaTeX já existe)

---

## Notas de Implementação

- Todas as bibliotecas devem ser integradas via atributos `data-*` no Markdown
- O sistema de processamento em `DisciplineContent.ts` deve ser estendido
- Cada biblioteca deve ter um serviço/utilitário dedicado em `src/services/`
- Documentação de uso deve ser incluída no system instruction do agente de revisão
- Considerar bundle size ao adicionar bibliotecas grandes (Phaser, ECharts)

