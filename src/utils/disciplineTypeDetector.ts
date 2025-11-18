/**
 * Utilitário para detectar o tipo de disciplina baseado no título e descrição
 * Usado pelo agente de revisão para escolher bibliotecas apropriadas
 */

import { libraryResearchService } from '@/services/libraryResearchService';

export type DisciplineType =
  | 'data-structures'
  | 'pointers'
  | 'graphs'
  | 'calculus'
  | 'algorithms'
  | 'physics'
  | 'programming'
  | 'database'
  | 'networks'
  | 'ai'
  | 'general';

/**
 * Informação sobre biblioteca recomendada com versão
 */
export interface RecommendedLibrary {
  name: string;
  version?: string;
  exists: boolean;
  reason?: string; // Por que esta biblioteca é recomendada para este tipo
}

/**
 * Escapa caracteres especiais de regex
 * @param str - String a ser escapada
 * @returns String com caracteres especiais escapados
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detecta o tipo de disciplina baseado no título e descrição
 * @param title - Título da disciplina
 * @param description - Descrição da disciplina (opcional)
 * @returns Tipo de disciplina detectado
 */
export function detectDisciplineType(title: string, description: string = ''): DisciplineType {
  const text = `${title} ${description}`.toLowerCase();
  
  // Padrões de palavras-chave para cada tipo
  const patterns: Array<{ type: DisciplineType; keywords: string[] }> = [
    {
      type: 'data-structures',
      keywords: [
        'estrutura de dados',
        'estrutura dados',
        'estruturas de dados',
        'lista',
        'árvore',
        'árvores',
        'pilha',
        'fila',
        'heap',
        'hash',
        'tabela hash',
        'grafo',
        'grafos',
        'árvore binária',
        'avl',
        'red-black',
        'b-tree',
        'linked list',
        'stack',
        'queue',
        'tree',
        'binary tree',
        'data structure',
        'estrutura',
      ],
    },
    {
      type: 'pointers',
      keywords: [
        'ponteiro',
        'ponteiros',
        'referência',
        'referências',
        'memória',
        'endereço',
        'endereços',
        'dereferenciação',
        'dereferencia',
        'pointer',
        'pointers',
        'reference',
        'memory',
        'address',
        'dereference',
      ],
    },
    {
      type: 'graphs',
      keywords: [
        'teoria dos grafos',
        'teoria grafo',
        'grafo',
        'grafos',
        'network',
        'networks',
        'rede',
        'redes',
        'vértice',
        'vértices',
        'aresta',
        'arestas',
        'nó',
        'nós',
        'edge',
        'edges',
        'vertex',
        'vertices',
        'node',
        'nodes',
        'graph theory',
        'graph algorithm',
        'algoritmo de grafo',
        'dfs',
        'bfs',
        'dijkstra',
        'kruskal',
        'prim',
        'topological sort',
      ],
    },
    {
      type: 'calculus',
      keywords: [
        'cálculo',
        'calculo',
        'derivada',
        'derivadas',
        'integral',
        'integrais',
        'limite',
        'limites',
        'função',
        'funções',
        'função contínua',
        'derivada parcial',
        'integral definida',
        'integral indefinida',
        'série',
        'séries',
        'taylor',
        'fourier',
        'calculus',
        'derivative',
        'derivatives',
        'integral',
        'integrals',
        'limit',
        'limits',
        'function',
        'functions',
        'continuous',
        'differential',
        'differential equation',
      ],
    },
    {
      type: 'algorithms',
      keywords: [
        'algoritmo',
        'algoritmos',
        'ordenação',
        'ordena',
        'sort',
        'sorting',
        'busca',
        'search',
        'complexidade',
        'complexity',
        'big o',
        'big-o',
        'notação assintótica',
        'asymptotic',
        'quicksort',
        'mergesort',
        'heapsort',
        'bubblesort',
        'insertion sort',
        'selection sort',
        'binary search',
        'linear search',
        'dynamic programming',
        'programação dinâmica',
        'greedy',
        'guloso',
        'divide and conquer',
        'divisão e conquista',
        'backtracking',
        'recursão',
        'recursion',
      ],
    },
    {
      type: 'physics',
      keywords: [
        'física',
        'fisica',
        'mecânica',
        'mecanica',
        'cinemática',
        'cinematica',
        'dinâmica',
        'dinamica',
        'termodinâmica',
        'termodinamica',
        'eletromagnetismo',
        'óptica',
        'optica',
        'física quântica',
        'fisica quantica',
        'physics',
        'mechanics',
        'kinematics',
        'dynamics',
        'thermodynamics',
        'electromagnetism',
        'optics',
        'quantum',
        'newton',
        'newtonian',
        'einstein',
        'relativity',
      ],
    },
    {
      type: 'programming',
      keywords: [
        'programação',
        'programacao',
        'programming',
        'linguagem de programação',
        'linguagem programacao',
        'sintaxe',
        'syntax',
        'variável',
        'variavel',
        'variables',
        'função',
        'function',
        'classe',
        'class',
        'objeto',
        'object',
        'orientação a objetos',
        'orientacao objetos',
        'oop',
        'paradigma',
        'paradigm',
        'python',
        'javascript',
        'java',
        'c++',
        'c#',
        'typescript',
      ],
    },
    {
      type: 'database',
      keywords: [
        'banco de dados',
        'banco dados',
        'database',
        'sql',
        'nosql',
        'relacional',
        'relational',
        'tabela',
        'table',
        'query',
        'queries',
        'schema',
        'modelo',
        'model',
        'normalização',
        'normalizacao',
        'normalization',
        'index',
        'índice',
        'indice',
        'transaction',
        'transação',
        'transacao',
      ],
    },
    {
      type: 'networks',
      keywords: [
        'rede de computadores',
        'rede computadores',
        'networking',
        'protocolo',
        'protocol',
        'tcp',
        'ip',
        'http',
        'https',
        'dns',
        'osi',
        'modelo osi',
        'modelo tcp/ip',
        'roteamento',
        'routing',
        'switching',
        'comutação',
        'comutacao',
        'lan',
        'wan',
        'vpn',
        'firewall',
      ],
    },
    {
      type: 'ai',
      keywords: [
        'inteligência artificial',
        'inteligencia artificial',
        'ia',
        'ai',
        'machine learning',
        'aprendizado de máquina',
        'aprendizado maquina',
        'deep learning',
        'aprendizado profundo',
        'neural network',
        'rede neural',
        'redes neurais',
        'neural networks',
        'perceptron',
        'backpropagation',
        'gradient descent',
        'descida do gradiente',
        'classificação',
        'classificacao',
        'classification',
        'regressão',
        'regressao',
        'regression',
        'clustering',
        'agrupamento',
      ],
    },
  ];

  // Contar ocorrências de cada tipo
  const scores: Map<DisciplineType, number> = new Map();
  
  patterns.forEach(({ type, keywords }) => {
    let score = 0;
    keywords.forEach(keyword => {
      // Busca exata tem peso maior
      if (text.includes(keyword)) {
        score += keyword.length > 5 ? 2 : 1;
      }
      // Busca como palavra completa tem peso ainda maior
      // Escapar caracteres especiais de regex antes de usar
      const escapedKeyword = escapeRegex(keyword);
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      if (regex.test(text)) {
        score += 2;
      }
    });
    if (score > 0) {
      scores.set(type, (scores.get(type) || 0) + score);
    }
  });

  // Retornar o tipo com maior score
  if (scores.size === 0) {
    return 'general';
  }

  const sortedScores = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
  return sortedScores[0][0];
}

