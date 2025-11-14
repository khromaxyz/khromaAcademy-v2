/**
 * Serviço para comunicação com a API do Google Gemini
 */

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

interface GeminiRequest {
  contents: GeminiMessage[];
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

interface CountTokensResponse {
  totalTokens: number;
  error?: {
    message: string;
    code: number;
  };
}

class GeminiService {
  private apiKey: string;
  private model: string = 'gemini-flash-lite-latest';
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly MODEL_STORAGE_KEY = 'gemini-chatbot-model';
  private readonly API_KEY_STORAGE_KEY = 'gemini-chatbot-api-key';
  private readonly AVAILABLE_MODELS = ['gemini-2.5-pro', 'gemini-flash-lite-latest', 'gemini-flash-lite'];

  constructor() {
    // Obter API key da variável de ambiente ou localStorage
    this.apiKey = this.getApiKey();
    
    if (!this.apiKey) {
      console.warn('⚠️ API key do Gemini não encontrada. Configure-a nas configurações do chatbot.');
      console.log('🔍 Debug - import.meta.env:', import.meta.env);
      console.log('🔍 Debug - VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY);
    } else {
      console.log('✅ API key do Gemini carregada com sucesso');
    }

    // Carregar modelo salvo do localStorage
    this.loadModelFromStorage();
  }

  /**
   * Obtém a API key da variável de ambiente ou do localStorage
   */
  private getApiKey(): string {
    // Prioridade: variável de ambiente > localStorage
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (envKey) {
      return envKey;
    }
    
    // Tentar obter do localStorage
    try {
      const storedKey = localStorage.getItem(this.API_KEY_STORAGE_KEY);
      if (storedKey) {
        return storedKey;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao ler API key do localStorage:', error);
    }
    
    return '';
  }

  /**
   * Define a API key e salva no localStorage
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey.trim();
    
    // Salvar no localStorage
    try {
      if (this.apiKey) {
        localStorage.setItem(this.API_KEY_STORAGE_KEY, this.apiKey);
        console.log('✅ API key do Gemini salva com sucesso');
      } else {
        localStorage.removeItem(this.API_KEY_STORAGE_KEY);
        console.log('✅ API key do Gemini removida');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar API key no localStorage:', error);
    }
  }

  /**
   * Obtém a API key atual (sem expor a chave real)
   */
  getApiKeyStatus(): { configured: boolean; source: 'env' | 'localStorage' | 'none' } {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (envKey) {
      return { configured: true, source: 'env' };
    }
    
    try {
      const storedKey = localStorage.getItem(this.API_KEY_STORAGE_KEY);
      if (storedKey) {
        return { configured: true, source: 'localStorage' };
      }
    } catch (error) {
      console.warn('⚠️ Erro ao verificar API key no localStorage:', error);
    }
    
    return { configured: false, source: 'none' };
  }

  /**
   * Envia uma mensagem para o Gemini e retorna a resposta
   * @param message - Texto da mensagem
   * @param images - Array opcional de imagens em base64 (sem prefixo data:)
   * @param conversationHistory - Histórico de conversa
   * @param systemInstruction - Instrução de sistema opcional
   */
  /**
   * Verifica se o erro indica que o modelo está sobrecarregado
   */
  private isOverloadedError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes('overloaded') ||
      errorMessage.includes('resource exhausted') ||
      errorMessage.includes('quota exceeded') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('503') ||
      errorMessage.includes('429')
    );
  }

  /**
   * Aguarda um tempo com backoff exponencial
   */
  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendMessage(
    message: string,
    images?: Array<{ mimeType: string; data: string }>,
    conversationHistory: GeminiMessage[] = [],
    systemInstruction?: string,
    pdfs?: Array<{ mimeType: string; data: string }>
  ): Promise<string> {
    // Atualizar API key antes de usar (pode ter sido configurada no modal)
    this.apiKey = this.getApiKey();
    
    if (!this.apiKey) {
      throw new Error('API key do Gemini não configurada. Configure-a nas configurações do chatbot.');
    }

    // Usar apenas o modelo selecionado (sem fallback)
    const modelToUse = this.model || 'gemini-flash-lite-latest';
    
    // Verificar se o modelo é válido
    if (!this.AVAILABLE_MODELS.includes(modelToUse)) {
      throw new Error(`Modelo inválido: ${modelToUse}. Configure um modelo válido.`);
    }

    console.log(`🔄 [GeminiService] Usando modelo: ${modelToUse}`);

    let lastError: Error | null = null;

    // Tentar até 3 vezes com backoff exponencial (apenas o mesmo modelo)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await this.sendMessageWithModel(
          message,
          images,
          conversationHistory,
          systemInstruction,
          pdfs,
          modelToUse
        );
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Se não for erro de sobrecarga, não tenta novamente
        if (!this.isOverloadedError(lastError)) {
          console.error(`❌ [GeminiService] Erro não relacionado a sobrecarga: ${lastError.message}`);
          throw lastError; // Lança o erro imediatamente
        }
        
