import type { Discipline, ModuleMetadata, ModuleContent } from '@/types';
import { dataService, themeService } from '@/services';
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
import { GeminiChatbot } from './GeminiChatbot';
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
  private chatbot: GeminiChatbot | null = null;

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
      console.log('📋 Módulos com metadata:', this.modules.map(m => ({ id: m.id, icon: m.icon, section: m.section })));

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

    // TOC removido - substituído por chatbot
    // this.updateTableOfContents();
    // this.setupScrollSpy();

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

    // 10. Processar code blocks do markdown
    this.processCodeBlocks(container);

    console.log('✅ Blocos especiais processados');
  }

  /**
   * Transforma code blocks do markdown em estrutura com header (igual ao teste1.html)
   */
  private processCodeBlocks(container: HTMLElement): void {
    const codeBlocks = container.querySelectorAll('pre[class*="language-"]');
    
    codeBlocks.forEach((preElement) => {
      // Verificar se já foi processado
      if (preElement.closest('.code-block')) {
        return;
      }

      const codeElement = preElement.querySelector('code');
      if (!codeElement) return;

      // Extrair linguagem da classe
      const languageMatch = preElement.className.match(/language-(\w+)/);
      const language = languageMatch ? languageMatch[1] : 'text';
      
      // Obter código original
      const codeText = codeElement.textContent || '';

      // Criar estrutura igual ao teste1.html
      const codeBlock = document.createElement('div');
      codeBlock.className = 'code-block';

      // Header
      const header = document.createElement('div');
      header.className = 'code-block-header';
      const langSpan = document.createElement('span');
      langSpan.className = 'code-block-language';
      langSpan.textContent = language;
      
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'code-actions';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-block-copy-btn';
      copyBtn.type = 'button';
      copyBtn.setAttribute('aria-label', 'Copiar código');
      
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'copy');
      icon.setAttribute('size', '14');
      
      copyBtn.appendChild(icon);
      copyBtn.appendChild(document.createTextNode(' Copy'));
      
      actionsDiv.appendChild(copyBtn);
      
      header.appendChild(langSpan);
      header.appendChild(actionsDiv);

      // Container de conteúdo (igual ao .k-code-content do teste1.html)
      const contentContainer = document.createElement('div');
      contentContainer.className = 'code-block-container';

      // Mover o pre/code para dentro do container
      const newPre = document.createElement('pre');
      newPre.className = preElement.className;
      const newCode = document.createElement('code');
      newCode.className = codeElement.className;
      newCode.innerHTML = codeElement.innerHTML;
      newPre.appendChild(newCode);
      contentContainer.appendChild(newPre);

      // Montar estrutura
      codeBlock.appendChild(header);
      codeBlock.appendChild(contentContainer);

      // Substituir o pre original
      preElement.parentNode?.replaceChild(codeBlock, preElement);

      // Adicionar funcionalidade de copiar
      if (copyBtn) {
        // Salvar o conteúdo original do botão (ícone + texto)
        const originalContent = copyBtn.innerHTML;
        
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(codeText).then(() => {
            copyBtn.classList.add('copied');
            // Manter o ícone e mudar apenas o texto
            const icon = copyBtn.querySelector('i[data-lucide]');
            if (icon) {
              copyBtn.innerHTML = icon.outerHTML + ' Copied!';
            } else {
              copyBtn.textContent = 'Copied!';
            }
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.innerHTML = originalContent;
              // Re-inicializar o ícone Lucide
              if (typeof lucide !== 'undefined') {
                lucide.createIcons();
              }
            }, 2000);
          }).catch(err => {
            console.error('Erro ao copiar código:', err);
          });
        });
      }
    });

    // Inicializar ícones Lucide após processar todos os blocos de código
    if (typeof lucide !== 'undefined') {
      requestAnimationFrame(() => {
        lucide.createIcons();
      });
    }
  }

  /**
   * Renderiza a estrutura completa
   */
  private renderStructure(discipline: Discipline): void {
    if (!this.container) return;

    const html = `
      <div class="discipline-content-wrapper">
        ${this.renderHeader()}
        ${this.renderSidebar(discipline)}
        ${this.renderMainContent()}
      </div>
    `;

    this.container.innerHTML = html;
    
    // Inicializar ícones Lucide após inserir no DOM
    if (typeof lucide !== 'undefined') {
      // Aguardar um frame para garantir que o DOM está atualizado
      requestAnimationFrame(() => {
        lucide.createIcons();
        // Verificar se os ícones foram renderizados
        const icons = this.container?.querySelectorAll('[data-lucide]');
        console.log(`🎨 Ícones Lucide inicializados: ${icons?.length || 0} encontrados`);
      });
    }
    
    // Setup event listeners
    this.setupSidebarListeners(discipline);
    this.setupBackToMenu();
    this.setupThemeToggle();
    
    // Aguardar um frame para garantir que o DOM está pronto
    requestAnimationFrame(() => {
      this.setupChatbotToggle();
      // Inicializar chatbot (mas não mostrar ainda)
      this.initializeChatbot();
    });
  }

  /**
   * Renderiza o header (docs-header)
   */
  private renderHeader(): string {
    return `
      <header class="docs-header">
        <div class="header-left">
          <button 
            id="back-to-menu-btn" 
            class="back-to-menu-btn" 
            title="Voltar ao Menu Principal" 
            type="button"
            aria-label="Voltar ao Menu Principal"
          >
            ${getIcon('arrow-left', { size: 20 })}
          </button>
          <a href="#" class="logo link" aria-label="Khroma Academy - Página Inicial">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 9L11 12L7 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 16H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="logo-text">khroma.academy</span>
          </a>
          <div class="header-search-target"></div>
        </div>
        <div class="header-right">
          <button class="icon-btn" title="Toggle Theme" type="button">
            ${getIcon('sun', { size: 20 })}
          </button>
          <button class="icon-btn" title="Github" type="button">
            ${getIcon('github', { size: 20 })}
          </button>
          <div style="width: 1px; height: 24px; background: var(--k-gray-2); margin: 0 8px;"></div>
          <button 
            id="chatbot-toggle-btn" 
            class="icon-btn chatbot-toggle-btn" 
            title="Abrir Chat Gemini" 
            type="button"
            aria-label="Abrir/Fechar Chat Gemini"
          >
            ${getIcon('message-circle', { size: 20 })}
          </button>
        </div>
      </header>
    `;
  }

  /**
   * Renderiza a sidebar com módulos
   */
  private renderSidebar(discipline: Discipline): string {
    // Obter ícone do módulo (prioriza icon do toc.json, fallback automático)
    const getModuleIcon = (module: ModuleMetadata, index: number): string => {
      // Priorizar ícone do toc.json
      if (module.icon) {
        const iconHtml = getIcon(module.icon, { size: 16 });
        console.log(`🎯 Ícone para ${module.title}: ${module.icon}`, iconHtml.substring(0, 100));
        return iconHtml;
      }

      // Fallback: detecção automática baseada no título
      const lowerTitle = module.title.toLowerCase();
      if (lowerTitle.includes('introdução') || lowerTitle.includes('introduction') || lowerTitle.includes('começando')) {
        return getIcon('sparkles', { size: 16 });
      } else if (lowerTitle.includes('quick') || lowerTitle.includes('rápido') || lowerTitle.includes('início')) {
        return getIcon('zap', { size: 16 });
      } else if (lowerTitle.includes('instalação') || lowerTitle.includes('installation') || lowerTitle.includes('setup')) {
        return getIcon('package', { size: 16 });
      } else if (lowerTitle.includes('arquitetura') || lowerTitle.includes('architecture')) {
        return getIcon('cpu', { size: 16 });
      } else if (lowerTitle.includes('estado') || lowerTitle.includes('state') || lowerTitle.includes('gerenciamento')) {
        return getIcon('layers', { size: 16 });
      } else if (lowerTitle.includes('rota') || lowerTitle.includes('routing') || lowerTitle.includes('navegação')) {
        return getIcon('workflow', { size: 16 });
      } else if (lowerTitle.includes('api') || lowerTitle.includes('rest')) {
        return getIcon('webhook', { size: 16 });
      } else if (lowerTitle.includes('database') || lowerTitle.includes('banco') || lowerTitle.includes('graphql')) {
        return getIcon('database', { size: 16 });
      } else if (lowerTitle.includes('auth') || lowerTitle.includes('autenticação') || lowerTitle.includes('segurança')) {
        return getIcon('shield', { size: 16 });
      } else if (lowerTitle.includes('avançado') || lowerTitle.includes('advanced') || lowerTitle.includes('pro')) {
        return getIcon('lock', { size: 16 });
      }
      // Ícones padrão baseados na posição
      const defaultIcons = ['sparkles', 'zap', 'package', 'cpu', 'layers', 'workflow', 'webhook', 'database', 'shield'];
      return getIcon(defaultIcons[index % defaultIcons.length] || 'book-open', { size: 16 });
    };

    // Agrupar módulos por seção
    const groupModulesBySection = (): Array<{ title: string; modules: ModuleMetadata[] }> => {
      // Verificar se algum módulo tem section definida
      const hasCustomSections = this.modules.some(m => m.section);
      
      if (hasCustomSections) {
        // Agrupar por section do toc.json
        const sectionMap = new Map<string, ModuleMetadata[]>();
        
        this.modules.forEach(module => {
          const sectionName = module.section || 'Other';
          if (!sectionMap.has(sectionName)) {
            sectionMap.set(sectionName, []);
          }
          sectionMap.get(sectionName)!.push(module);
        });

        // Converter para array e ordenar por ordem dos módulos
        return Array.from(sectionMap.entries())
          .map(([title, modules]) => ({
            title,
            modules: modules.sort((a, b) => a.order - b.order)
          }))
          .sort((a, b) => {
            // Ordenar seções: Getting Started primeiro, depois Core Concepts, depois API Reference, depois outras
            const order = ['Getting Started', 'Core Concepts', 'API Reference'];
            const aIndex = order.indexOf(a.title);
            const bIndex = order.indexOf(b.title);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.title.localeCompare(b.title);
          });
      } else {
        // Fallback: agrupamento automático
        return [
          {
            title: 'Getting Started',
            modules: this.modules.slice(0, Math.min(3, this.modules.length))
          },
          {
            title: 'Core Concepts',
            modules: this.modules.slice(3, Math.min(6, this.modules.length))
          },
          {
            title: 'API Reference',
            modules: this.modules.slice(6)
          }
        ].filter(section => section.modules.length > 0);
      }
    };

    const sections = groupModulesBySection();

    return `
        <aside class="docs-sidebar">
          <nav class="sidebar-nav" aria-label="Navegação do curso">
            ${sections.map((section) => `
              <div class="nav-group">
                <div class="nav-label">${section.title}</div>
                ${section.modules.map((module, moduleIndex) => {
                  // Verificar se é o módulo atual
                  const isActive = this.currentModule?.metadata.id === module.id || 
                                  (moduleIndex === 0 && section === sections[0] && !this.currentModule);
                  return `
                    <a href="#" class="nav-item ${isActive ? 'active' : ''}" 
                        data-module-id="${module.id}" 
                        tabindex="0" 
                        role="button"
                        aria-label="${module.title}">
                      ${getModuleIcon(module, moduleIndex)}
                      ${module.title}
                    </a>
                  `;
                }).join('')}
              </div>
            `).join('')}
          </nav>
        </aside>
    `;
  }

  /**
   * Renderiza o conteúdo principal
   */
  private renderMainContent(): string {
    return `
      <div class="docs-content-wrapper">
        <main class="main-scroll-area" id="main-content">
          <div class="loading">
            <p>Carregando conteúdo...</p>
          </div>
        </main>
        <aside class="docs-toc" id="docs-toc">
          <div id="chatbot-container"></div>
        </aside>
      </div>
    `;
  }

  /**
   * Renderiza o Chatbot Gemini (substitui o Table of Contents)
   */
  private renderTableOfContents(): string {
    // Retorna um placeholder que será substituído pelo chatbot
    return `<aside class="docs-toc"><div id="chatbot-container"></div></aside>`;
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
        ${this.renderHeader()}
        ${this.renderSidebar(discipline)}
        ${this.renderMainContentFallback(discipline)}
      </div>
    `;

    this.container.innerHTML = html;
    
    // Inicializar ícones Lucide após inserir no DOM
    if (typeof lucide !== 'undefined') {
      requestAnimationFrame(() => {
        lucide.createIcons();
      });
    }
    
    // Setup event listeners
    this.setupSidebarListeners(discipline);
    this.setupBackToMenu();
    this.setupThemeToggle();
    
    // Aguardar um frame para garantir que o DOM está pronto
    requestAnimationFrame(() => {
      this.setupChatbotToggle();
      // Inicializar chatbot
      this.initializeChatbot();
    });
  }

  /**
   * Renderiza conteúdo principal (fallback)
   */
  private renderMainContentFallback(discipline: Discipline): string {
    return `
      <div class="docs-content-wrapper">
        <main class="main-scroll-area" id="main-content">
          <h1 class="k-doc-title">${discipline.title}</h1>
          <p class="k-doc-lead">${discipline.description}</p>
          <div class="k-section">
            <h2>Conteúdo em Desenvolvimento</h2>
            <p>O conteúdo detalhado desta disciplina está sendo preparado.</p>
            <h2>Syllabus</h2>
            <ul>
              ${discipline.syllabus.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        </main>
        <aside class="docs-toc" id="docs-toc">
          <div id="chatbot-container"></div>
        </aside>
      </div>
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
   * Setup do botão de voltar ao menu principal
   */
  private setupBackToMenu(): void {
    const backBtn = document.getElementById('back-to-menu-btn');
    
    if (!backBtn) return;

    backBtn.addEventListener('click', () => {
      // Esconder o conteúdo da disciplina
      this.hide();
      
      // Disparar evento para voltar ao menu principal
      // O app.ts escuta este evento via MainNavigation
      window.dispatchEvent(new CustomEvent('navigation-change', {
        detail: { itemId: 'home' }
      }));
    });
  }

  /**
   * Setup do botão de toggle de tema
   */
  private setupThemeToggle(): void {
    const themeToggleBtn = this.container?.querySelector('.header-right .icon-btn[title="Toggle Theme"]') as HTMLElement;
    
    if (!themeToggleBtn) {
      console.warn('⚠️ Botão de toggle de tema não encontrado');
      return;
    }

    // Atualizar ícone baseado no tema atual
    const updateThemeIcon = () => {
      const currentTheme = themeService.getCurrentTheme();
      const icon = themeToggleBtn.querySelector('svg, i[data-lucide]');
      if (icon) {
        const iconName = currentTheme === 'light' ? 'moon' : 'sun';
        // Atualizar o ícone usando getIcon
        const newIcon = getIcon(iconName, { size: 20 });
        if (icon.parentElement) {
          icon.outerHTML = newIcon;
          // Re-inicializar ícones Lucide se necessário
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }
      }
    };

    // Atualizar ícone inicial
    updateThemeIcon();

    // Listener para mudanças de tema
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = themeService.getCurrentTheme();
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      themeService.applyTheme(newTheme);
      themeService.saveTheme();
      
      // Atualizar ícone
      updateThemeIcon();
      
      // Feedback visual
      themeToggleBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        themeToggleBtn.style.transform = '';
      }, 150);
    });

    // Escutar mudanças de tema de outras fontes (ex: SettingsPanel)
    window.addEventListener('theme-changed', () => {
      updateThemeIcon();
    });
  }

  /**
   * Setup do botão de toggle do chatbot
   */
  private setupChatbotToggle(): void {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const docsToc = this.container?.querySelector('.docs-toc') as HTMLElement;
    
    if (!toggleBtn) {
      console.warn('⚠️ Botão de toggle do chatbot não encontrado');
      return;
    }
    
    if (!docsToc) {
      console.warn('⚠️ Container docs-toc não encontrado');
      return;
    }

    console.log('✅ Botão e docs-toc encontrados, configurando toggle...');

    // Inicialmente esconder o chatbot
    docsToc.style.display = 'none';
    docsToc.style.visibility = 'hidden';

    // Remover listeners anteriores se existirem
    const newToggleBtn = toggleBtn.cloneNode(true) as HTMLElement;
    toggleBtn.parentNode?.replaceChild(newToggleBtn, toggleBtn);

    newToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      const isVisible = docsToc.style.display !== 'none' && docsToc.style.visibility !== 'hidden';
      
      console.log('🔘 Toggle clicado, estado atual:', isVisible ? 'visível' : 'escondido');
      
      if (isVisible) {
        // Esconder
        docsToc.style.display = 'none';
        docsToc.style.visibility = 'hidden';
        newToggleBtn.setAttribute('title', 'Abrir Chat Gemini');
        newToggleBtn.setAttribute('aria-label', 'Abrir Chat Gemini');
        console.log('👁️ Chatbot escondido');
      } else {
        // Mostrar - usar flex para garantir layout correto
        docsToc.style.display = 'flex';
        docsToc.style.visibility = 'visible';
        docsToc.style.opacity = '1';
        docsToc.style.flexDirection = 'column';
        newToggleBtn.setAttribute('title', 'Fechar Chat Gemini');
        newToggleBtn.setAttribute('aria-label', 'Fechar Chat Gemini');
        console.log('👁️ Chatbot mostrado, display:', docsToc.style.display, 'visibility:', docsToc.style.visibility);
      }
    });
  }

  /**
   * Inicializa o chatbot Gemini
   */
  private initializeChatbot(): void {
    const container = this.container?.querySelector('#chatbot-container');
    const docsToc = this.container?.querySelector('.docs-toc') as HTMLElement;
    
    if (!container) {
      console.warn('⚠️ Container do chatbot não encontrado');
      return;
    }

    // Destruir chatbot anterior se existir
    if (this.chatbot) {
      this.chatbot.destroy();
    }

    // Criar novo chatbot
    this.chatbot = new GeminiChatbot();
    const chatbotElement = this.chatbot.create();
    
    // Adicionar o chatbot dentro do container (que está dentro do docs-toc)
    container.appendChild(chatbotElement);
    
    // Garantir que o docs-toc tenha a largura inicial correta
    if (docsToc) {
      docsToc.style.setProperty('width', '260px', 'important');
      docsToc.style.setProperty('min-width', '200px', 'important');
      docsToc.style.setProperty('max-width', '600px', 'important');
    }
    
    // Inicializar ícones Lucide após adicionar ao DOM
    // Usar setTimeout para garantir que o elemento esteja no DOM
    const initIcons = () => {
      if (typeof lucide !== 'undefined' && chatbotElement.parentElement) {
        try {
          lucide.createIcons({
            baseElement: chatbotElement
          });
        } catch (error) {
          console.warn('Erro ao inicializar ícones Lucide no chatbot:', error);
        }
      }
    };
    
    requestAnimationFrame(() => {
      setTimeout(initIcons, 100);
    });
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
    
    // Limpar chatbot
    if (this.chatbot) {
      this.chatbot.destroy();
      this.chatbot = null;
    }
  }
}
