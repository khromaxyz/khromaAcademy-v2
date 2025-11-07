# 🔷 Teoria dos Grafos Interativa

Explore o fascinante mundo dos **grafos** de forma completamente interativa! Arraste os nós, experimente diferentes layouts, e compreenda visualmente os conceitos fundamentais da teoria dos grafos.

---

## 📚 1. Fundamentos de Grafos

### O que é um Grafo?

Um **grafo** $G = (V, E)$ é uma estrutura matemática composta por:
- $V$ = conjunto de **vértices** (ou nós)
- $E$ = conjunto de **arestas** que conectam os vértices

### Grafo Simples - Exemplo Básico

<div data-graph='{
  "title": "Grafo Simples Não-Direcionado",
  "description": "Um grafo básico com 5 vértices. Arraste os nós e experimente diferentes layouts!",
  "nodes": [
    {"id": "A", "label": "A"},
    {"id": "B", "label": "B"},
    {"id": "C", "label": "C"},
    {"id": "D", "label": "D"},
    {"id": "E", "label": "E"}
  ],
  "edges": [
    {"source": "A", "target": "B"},
    {"source": "B", "target": "C"},
    {"source": "C", "target": "D"},
    {"source": "D", "target": "E"},
    {"source": "E", "target": "A"},
    {"source": "A", "target": "C"}
  ],
  "layout": "circle",
  "directed": false
}'></div>

**Propriedades deste grafo:**
- **Vértices**: $|V| = 5$
- **Arestas**: $|E| = 6$
- **Grau máximo**: 3 (vértices A e C)
- **Conectado**: Sim ✅
- **Cíclico**: Sim (contém ciclos)

---

## 🎯 2. Tipos de Grafos Clássicos

### Grafo Completo ($K_5$)

Um grafo onde **cada vértice está conectado a todos os outros**.

<div data-graph='{
  "title": "Grafo Completo K₅",
  "description": "Todos os vértices estão conectados entre si. Total de arestas: n(n-1)/2 = 10",
  "nodes": [
    {"id": "1", "label": "1", "color": "#41ff41"},
    {"id": "2", "label": "2", "color": "#41ff41"},
    {"id": "3", "label": "3", "color": "#41ff41"},
    {"id": "4", "label": "4", "color": "#41ff41"},
    {"id": "5", "label": "5", "color": "#41ff41"}
  ],
  "edges": [
    {"source": "1", "target": "2"},
    {"source": "1", "target": "3"},
    {"source": "1", "target": "4"},
    {"source": "1", "target": "5"},
    {"source": "2", "target": "3"},
    {"source": "2", "target": "4"},
    {"source": "2", "target": "5"},
    {"source": "3", "target": "4"},
    {"source": "3", "target": "5"},
    {"source": "4", "target": "5"}
  ],
  "layout": "circle",
  "directed": false
}'></div>

**Fórmula das arestas:**
$$
|E| = \frac{n(n-1)}{2} = \frac{5 \cdot 4}{2} = 10
$$

### Grafo Bipartido ($K_{3,3}$)

Um grafo com dois conjuntos de vértices onde **arestas só conectam vértices de conjuntos diferentes**.

<div data-graph='{
  "title": "Grafo Bipartido Completo K₃,₃",
  "description": "Problema das 3 casas e 3 utilidades. Famoso por ser não-planar!",
  "nodes": [
    {"id": "A1", "label": "Casa 1", "color": "#41ffff"},
    {"id": "A2", "label": "Casa 2", "color": "#41ffff"},
    {"id": "A3", "label": "Casa 3", "color": "#41ffff"},
    {"id": "B1", "label": "Água", "color": "#ff41ff"},
    {"id": "B2", "label": "Gás", "color": "#ff41ff"},
    {"id": "B3", "label": "Luz", "color": "#ff41ff"}
  ],
  "edges": [
    {"source": "A1", "target": "B1", "color": "#41ffff"},
    {"source": "A1", "target": "B2", "color": "#41ffff"},
    {"source": "A1", "target": "B3", "color": "#41ffff"},
    {"source": "A2", "target": "B1", "color": "#41ffff"},
    {"source": "A2", "target": "B2", "color": "#41ffff"},
    {"source": "A2", "target": "B3", "color": "#41ffff"},
    {"source": "A3", "target": "B1", "color": "#41ffff"},
    {"source": "A3", "target": "B2", "color": "#41ffff"},
    {"source": "A3", "target": "B3", "color": "#41ffff"}
  ],
  "layout": "grid",
  "directed": false
}'></div>