        // Se for último attempt, lança o erro
        if (attempt === 3) {
          console.error(`❌ [GeminiService] Modelo ${modelToUse} falhou após 3 tentativas.`);
          throw lastError;
        }
        
        // Backoff exponencial: 2s, 4s, 8s
        const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ [GeminiService] Modelo sobrecarregado. Aguardando ${waitTime}ms antes de tentar novamente (tentativa ${attempt}/3)...`);
        await this.wait(waitTime);
      }
    }

    // Não deveria chegar aqui, mas por segurança
    throw lastError || new Error('Erro desconhecido ao comunicar com a API do Gemini');
  }

  /**
   * Envia mensagem com um modelo específico (sem retry)
   */
  private async sendMessageWithModel(
    message: string,
    images?: Array<{ mimeType: string; data: string }>,
    conversationHistory: GeminiMessage[] = [],
    systemInstruction?: string,
    pdfs?: Array<{ mimeType: string; data: string }>,
    modelToUse?: string
  ): Promise<string> {
    // Construir partes da mensagem
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
    
    // Adicionar texto se houver
    if (message.trim()) {
      parts.push({ text: message });
    }
    
    // Adicionar PDFs primeiro (se houver)
    if (pdfs && pdfs.length > 0) {
      for (const pdf of pdfs) {
        parts.push({
          inlineData: {
            mimeType: pdf.mimeType, // application/pdf
            data: pdf.data, // Base64 sem prefixo
          },
        });
      }
    }
    
    // Adicionar imagens se houver
    if (images && images.length > 0) {
      for (const image of images) {
        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data, // Já deve vir sem o prefixo data:image/...;base64,
          },
        });
      }
    }

    // Construir histórico de conversa + nova mensagem
    const contents: GeminiMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        parts,
      },
    ];

    const requestBody: GeminiRequest = {
      contents,
    };

    // Adicionar system instruction se fornecida
    if (systemInstruction && systemInstruction.trim()) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    // Usar modelo fornecido ou o atual
    let model = modelToUse || this.model || 'gemini-flash-lite-latest';
    
    // Verificar se o modelo é válido
    if (!this.AVAILABLE_MODELS.includes(model)) {
      console.error(`❌ [GeminiService] Modelo inválido: ${model}. Usando padrão.`);
      model = 'gemini-flash-lite-latest';
    }
    
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
    console.log(`🔍 [GeminiService] Enviando requisição para modelo: ${model}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Erro na API: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Erro desconhecido da API');
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma resposta recebida do modelo');
    }

