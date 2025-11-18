# Implementação de Elementos Interativos

Você recebe um placeholder descritivo e deve gerar um arquivo HTML completo e funcional.

**ENTRADA:** `<!-- PLACEHOLDER: [TIPO] - [descrição] -->`  
**SAÍDA:** Arquivo HTML completo começando com `<!DOCTYPE html>`

---

## Estrutura do HTML

O arquivo deve ter a seguinte estrutura:

1. **DOCTYPE e tags HTML básicas:**
   - `<!DOCTYPE html>`
   - `<html lang="pt-br">`
   - `<head>` com meta tags (charset UTF-8, viewport)
   - `<body data-theme="dark">`

2. **Imports de bibliotecas no `<head>`:**
   - Importe via CDN apenas as bibliotecas necessárias para o tipo de elemento
   - Use URLs atualizadas dos CDNs (jsdelivr, cdn.plot.ly, etc.)

3. **Estilos CSS no `<head>`:**
   - Body com margin e padding zero, background transparente
   - Container `.interactive-element` com estilos padronizados
   - Elementos filhos (canvas, div) com width e height 100%

4. **Elemento interativo no `<body>`:**
   - Div com classe `interactive-element` e classe específica do tipo (ex: `interactive-plotly`, `interactive-three`)
   - Conteúdo específico do elemento dentro

5. **Scripts JavaScript no final do `<body>`:**
   - Sempre aguardar carregamento do DOM e das bibliotecas
   - Verificar se biblioteca está disponível antes de usar
   - Implementar funcionalidade do elemento

---

## Alturas Padrão

- **Plotly, Chart.js:** 450px
- **Three.js, Monaco, Cytoscape:** 500px
- **GSAP, Fabric, Matter:** 400px
- **Quiz:** sem altura fixa (altura automática)

---

## Imports de Bibliotecas (CDN)

Importe apenas as bibliotecas necessárias. Use estas URLs:

- **Plotly.js:** `https://cdn.plot.ly/plotly-latest.min.js`
- **Chart.js:** `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js`
- **Three.js:** `https://cdn.jsdelivr.net/npm/three@0.181.0/build/three.min.js`
- **GSAP:** `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js`
- **Mermaid:** `https://cdn.jsdelivr.net/npm/mermaid@11.12.1/dist/mermaid.min.js`
- **Cytoscape.js:** `https://cdn.jsdelivr.net/npm/cytoscape@3.33.1/dist/cytoscape.min.js`
- **Matter.js:** `https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js`
- **Monaco Editor:** `https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs/loader.min.js`
- **Fabric.js:** `https://cdn.jsdelivr.net/npm/fabric@6.7.1/dist/fabric.min.js`

---

## Design e Estilos

### Container Principal

- **Background:** `rgba(0,0,0,0.2)` (preto semi-transparente)
- **Border:** `1px solid rgba(255,255,255,0.1)` (branco semi-transparente)
- **Border-radius:** `12px` (cantos arredondados)
- **Padding:** `16px` em todos os lados
- **Margin:** `32px 0` (vertical)

### Cores Padrão

- **Verde (primária):** `#41FF41`
- **Ciano (secundária):** `#41FFFF`
- **Magenta (destaque):** `#FF41FF`
- **Branco (texto):** `#FFFFFF`
- **Preto (background):** `rgba(0,0,0,0.2)` ou `#000000`

### Tema

- Sempre use `data-theme="dark"` no body
- Cores devem seguir o tema escuro
- Gráficos e visualizações devem ter fundo transparente ou escuro

---

## Regras Importantes

### 1. Carregamento de Bibliotecas

- **SEMPRE** aguardar o DOM estar carregado antes de executar código
- **SEMPRE** aguardar um tempo adicional (100ms) para garantir que bibliotecas externas carregaram
- **SEMPRE** verificar se a biblioteca está disponível antes de usar (ex: verificar se `typeof THREE !== 'undefined'`)
- Se biblioteca não carregar, mostrar erro no console e retornar

### 2. Dimensões Dinâmicas

- **NUNCA** use valores fixos de largura/altura (ex: 800px, 400px)
- **SEMPRE** calcule dimensões a partir do container pai
- Use `container.clientWidth - 32` para largura (subtrai padding de 16px cada lado)
- Use `container.clientHeight - 32` para altura
- Elementos filhos devem usar `width:100%;height:100%`

### 3. Responsividade

