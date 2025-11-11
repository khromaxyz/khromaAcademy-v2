<!-- 5a543ea0-bd14-4c01-aec9-f68e9123267e 70d7e0a2-6853-4f04-b489-7147ed691ef6 -->
# Refatorar Sistema de Resize do Chatbot Gemini

## Problema Identificado

O resize atual não está funcionando corretamente - o chatbot aumenta de tamanho mas não empurra o conteúdo principal para a esquerda. O problema está na combinação de `position: sticky`, flex layout e como a largura está sendo aplicada.

## Solução Proposta

### 1. Refatorar setupResize() em GeminiChatbot.ts

- Usar `requestAnimationFrame` para atualizações suaves durante o resize
- Garantir que o cálculo do diff esteja correto (arrastar para esquerda = aumentar)
- Aplicar largura diretamente no `docs-toc` com `!important`
- Adicionar `will-change: width` durante o resize para otimização
- Melhorar detecção do `docs-toc` usando querySelector mais robusto

### 2. Ajustar CSS do docs-toc

- Remover `position: sticky` durante o resize (ou usar `position: relative`)
- Garantir que `flex: 0 0 auto` não interfira com o resize
- Adicionar `will-change: width` quando `.resizing` está ativo
- Remover todas as transições durante resize

### 3. Ajustar CSS do docs-content-wrapper

- Garantir que `display: flex` e `flex-direction: row` estejam corretos
- Verificar que `main-scroll-area` com `flex: 1` responda imediatamente
- Adicionar `will-change: width` no wrapper durante resize

### 4. Melhorar handle de resize

- Aumentar área clicável se necessário
- Garantir que eventos não sej

### To-dos

- [x] Refatorar setupResize() em GeminiChatbot.ts: usar requestAnimationFrame, melhorar cálculo do diff, aplicar largura com !important no docs-toc
- [x] Ajustar CSS do docs-toc: remover position sticky durante resize, adicionar will-change, garantir flex correto
- [x] Ajustar docs-content-wrapper e main-scroll-area: garantir que flex layout responda imediatamente ao resize
- [x] Melhorar handle de resize: aumentar área clicável, melhorar feedback visual, garantir eventos não bloqueados
- [x] Testar resize: verificar que funciona em tempo real, conteúdo é empurrado, limites são respeitados