/**
 * Tabs Component
 * Componente de abas para alternar conteúdo
 */

import './Tabs.css';
import { fadeIn, fadeOut } from '@/utils/animations';

export interface Tab {
  id: string;
  label: string;
  content: string | HTMLElement;
  icon?: string;
  badge?: string | number;
}

export interface TabsOptions {
  activeTabId?: string;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  onChange?: (tabId: string) => void;
}

/**
 * Classe Tabs para criar navegação por abas
 */
export class Tabs {
  private container: HTMLElement;
  private tabs: Tab[];
  private options: TabsOptions;
  private activeTabId: string;
  private tabHeaders: Map<string, HTMLElement>;
  private tabContents: Map<string, HTMLElement>;

  constructor(tabs: Tab[], options: TabsOptions = {}) {
    this.tabs = tabs;
    this.options = {
      variant: 'default',
      ...options
    };
    this.activeTabId = options.activeTabId || (tabs[0]?.id || '');
    this.tabHeaders = new Map();
    this.tabContents = new Map();
    this.container = this.create();
  }

  /**
   * Cria o elemento tabs
   */
  private create(): HTMLElement {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = `tabs tabs-${this.options.variant} ${this.options.className || ''}`.trim();

    // Criar tab headers
    const tabList = document.createElement('div');
    tabList.className = 'tabs-list';
    tabList.setAttribute('role', 'tablist');

    this.tabs.forEach(tab => {
      const tabButton = this.createTabButton(tab);
      this.tabHeaders.set(tab.id, tabButton);
      tabList.appendChild(tabButton);
    });

    // Criar tab contents
    const tabPanels = document.createElement('div');
    tabPanels.className = 'tabs-panels';

    this.tabs.forEach(tab => {
      const tabPanel = this.createTabPanel(tab);
      this.tabContents.set(tab.id, tabPanel);
      tabPanels.appendChild(tabPanel);
    });

    tabsContainer.appendChild(tabList);
    tabsContainer.appendChild(tabPanels);

    return tabsContainer;
  }

  /**
   * Cria um botão de tab
   */
  private createTabButton(tab: Tab): HTMLElement {
    const isActive = tab.id === this.activeTabId;

    const button = document.createElement('button');
    button.className = `tab-button ${isActive ? 'is-active' : ''}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(isActive));
    button.setAttribute('aria-controls', `panel-${tab.id}`);
    button.dataset.tabId = tab.id;

    let content = '';
    if (tab.icon) {
      content += `<span class="tab-icon">${tab.icon}</span>`;
    }
    content += `<span class="tab-label">${tab.label}</span>`;
    if (tab.badge !== undefined) {
      content += `<span class="tab-badge">${tab.badge}</span>`;
    }

    button.innerHTML = content;
    button.addEventListener('click', () => this.selectTab(tab.id));

    return button;
  }

  /**
   * Cria um painel de tab
   */
  private createTabPanel(tab: Tab): HTMLElement {
    const isActive = tab.id === this.activeTabId;

    const panel = document.createElement('div');
    panel.className = `tab-panel ${isActive ? 'is-active' : ''}`;
    panel.id = `panel-${tab.id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.dataset.tabId = tab.id;

    if (typeof tab.content === 'string') {
      panel.innerHTML = tab.content;
    } else {
      panel.appendChild(tab.content);
    }

    if (!isActive) {
      panel.style.display = 'none';
    }

    return panel;
  }

  /**
   * Seleciona uma tab
   */
  async selectTab(tabId: string): Promise<void> {
    if (tabId === this.activeTabId) return;

    const oldPanel = this.tabContents.get(this.activeTabId);
    const newPanel = this.tabContents.get(tabId);
    const oldButton = this.tabHeaders.get(this.activeTabId);
    const newButton = this.tabHeaders.get(tabId);

    if (!newPanel || !newButton) return;

    // Atualizar botões
    oldButton?.classList.remove('is-active');
    oldButton?.setAttribute('aria-selected', 'false');
    newButton.classList.add('is-active');
    newButton.setAttribute('aria-selected', 'true');

    // Animar transição de painéis
    if (oldPanel) {
      await fadeOut(oldPanel, 300);
      oldPanel.classList.remove('is-active');
      oldPanel.style.display = 'none';
    }

    newPanel.style.display = 'block';
    newPanel.classList.add('is-active');
    await fadeIn(newPanel, 300);

    // Atualizar estado
    this.activeTabId = tabId;

    // Callback
    this.options.onChange?.(tabId);
  }

  /**
   * Retorna o elemento container
   */
  getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Retorna a tab ativa
   */
  getActiveTab(): string {
    return this.activeTabId;
  }

  /**
   * Adiciona uma nova tab
   */
  addTab(tab: Tab, index?: number): void {
    if (index !== undefined && index >= 0 && index < this.tabs.length) {
      this.tabs.splice(index, 0, tab);
    } else {
      this.tabs.push(tab);
    }

    const tabList = this.container.querySelector('.tabs-list');
    const tabPanels = this.container.querySelector('.tabs-panels');

    if (!tabList || !tabPanels) return;

    const tabButton = this.createTabButton(tab);
    const tabPanel = this.createTabPanel(tab);

    this.tabHeaders.set(tab.id, tabButton);
    this.tabContents.set(tab.id, tabPanel);

    if (index !== undefined && index >= 0 && index < tabList.children.length) {
      tabList.insertBefore(tabButton, tabList.children[index]);
      tabPanels.insertBefore(tabPanel, tabPanels.children[index]);
    } else {
      tabList.appendChild(tabButton);
      tabPanels.appendChild(tabPanel);
    }
  }

  /**
   * Remove uma tab
   */
  removeTab(tabId: string): void {
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    this.tabs.splice(index, 1);

    const tabButton = this.tabHeaders.get(tabId);
    const tabPanel = this.tabContents.get(tabId);

    tabButton?.remove();
    tabPanel?.remove();

    this.tabHeaders.delete(tabId);
    this.tabContents.delete(tabId);

    // Se a tab removida era a ativa, selecionar outra
    if (tabId === this.activeTabId && this.tabs.length > 0) {
      this.selectTab(this.tabs[0].id);
    }
  }

  /**
   * Método estático para criar tabs facilmente
   */
  static create(tabs: Tab[], options?: TabsOptions): HTMLElement {
    const tabsInstance = new Tabs(tabs, options);
    return tabsInstance.getElement();
  }

  /**
   * Inicializa todos os tabs em um container
   */
  static initAll(_container: HTMLElement): void {
    // Método placeholder - tabs são auto-inicializados quando criados
    // Este método existe para manter consistência na API
  }
}

