/**
 * Interface para representar uma disciplina do curso
 */
export interface Discipline {
  /** Código da disciplina (ex: "ICP131") */
  code: string;
  /** Título da disciplina */
  title: string;
  /** Período do curso (1-8 para obrigatórias) */
  period: number | string;
  /** Descrição da disciplina */
  description: string;
  /** Lista de tópicos do syllabus (mantido para compatibilidade) */
  syllabus: string[];
  /** Estrutura hierárquica de módulos e submódulos (nova estrutura) */
  modules?: ModuleStructure[];
  /** Progresso da disciplina (0-100) */
  progress: number;
  /** Cor principal da disciplina em formato hexadecimal */
  color: string;
  /** Códigos das disciplinas pré-requisitas */
  prerequisites: string[];
  /** Posição no grafo de conhecimento (mantido para compatibilidade, mas não editável) */
  position: {
    x: number;
    y: number;
  };
  /** Ícone SVG da disciplina */
  icon: string;
  /** Caminho para o conteúdo markdown (opcional) */
  contentPath?: string;
  /** Categoria da disciplina (opcional) */
  category?: string;
  /** Contexto completo gerado pela IA (opcional) */
  context?: string;
  /** Data de geração do contexto (opcional) */
  contextGeneratedAt?: string;
  /** Conteúdo gerado por submódulo (opcional) - mapeia submoduleId -> conteúdo markdown */
  subModuleContent?: Record<string, string>;
}

/**
 * Estrutura completa dos dados de disciplinas
 */
export interface DisciplinesData {
  disciplines: Record<string, Discipline>;
}

/**
 * Dados de uma disciplina para formulário de criação/edição
 */
export interface DisciplineFormData {
  id?: string;
  code: string;
  title: string;
  period: number | string;
  description: string;
  color: string;
  progress: number;
  positionX: number;
  positionY: number;
  prerequisites: string[];
  syllabus: string[];
  icon: string;
  category?: string;
}

/**
 * Metadados de um módulo de conteúdo
 */
export interface ModuleMetadata {
  id: string;
  title: string;
  file: string;
  order: number;
  /** Ícone Lucide para exibir na sidebar (opcional, extraído do front matter) */
  icon?: string;
  /** Seção da sidebar onde o módulo deve aparecer (opcional, extraído do front matter) */
  section?: string;
}

/**
 * Conteúdo de um módulo completo
 */
export interface ModuleContent {
  metadata: ModuleMetadata;
  rawMarkdown: string;
  renderedHtml: string;
}

/**
 * Estrutura de um submódulo dentro de um módulo
 */
export interface SubModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  /** Conteúdo markdown gerado para este submódulo (opcional) */
  content?: string;
  /** Data de geração do conteúdo (opcional) */
  contentGeneratedAt?: string;
}

/**
 * Estrutura de um módulo com submódulos
 */
export interface ModuleStructure {
  id: string;
  title: string;
  description?: string;
  order: number;
  subModules: SubModule[];
}