    const text = data.candidates[0].content.parts[0]?.text || 'Sem resposta do modelo';
    return text;
  }

  /**
   * Conta os tokens de um conteúdo completo (contents + systemInstruction)
   * @param contents - Histórico de conversa
   * @param systemInstruction - Instrução de sistema opcional
   * @returns Número total de tokens
   */
  async countTokens(
    contents: GeminiMessage[],
    systemInstruction?: string
  ): Promise<number> {
    // Atualizar API key antes de usar (pode ter sido configurada no modal)
    this.apiKey = this.getApiKey();
    
    if (!this.apiKey) {
      throw new Error('API key do Gemini não configurada. Configure-a nas configurações do chatbot.');
    }

    try {
      const requestBody: GeminiRequest = {
        contents,
      };

      // Adicionar system instruction se fornecida
      if (systemInstruction && systemInstruction.trim()) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const url = `${this.baseUrl}/models/${this.model}:countTokens?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Erro na API: ${response.status} ${response.statusText}`
        );
      }

      const data: CountTokensResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Erro desconhecido da API');
      }

      return data.totalTokens || 0;
    } catch (error) {
      console.error('Erro ao contar tokens:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao contar tokens');
    }
  }

  /**
   * Verifica se o serviço está configurado corretamente
   * Verifica dinamicamente para permitir que funcione após configurar no modal
   */
  isConfigured(): boolean {
    // Sempre verifica a variável de ambiente e localStorage diretamente
    const currentKey = this.getApiKey();
    
    // Atualiza a API key se foi configurada
    if (currentKey && currentKey !== this.apiKey) {
      this.apiKey = currentKey;
      console.log('✅ API key do Gemini configurada');
    }
    
    return !!currentKey;
  }

  /**
   * Carrega o modelo salvo do localStorage
   */
  private loadModelFromStorage(): void {
    try {
      const savedModel = localStorage.getItem(this.MODEL_STORAGE_KEY);
      if (savedModel && this.AVAILABLE_MODELS.includes(savedModel)) {
        this.model = savedModel;
        console.log(`✅ Modelo do Gemini carregado: ${this.model}`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar modelo do localStorage:', error);
    }
  }

  /**
   * Define o modelo a ser usado
   * @param model - Nome do modelo (deve ser um dos modelos disponíveis)
   */
  setModel(model: string): void {
    if (!this.AVAILABLE_MODELS.includes(model)) {
      console.warn(`⚠️ Modelo inválido: ${model}. Modelos disponíveis: ${this.AVAILABLE_MODELS.join(', ')}`);
      return;
    }

    this.model = model;
    
    // Salvar no localStorage
    try {
      localStorage.setItem(this.MODEL_STORAGE_KEY, model);
      console.log(`✅ [GeminiService] Modelo atualizado para: ${this.model}`);
    } catch (error) {
      console.warn('⚠️ Erro ao salvar modelo no localStorage:', error);
    }
  }

  /**
   * Obtém o modelo atual
   * @returns Nome do modelo atual
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Obtém a lista de modelos disponíveis
   * @returns Array com os nomes dos modelos disponíveis
   */
  getAvailableModels(): string[] {
    return [...this.AVAILABLE_MODELS];
  }

  /**
   * Carrega a system instruction completa do arquivo MD (contém instruções + templates de prompts)
   */
  private async loadSystemInstruction(): Promise<{ 
    systemInstruction: string; 
    promptTemplate: string; 
    modificationTemplate: string;
    contextTemplate: string;
  } | null> {
    try {
      const response = await fetch('/system-instructions/gemini-system-instruction-discipline-creator.md');
      if (!response.ok) {
        console.warn('⚠️ Não foi possível carregar system instruction, usando padrão');
        return null;
      }
      const content = await response.text();
      
      // Separar system instruction do prompt template
      // O primeiro "---" separa system instruction do prompt de geração
      // O segundo "---" separa prompt de geração do prompt de modificação
      // O terceiro "---" separa prompt de modificação do prompt de contexto
      const firstSeparator = content.indexOf('---');
      
      if (firstSeparator === -1) {
        // Se não houver separador, usar tudo como system instruction
        return {
          systemInstruction: content,
          promptTemplate: '',
          modificationTemplate: '',
          contextTemplate: ''
        };
      }
      
      const systemInstruction = content.substring(0, firstSeparator).trim();
      const afterFirstSeparator = content.substring(firstSeparator + 3).trim();
      
      // Procurar segundo separador (para prompt de modificação)
      const secondSeparator = afterFirstSeparator.indexOf('---');
      
      let promptTemplate: string;
      let modificationTemplate: string;
      let contextTemplate: string;
      
      if (secondSeparator === -1) {
        // Só há um separador, então tudo após é o prompt de geração
        promptTemplate = afterFirstSeparator;
        modificationTemplate = '';
        contextTemplate = '';
      } else {
        // Há pelo menos dois separadores
        promptTemplate = afterFirstSeparator.substring(0, secondSeparator).trim();
        const afterSecondSeparator = afterFirstSeparator.substring(secondSeparator + 3).trim();
        
        // Procurar terceiro separador (para prompt de contexto)
        const thirdSeparator = afterSecondSeparator.indexOf('---');
        
        if (thirdSeparator === -1) {
          // Só há dois separadores
          modificationTemplate = afterSecondSeparator;
          contextTemplate = '';
        } else {
          // Há três separadores
          modificationTemplate = afterSecondSeparator.substring(0, thirdSeparator).trim();
          contextTemplate = afterSecondSeparator.substring(thirdSeparator + 3).trim();
        }
      }
      
      return {
        systemInstruction,
        promptTemplate,
        modificationTemplate,
        contextTemplate
      };
    } catch (error) {
      console.warn('⚠️ Erro ao carregar system instruction:', error);
      return null;
    }
  }

  /**
   * Gera a estrutura de uma disciplina usando IA
   * @param input - Informações da disciplina fornecidas pelo usuário
   * @param existingDisciplines - Lista de disciplinas existentes para sugerir pré-requisitos
   * @param pdfFiles - Arquivos PDF em base64 (opcional)
   * @returns Estrutura gerada da disciplina em formato JSON
   */
  async generateDisciplineStructure(
    input: {
      nome: string;
      curso?: string;
      periodo: string;
      ementa?: string;
      contextoAdicional?: string;
    },
    existingDisciplines: Array<{ id: string; title: string; code: string; syllabus: string[] }> = [],
    pdfFiles: Array<{ mimeType: string; data: string }> = []
  ): Promise<{
    modules?: Array<{
      id: string;
      title: string;
      description?: string;
      order: number;
      subModules: Array<{
        id: string;
        title: string;
        description?: string;
        order: number;
      }>;
    }>;
    syllabus: string[];
    prerequisites: string[];
    code: string;
    color: string;
    position: { x: number; y: number };
  }> {
    // Carregar system instruction e prompt template (arquivo único)
    const loadedContent = await this.loadSystemInstruction();
    
    // Se não conseguir carregar, usar padrões
    let systemInstruction: string;
    let promptTemplate: string;
    
    if (!loadedContent) {
      systemInstruction = `Você é um assistente especializado em criar estruturas de disciplinas acadêmicas. Gere APENAS a ESTRUTURA (sem conteúdo textual detalhado) de uma disciplina.`;
      promptTemplate = `Com base nas seguintes informações, gere APENAS a ESTRUTURA (sem conteúdo textual detalhado) de uma disciplina:

Nome: {{NOME}}
Curso: {{CURSO}}
Período: {{PERIODO}}
Ementa: {{EMENTA}}
Contexto adicional: {{CONTEXTO_ADICIONAL}}
{{DISCIPLINAS_EXISTENTES}}

IMPORTANTE:
1. Gere apenas uma lista de tópicos/módulos do syllabus (apenas títulos, sem descrições detalhadas)
2. Sugira pré-requisitos baseados nas disciplinas existentes (use os IDs fornecidos)
3. Sugira um código para a disciplina (formato curto, ex: "ALG", "ED", "IA")
4. Sugira uma cor da paleta: {{CORES_DISPONIVEIS}}
5. Sugira uma posição no grafo (x e y de 0 a 100)

Formato de resposta (JSON válido, sem markdown, sem código, apenas JSON puro):
{
  "syllabus": ["Tópico 1", "Tópico 2", "Tópico 3", ...],
  "prerequisites": ["id-disciplina-1", "id-disciplina-2"],
  "code": "CODIGO",
  "color": "#41FF41",
  "position": { "x": 50, "y": 50 }
}

Gere entre 5 e 12 tópicos no syllabus. Os tópicos devem ser progressivos e lógicos para o curso.`;
    } else {
      systemInstruction = loadedContent.systemInstruction;
      // Remover o título "## Prompt para Geração" se existir
      promptTemplate = loadedContent.promptTemplate
        .replace(/^##\s*Prompt\s+para\s+Geração\s*\n*/i, '')
        .trim() || systemInstruction;
    }

    // Construir contexto das disciplinas existentes
    const existingContext = existingDisciplines.length > 0
      ? `\n\nDisciplinas existentes no sistema (para referência de pré-requisitos):\n${existingDisciplines.map(d => `- ${d.code}: ${d.title} (ID: ${d.id})`).join('\n')}`
      : '';

    // Paleta de cores disponíveis
    const availableColors = ['#41FF41', '#4141FF', '#FF41FF', '#41FFFF', '#F2FF41', '#FF4141'];

    // Substituir placeholders no template
    const prompt = promptTemplate
      .replace(/\{\{NOME\}\}/g, input.nome)
      .replace(/\{\{CURSO\}\}/g, input.curso || 'Não especificado')
      .replace(/\{\{PERIODO\}\}/g, input.periodo)
      .replace(/\{\{EMENTA\}\}/g, input.ementa || 'Não fornecida')
      .replace(/\{\{CONTEXTO_ADICIONAL\}\}/g, input.contextoAdicional || 'Nenhum')
      .replace(/\{\{DISCIPLINAS_EXISTENTES\}\}/g, existingContext)
      .replace(/\{\{CORES_DISPONIVEIS\}\}/g, availableColors.join(', '));

    try {
      const currentModel = this.model || 'gemini-flash-lite-latest';
      console.log(`🔄 [GeminiService] Gerando estrutura com modelo: ${currentModel}`);

      // Enviar mensagem com PDFs e system instruction (com retry automático no mesmo modelo)
      const response = await this.sendMessage(
        prompt,
        undefined, // images
        [], // conversationHistory
        systemInstruction,
        pdfFiles.length > 0 ? pdfFiles : undefined
      );
      
      // Tentar extrair JSON da resposta
      let jsonStr = response.trim();
      
      // Remover markdown code blocks se houver
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Tentar encontrar JSON entre chaves
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);

      // Processar módulos se existirem
      let modules: Array<{
        id: string;
        title: string;
        description?: string;
        order: number;
        subModules: Array<{
          id: string;
          title: string;
          description?: string;
          order: number;
        }>;
      }> | undefined = undefined;

      if (Array.isArray(parsed.modules) && parsed.modules.length > 0) {
        modules = parsed.modules
          .filter((m: any) => m && typeof m === 'object' && typeof m.title === 'string' && m.title.trim())
          .map((m: any, index: number) => ({
            id: typeof m.id === 'string' && m.id.trim() ? m.id : `module-${index + 1}`,
            title: m.title.trim(),
            description: typeof m.description === 'string' ? m.description.trim() : undefined,
            order: typeof m.order === 'number' ? m.order : index,
            subModules: Array.isArray(m.subModules)
              ? m.subModules
                  .filter((sm: any) => sm && typeof sm === 'object' && typeof sm.title === 'string' && sm.title.trim())
                  .map((sm: any, smIndex: number) => ({
                    id: typeof sm.id === 'string' && sm.id.trim() ? sm.id : `submodule-${index + 1}-${smIndex + 1}`,
                    title: sm.title.trim(),
                    description: typeof sm.description === 'string' ? sm.description.trim() : undefined,
                    order: typeof sm.order === 'number' ? sm.order : smIndex,
                  }))
              : [],
          }))
          .filter((m: any) => m.subModules.length > 0); // Apenas módulos com submódulos

        // Se não houver módulos válidos, não incluir
        if (modules.length === 0) {
          modules = undefined;
        }
      }

      // Validar e normalizar resposta
      const result = {
        modules,
        syllabus: Array.isArray(parsed.syllabus) ? parsed.syllabus.filter((t: any) => typeof t === 'string' && t.trim()) : [],
        prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites.filter((p: any) => typeof p === 'string') : [],
        code: typeof parsed.code === 'string' ? parsed.code.toUpperCase().trim() : input.nome.substring(0, 3).toUpperCase(),
        color: typeof parsed.color === 'string' && availableColors.includes(parsed.color.toUpperCase()) 
          ? parsed.color.toUpperCase() 
          : availableColors[0],
        position: {
          x: typeof parsed.position?.x === 'number' ? Math.max(0, Math.min(100, parsed.position.x)) : 50,
          y: typeof parsed.position?.y === 'number' ? Math.max(0, Math.min(100, parsed.position.y)) : 50,
        },
      };

      // Garantir que há pelo menos alguns tópicos no syllabus (compatibilidade)
      if (result.syllabus.length === 0) {
        // Se houver módulos, gerar syllabus a partir deles
        if (result.modules && result.modules.length > 0) {
          result.syllabus = result.modules.map(m => m.title);
        } else {
          result.syllabus = [
            'Introdução',
            'Conceitos Fundamentais',
            'Aplicações Práticas',
            'Avaliação',
          ];
        }
      }

      return result;
    } catch (error) {
      console.error('Erro ao gerar estrutura:', error);
      // Retornar estrutura padrão em caso de erro
      return {
        modules: undefined,
        syllabus: [
          'Introdução',
          'Conceitos Fundamentais',
          'Aplicações Práticas',
          'Avaliação',
        ],
        prerequisites: [],
        code: input.nome.substring(0, 3).toUpperCase(),
        color: availableColors[0],
        position: { x: 50, y: 50 },
      };
    }
  }

  /**
   * Gera um contexto completo e detalhado da disciplina
   * @param input - Informações da disciplina
   * @param structure - Estrutura gerada da disciplina
   * @param existingDisciplines - Lista de disciplinas existentes
   * @param pdfFiles - Arquivos PDF em base64 (opcional)
   * @returns Contexto completo em markdown
   */
  async generateDisciplineContext(
    input: {
      nome: string;
      curso?: string;
      periodo: string;
      ementa?: string;
      contextoAdicional?: string;
    },
    structure: {
      syllabus: string[];
      prerequisites: string[];
      code: string;
    },
    existingDisciplines: Array<{ id: string; title: string; code: string; syllabus: string[] }> = [],
    pdfFiles: Array<{ mimeType: string; data: string }> = []
  ): Promise<string> {
    // Carregar system instruction e templates
    const loadedContent = await this.loadSystemInstruction();
    
    // Se não conseguir carregar, usar padrão
    let systemInstruction: string;
    let contextTemplate: string;
    
    if (!loadedContent) {
      // System instruction específica para contexto (não para estrutura JSON)
      systemInstruction = `Você é um assistente especializado em criar contextos acadêmicos completos e detalhados para disciplinas. Você deve retornar APENAS texto em formato MARKDOWN estruturado, NUNCA JSON. O contexto será usado para gerar conteúdo textual posteriormente.`;
      contextTemplate = `Com base em TODAS as informações fornecidas, crie um CONTEXTO COMPLETO E DETALHADO da disciplina em MARKDOWN. Seja EXTENSIVO, ABRANGENTE e DETALHADO (pelo menos 2000-3000 palavras). NUNCA retorne JSON, apenas MARKDOWN estruturado.`;
    } else {
      // System instruction específica para contexto (sobrescreve a de estrutura)
      systemInstruction = `Você é um assistente especializado em criar contextos acadêmicos completos e detalhados para disciplinas. Você deve retornar APENAS texto em formato MARKDOWN estruturado, NUNCA JSON. O contexto será usado para gerar conteúdo textual posteriormente.`;
      // Remover o título "## Prompt para Geração de Contexto Completo" se existir
      contextTemplate = loadedContent.contextTemplate
        .replace(/^##\s*Prompt\s+para\s+Geração\s+de\s+Contexto\s+Completo\s*\n*/i, '')
        .trim() || systemInstruction;
    }

    // Construir contexto das disciplinas existentes
    const existingContext = existingDisciplines.length > 0
      ? `\n\nDisciplinas existentes no sistema:\n${existingDisciplines.map(d => `- ${d.code}: ${d.title} (ID: ${d.id})`).join('\n')}`
      : '';

    // Construir estrutura do syllabus
    const syllabusStructure = structure.syllabus.length > 0
      ? `\n\nEstrutura do Syllabus:\n${structure.syllabus.map((topic, index) => `${index + 1}. ${topic}`).join('\n')}`
      : '';

    // Construir informações de pré-requisitos
    const prerequisitesInfo = structure.prerequisites.length > 0
      ? structure.prerequisites.map(prereqId => {
          const prereq = existingDisciplines.find(d => d.id === prereqId);
          if (prereq) {
            return `- **${prereq.code} - ${prereq.title}** (ID: ${prereq.id})`;
          }
          return `- ${prereqId}`;
        }).join('\n')
      : 'Nenhum pré-requisito especificado';

    // Substituir placeholders no template
    let prompt = contextTemplate
      .replace(/\{\{NOME\}\}/g, input.nome)
      .replace(/\{\{CURSO\}\}/g, input.curso || 'Não especificado')
      .replace(/\{\{PERIODO\}\}/g, input.periodo)
      .replace(/\{\{CODIGO\}\}/g, structure.code)
      .replace(/\{\{EMENTA\}\}/g, input.ementa || 'Não fornecida')
      .replace(/\{\{CONTEXTO_ADICIONAL\}\}/g, input.contextoAdicional || 'Nenhum')
      .replace(/\{\{PRE_REQUISITOS\}\}/g, prerequisitesInfo)
      .replace(/\{\{DISCIPLINAS_EXISTENTES\}\}/g, existingContext)
      .replace(/\{\{ESTRUTURA_SYLLABUS\}\}/g, syllabusStructure);

    // Adicionar instrução explícita no início do prompt para garantir formato markdown
    prompt = `**IMPORTANTE: Retorne APENAS texto em MARKDOWN, NUNCA JSON. Não use blocos de código JSON.**\n\n${prompt}`;

    try {
      const currentModel = this.model || 'gemini-flash-lite-latest';
      console.log(`📝 [GeminiService] Gerando contexto completo para: ${input.nome} com modelo: ${currentModel}`);
      
      // Enviar mensagem com PDFs e system instruction (com retry automático no mesmo modelo)
      const response = await this.sendMessage(
        prompt,
        undefined, // images
        [], // conversationHistory
        systemInstruction,
        pdfFiles.length > 0 ? pdfFiles : undefined
      );
      
      console.log(`✅ [GeminiService] Contexto gerado com sucesso (${response.length} caracteres)`);
      return response;
    } catch (error) {
      console.error('❌ [GeminiService] Erro ao gerar contexto:', error);
      throw new Error(`Erro ao gerar contexto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gera conteúdo educacional completo da disciplina
   * @param discipline - Disciplina completa com todos os metadados
   * @param existingDisciplines - Lista de disciplinas existentes
   * @param pdfFiles - Arquivos PDF em base64 (opcional)
   * @returns Conteúdo educacional completo em markdown
   */
  async generateDisciplineContent(
    discipline: {
      id: string;
      code: string;
      title: string;
      period: number | string;
      description: string;
      syllabus: string[];
      modules?: Array<{
        id: string;
        title: string;
        description?: string;
        order: number;
        subModules: Array<{
          id: string;
          title: string;
          description?: string;
          order: number;
        }>;
      }>;
      prerequisites: string[];
      context?: string;
      contextGeneratedAt?: string;
    },
    existingDisciplines: Array<{ id: string; title: string; code: string; syllabus: string[] }> = [],
    pdfFiles: Array<{ mimeType: string; data: string }> = []
  ): Promise<string> {
    // Carregar system instruction do arquivo
    let systemInstruction: string;
    let promptTemplate: string;
    
    try {
      const response = await fetch('/system-instructions/gemini-prompt-content-generation.md');
      if (response.ok) {
        const content = await response.text();
        // Separar system instruction do prompt template
        const separatorIndex = content.indexOf('---');
        if (separatorIndex !== -1) {
          systemInstruction = content.substring(0, separatorIndex).trim();
          const afterSeparator = content.substring(separatorIndex + 3).trim();
          // Procurar pelo prompt template (após "## Prompt para Geração de Conteúdo Completo")
          const promptIndex = afterSeparator.indexOf('## Prompt para Geração de Conteúdo Completo');
          if (promptIndex !== -1) {
            promptTemplate = afterSeparator.substring(promptIndex).replace(/^##\s*Prompt\s+para\s+Geração\s+de\s+Conteúdo\s+Completo\s*\n*/i, '').trim();
          } else {
            promptTemplate = afterSeparator;
          }
        } else {
          systemInstruction = content;
          promptTemplate = '';
        }
      } else {
        throw new Error('Arquivo não encontrado');
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível carregar system instruction, usando padrão');
      systemInstruction = `Você é um assistente especializado em criar conteúdo educacional completo, didático e estruturado para disciplinas acadêmicas. Você deve retornar APENAS texto em formato MARKDOWN estruturado, NUNCA JSON. O conteúdo será usado diretamente pelos alunos.`;
      promptTemplate = `Gere um conteúdo educacional COMPLETO, DIDÁTICO e ESTRUTURADO em MARKDOWN para a disciplina fornecida.`;
    }

    // Construir estrutura de módulos formatada
    let estruturaModulos = '';
    if (discipline.modules && discipline.modules.length > 0) {
      estruturaModulos = discipline.modules
        .sort((a, b) => a.order - b.order)
        .map(module => {
          const subModulesText = module.subModules
            .sort((a, b) => a.order - b.order)
            .map(sub => `    - ${sub.title}${sub.description ? `: ${sub.description}` : ''}`)
            .join('\n');
          return `- **${module.title}**${module.description ? `: ${module.description}` : ''}\n${subModulesText}`;
        })
        .join('\n\n');
    } else if (discipline.syllabus && discipline.syllabus.length > 0) {
      estruturaModulos = discipline.syllabus.map((topic, index) => `${index + 1}. ${topic}`).join('\n');
    } else {
      estruturaModulos = 'Estrutura não especificada';
    }

    // Construir informações de pré-requisitos
    const prerequisitesInfo = discipline.prerequisites.length > 0
      ? discipline.prerequisites.map(prereqId => {
          const prereq = existingDisciplines.find(d => d.id === prereqId);
          if (prereq) {
            return `- **${prereq.code} - ${prereq.title}**`;
          }
          return `- ${prereqId}`;
        }).join('\n')
      : 'Nenhum pré-requisito especificado';

    // Construir contexto das disciplinas existentes
    const existingContext = existingDisciplines.length > 0
      ? `\n\nDisciplinas relacionadas no sistema:\n${existingDisciplines.map(d => `- ${d.code}: ${d.title}`).join('\n')}`
      : '';

    // Construir contexto da disciplina (se disponível)
    const contextoDisciplina = discipline.context || 'Contexto não disponível. Use as informações fornecidas para criar um contexto completo.';

    // Substituir placeholders no template
    let prompt = promptTemplate
      .replace(/\{\{NOME\}\}/g, discipline.title)
      .replace(/\{\{CODIGO\}\}/g, discipline.code)
      .replace(/\{\{CURSO\}\}/g, 'Ciência da Computação')
      .replace(/\{\{PERIODO\}\}/g, String(discipline.period))
      .replace(/\{\{EMENTA\}\}/g, discipline.description || 'Não fornecida')
      .replace(/\{\{CONTEXTO_ADICIONAL\}\}/g, 'Nenhum')
      .replace(/\{\{ESTRUTURA_MODULOS\}\}/g, estruturaModulos)
      .replace(/\{\{PRE_REQUISITOS\}\}/g, prerequisitesInfo)
      .replace(/\{\{CONTEXTO_DISCIPLINA\}\}/g, contextoDisciplina)
      .replace(/\{\{DISCIPLINAS_EXISTENTES\}\}/g, existingContext);

    // Se o template estiver vazio, construir prompt padrão
    if (!prompt || prompt.trim() === '') {
      prompt = `Gere um conteúdo educacional COMPLETO, DIDÁTICO e ESTRUTURADO em MARKDOWN para a disciplina "${discipline.title}" (${discipline.code}).

**Informações da Disciplina:**
- Nome: ${discipline.title}
- Código: ${discipline.code}
- Período: ${discipline.period}
- Descrição: ${discipline.description}

**Estrutura de Módulos e Submódulos:**
${estruturaModulos}

**Pré-requisitos:**
${prerequisitesInfo}

**Contexto da Disciplina:**
${contextoDisciplina}

Gere um conteúdo completo que cubra TODOS os módulos e submódulos, com explicações detalhadas, exemplos práticos, exercícios e resumos. O conteúdo deve ser didático mas manter formalidade acadêmica.`;
    }

    // Adicionar instrução explícita no início do prompt
    prompt = `**IMPORTANTE: Retorne APENAS conteúdo em MARKDOWN, NUNCA JSON. O conteúdo será usado diretamente pelos alunos.**\n\n${prompt}`;

    try {
      const currentModel = this.model || 'gemini-flash-lite-latest';
      console.log(`📚 [GeminiService] Gerando conteúdo educacional completo para: ${discipline.title} com modelo: ${currentModel}`);
      
      // Enviar mensagem com PDFs e system instruction
      const response = await this.sendMessage(
        prompt,
        undefined, // images
        [], // conversationHistory
        systemInstruction,
        pdfFiles.length > 0 ? pdfFiles : undefined
      );
      
      console.log(`✅ [GeminiService] Conteúdo educacional gerado com sucesso (${response.length} caracteres)`);
      return response;
    } catch (error) {
      console.error('❌ [GeminiService] Erro ao gerar conteúdo educacional:', error);
      throw new Error(`Erro ao gerar conteúdo educacional: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gera conteúdo educacional para um submódulo específico
   * @param data - Dados do submódulo e disciplina
   * @param existingDisciplines - Lista de disciplinas existentes
   * @returns Conteúdo educacional em markdown
   */
  async generateSubModuleContent(
    data: {
      disciplineId: string;
      disciplineTitle: string;
      disciplineCode: string;
      disciplineDescription: string;
      moduleTitle: string;
      moduleDescription?: string;
      subModuleTitle: string;
      subModuleDescription?: string;
      context?: string;
    },
    existingDisciplines: Array<{ id: string; title: string; code: string; syllabus: string[] }> = []
  ): Promise<string> {
    // Carregar system instruction do arquivo
    let systemInstruction: string;
    
    try {
      const response = await fetch('/system-instructions/gemini-prompt-content-generation.md');
      if (response.ok) {
        const content = await response.text();
        const separatorIndex = content.indexOf('---');
        if (separatorIndex !== -1) {
          systemInstruction = content.substring(0, separatorIndex).trim();
        } else {
          systemInstruction = content;
        }
      } else {
        throw new Error('Arquivo não encontrado');
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível carregar system instruction, usando padrão');
      systemInstruction = `Você é um assistente especializado em criar conteúdo educacional completo, didático e estruturado para SUBMÓDULOS ESPECÍFICOS de disciplinas acadêmicas. 

CRÍTICO: Quando solicitado a gerar conteúdo, você deve gerar APENAS para o submódulo específico mencionado na solicitação. NÃO gere conteúdo para outros submódulos, para o módulo inteiro, ou para a disciplina completa. 

Você deve retornar APENAS texto em formato MARKDOWN estruturado, NUNCA JSON. O conteúdo será usado diretamente pelos alunos quando visualizarem aquele submódulo específico na disciplina.`;
    }

    // Construir prompt específico para o submódulo
    const prerequisitesInfo = existingDisciplines.length > 0
      ? `\n\nDisciplinas relacionadas no sistema:\n${existingDisciplines.map(d => `- ${d.code}: ${d.title}`).join('\n')}`
      : '';

    const contextInfo = data.context
      ? `\n\n**Contexto da Disciplina:**\n${data.context.substring(0, 2000)}...` // Limitar tamanho do contexto
      : '';

    const prompt = `**CRÍTICO: Você deve gerar conteúdo APENAS para o submódulo específico abaixo. NÃO gere conteúdo para outros submódulos, para o módulo inteiro, ou para a disciplina completa.**

Gere um conteúdo educacional COMPLETO, DIDÁTICO e ESTRUTURADO em MARKDOWN APENAS para o seguinte submódulo específico:

**Disciplina (contexto apenas):** ${data.disciplineTitle} (${data.disciplineCode})
**Descrição da Disciplina (contexto apenas):** ${data.disciplineDescription}

**Módulo (contexto apenas):** ${data.moduleTitle}${data.moduleDescription ? `\n${data.moduleDescription}` : ''}

**SUBMÓDULO ESPECÍFICO (GERE CONTEÚDO APENAS PARA ESTE):**
- **Título:** ${data.subModuleTitle}
${data.subModuleDescription ? `- **Descrição:** ${data.subModuleDescription}` : ''}
${contextInfo}
${prerequisitesInfo}

## TAREFA CRÍTICA

Você deve gerar conteúdo educacional COMPLETO APENAS para o submódulo "${data.subModuleTitle}" listado acima. NÃO gere conteúdo para:
- ❌ Outros submódulos do mesmo módulo
- ❌ O módulo inteiro
- ❌ A disciplina completa
- ❌ Outros tópicos não relacionados

O conteúdo para este submódulo específico deve incluir:

1. **Introdução ao Submódulo**: Contextualização clara e objetiva deste submódulo específico
2. **Conceitos Fundamentais**: Explicação detalhada e progressiva dos conceitos relacionados APENAS a este submódulo
3. **Exemplos Práticos**: Código funcional, diagramas (em formato Mermaid quando possível), casos de uso reais relacionados APENAS a este submódulo
4. **Exercícios**: Pelo menos 2-3 exercícios práticos para fixação do conteúdo deste submódulo específico
5. **Resumo**: Síntese dos pontos principais deste submódulo

**Diretrizes:**
- Seja EXTENSIVO (pelo menos 1000-2000 palavras) APENAS para este submódulo
- Use formatação Markdown rica (títulos hierárquicos, blocos de código, tabelas, listas)
- Mantenha equilíbrio entre clareza pedagógica e formalidade acadêmica
- Inclua exemplos de código funcionais quando aplicável
- Use diagramas Mermaid quando apropriado
- O conteúdo deve ser autocontido e completo APENAS para este submódulo específico
- NÃO mencione ou desenvolva conteúdo de outros submódulos

**IMPORTANTE FINAL**: 
- Retorne APENAS o conteúdo em MARKDOWN para o submódulo "${data.subModuleTitle}"
- NÃO inclua conteúdo de outros submódulos
- NÃO inclua explicações adicionais, JSON ou metadados
- O conteúdo será exibido diretamente quando o aluno visualizar este submódulo específico na disciplina`;

    try {
      const currentModel = this.model || 'gemini-flash-lite-latest';
      console.log(`📚 [GeminiService] Gerando conteúdo para submódulo: ${data.subModuleTitle} com modelo: ${currentModel}`);
      
      const response = await this.sendMessage(
        prompt,
        undefined, // images
        [], // conversationHistory
        systemInstruction,
        undefined // pdfs
      );
      
      console.log(`✅ [GeminiService] Conteúdo do submódulo gerado com sucesso (${response.length} caracteres)`);
      return response;
    } catch (error) {
      console.error('❌ [GeminiService] Erro ao gerar conteúdo do submódulo:', error);
      throw new Error(`Erro ao gerar conteúdo do submódulo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

// Singleton instance
export const geminiService = new GeminiService();

