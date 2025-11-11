# Guia para IA - Como Usar a Pasta Tasks

Este arquivo contém regras e instruções para IAs sobre como trabalhar com a pasta `tasks/`.

## 📋 Regras Obrigatórias

### 1. Atualização Automática de Status

**SEMPRE que você fizer qualquer alteração relacionada a uma tarefa documentada:**

1. ✅ **Atualize o status** no arquivo MD correspondente
2. ✅ **Adicione uma entrada** na seção "Tentativas Realizadas" ou "Histórico"
3. ✅ **Atualize a seção "Próximos Passos"** se necessário
4. ✅ **Atualize o INDEX.md** se o status mudou

**Exemplo:**
```markdown
## Status
🟡 EM PROGRESSO (era 🔴 PENDENTE)

## Tentativas Realizadas
- [x] Tentativa anterior: Descrição
- [x] **Nova tentativa (data)**: Implementada solução X no arquivo Y
```

### 2. Criação de Novas Tarefas

**Sempre que identificar um problema, bug, ou necessidade de melhoria:**

1. ✅ **Crie um arquivo MD** na pasta apropriada usando os templates em `.templates/`
2. ✅ **Atualize o INDEX.md** adicionando a nova tarefa
3. ✅ **Use o template correto** para o tipo de tarefa

### 3. Ao Resolver uma Tarefa

**Quando uma tarefa for concluída:**

1. ✅ **Mude o status** para 🟢 CONCLUÍDO
2. ✅ **Adicione uma seção "Solução"** descrevendo o que foi feito
3. ✅ **Liste os arquivos modificados** na seção apropriada
4. ✅ **Atualize o INDEX.md** movendo para seção de concluídos (ou remova se preferir manter histórico)

**Exemplo:**
```markdown
## Status
🟢 CONCLUÍDO

## Solução Implementada
A solução foi implementada através de:
- Modificação no arquivo X
- Adição de regra CSS Y
- Ajuste no componente Z

## Arquivos Modificados
- `src/components/Component.ts`
- `src/styles/component.css`
```

### 4. Ao Trabalhar em uma Tarefa

**Antes de começar a trabalhar em uma tarefa:**

1. ✅ **Leia o arquivo MD completo** da tarefa
2. ✅ **Verifique o histórico** de tentativas anteriores
3. ✅ **Mude o status** para 🟡 EM PROGRESSO
4. ✅ **Atualize o INDEX.md** se necessário

**Durante o trabalho:**

1. ✅ **Documente cada tentativa** na seção "Tentativas Realizadas"
2. ✅ **Atualize "Próximos Passos"** conforme progride
3. ✅ **Adicione notas** se encontrar informações importantes

### 5. Estrutura de Pastas

**Use as pastas corretamente:**

- `fix-bugs/` - Apenas para bugs reais que precisam correção
- `features/` - Para novas funcionalidades planejadas
- `improvements/` - Para melhorias gerais (performance, UX, código)
- `refactoring/` - Para refatorações de código/arquitetura

**NÃO misture tipos de tarefas nas pastas erradas!**

### 6. Nomenclatura de Arquivos

**Use nomes descritivos e em kebab-case:**

✅ **Bom:**
- `cursor-toggle-button.md`
- `add-dark-mode-support.md`
- `optimize-bundle-size.md`

❌ **Ruim:**
- `bug1.md`
- `feature.md`
- `melhoria.md`

### 7. Conteúdo dos Arquivos

**Sempre inclua:**

- ✅ Título claro e descritivo
- ✅ Status atualizado
- ✅ Descrição detalhada
- ✅ Arquivos relacionados
- ✅ Histórico de tentativas
- ✅ Próximos passos

**Seja específico e detalhado!**

## 🔄 Fluxo de Trabalho Recomendado

### Quando o Usuário Reporta um Problema:

1. Criar arquivo em `fix-bugs/` usando template
2. Atualizar `INDEX.md`
3. Começar a trabalhar (mudar status para 🟡 EM PROGRESSO)
4. Documentar tentativas
5. Ao resolver, mudar para 🟢 CONCLUÍDO e documentar solução

### Quando Identificar um Bug Durante Desenvolvimento:

1. Criar arquivo em `fix-bugs/` imediatamente
2. Atualizar `INDEX.md`
3. Decidir se resolve agora ou depois (mudar status apropriadamente)

### Quando Implementar uma Feature:

1. Se já existe arquivo em `features/`, atualizar status para 🟡 EM PROGRESSO
2. Se não existe, criar usando template
3. Durante implementação, documentar progresso
4. Ao finalizar, mudar para 🟢 CONCLUÍDO

## 📝 Formato de Atualizações

### Adicionar Nova Tentativa:

```markdown
## Tentativas Realizadas
- [x] Tentativa anterior
- [x] **Nova tentativa (YYYY-MM-DD)**: 
  - O que foi feito
  - Resultado
  - Arquivos modificados: `caminho/arquivo.ts`
```

### Atualizar Próximos Passos:

```markdown
## Próximos Passos
- [x] Item concluído
- [ ] Novo item a fazer
- [ ] Item ainda pendente
```

## ⚠️ Importante

1. **NUNCA delete** arquivos de tarefas sem permissão explícita do usuário
2. **SEMPRE atualize** o status quando trabalhar em uma tarefa
3. **SEMPRE documente** o que foi feito
4. **MANTENHA** o INDEX.md atualizado
5. **USE** os templates para consistência

## 🎯 Exemplo Completo

**Situação:** Usuário reporta que o botão X não funciona

**Ações da IA:**

1. ✅ Verifica se já existe arquivo em `fix-bugs/` sobre isso
2. ✅ Se não existe, cria `fix-bugs/button-x-not-working.md` usando template
3. ✅ Atualiza `INDEX.md` adicionando na seção de bugs pendentes
4. ✅ Muda status para 🟡 EM PROGRESSO
5. ✅ Investiga o problema
6. ✅ Documenta tentativas no arquivo MD
7. ✅ Implementa solução
8. ✅ Muda status para 🟢 CONCLUÍDO
9. ✅ Adiciona seção "Solução Implementada"
10. ✅ Atualiza `INDEX.md` movendo para concluídos

## 📚 Referências

- Templates disponíveis em: `.templates/`
- Índice de tarefas: `INDEX.md`
- README principal: `README.md`

---

**Lembre-se:** Esta pasta é para organização e rastreamento. Sempre mantenha-a atualizada e bem documentada!