> **Curiosidade**: $K_{3,3}$ não é **planar**! É impossível desenhá-lo em um plano sem que as arestas se cruzem.

---

## 🌳 3. Árvores

Uma **árvore** é um grafo **conectado** e **acíclico** (sem ciclos).

### Árvore Binária Completa

<div data-graph='{
  "title": "Árvore Binária Completa de Profundidade 3",
  "description": "Cada nó tem no máximo 2 filhos. Perfeita para estruturas de dados!",
  "nodes": [
    {"id": "1", "label": "Raiz", "color": "#ffff41"},
    {"id": "2", "label": "2", "color": "#41ff41"},
    {"id": "3", "label": "3", "color": "#41ff41"},
    {"id": "4", "label": "4", "color": "#41ffff"},
    {"id": "5", "label": "5", "color": "#41ffff"},
    {"id": "6", "label": "6", "color": "#41ffff"},
    {"id": "7", "label": "7", "color": "#41ffff"}
  ],
  "edges": [
    {"source": "1", "target": "2"},
    {"source": "1", "target": "3"},
    {"source": "2", "target": "4"},
    {"source": "2", "target": "5"},
    {"source": "3", "target": "6"},
    {"source": "3", "target": "7"}
  ],
  "layout": "breadthfirst",
  "directed": false
}'></div>

**Propriedades das árvores:**
- $|E| = |V| - 1$ (sempre!)
- Existe **exatamente um caminho** entre quaisquer dois vértices
- Não contém ciclos
- Se remover qualquer aresta, o grafo se desconecta

---

## ➡️ 4. Grafos Direcionados (Dígrafos)

Em grafos direcionados, as arestas têm **direção** (representadas por setas).

### DAG - Grafo Acíclico Direcionado

<div data-graph='{
  "title": "DAG - Dependências de Tarefas",
  "description": "Representação de dependências (ex: tarefas de um projeto). Note as setas!",
  "nodes": [
    {"id": "Inicio", "label": "Início", "color": "#41ff41"},
    {"id": "A", "label": "Tarefa A"},
    {"id": "B", "label": "Tarefa B"},
    {"id": "C", "label": "Tarefa C"},
    {"id": "D", "label": "Tarefa D"},
    {"id": "Fim", "label": "Fim", "color": "#ff4141"}
  ],
  "edges": [
    {"source": "Inicio", "target": "A"},
    {"source": "Inicio", "target": "B"},
    {"source": "A", "target": "C"},
    {"source": "B", "target": "C"},
    {"source": "B", "target": "D"},
    {"source": "C", "target": "Fim"},
    {"source": "D", "target": "Fim"}
  ],
  "layout": "breadthfirst",
  "directed": true
}'></div>

**Aplicações de DAGs:**
- 📦 Gerenciamento de dependências (npm, pip)
- 🏗️ Scheduling de tarefas
- 🔄 Compilação de código
- 🧬 Análise de linhagem de dados

---

## ⚖️ 5. Grafos Ponderados

Grafos onde as **arestas têm pesos** (custos, distâncias, tempos, etc.).

### Grafo de Cidades com Distâncias

<div data-graph='{
  "title": "Mapa de Distâncias entre Cidades (km)",
  "description": "Problema do caixeiro viajante. Qual o caminho mais curto?",
  "nodes": [
    {"id": "SP", "label": "São Paulo", "color": "#ff41ff"},
    {"id": "RJ", "label": "Rio de Janeiro", "color": "#ff41ff"},
    {"id": "BH", "label": "Belo Horizonte", "color": "#ff41ff"},
    {"id": "BSB", "label": "Brasília", "color": "#ff41ff"},
    {"id": "CWB", "label": "Curitiba", "color": "#ff41ff"}
  ],
  "edges": [
    {"source": "SP", "target": "RJ", "weight": 430},
    {"source": "SP", "target": "BH", "weight": 586},
    {"source": "SP", "target": "CWB", "weight": 408},
    {"source": "RJ", "target": "BH", "weight": 434},
    {"source": "BH", "target": "BSB", "weight": 716},
    {"source": "SP", "target": "BSB", "weight": 1015},
    {"source": "CWB", "target": "BSB", "weight": 1366}
  ],
  "layout": "cose",
  "directed": false
}'></div>

