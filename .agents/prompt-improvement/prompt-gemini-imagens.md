# Prompt Melhorado: Adicionar Suporte a Imagens no Gemini

## Prompt Melhorado (Parágrafo)

Preciso adicionar suporte para envio de imagens anexadas no chatbot Gemini, permitindo que os usuários façam upload de arquivos de imagem através de um botão de anexo na interface do chat, convertendo essas imagens para o formato base64 ou multipart/form-data conforme necessário pela API do Gemini, e incluindo essas imagens nas partes da mensagem enviada ao serviço, garantindo que o histórico de conversa mantenha tanto o texto quanto as imagens enviadas, além de exibir visualmente as imagens anexadas nas mensagens do usuário antes do envio e processar adequadamente as respostas do modelo que possam fazer referência às imagens enviadas.

## Versão Original (Para Referência)

Preciso adicionar a funcionalidade de anexar imagens no chatbot Gemini. Os usuários devem poder fazer upload de imagens através de um botão na interface. As imagens devem ser convertidas para o formato que a API do Gemini aceita (base64 ou multipart). As imagens devem ser incluídas nas partes da mensagem quando enviadas. O histórico de conversa deve manter as imagens. A interface deve mostrar as imagens anexadas antes de enviar. As respostas do modelo devem processar corretamente quando há imagens na conversa.

## Contexto Técnico

- **Serviço atual**: `src/services/geminiService.ts` - envia apenas texto
- **Interface atual**: `src/components/DisciplineContent/GeminiChatbot.ts` - apenas input de texto
- **API Gemini**: Suporta imagens em `parts` com `inlineData` (base64) ou `fileData`
- **Formato necessário**: `parts: [{ text: string }]` → `parts: [{ text: string }, { inlineData: { mimeType: string, data: string } }]`

## Requisitos Técnicos Detalhados

1. Adicionar botão de anexo de imagem na interface do chat
2. Implementar input de arquivo com validação de tipo (jpg, png, gif, webp)
3. Converter imagens para base64
4. Atualizar interface `GeminiMessage` para suportar `inlineData`
5. Modificar `sendMessage` para incluir imagens nas partes
6. Atualizar histórico de conversa para manter imagens
7. Exibir preview das imagens anexadas antes do envio
8. Tratar respostas do modelo que referenciem imagens

