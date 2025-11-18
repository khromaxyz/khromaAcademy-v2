/**
 * Tipos relacionados a agentes e histórico
 */

/**
 * Item do histórico de geração de disciplinas por agentes
 */
export interface AgentHistoryItem {
  /** ID único do item de histórico */
  id: string;
  /** Nome do arquivo PDF original */
  pdfFileName: string;
  /** Tamanho do arquivo PDF em bytes */
  pdfFileSize?: number;
  /** Prompt opcional fornecido pelo usuário */
  userPrompt?: string;
  /** ID da disciplina gerada */
  disciplineId: string;
  /** Título da disciplina gerada */
  disciplineTitle: string;
  /** Data de criação (ISO string) */
  createdAt: string;
  /** Data de última visualização (ISO string) */
  lastViewedAt?: string;
}

/**
 * Configuração do agente PDF to Docs
 */
export interface PDFToDocsConfig {
  /** Prompt opcional do usuário */
  prompt?: string;
  /** Arquivo PDF em base64 */
  pdfFile?: {
    name: string;
    size: number;
    mimeType: string;
    data: string; // Base64 sem prefixo
  };
}

/**
 * Estrutura de histórico de agentes
 */
export interface AgentsHistory {
  pdfToDocs: AgentHistoryItem[];
  contentReview: ReviewHistoryItem[];
}

/**
 * Etapas de geração de disciplina
 */
export enum GenerationStep {
  IDLE = 'idle',
  ANALYZING = 'analyzing',
  GENERATING_STRUCTURE = 'generating_structure',
  GENERATING_CONTENT = 'generating_content',
  COMPLETED = 'completed',
  ERROR = 'error'
}

/**
 * Etapas de revisão de conteúdo
 */
export enum ReviewStep {
  IDLE = 'idle',
  LOADING_DISCIPLINE = 'loading_discipline',
  DETECTING_TYPE = 'detecting_type',
  REVIEWING_CONTENT = 'reviewing_content',
  COMPLETED = 'completed',
  ERROR = 'error'
}

/**
 * Configuração do agente de revisão de conteúdo
 */
export interface ContentReviewConfig {
  /** ID da disciplina a ser revisada */
  disciplineId: string;
  /** Tipo de disciplina (opcional, será detectado automaticamente se não fornecido) */
  disciplineType?: string;
  /** Prompt opcional do usuário para personalizar a revisão */
  userPrompt?: string;
}

/**
 * Item do histórico de revisão de conteúdo
 */
export interface ReviewHistoryItem {
  /** ID único do item de histórico */
  id: string;
  /** ID da disciplina revisada */
  disciplineId: string;
  /** Título da disciplina revisada */
  disciplineTitle: string;
  /** Tipo de disciplina detectado */
  disciplineType: string;
  /** Prompt opcional usado na revisão */
  userPrompt?: string;
  /** Data de criação (ISO string) */
  createdAt: string;
  /** Data de última visualização (ISO string) */
  lastViewedAt?: string;
  /** Métricas da revisão */
  metrics?: {
    totalSubModules: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalDuration: number;
  };
}