**Algoritmos para grafos ponderados:**
- 🔍 **Dijkstra**: Caminho mais curto (pesos positivos)
- 🌊 **Bellman-Ford**: Caminho mais curto (aceita pesos negativos)
- 🌲 **Prim/Kruskal**: Árvore Geradora Mínima
- 🚗 **Floyd-Warshall**: Todos os caminhos mais curtos

---

## 🎨 6. Ciclos e Caminhos

### Ciclo Hamiltoniano

Um **ciclo hamiltoniano** visita **todos os vértices exatamente uma vez** e retorna ao início.

<div data-graph='{
  "title": "Grafo com Ciclo Hamiltoniano",
  "description": "O caminho A → B → C → D → E → A é um ciclo hamiltoniano",
  "nodes": [
    {"id": "A", "label": "A", "color": "#ffff41"},
    {"id": "B", "label": "B", "color": "#ffff41"},
    {"id": "C", "label": "C", "color": "#ffff41"},
    {"id": "D", "label": "D", "color": "#ffff41"},
    {"id": "E", "label": "E", "color": "#ffff41"}
  ],
  "edges": [
    {"source": "A", "target": "B", "color": "#ff41ff"},
    {"source": "B", "target": "C", "color": "#ff41ff"},
    {"source": "C", "target": "D", "color": "#ff41ff"},
    {"source": "D", "target": "E", "color": "#ff41ff"},
    {"source": "E", "target": "A", "color": "#ff41ff"},
    {"source": "A", "target": "C", "color": "#41ffff"},
    {"source": "B", "target": "D", "color": "#41ffff"}
  ],
  "layout": "circle",
  "directed": false
}'></div>

**Ciclo destacado** (magenta): A → B → C → D → E → A

---

## ⭐ 7. Grafos Especiais

### Grafo de Petersen

Um dos grafos mais famosos da teoria dos grafos!

<div data-graph='{
  "title": "Grafo de Petersen",
  "description": "Famoso por ser um contra-exemplo para muitos teoremas. 10 vértices, 15 arestas.",
  "nodes": [
    {"id": "O1", "label": "1", "color": "#ff41ff"},
    {"id": "O2", "label": "2", "color": "#ff41ff"},
    {"id": "O3", "label": "3", "color": "#ff41ff"},
    {"id": "O4", "label": "4", "color": "#ff41ff"},
    {"id": "O5", "label": "5", "color": "#ff41ff"},
    {"id": "I1", "label": "6", "color": "#41ffff"},
    {"id": "I2", "label": "7", "color": "#41ffff"},
    {"id": "I3", "label": "8", "color": "#41ffff"},
    {"id": "I4", "label": "9", "color": "#41ffff"},
    {"id": "I5", "label": "10", "color": "#41ffff"}
  ],
  "edges": [
    {"source": "O1", "target": "O2"},
    {"source": "O2", "target": "O3"},
    {"source": "O3", "target": "O4"},
    {"source": "O4", "target": "O5"},
    {"source": "O5", "target": "O1"},
    {"source": "O1", "target": "I1"},
    {"source": "O2", "target": "I2"},
    {"source": "O3", "target": "I3"},
    {"source": "O4", "target": "I4"},
    {"source": "O5", "target": "I5"},
    {"source": "I1", "target": "I3"},
    {"source": "I3", "target": "I5"},
    {"source": "I5", "target": "I2"},
    {"source": "I2", "target": "I4"},
    {"source": "I4", "target": "I1"}
  ],
  "layout": "concentric",
  "directed": false
}'></div>

**Propriedades interessantes:**
- 3-regular (cada vértice tem grau 3)
- Não-planar
- Não possui ciclo hamiltoniano
- Diâmetro = 2 (distância máxima entre vértices)

### Grafo Estrela ($S_6$)

