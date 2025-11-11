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
  /** Lista de tópicos do syllabus */
  syllabus: string[];
  /** Progresso da disciplina (0-100) */
  progress: number;
  /** Cor principal da disciplina em formato hexadecimal */
  color: string;
  /** Códigos das disciplinas pré-requisitas */
  prerequisites: string[];
  /** Posição no grafo de conhecimento */
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

