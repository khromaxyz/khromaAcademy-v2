# 🚀 Demonstração Avançada - Recursos Educacionais Completos

Este módulo demonstra **TODAS** as capacidades avançadas da plataforma KhromaAcademy com as novas bibliotecas integradas.

---

## 📊 1. Gráficos Científicos com Plotly.js

### Gráfico de Linha Interativo

<div data-plotly='{
  "type": "line",
  "x": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "y": [0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
  "options": {
    "title": "Função Quadrática: y = x²",
    "xLabel": "x",
    "yLabel": "y = x²"
  }
}'></div>

*Passe o mouse sobre os pontos para ver os valores exatos. Você pode dar zoom, pan, e salvar como imagem!*

### Gráfico de Barras - Complexidade de Algoritmos

<div data-plotly='{
  "type": "bar",
  "x": ["Bubble Sort", "Quick Sort", "Merge Sort", "Heap Sort", "Tim Sort"],
  "y": [8.5, 1.8, 2.1, 2.3, 1.5],
  "options": {
    "title": "Tempo de Execução (segundos) - Array com 10.000 elementos",
    "yLabel": "Tempo (s)"
  }
}'></div>

### Gráfico 3D - Superfície Matemática

<div data-plotly='{
  "type": "surface",
  "z": [
    [8.83, 8.89, 8.81, 8.87, 8.9, 8.87],
    [8.89, 8.94, 8.85, 8.94, 8.96, 8.92],
    [8.84, 8.9, 8.82, 8.92, 8.93, 8.91],
    [8.79, 8.85, 8.79, 8.9, 8.94, 8.92],
    [8.79, 8.88, 8.81, 8.9, 8.95, 8.92],
    [8.8, 8.82, 8.78, 8.91, 8.94, 8.92]
  ],
  "options": {
    "title": "Superfície 3D Interativa",
    "colorscale": "Viridis"
  }
}'></div>

*Rotacione o gráfico 3D com o mouse para ver de diferentes ângulos!*

### Heatmap - Correlação de Dados

<div data-plotly='{
  "type": "heatmap",
  "z": [
    [1, 0.8, 0.3, 0.1],
    [0.8, 1, 0.4, 0.2],
    [0.3, 0.4, 1, 0.7],
    [0.1, 0.2, 0.7, 1]
  ],
  "options": {
    "title": "Matriz de Correlação",
    "x": ["Var A", "Var B", "Var C", "Var D"],
    "y": ["Var A", "Var B", "Var C", "Var D"]
  }
}'></div>

---

## 📈 2. Gráficos com Chart.js

### Gráfico de Linha - Crescimento de Usuários

<div data-chart='{
  "type": "line",
  "data": {
    "labels": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    "datasets": [{
      "label": "Usuários Ativos",
      "data": [12, 19, 25, 32, 42, 58],
      "borderColor": "#41ff41",
      "backgroundColor": "rgba(65, 255, 65, 0.1)",
      "tension": 0.4
    }]
  },
  "options": {
    "plugins": {
      "title": {
        "display": true,
        "text": "Crescimento de Usuários - 2024"
      }
    }
  }
}'></div>

### Gráfico de Pizza - Distribuição de Linguagens

<div data-chart='{
  "type": "pie",
  "data": {
    "labels": ["JavaScript", "Python", "Java", "C++", "TypeScript"],
    "datasets": [{
      "data": [35, 28, 15, 12, 10],
      "backgroundColor": [
        "#41ff41",
        "#41ffff",
        "#ff41ff",
        "#ffff41",
        "#ff4141"
      ]
    }]
  },
  "options": {
    "plugins": {
      "title": {
        "display": true,
        "text": "Linguagens Mais Utilizadas"
      }
    }
  }
}'></div>

---

## 🧮 3. Cálculos Matemáticos com Math.js

### Expressões Matemáticas Avaliadas

<div data-math-calc="sqrt(16) + 2^3"></div>

<div data-math-calc="sin(pi/2) + cos(0)"></div>

<div data-math-calc="log(100, 10)"></div>

<div data-math-calc="factorial(5)"></div>

<div data-math-calc="det([[1, 2], [3, 4]])"></div>

*Os cálculos são processados automaticamente usando Math.js!*

---

## 💻 4. Editor de Código Interativo (Monaco Editor)

### Playground de JavaScript