/**
 * Mapeamento de bibliotecas recomendadas por tipo de disciplina
 * Inclui razões para cada recomendação
 */
const LIBRARY_MAP: Record<DisciplineType, Array<{ name: string; reason: string }>> = {
  'data-structures': [
    { name: 'three', reason: 'Visualizações 3D interativas de estruturas (árvores, pilhas, filas)' },
    { name: 'd3', reason: 'Visualizações customizadas de árvores e hierarquias' },
    { name: 'gsap', reason: 'Animações suaves de operações (inserção/remoção)' },
    { name: 'cytoscape', reason: 'Visualização interativa de grafos e estruturas complexas' },
    { name: 'sortablejs', reason: 'Exercícios interativos de reorganização de estruturas' },
    { name: 'mermaid', reason: 'Diagramas estáticos de estruturas de dados' },
  ],
  'pointers': [
    { name: 'd3', reason: 'Diagramas de memória e visualizações de endereços' },
    { name: 'mermaid', reason: 'Diagramas de fluxo de memória e referências' },
    { name: 'gsap', reason: 'Animações de ponteiros seguindo referências' },
    { name: 'tippy.js', reason: 'Tooltips explicando endereços de memória' },
  ],
  'graphs': [
    { name: 'cytoscape', reason: 'Grafos interativos com zoom, pan e drag (principal)' },
    { name: 'd3', reason: 'Force-directed graphs e layouts customizados' },
    { name: 'vis-network', reason: 'Visualizações de rede e grafos complexos' },
    { name: 'gsap', reason: 'Animações passo-a-passo de algoritmos de grafos' },
    { name: 'mermaid', reason: 'Diagramas de grafos estáticos' },
  ],
  'calculus': [
    { name: 'plotly.js-dist-min', reason: 'Gráficos interativos de funções 3D e superfícies' },
    { name: 'katex', reason: 'Renderização de fórmulas matemáticas complexas' },
    { name: 'three', reason: 'Visualizações 3D de superfícies e funções multivariáveis' },
    { name: 'echarts', reason: 'Gráficos estatísticos e visualizações de dados' },
    { name: '@observablehq/plot', reason: 'Visualizações estatísticas declarativas' },
  ],
  'algorithms': [
    { name: 'gsap', reason: 'Animações passo-a-passo de execução de algoritmos' },
    { name: 'd3', reason: 'Visualizações de execução e comparação de algoritmos' },
    { name: 'chart.js', reason: 'Gráficos de complexidade temporal e espacial' },
    { name: 'plotly.js-dist-min', reason: 'Gráficos avançados de análise de algoritmos' },
    { name: 'sortablejs', reason: 'Demonstrações interativas de algoritmos de ordenação' },
    { name: 'monaco-editor', reason: 'Editor de código interativo para implementação' },
  ],
  'physics': [
    { name: 'matter-js', reason: 'Simulações de física 2D (mecânica, colisões)' },
    { name: 'cannon', reason: 'Física 3D e simulações de corpos rígidos' },
    { name: 'three', reason: 'Visualizações 3D de sistemas físicos' },
    { name: 'plotly.js-dist-min', reason: 'Gráficos de movimento, velocidade e aceleração' },
    { name: 'gsap', reason: 'Animações de movimento e transições' },
  ],
  'programming': [
    { name: 'monaco-editor', reason: 'Editor de código avançado (VS Code editor)' },
    { name: 'prismjs', reason: 'Syntax highlighting avançado para exemplos de código' },
    { name: 'tippy.js', reason: 'Tooltips com explicações de sintaxe e conceitos' },
    { name: 'mermaid', reason: 'Diagramas de fluxo de código e algoritmos' },
  ],
  'database': [
    { name: 'mermaid', reason: 'Diagramas ER, esquemas de banco de dados' },
    { name: 'd3', reason: 'Visualizações de relacionamentos e estruturas' },
    { name: 'echarts', reason: 'Gráficos de análise de dados e queries' },
    { name: 'tippy.js', reason: 'Tooltips explicando conceitos de banco de dados' },
  ],
  'networks': [
    { name: 'cytoscape', reason: 'Visualização interativa de redes e topologias' },
    { name: 'd3', reason: 'Grafos force-directed de redes de computadores' },
    { name: 'vis-network', reason: 'Visualizações de rede e protocolos' },
    { name: 'mermaid', reason: 'Diagramas de arquitetura de rede' },
  ],
  'ai': [
    { name: 'plotly.js-dist-min', reason: 'Gráficos de aprendizado, loss, accuracy' },
    { name: 'chart.js', reason: 'Visualizações de métricas de modelos de ML' },
    { name: 'd3', reason: 'Visualizações customizadas de redes neurais' },
    { name: 'mermaid', reason: 'Diagramas de arquitetura de redes neurais' },
    { name: 'tippy.js', reason: 'Tooltips explicando conceitos de IA/ML' },
  ],
  'general': [
    { name: 'mermaid', reason: 'Diagramas versáteis para qualquer conteúdo' },
    { name: 'chart.js', reason: 'Gráficos simples e responsivos' },
    { name: 'plotly.js-dist-min', reason: 'Gráficos interativos avançados' },
    { name: 'tippy.js', reason: 'Tooltips para explicações contextuais' },
  ],
};

