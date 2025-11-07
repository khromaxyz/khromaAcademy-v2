import type { Discipline, ModuleMetadata, ModuleContent } from '@/types';
import { dataService } from '@/services';
import { markdownService } from '@/services/markdownService';
import { mermaidService } from '@/services/mermaidService';
import { plotlyService } from '@/services/plotlyService';
import { chartService } from '@/services/chartService';
import { mathService } from '@/services/mathService';
import { cytoscapeService } from '@/services/cytoscapeService';
import { getIcon } from '@/utils/iconLoader';
import { ThreeViewer } from './ContentBlocks/ThreeViewer';
import { QuizBlock } from './ContentBlocks/QuizBlock';
import { MonacoEditorBlock } from './ContentBlocks/MonacoEditor';
import { MatterSimulation } from './ContentBlocks/MatterSimulation';
import { FabricCanvas } from './ContentBlocks/FabricCanvas';
import './DisciplineContent.css';

/**
 * Interface para itens do Table of Contents
 */
interface TocItem {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

/**
 * DisciplineContent - Página de Conteúdo com Suporte a Markdown
 */
export class DisciplineContent {
  private container: HTMLElement | null = null;
  private tocItems: TocItem[] = [];
  private activeSection: string | null = null;
  private observerOptions = {
    root: null,
    rootMargin: '-100px 0px -66% 0px',
    threshold: 0,
  };
  private intersectionObserver: IntersectionObserver | null = null;
  
  // Novos campos para suporte a markdown
  private modules: ModuleMetadata[] = [];
  private currentModule: ModuleContent | null = null;
  private moduleCache: Map<string, ModuleContent> = new Map();
  private currentDiscipline: Discipline | null = null;

  /**
   * Singleton instance
   */
  private static instance: DisciplineContent | null = null;

  static getInstance(): DisciplineContent {
    if (!DisciplineContent.instance) {
      DisciplineContent.instance = new DisciplineContent();
    }
    return DisciplineContent.instance;
  }

  /**
   * Inicializa o componente
   */
  init(): void {
    console.log('🎯 DisciplineContent.init() chamado');
    
    this.container = document.getElementById('discipline-content');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'discipline-content';
      this.container.className = 'discipline-content';
      document.body.appendChild(this.container);
      console.log('✅ Container criado');
    }
  }