<div data-monaco='{
  "language": "javascript",
  "code": "// Função recursiva de Fibonacci\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// Teste\nfor (let i = 0; i <= 10; i++) {\n  console.log(`F(${i}) = ${fibonacci(i)}`);\n}",
  "readOnly": false,
  "height": 400
}'></div>

*Edite o código e clique em "Executar" para ver o resultado!*

### Exemplo Python (Read-Only)

<div data-monaco='{
  "language": "python",
  "code": "# Busca Binária em Python\ndef busca_binaria(arr, x):\n    esq, dir = 0, len(arr) - 1\n    \n    while esq <= dir:\n        meio = (esq + dir) // 2\n        \n        if arr[meio] == x:\n            return meio\n        elif arr[meio] < x:\n            esq = meio + 1\n        else:\n            dir = meio - 1\n    \n    return -1\n\n# Teste\narr = [1, 3, 5, 7, 9, 11, 13, 15]\nprint(f\"Índice do 7: {busca_binaria(arr, 7)}\")",
  "readOnly": true,
  "height": 350
}'></div>

---

## ⚛️ 5. Simulações de Física (Matter.js)

### Simulação de Gravidade

<div data-matter='{
  "type": "gravity",
  "width": 800,
  "height": 500,
  "showControls": true
}'></div>

*Objetos caindo sob a ação da gravidade. Use os controles para pausar ou ajustar a gravidade!*

### Pêndulo Simples

<div data-matter='{
  "type": "pendulum",
  "width": 600,
  "height": 400,
  "showControls": true
}'></div>

*Demonstração de movimento harmônico simples com um pêndulo.*

### Colisão Elástica

<div data-matter='{
  "type": "collision",
  "width": 700,
  "height": 350,
  "showControls": true
}'></div>

*Duas bolas colidindo elasticamente. Observe a conservação do momento!*

### Torre de Blocos

<div data-matter='{
  "type": "stack",
  "width": 600,
  "height": 500,
  "gravity": {"x": 0, "y": 0.8},
  "showControls": true
}'></div>

*Pilha de caixas demonstrando estabilidade e equilíbrio.*

---

## 🎨 6. Canvas de Desenho Interativo (Fabric.js)

### Lousa Virtual

<div data-fabric='{
  "width": 800,
  "height": 500,
  "mode": "draw",
  "background": "#1a1a1a"
}'></div>

*Use as ferramentas para desenhar, adicionar formas e texto. Perfeito para explicar conceitos visualmente!*

---

## 🎯 7. Exemplos Práticos Combinados

### Análise de Algoritmo de Ordenação

Vamos analisar a complexidade do **Merge Sort** de forma visual e prática.

#### Código Implementação

<div data-monaco='{
  "language": "javascript",
  "code": "function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  \n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  \n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  const result = [];\n  let i = 0, j = 0;\n  \n  while (i < left.length && j < right.length) {\n    if (left[i] < right[j]) {\n      result.push(left[i++]);\n    } else {\n      result.push(right[j++]);\n    }\n  }\n  \n  return result.concat(left.slice(i)).concat(right.slice(j));\n}\n\n// Teste\nconst arr = [64, 34, 25, 12, 22, 11, 90];\nconsole.log(\"Array original:\", arr);\nconsole.log(\"Array ordenado:\", mergeSort(arr));",
  "readOnly": false,
  "height": 400
}'></div>

#### Complexidade de Tempo

A equação de recorrência do Merge Sort:

$$
T(n) = 2T\left(\frac{n}{2}\right) + n
$$

Aplicando o Teorema Mestre: $a = 2$, $b = 2$, $f(n) = n$

$$
\log_b a = \log_2 2 = 1
$$

Como $f(n) = \Theta(n^{\log_b a})$, temos:

$$
T(n) = \Theta(n \log n)
$$

#### Visualização de Performance

