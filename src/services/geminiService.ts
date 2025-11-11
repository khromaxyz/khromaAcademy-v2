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
  private readonly AVAILABLE_MODELS = ['gemini-2.5-pro', 'gemini-flash-lite-latest', 'gemini-flash-lite'];

  constructor() {
    // Obter API key da variável de ambiente
    this.apiKey = this.getApiKey();
    
    if (!this.apiKey) {
      console.warn('⚠️ VITE_GEMINI_API_KEY não encontrada. O chatbot não funcionará.');
      console.log('🔍 Debug - import.meta.env:', import.meta.env);
      console.log('🔍 Debug - VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY);
    } else {
      console.log('✅ API key do Gemini carregada com sucesso');
    }

    // Carregar modelo salvo do localStorage
    this.loadModelFromStorage();
  }

  /**
   * Obtém a API key da variável de ambiente
   */
  private getApiKey(): string {
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  /**
   * Envia uma mensagem para o Gemini e retorna a resposta
   * @param message - Texto da mensagem
   * @param images - Array opcional de imagens em base64 (sem prefixo data:)
   * @param conversationHistory - Histórico de conversa
   * @param systemInstruction - Instrução de sistema opcional
   */
  async sendMessage(
    message: string,
    images?: Array<{ mimeType: string; data: string }>,
    conversationHistory: GeminiMessage[] = [],
    systemInstruction?: string
  ): Promise<string> {
    // Atualizar API key antes de usar
    if (!this.apiKey) {
      this.apiKey = this.getApiKey();
    }
    
    if (!this.apiKey) {
      throw new Error('API key do Gemini não configurada. Verifique a variável de ambiente VITE_GEMINI_API_KEY.');
    }

    try {
      // Construir partes da mensagem
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      
      // Adicionar texto se houver
      if (message.trim()) {
        parts.push({ text: message });
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

      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

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

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Erro desconhecido da API');
      }

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Nenhuma resposta recebida do modelo');
      }

      const text = data.candidates[0].content.parts[0]?.text || 'Sem resposta do modelo';
      return text;
    } catch (error) {
      console.error('Erro ao comunicar com Gemini API:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao comunicar com a API do Gemini');
    }
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
    // Atualizar API key antes de usar
    if (!this.apiKey) {
      this.apiKey = this.getApiKey();
    }
    
    if (!this.apiKey) {
      throw new Error('API key do Gemini não configurada. Verifique a variável de ambiente VITE_GEMINI_API_KEY.');
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
   * Verifica dinamicamente para permitir que funcione após reiniciar o servidor
   */
  isConfigured(): boolean {
    // Sempre verifica a variável de ambiente diretamente
    const currentKey = this.getApiKey();
    
    // Atualiza a API key se foi configurada
    if (currentKey && currentKey !== this.apiKey) {
      this.apiKey = currentKey;
      console.log('✅ API key do Gemini configurada');
    }
    
    // Log para debug
    if (!currentKey) {
      console.warn('⚠️ VITE_GEMINI_API_KEY não encontrada. Valor:', import.meta.env.VITE_GEMINI_API_KEY);
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
      console.warn(`⚠️ Modelo inválido: ${model}. Usando modelo padrão.`);
      return;
    }

    this.model = model;
    
    // Salvar no localStorage
    try {
      localStorage.setItem(this.MODEL_STORAGE_KEY, model);
      console.log(`✅ Modelo do Gemini atualizado para: ${this.model}`);
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
}

// Singleton instance
export const geminiService = new GeminiService();

