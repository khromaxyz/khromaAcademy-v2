import type { Discipline, DisciplinesData } from '@/types/discipline';

const STORAGE_KEY = 'khroma-disciplines';
const DATA_FILE = '/disciplinas.json';

/**
 * Type guard para verificar se é um Record de Disciplines
 */
function isDisciplinesRecord(data: any): data is Record<string, Discipline> {
  if (typeof data !== 'object' || data === null) return false;
  if ('disciplines' in data) return false; // É um DisciplinesData
  return Object.values(data).every((item: any) => 
    item && typeof item === 'object' && 'title' in item && 'period' in item
  );
}

/**
 * Serviço para gerenciamento de dados das disciplinas
 */
export class DataService {
  private disciplines: Record<string, Discipline> = {};

  /**
   * Carrega disciplinas do localStorage ou do arquivo JSON
   */
  async loadDisciplines(): Promise<Record<string, Discipline>> {
    // Primeiro tenta carregar do localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if ('disciplines' in data && typeof data.disciplines === 'object') {
          this.disciplines = data.disciplines;
        } else if (isDisciplinesRecord(data)) {
          this.disciplines = data;
        } else {
          this.disciplines = {};
        }
        return this.disciplines;
      } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
      }
    }

    // Se não houver no localStorage, tenta carregar do JSON
    try {
      const response = await fetch(DATA_FILE);
      if (response.ok) {
        const data: DisciplinesData = await response.json();
        this.disciplines = data.disciplines || (data as unknown as Record<string, Discipline>);
        this.saveDisciplines();
        return this.disciplines;
      } else {
        // Fallback para dados padrão
        this.disciplines = this.getDefaultDisciplines();
        this.saveDisciplines();
        return this.disciplines;
      }
    } catch (error) {
      console.warn('Não foi possível carregar disciplinas.json, usando dados padrão', error);
      this.disciplines = this.getDefaultDisciplines();
      this.saveDisciplines();
      return this.disciplines;
    }
  }

  /**
   * Salva disciplinas no localStorage
   */
  saveDisciplines(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.disciplines));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  /**
   * Retorna todas as disciplinas
   */
  getAllDisciplines(): Record<string, Discipline> {
    return { ...this.disciplines };
  }

  /**
   * Retorna uma disciplina por ID
   */
  getDiscipline(id: string): Discipline | undefined {
    return this.disciplines[id];
  }

  /**
   * Adiciona ou atualiza uma disciplina
   */
  saveDiscipline(id: string, discipline: Discipline): void {
    this.disciplines[id] = discipline;
    this.saveDisciplines();
  }

  /**
   * Remove uma disciplina
   */
  deleteDiscipline(id: string): void {
    delete this.disciplines[id];
    this.saveDisciplines();
  }

  /**
   * Retorna dados padrão de disciplinas
   */
  private getDefaultDisciplines(): Record<string, Discipline> {
    return {
      algoritmos: {
        code: 'ALG',
        title: 'Algoritmos & Complexidade',
        period: '3º',
        description: 'O pilar da computação. Aprenda a desenhar, analisar e otimizar algoritmos eficientes.',
        syllabus: [
          'Análise Assintótica',
          'Estruturas de Dados Fundamentais',
          'Algoritmos de Ordenação',
          'Grafos',
          'Programação Dinâmica',
        ],
        progress: 75,
        color: '#41FF41',
        prerequisites: [],
        position: { x: 50, y: 10 },
        icon: `<svg viewBox="0 0 200 200"><defs><marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#41FF41"></path></marker></defs><circle cx="60" cy="60" r="12" fill="none" stroke-width="10"/><path d="M65,70 C70,120 100,140 145,140" fill="none" stroke-width="10" marker-end="url(#arrow-green)"/></svg>`,
      },
      'estruturas-dados': {
        code: 'ED',
        title: 'Estruturas de Dados',
        period: '2º',
        description: 'Organize a informação de forma inteligente para criar software performático e escalável.',
        syllabus: [
          'Listas, Pilhas e Filas',
          'Árvores Binárias e Balanceadas',
          'Hashing',
          'Heaps',
          'Estruturas Avançadas',
        ],
        progress: 90,
        color: '#4141FF',
        prerequisites: ['algoritmos'],
        position: { x: 50, y: 35 },
        icon: `<svg viewBox="0 0 200 200"><circle cx="60" cy="60" r="12" fill="none" stroke-width="10"/><circle cx="140" cy="60" r="12" fill="none" stroke-width="10"/><circle cx="100" cy="140" r="12" fill="none" stroke-width="10"/><path d="M68,70 L92,132 M132,70 L108,132" fill="none" stroke-width="10"/></svg>`,
      },
      ia: {
        code: 'IA',
        title: 'Inteligência Artificial',
        period: '6º',
        description: 'Explore os fundamentos da criação de sistemas que pensam, aprendem e raciocinam.',
        syllabus: [
          'Busca e Otimização',
          'Lógica Proposicional',
          'Aprendizado de Máquina',
          'Redes Neurais',
          'Processamento de Linguagem Natural',
        ],
        progress: 40,
        color: '#FF4141',
        prerequisites: ['estruturas-dados'],
        position: { x: 25, y: 60 },
        icon: `<svg viewBox="0 0 200 200"><path d="M100,50 C40,50 40,150 100,150" fill="none" stroke-width="10"/><path d="M100,50 C160,50 160,150 100,150" fill="none" stroke-width="10"/><circle cx="100" cy="100" r="15" fill="none" stroke-width="10"/></svg>`,
      },
    };
  }

  /**
   * Exporta disciplinas como JSON
   */
  exportAsJSON(): string {
    return JSON.stringify({ disciplines: this.disciplines }, null, 2);
  }

  /**
   * Importa disciplinas de um JSON
   */
  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json);
      if ('disciplines' in data && typeof data.disciplines === 'object') {
        this.disciplines = data.disciplines;
      } else if (isDisciplinesRecord(data)) {
        this.disciplines = data;
      } else {
        throw new Error('Formato de JSON inválido');
      }
      this.saveDisciplines();
    } catch (error) {
      throw new Error(`Erro ao importar JSON: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Carrega o índice (toc.json) de uma disciplina
   */
  async loadModuleToc(contentPath: string): Promise<any[]> {
    try {
      const response = await fetch(`/disciplinas/${contentPath}/toc.json`);
      if (!response.ok) {
        throw new Error(`TOC não encontrado para ${contentPath}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao carregar TOC de ${contentPath}:`, error);
      throw error;
    }
  }

  /**
   * Carrega um módulo específico em markdown
   */
  async loadModuleContent(contentPath: string, filename: string): Promise<string> {
    try {
      const response = await fetch(`/disciplinas/${contentPath}/${filename}`);
      if (!response.ok) {
        throw new Error(`Módulo ${filename} não encontrado em ${contentPath}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Erro ao carregar módulo ${filename}:`, error);
      throw error;
    }
  }
}

// Singleton instance
export const dataService = new DataService();