<div data-chart='{
  "type": "line",
  "data": {
    "labels": ["100", "500", "1000", "5000", "10000", "50000"],
    "datasets": [{
      "label": "Merge Sort",
      "data": [0.1, 0.8, 2.1, 13.2, 29.5, 168.3],
      "borderColor": "#41ff41",
      "tension": 0.3
    }, {
      "label": "Quick Sort",
      "data": [0.08, 0.6, 1.8, 11.5, 27.1, 162.8],
      "borderColor": "#41ffff",
      "tension": 0.3
    }, {
      "label": "Bubble Sort",
      "data": [0.5, 12.5, 50.2, 1250.5, 5001.2, 125030.5],
      "borderColor": "#ff4141",
      "tension": 0.3
    }]
  },
  "options": {
    "plugins": {
      "title": {
        "display": true,
        "text": "Comparação de Performance (ms)"
      }
    },
    "scales": {
      "y": {
        "type": "logarithmic"
      }
    }
  }
}'></div>

---

## 🧬 8. Caso de Uso: Análise de DNA

### Visualização de Sequência

Representação visual da similaridade entre sequências de DNA:

<div data-plotly='{
  "type": "heatmap",
  "z": [
    [100, 85, 62, 45],
    [85, 100, 71, 53],
    [62, 71, 100, 68],
    [45, 53, 68, 100]
  ],
  "options": {
    "title": "Similaridade entre Sequências de DNA (%)",
    "x": ["Seq1", "Seq2", "Seq3", "Seq4"],
    "y": ["Seq1", "Seq2", "Seq3", "Seq4"]
  }
}'></div>

### Cálculo de Distância de Hamming

<div data-math-calc="abs(0b1010 - 0b1100)"></div>

---

## 🤖 9. Aprendizado de Máquina - Regressão Linear

### Dados e Visualização

<div data-plotly='{
  "type": "line",
  "x": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "y": [2.1, 3.9, 6.2, 8.1, 9.8, 12.1, 14.2, 15.9, 18.1, 20.2],
  "options": {
    "title": "Dados de Treinamento - Regressão Linear",
    "xLabel": "x (feature)",
    "yLabel": "y (target)"
  }
}'></div>

### Equação da Reta

A reta de melhor ajuste encontrada:

$$
y = 2.01x + 0.12
$$

Com coeficiente de determinação: $R^2 = 0.996$

### Implementação

<div data-monaco='{
  "language": "javascript",
  "code": "class LinearRegression {\n  constructor() {\n    this.slope = 0;\n    this.intercept = 0;\n  }\n  \n  fit(X, y) {\n    const n = X.length;\n    const sumX = X.reduce((a, b) => a + b, 0);\n    const sumY = y.reduce((a, b) => a + b, 0);\n    const sumXY = X.reduce((acc, xi, i) => acc + xi * y[i], 0);\n    const sumX2 = X.reduce((acc, xi) => acc + xi * xi, 0);\n    \n    this.slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);\n    this.intercept = (sumY - this.slope * sumX) / n;\n    \n    console.log(`Equação: y = ${this.slope.toFixed(2)}x + ${this.intercept.toFixed(2)}`);\n  }\n  \n  predict(x) {\n    return this.slope * x + this.intercept;\n  }\n}\n\n// Teste\nconst model = new LinearRegression();\nconst X = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\nconst y = [2.1, 3.9, 6.2, 8.1, 9.8, 12.1, 14.2, 15.9, 18.1, 20.2];\n\nmodel.fit(X, y);\nconsole.log(`Predição para x=15: ${model.predict(15).toFixed(2)}`);",
  "readOnly": false,
  "height": 450
}'></div>

---

## 🎓 10. Exercício Prático: Sistema de Partículas

Combine física, matemática e programação neste exercício!

### Tarefa

Crie um sistema onde partículas são atraídas por um ponto central, seguindo a lei da gravitação:

$$
F = G \frac{m_1 m_2}{r^2}
$$

### Simulação Base

<div data-matter='{
  "type": "gravity",
  "width": 700,
  "height": 400,
  "gravity": {"x": 0, "y": 1},
  "showControls": true
}'></div>

### Seu Código