/**
 * Normaliza nome de biblioteca para formato npm
 */
function normalizeLibraryName(name: string): string {
  // Mapear nomes comuns para nomes corretos do npm
  const nameMap: Record<string, string> = {
    'three.js': 'three',
    'd3.js': 'd3',
    'plotly.js': 'plotly.js-dist-min',
    'cytoscape.js': 'cytoscape',
    'tippy.js': 'tippy.js',
    'matter.js': 'matter-js',
    'cannon.js': 'cannon',
    'vis.js': 'vis-network',
    'observable-plot': '@observablehq/plot',
  };

  return nameMap[name] || name;
}

/**
 * Retorna bibliotecas recomendadas para um tipo de disciplina (versão síncrona)
 * @param type - Tipo de disciplina
 * @returns Array de nomes de bibliotecas recomendadas
 */
export function getRecommendedLibraries(type: DisciplineType): string[] {
  const libraries = LIBRARY_MAP[type] || LIBRARY_MAP.general;
  return libraries.map(lib => lib.name);
}

/**
 * Retorna bibliotecas recomendadas com informações detalhadas (versão assíncrona)
 * Busca versões atualizadas e valida existência
 * @param type - Tipo de disciplina
 * @param useCache - Se deve usar cache (padrão: true)
 * @returns Array de bibliotecas recomendadas com versões e validação
 */