  /**
   * Renderiza o conteúdo da disciplina
   */
  async render(discipline: Discipline): Promise<void> {
    console.log('🎨 DisciplineContent.render() chamado para:', discipline.title);
    this.currentDiscipline = discipline;

    if (!discipline.contentPath) {
      // Fallback para conteúdo gerado
      this.renderWithGeneratedContent(discipline);
      return;
    }

    try {
      // Carregar TOC
      this.modules = await dataService.loadModuleToc(discipline.contentPath);
      console.log(`📚 Carregados ${this.modules.length} módulos`);

      // Renderizar estrutura PRIMEIRO (com HTML vazio)
      this.renderStructure(discipline);

      // DEPOIS carregar e renderizar o primeiro módulo
      if (this.modules.length > 0) {
        const firstModule = this.modules[0];
        await this.loadAndRenderModule(discipline.contentPath, firstModule);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conteúdo markdown:', error);
      // Fallback para conteúdo gerado
      this.renderWithGeneratedContent(discipline);
    }
  }

  /**
   * Carrega e renderiza um módulo específico
   */
  private async loadAndRenderModule(
    contentPath: string,
    metadata: ModuleMetadata
  ): Promise<void> {
    console.log(`📖 Carregando módulo: ${metadata.title}`);

    // Verificar cache
    if (this.moduleCache.has(metadata.id)) {
      this.currentModule = this.moduleCache.get(metadata.id)!;
      this.updateMainContent();
      return;
    }

    try {
      // Carregar markdown
      console.log(`📥 Fazendo fetch de: /disciplinas/${contentPath}/${metadata.file}`);
      const rawMarkdown = await dataService.loadModuleContent(contentPath, metadata.file);
      console.log(`✅ Markdown carregado, tamanho: ${rawMarkdown.length} chars`);

      // Renderizar com markdown-it + KaTeX
      console.log('🔄 Renderizando markdown...');
      const renderedHtml = markdownService.render(rawMarkdown);
      console.log(`✅ HTML renderizado, tamanho: ${renderedHtml.length} chars`);

      this.currentModule = {
        metadata,
        rawMarkdown,
        renderedHtml,
      };

      // Cachear
      this.moduleCache.set(metadata.id, this.currentModule);
      console.log(`💾 Módulo ${metadata.id} cacheado`);

      this.updateMainContent();
    } catch (error) {
      console.error(`❌ Erro ao carregar módulo ${metadata.file}:`, error);
      this.showError('Erro ao carregar módulo');
    }
  }

  /**
   * Atualiza o conteúdo principal com o módulo atual
   */
  private async updateMainContent(): Promise<void> {
    console.log('🔄 updateMainContent() chamado');
    
    const contentArea = document.getElementById('main-content');
    if (!contentArea) {
      console.error('❌ Elemento #main-content não encontrado!');
      return;
    }

    if (!this.currentModule) {
      console.error('❌ currentModule está null!');
      return;
    }

    console.log('✅ Atualizando conteúdo:', this.currentModule.metadata.title);
    contentArea.innerHTML = this.currentModule.renderedHtml;
    console.log('✅ HTML atualizado, tamanho:', this.currentModule.renderedHtml.length, 'chars');

    // Re-aplicar Prism.js para syntax highlighting
    if (typeof window !== 'undefined' && (window as any).Prism) {
      console.log('🎨 Aplicando Prism.js...');
      (window as any).Prism.highlightAllUnder(contentArea);
    }

    // Renderizar diagramas Mermaid
    console.log('🔷 Processando diagramas Mermaid...');
    await mermaidService.render(contentArea);

    // Processar blocos especiais (quizzes, visualizações 3D)
    console.log('🎮 Processando blocos especiais...');
    this.processSpecialBlocks(contentArea);

    // Atualizar TOC
    this.updateTableOfContents();

    // Scroll spy
    this.setupScrollSpy();

    // Scroll to top
    if (contentArea.scrollTo) {
      contentArea.scrollTo(0, 0);
    }

    console.log('✅ updateMainContent() concluído');
  }

  /**
   * Processa blocos especiais (quizzes, visualizações 3D, etc.)
   */
  private processSpecialBlocks(container: HTMLElement): void {
    console.log('🎮 Processando blocos especiais avançados...');

    // 1. Processar quizzes
    QuizBlock.processAll(container);

    // 2. Processar visualizações 3D (Three.js)
    const threeElements = container.querySelectorAll('[data-three]');
    threeElements.forEach((el) => {
      try {
        const configAttr = el.getAttribute('data-three');
        if (!configAttr) return;

        const config = JSON.parse(configAttr);
        ThreeViewer.create(el as HTMLElement, config);
      } catch (error) {
        console.error('Erro ao criar visualização 3D:', error);
        (el as HTMLElement).innerHTML = `
          <div class="three-error">
            <strong>⚠️ Erro ao carregar visualização 3D</strong>
            <p>Não foi possível processar a configuração da visualização.</p>
          </div>
        `;
      }
    });

    // 3. Processar gráficos Plotly
    plotlyService.processAll(container);

    // 4. Processar gráficos Chart.js
    chartService.processAll(container);

    // 5. Processar cálculos matemáticos
    mathService.processAll(container);

    // 6. Processar editores Monaco
    MonacoEditorBlock.processAll(container);

    // 7. Processar simulações de física (Matter.js)
    MatterSimulation.processAll(container);

    // 8. Processar canvas de desenho (Fabric.js)
    FabricCanvas.processAll(container);

    // 9. Processar grafos (Cytoscape.js)
    cytoscapeService.processAll(container);

    console.log('✅ Blocos especiais processados');
  }

  /**
   * Renderiza a estrutura completa
   */
  private renderStructure(discipline: Discipline): void {
    if (!this.container) return;

    const html = `
      <div class="discipline-content-wrapper">
        ${this.renderSidebar(discipline)}
        ${this.renderMainContent()}
        ${this.renderTableOfContents()}
      </div>
    `;

    this.container.innerHTML = html;
    
    // Setup event listeners
    this.setupSidebarListeners(discipline);
    this.setupCloseButton();
  }

  /**
   * Renderiza a sidebar com módulos
   */
  private renderSidebar(discipline: Discipline): string {
    return `
        <aside class="discipline-sidebar">
          <div class="sidebar-header">
          <button class="sidebar-close-btn" id="sidebar-close-btn" aria-label="Voltar">
            ${getIcon('arrow-left', { size: 20 })}
            </button>
            <h2>${discipline.title}</h2>
          </div>

        <nav class="sidebar-nav" aria-label="Navegação do curso">
            <div class="nav-section">
              <h3 class="nav-section-title">
              ${getIcon('book-open', { size: 16 })}
              Módulos do Curso
              </h3>
            <ul class="nav-list" role="list">
              ${this.modules.map((module, index) => `
                <li class="nav-item ${index === 0 ? 'active' : ''}" 
                    data-module-id="${module.id}" 
                    tabindex="0" 
                    role="button"
                    aria-label="Módulo ${index + 1}: ${module.title}">
                  <span class="nav-item-number">${String(index + 1).padStart(2, '0')}</span>
                  <span class="nav-item-text">${module.title}</span>
                  <span class="nav-item-status">○</span>
                </li>
              `).join('')}
              </ul>
            </div>
          </nav>

          <div class="sidebar-progress">
            <div class="sidebar-progress-info">
              <span>Progresso Geral</span>
              <span class="sidebar-progress-percentage">${discipline.progress}%</span>
            </div>
            <div class="sidebar-progress-bar">
              <div class="sidebar-progress-fill" style="width: ${discipline.progress}%"></div>
            </div>
          </div>
        </aside>
    `;
  }

  /**
   * Renderiza o conteúdo principal
   */
  private renderMainContent(): string {
    return `
        <main class="discipline-main">
          <header class="discipline-main-header">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="#" class="breadcrumb-item" id="breadcrumb-home">Home</a>
              <span class="breadcrumb-separator">/</span>
            <a href="#" class="breadcrumb-item" id="breadcrumb-disciplines">Disciplinas</a>
              <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item active">${this.currentDiscipline?.title || ''}</span>
            </nav>
          </header>

        <div class="discipline-main-content" id="main-content">
          <div class="loading">
            <p>Carregando conteúdo...</p>
          </div>
        </div>
      </main>
    `;
  }

  /**
   * Renderiza o Table of Contents
   */
  private renderTableOfContents(): string {
    return `
      <aside class="discipline-toc" id="discipline-toc">
        <div class="toc-header">
          <h3>Nesta Página</h3>
        </div>
        <nav class="toc-content" id="toc-content" aria-label="Table of contents">
          <ul class="toc-list" id="toc-list"></ul>
        </nav>
      </aside>
    `;
  }

  /**
   * Setup listeners para troca de módulo
   */
  private setupSidebarListeners(discipline: Discipline): void {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach((item) => {
      item.addEventListener('click', async () => {
        const moduleId = item.getAttribute('data-module-id');
        if (!moduleId || !discipline.contentPath) return;

        const module = this.modules.find((m) => m.id === moduleId);
        if (!module) return;

        // Update active state
        navItems.forEach((navItem) => navItem.classList.remove('active'));
        item.classList.add('active');

        // Load module
        await this.loadAndRenderModule(discipline.contentPath, module);
      });
    });
  }

  /**
   * Setup botão de fechar
   */
  private setupCloseButton(): void {
    const closeBtn = document.getElementById('sidebar-close-btn');
    const breadcrumbHome = document.getElementById('breadcrumb-home');
    const breadcrumbDisciplines = document.getElementById('breadcrumb-disciplines');

    [closeBtn, breadcrumbHome, breadcrumbDisciplines].forEach((btn) => {
      btn?.addEventListener('click', (e) => {
        e.preventDefault();
        this.hide();
      });
    });
  }

/**
   * Atualiza Table of Contents baseado nos headers do conteúdo
   */
  private updateTableOfContents(): void {
    const contentArea = document.getElementById('main-content');
    const tocList = document.getElementById('toc-list');
    
    if (!contentArea || !tocList) return;

    // Encontrar todos os headers
    const headers = contentArea.querySelectorAll('h1, h2, h3, h4');
    this.tocItems = [];

    let tocHtml = '';

    headers.forEach((header) => {
      const text = header.textContent || '';
      const level = parseInt(header.tagName.substring(1));
      const id = header.id || text.toLowerCase().replace(/\s+/g, '-');

      // Adicionar ID se não existir
      if (!header.id) {
        header.id = id;
      }

      this.tocItems.push({
        id,
        text,
        level,
        element: header as HTMLElement,
      });

      const indent = (level - 1) * 12;
      tocHtml += `
        <li class="toc-item toc-level-${level}" style="padding-left: ${indent}px">
          <a href="#${id}" class="toc-link">${text}</a>
        </li>
      `;
    });

    tocList.innerHTML = tocHtml;

    // Add click listeners
    tocList.querySelectorAll('.toc-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          const target = document.querySelector(href);
          target?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Setup scroll spy
   */
  private setupScrollSpy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
              this.setActiveSection(id);
          }
        });
      },
      this.observerOptions
    );

    // Observe all headers
    this.tocItems.forEach((item) => {
      if (item.element) {
      this.intersectionObserver?.observe(item.element);
      }
    });
  }

  /**
   * Define seção ativa no TOC
   */
  private setActiveSection(id: string): void {
    if (this.activeSection === id) return;

    this.activeSection = id;

    // Update TOC links
    const tocLinks = document.querySelectorAll('.toc-link');
    tocLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Renderiza com conteúdo gerado (fallback)
   */
  private renderWithGeneratedContent(discipline: Discipline): void {
    console.log('⚠️ Usando conteúdo gerado como fallback');
    
    if (!this.container) return;

    const html = `
      <div class="discipline-content-wrapper">
        ${this.renderSidebar(discipline)}
        ${this.renderMainContentFallback(discipline)}
        ${this.renderTableOfContents()}
      </div>
    `;

    this.container.innerHTML = html;

    this.setupCloseButton();
    this.updateTableOfContents();
    this.setupScrollSpy();
  }

  /**
   * Renderiza conteúdo principal (fallback)
   */
  private renderMainContentFallback(discipline: Discipline): string {
    return `
      <main class="discipline-main">
        <div class="discipline-main-content" id="main-content">
          <h1>${discipline.title}</h1>
          <p>${discipline.description}</p>
          <h2>Conteúdo em Desenvolvimento</h2>
          <p>O conteúdo detalhado desta disciplina está sendo preparado.</p>
          <h2>Syllabus</h2>
          <ul>
            ${discipline.syllabus.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </main>
    `;
  }

  /**
   * Mostra mensagem de erro
   */
  private showError(message: string): void {
    const contentArea = document.getElementById('main-content');
    if (contentArea) {
      contentArea.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  /**
   * Mostra o conteúdo
   */
  show(): void {
    console.log('👁️ DisciplineContent.show() chamado');
    
    if (!this.container) {
      console.error('❌ Container não existe!');
      return;
    }
    
    console.log('✅ Container existe:', this.container);
    
    // Garantir que está no DOM
    if (!document.body.contains(this.container)) {
      console.log('➕ Adicionando container ao body');
      document.body.appendChild(this.container);
    }
    
    // Usar 'visible' ao invés de 'active' para corresponder ao CSS
    this.container.classList.add('visible');
    document.body.classList.add('content-open');
    
    console.log('✅ Classes adicionadas, container deve estar visível');
  }

  /**
   * Esconde o conteúdo
   */
  hide(): void {
    this.container?.classList.remove('visible');
    document.body.classList.remove('content-open');
    
    // Limpar observers
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}