<div data-graph='{
  "title": "Grafo Estrela S₆",
  "description": "Um vértice central conectado a todos os outros. Útil em topologias de rede!",
  "nodes": [
    {"id": "Centro", "label": "Hub", "color": "#ffff41"},
    {"id": "1", "label": "1", "color": "#41ff41"},
    {"id": "2", "label": "2", "color": "#41ff41"},
    {"id": "3", "label": "3", "color": "#41ff41"},
    {"id": "4", "label": "4", "color": "#41ff41"},
    {"id": "5", "label": "5", "color": "#41ff41"},
    {"id": "6", "label": "6", "color": "#41ff41"}
  ],
  "edges": [
    {"source": "Centro", "target": "1"},
    {"source": "Centro", "target": "2"},
    {"source": "Centro", "target": "3"},
    {"source": "Centro", "target": "4"},
    {"source": "Centro", "target": "5"},
    {"source": "Centro", "target": "6"}
  ],
  "layout": "concentric",
  "directed": false
}'></div>

**Aplicações:**
- 🌐 Topologia de redes (hub central)
- 💻 Arquitetura cliente-servidor
- 📡 Distribuição de conteúdo

---

## 🌈 8. Coloração de Grafos

A **coloração de vértices** atribui cores aos vértices de modo que **vértices adjacentes tenham cores diferentes**.

### Problema das 4 Cores - Mapa

<div data-graph='{
  "title": "Coloração de Mapa (Teorema das 4 Cores)",
  "description": "Qualquer mapa planar pode ser colorido com no máximo 4 cores!",
  "nodes": [
    {"id": "R1", "label": "Região 1", "color": "#41ff41"},
    {"id": "R2", "label": "Região 2", "color": "#ff4141"},
    {"id": "R3", "label": "Região 3", "color": "#41ffff"},
    {"id": "R4", "label": "Região 4", "color": "#ffff41"},
    {"id": "R5", "label": "Região 5", "color": "#ff41ff"},
    {"id": "R6", "label": "Região 6", "color": "#41ff41"}
  ],
  "edges": [
    {"source": "R1", "target": "R2"},
    {"source": "R1", "target": "R3"},
    {"source": "R1", "target": "R4"},
    {"source": "R2", "target": "R3"},
    {"source": "R2", "target": "R5"},
    {"source": "R3", "target": "R4"},
    {"source": "R3", "target": "R5"},
    {"source": "R3", "target": "R6"},
    {"source": "R4", "target": "R6"},
    {"source": "R5", "target": "R6"}
  ],
  "layout": "cose",
  "directed": false
}'></div>

**Número cromático** ($\chi(G)$): Número mínimo de cores necessárias.

**Aplicações:**
- 📅 Scheduling de horários
- 📻 Alocação de frequências
- 🗺️ Coloração de mapas
- 🎨 Registro de compiladores

---

## 🔗 9. Grafos de Redes Sociais

### Rede de Amizades

<div data-graph='{
  "title": "Rede Social Simplificada",
  "description": "Cada nó é uma pessoa, arestas representam amizades. Quem é mais influente?",
  "nodes": [
    {"id": "Alice", "label": "Alice", "color": "#ff41ff"},
    {"id": "Bob", "label": "Bob", "color": "#41ff41"},
    {"id": "Carol", "label": "Carol", "color": "#41ffff"},
    {"id": "David", "label": "David", "color": "#ffff41"},
    {"id": "Eve", "label": "Eve", "color": "#ff4141"},
    {"id": "Frank", "label": "Frank", "color": "#41ff41"},
    {"id": "Grace", "label": "Grace", "color": "#41ffff"}
  ],
  "edges": [
    {"source": "Alice", "target": "Bob"},
    {"source": "Alice", "target": "Carol"},
    {"source": "Alice", "target": "David"},
    {"source": "Bob", "target": "Eve"},
    {"source": "Carol", "target": "David"},
    {"source": "Carol", "target": "Frank"},
    {"source": "David", "target": "Grace"},
    {"source": "Eve", "target": "Frank"},
    {"source": "Frank", "target": "Grace"}
  ],
  "layout": "cose",
  "directed": false
}'></div>

**Métricas importantes:**
- **Grau** (degree): Número de conexões
- **Centralidade**: Importância de um nó
- **Coeficiente de clustering**: Quão agrupada é a rede
- **Caminho médio**: Graus de separação