<div data-monaco='{
  "language": "javascript",
  "code": "// Implemente sua versão aqui!\n// Dica: Use a biblioteca Matter.js\n\nclass Particle {\n  constructor(x, y, mass) {\n    this.x = x;\n    this.y = y;\n    this.mass = mass;\n    this.vx = 0;\n    this.vy = 0;\n  }\n  \n  attractTo(target) {\n    const G = 0.1; // Constante gravitacional\n    const dx = target.x - this.x;\n    const dy = target.y - this.y;\n    const distance = Math.sqrt(dx * dx + dy * dy);\n    \n    if (distance > 1) { // Evitar divisão por zero\n      const force = G * this.mass * target.mass / (distance * distance);\n      const ax = (force * dx / distance) / this.mass;\n      const ay = (force * dy / distance) / this.mass;\n      \n      this.vx += ax;\n      this.vy += ay;\n    }\n  }\n  \n  update() {\n    this.x += this.vx;\n    this.y += this.vy;\n  }\n}\n\n// Teste\nconst particle = new Particle(100, 100, 1);\nconst center = new Particle(400, 300, 10);\n\nparticle.attractTo(center);\nparticle.update();\n\nconsole.log(`Nova posição: (${particle.x.toFixed(2)}, ${particle.y.toFixed(2)})`);\nconsole.log(`Velocidade: (${particle.vx.toFixed(4)}, ${particle.vy.toFixed(4)})`);"
, "readOnly": false,
  "height": 500
}'></div>

---

## 🌟 11. Recurso Extra: Desenho de Conceitos

Use o canvas abaixo para desenhar e explicar conceitos:

<div data-fabric='{
  "width": 700,
  "height": 400,
  "mode": "shapes"
}'></div>

*Perfeito para desenhar árvores binárias, grafos, diagramas de classe, etc!*

---

## 📊 12. Estatística Descritiva Visual

### Distribuição Normal

<div data-plotly='{
  "data": [{
    "x": [-4, -3.8, -3.6, -3.4, -3.2, -3, -2.8, -2.6, -2.4, -2.2, -2, -1.8, -1.6, -1.4, -1.2, -1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8, 4],
    "y": [0.0001, 0.0003, 0.0006, 0.0012, 0.0024, 0.0044, 0.0079, 0.0136, 0.0224, 0.0355, 0.0540, 0.0790, 0.1109, 0.1497, 0.1942, 0.2420, 0.2897, 0.3332, 0.3683, 0.3910, 0.3989, 0.3910, 0.3683, 0.3332, 0.2897, 0.2420, 0.1942, 0.1497, 0.1109, 0.0790, 0.0540, 0.0355, 0.0224, 0.0136, 0.0079, 0.0044, 0.0024, 0.0012, 0.0006, 0.0003, 0.0001],
    "type": "scatter",
    "mode": "lines",
    "fill": "tozeroy",
    "line": {"color": "#41ff41"}
  }],
  "layout": {
    "title": "Distribuição Normal (μ=0, σ=1)",
    "xaxis": {"title": "x"},
    "yaxis": {"title": "P(x)"}
  }
}'></div>

### Fórmula da Distribuição Normal

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}
$$

Onde:
- $\mu$ é a média
- $\sigma$ é o desvio padrão
- $\pi \approx 3.14159$
- $e \approx 2.71828$

---

## 🎯 Conclusão

Esta demonstração avançada mostra que a plataforma KhromaAcademy agora suporta:

### ✅ Recursos Implementados

1. **📊 Plotly.js** - Gráficos científicos 2D/3D interativos
2. **📈 Chart.js** - Gráficos estatísticos e de dados
3. **🧮 Math.js** - Cálculos matemáticos simbólicos e numéricos
4. **💻 Monaco Editor** - Editor de código completo (mesmo do VSCode!)
5. **⚛️ Matter.js** - Simulações físicas realistas
6. **🎨 Fabric.js** - Canvas de desenho interativo
7. **🔷 Mermaid.js** - Diagramas e fluxogramas (já implementado)
8. **🎮 Three.js** - Visualizações 3D (já implementado)
9. **❓ Quizzes Interativos** - Com feedback imediato
10. **🎯 Exercícios Expandíveis** - Soluções detalhadas

### 🚀 Pronto para Ensinar Qualquer Disciplina!

Com estas ferramentas, você pode ensinar:

- **💻 Ciência da Computação** - Algoritmos, estruturas de dados, programação
- **🔬 Física** - Mecânica, cinemática, dinâmica
- **🧮 Matemática** - Cálculo, álgebra, estatística
- **📊 Ciência de Dados** - Análise, visualização, machine learning
- **🧪 Química** - Moléculas, reações (com bibliotecas adicionais)
- **🎨 Design & Arte** - Desenho, geometria, design generativo
- **🎵 Música** - Teoria musical, áudio (com bibliotecas adicionais)

**A plataforma está equipada para o futuro da educação interativa!** 🎓✨