export async function getRecommendedLibrariesWithInfo(
  type: DisciplineType,
  useCache: boolean = true
): Promise<RecommendedLibrary[]> {
  const libraries = LIBRARY_MAP[type] || LIBRARY_MAP.general;
  const packageNames = libraries.map(lib => normalizeLibraryName(lib.name));

  // Buscar informações de todas as bibliotecas em paralelo
  const libraryInfoMap = await libraryResearchService.getMultipleLibraryInfo(packageNames, useCache);

  // Combinar informações
  return libraries.map(lib => {
    const normalizedName = normalizeLibraryName(lib.name);
    const info = libraryInfoMap.get(normalizedName.toLowerCase());

    return {
      name: lib.name,
      version: info?.version,
      exists: info?.exists ?? false,
      reason: lib.reason,
    };
  });
}

/**
 * Valida se todas as bibliotecas recomendadas existem
 * @param type - Tipo de disciplina
 * @returns true se todas as bibliotecas existem
 */
export async function validateRecommendedLibraries(type: DisciplineType): Promise<boolean> {
  const libraries = await getRecommendedLibrariesWithInfo(type);
  return libraries.every(lib => lib.exists);
}

/**
 * Retorna descrição legível do tipo de disciplina
 * @param type - Tipo de disciplina
 * @returns Descrição em português
 */
export function getDisciplineTypeLabel(type: DisciplineType): string {
  const labels: Record<DisciplineType, string> = {
    'data-structures': 'Estrutura de Dados',
    'pointers': 'Ponteiros e Memória',
    'graphs': 'Teoria dos Grafos',
    'calculus': 'Cálculo e Matemática',
    'algorithms': 'Algoritmos',
    'physics': 'Física',
    'programming': 'Programação',
    'database': 'Banco de Dados',
    'networks': 'Redes de Computadores',
    'ai': 'Inteligência Artificial',
    'general': 'Geral',
  };

  return labels[type] || 'Geral';
}