> **Alice** tem o maior grau (3 conexões) - ela é a mais conectada!

---

## 🎯 10. Desafios Práticos

### Problema das Pontes de Königsberg

O problema clássico que deu origem à teoria dos grafos!

<div data-graph='{
  "title": "Pontes de Königsberg (Problema de Euler)",
  "description": "É possível cruzar todas as 7 pontes exatamente uma vez? Resposta: NÃO!",
  "nodes": [
    {"id": "A", "label": "Norte", "color": "#41ff41"},
    {"id": "B", "label": "Sul", "color": "#41ff41"},
    {"id": "C", "label": "Leste", "color": "#41ff41"},
    {"id": "D", "label": "Oeste", "color": "#41ff41"}
  ],
  "edges": [
    {"source": "A", "target": "B", "label": "P1"},
    {"source": "A", "target": "C", "label": "P2"},
    {"source": "A", "target": "C", "label": "P3"},
    {"source": "A", "target": "D", "label": "P4"},
    {"source": "A", "target": "D", "label": "P5"},
    {"source": "B", "target": "C", "label": "P6"},
    {"source": "B", "target": "D", "label": "P7"}
  ],
  "layout": "circle",
  "directed": false
}'></div>

**Teorema de Euler**: Um grafo possui um **caminho euleriano** (passa por todas as arestas exatamente uma vez) se e somente se:
- Tem exatamente 0 ou 2 vértices de grau ímpar

No problema de Königsberg, **todos os 4 vértices têm grau ímpar** (3, 3, 5, 3), logo é impossível!

---

## 📊 Resumo das Propriedades

| Propriedade | Fórmula / Definição | Exemplo |
|-------------|---------------------|---------|
| **Ordem** | $|V|$ (número de vértices) | 5 vértices |
| **Tamanho** | $|E|$ (número de arestas) | 7 arestas |
| **Grau** | $d(v)$ = número de arestas incidentes em $v$ | $d(A) = 3$ |
| **Grau Médio** | $\bar{d} = \frac{2|E|}{|V|}$ | $\bar{d} = 2.8$ |
| **Grafo Completo** | $|E| = \frac{n(n-1)}{2}$ | $K_5$ tem 10 arestas |
| **Árvore** | $|E| = |V| - 1$ | 5 vértices → 4 arestas |
| **Diâmetro** | Maior distância entre dois vértices | $diam(G) = 3$ |
| **Conectividade** | Número mínimo de vértices para desconectar | $\kappa(G) = 2$ |

---

## 🎓 Aplicações Reais da Teoria dos Grafos

### 🌐 Internet e Redes
- Roteamento de pacotes
- Topologia de redes
- DNS e propagação de informação

### 🗺️ Sistemas de Navegação
- GPS e mapas (Google Maps, Waze)
- Algoritmos de caminho mais curto
- Otimização de rotas de entrega

### 🧬 Bioinformática
- Redes de interação proteína-proteína
- Caminhos metabólicos
- Análise filogenética

### 💰 Finanças
- Detecção de fraude
- Análise de risco
- Redes de transações

### 🎮 Jogos e IA
- Pathfinding (A*)
- Árvores de decisão
- Grafos de cena

### 📱 Redes Sociais
- Recomendação de amigos
- Detecção de comunidades
- Análise de influência

---

## 🚀 Experimente Você Mesmo!

Use os controles em cada grafo para:
- 🖱️ **Arrastar** nós e reorganizar
- 🔍 **Zoom** com o scroll do mouse
- 🎨 **Mudar layouts** (círculo, grade, força, etc.)
- 👆 **Passar o mouse** sobre nós e arestas para destacá-los
- 🔄 **Reset** para voltar ao layout original

---

## 💡 Conclusão

A **Teoria dos Grafos** é uma das áreas mais versáteis e aplicáveis da Matemática Discreta! Com estes exemplos interativos, você pode:

✅ Visualizar conceitos abstratos
✅ Experimentar com diferentes estruturas
✅ Compreender propriedades fundamentais
✅ Aplicar conhecimento em problemas reais

**Continue explorando e brincando com os grafos acima!** 🎨🔷

---

*💻 Todos os grafos são totalmente interativos graças ao Cytoscape.js*