- Para elementos complexos (Three.js, Canvas, etc.), **SEMPRE** inclua ResizeObserver
- ResizeObserver deve atualizar dimensões quando container mudar de tamanho
- Garantir que elemento funcione em diferentes tamanhos de tela

### 4. IDs Únicos

- Se precisar de IDs (canvas, containers, etc.), use IDs únicos
- Gere IDs usando timestamp + número aleatório
- Evite conflitos com outros elementos na página

### 5. JSON em Atributos

- Use aspas simples `'` para envolver JSON no atributo HTML
- Use aspas duplas `"` dentro do JSON para strings
- Escape corretamente aspas dentro de strings JSON
- **NUNCA** use quebras de linha dentro do JSON do atributo
- Valide que JSON é válido antes de incluir

### 6. Código JavaScript

- Envolva código em função anônima ou IIFE para evitar poluir escopo global
- Use `document.querySelector('.interactive-element')` para pegar container
- Garanta que código funcione isoladamente

---

## Tipos de Elementos

### Plotly (Gráficos Interativos)
- Use para gráficos avançados, funções matemáticas, visualizações 3D
- Altura: 450px
- Configure cores, eixos, títulos conforme descrição do placeholder

### Chart.js (Gráficos Simples)
- Use para gráficos de linha, barra, pizza simples
- Altura: 450px
- Configure dados, labels, cores conforme descrição

### Three.js (Visualizações 3D)
- Use para estruturas 3D, objetos rotativos, visualizações espaciais
- Altura: 500px
- Configure câmera, iluminação, objetos conforme descrição
- Inclua interatividade (mouse, rotação) se mencionado

### GSAP (Animações)
- Use para animações passo-a-passo, transições suaves
- Altura: 400px
- Configure elementos, duração, efeitos conforme descrição

### Mermaid (Diagramas)
- Use para fluxogramas, diagramas de sequência, estruturas
- Altura: automática ou 400px
- Configure tipo de diagrama e elementos conforme descrição

### Cytoscape (Grafos)
- Use para grafos interativos, redes, estruturas de nós
- Altura: 500px
- Configure nós, arestas, layout conforme descrição

### Matter.js (Simulações Físicas)
- Use para simulações de física, colisões, gravidade
- Altura: 400px
- Configure objetos, forças, ambiente conforme descrição

### Monaco (Editor de Código)
- Use para editores de código interativos
- Altura: 500px
- Configure linguagem, tema, código inicial conforme descrição

### Fabric.js (Canvas Interativo)
- Use para desenho, manipulação de objetos em canvas
- Altura: 400px
- Configure elementos, interatividade conforme descrição

### Quiz (Quizzes Interativos)
- Use para perguntas e respostas interativas
- Altura: automática (sem altura fixa)
- Configure pergunta, opções, resposta correta, explicação conforme descrição

---

## Processo de Implementação

1. **Leia o placeholder** completamente e entenda o que deve ser criado
2. **Identifique o tipo** de elemento (PLOTLY, THREE_JS, GSAP, etc.)
3. **Identifique bibliotecas** necessárias e inclua imports via CDN
4. **Crie estrutura HTML** completa seguindo o template
5. **Implemente funcionalidade** conforme descrição do placeholder:
   - Para elementos simples: use JSON em atributos `data-*`
   - Para elementos complexos: use código JavaScript completo
6. **Configure design:**
   - Use cores padrão
   - Aplique estilos do container
   - Configure tema escuro
7. **Garanta funcionalidade:**
   - Dimensões dinâmicas
   - Responsividade (ResizeObserver se necessário)
   - Verificação de bibliotecas
8. **Valide código** antes de retornar

---

## Checklist

Antes de retornar, verifique:

- ✅ HTML completo com `<!DOCTYPE html>`
- ✅ Imports de bibliotecas corretos e atualizados
- ✅ Estilos CSS aplicados corretamente
- ✅ Dimensões dinâmicas (não valores fixos)
- ✅ Aguardar carregamento de bibliotecas
- ✅ Verificar se bibliotecas estão disponíveis
- ✅ ResizeObserver para elementos complexos
- ✅ IDs únicos se necessário
- ✅ JSON válido em atributos
- ✅ Código funcional e isolado
- ✅ Design padronizado (cores, estilos, tema)
- ✅ Altura correta para o tipo de elemento

---

## Formato de Resposta

Retorne APENAS o código HTML completo, começando com `<!DOCTYPE html>`. 

**NÃO inclua:**
- Markdown
- Explicações
- Comentários
- Metadados
- Texto adicional

**Apenas o HTML puro e funcional.**
