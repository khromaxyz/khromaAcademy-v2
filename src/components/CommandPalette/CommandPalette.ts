/**
 * CommandPalette Component
 * Busca global estilo Spotlight/Command+K
 */

import './CommandPalette.css';
import { fuzzySearch, highlightMatches } from './fuzzySearch';
import type { SearchMatch } from './fuzzySearch';

export interface SearchItem {
  id: string;
  title: string;
  category: 'curso' | 'trilha' | 'config' | 'acao';
  icon: string;
  keywords: string[];
  action: () => void;
}

export interface CommandPaletteOptions {
  placeholder?: string;
  maxResults?: number;
}

/**
 * Classe CommandPalette - Busca Global Ultra-Moderna
 */
export class CommandPalette {
  private container: HTMLElement;
  private overlay: HTMLElement;
  private input: HTMLInputElement;
  private resultsContainer: HTMLElement;
  private items: SearchItem[] = [];
  private filteredItems: Array<{ item: SearchItem; match: SearchMatch }> = [];
  private selectedIndex: number = 0;
  private isOpen: boolean = false;
  private options: CommandPaletteOptions;
  private debounceTimer: number = 0;
  private recentSearches: string[] = [];

  constructor(options: CommandPaletteOptions = {}) {
    this.options = {
      placeholder: 'Buscar cursos, trilhas, configurações...',
      maxResults: 8,
      ...options
    };

    this.container = this.create();
    this.overlay = this.createOverlay();
    this.input = this.container.querySelector('.command-input') as HTMLInputElement;
    this.resultsContainer = this.container.querySelector('.command-results') as HTMLElement;
    
    this.setupEventListeners();
    this.loadRecentSearches();
  }

  /**
   * Cria o elemento do CommandPalette
   */
  private create(): HTMLElement {
    const palette = document.createElement('div');
    palette.className = 'command-palette';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-label', 'Busca global');
    palette.setAttribute('aria-modal', 'true');

    palette.innerHTML = `
      <div class="command-palette-container">
        <div class="command-header">
          <svg class="command-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            class="command-input" 
            placeholder="${this.options.placeholder}"
            autocomplete="off"
            spellcheck="false"
            aria-autocomplete="list"
            aria-controls="command-results"
          />
          <div class="command-close-hint">
            <span class="kbd">Esc</span>
          </div>
        </div>
        <div id="command-results" class="command-results" role="listbox">
          <!-- Results will be rendered here -->
        </div>
      </div>
    `;

    document.body.appendChild(palette);
    return palette;
  }

  /**
   * Cria o overlay de fundo
   */
  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'command-overlay';
    overlay.addEventListener('click', () => this.close());
    document.body.appendChild(overlay);
    return overlay;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Keyboard shortcuts globais
    document.addEventListener('keydown', (e) => {
      // Cmd+K ou Ctrl+K para abrir
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
        return;
      }

      // ESC para fechar
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }
    });

    // Input events
    this.input.addEventListener('input', () => {
      this.handleSearch();
    });

    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });

    // Click nos resultados
    this.resultsContainer.addEventListener('click', (e) => {
      const resultItem = (e.target as HTMLElement).closest('.command-result-item');
      if (resultItem) {
        const index = parseInt(resultItem.getAttribute('data-index') || '0');
        this.selectItem(index);
      }
    });
  }

  /**
   * Handle search com debounce
   */
  private handleSearch(): void {
    clearTimeout(this.debounceTimer);
    
    this.debounceTimer = window.setTimeout(() => {
      const query = this.input.value.trim();
      
      if (!query) {
        this.showRecentSearches();
        return;
      }

      this.filteredItems = fuzzySearch(
        query,
        this.items,
        (item) => item.title,
        (item) => item.keywords
      );

      this.selectedIndex = 0;
      this.renderResults();
    }, 150);
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyboardNavigation(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(
          this.selectedIndex + 1,
          this.filteredItems.length - 1
        );
        this.renderResults();
        this.scrollToSelected();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.renderResults();
        this.scrollToSelected();
        break;

      case 'Enter':
        e.preventDefault();
        if (this.filteredItems.length > 0) {
          this.selectItem(this.selectedIndex);
        }
        break;

      case 'Home':
        e.preventDefault();
        this.selectedIndex = 0;
        this.renderResults();
        this.scrollToSelected();
        break;

      case 'End':
        e.preventDefault();
        this.selectedIndex = this.filteredItems.length - 1;
        this.renderResults();
        this.scrollToSelected();
        break;
    }
  }

  /**
   * Scroll para o item selecionado
   */
  private scrollToSelected(): void {
    const selectedElement = this.resultsContainer.querySelector('.command-result-item.selected');
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  /**
   * Renderiza resultados
   */
  private renderResults(): void {
    if (this.filteredItems.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="command-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p>Nenhum resultado encontrado</p>
          <small>Tente buscar por outro termo</small>
        </div>
      `;
      return;
    }

    const maxResults = this.options.maxResults || 8;
    const itemsToShow = this.filteredItems.slice(0, maxResults);

    let html = '';
    let currentCategory = '';

    itemsToShow.forEach(({ item, match }, index) => {
      // Mostrar categoria
      if (item.category !== currentCategory) {
        html += `<div class="command-category">${this.getCategoryLabel(item.category)}</div>`;
        currentCategory = item.category;
      }

      const isSelected = index === this.selectedIndex;
      const highlightedTitle = highlightMatches(item.title, match.indices);

      html += `
        <div 
          class="command-result-item ${isSelected ? 'selected' : ''}" 
          data-index="${index}"
          role="option"
          aria-selected="${isSelected}"
        >
          <div class="result-icon">${item.icon}</div>
          <div class="result-content">
            <div class="result-title">${highlightedTitle}</div>
            <div class="result-category">${this.getCategoryLabel(item.category)}</div>
          </div>
          ${isSelected ? '<div class="result-enter"><span class="kbd">↵</span></div>' : ''}
        </div>
      `;
    });

    this.resultsContainer.innerHTML = html;
  }

  /**
   * Mostra buscas recentes
   */
  private showRecentSearches(): void {
    if (this.recentSearches.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="command-empty">
          <p>Digite para começar a buscar</p>
          <small>Use ⌘K para abrir a qualquer momento</small>
        </div>
      `;
      return;
    }

    let html = '<div class="command-category">Buscas Recentes</div>';
    
    this.recentSearches.slice(0, 5).forEach((search) => {
      html += `
        <div class="command-result-item recent-search" data-recent="${search}">
          <div class="result-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="result-content">
            <div class="result-title">${search}</div>
          </div>
        </div>
      `;
    });

    this.resultsContainer.innerHTML = html;

    // Click em busca recente
    this.resultsContainer.querySelectorAll('.recent-search').forEach(el => {
      el.addEventListener('click', () => {
        const search = el.getAttribute('data-recent') || '';
        this.input.value = search;
        this.handleSearch();
      });
    });
  }

  /**
   * Seleciona um item
   */
  private selectItem(index: number): void {
    if (index < 0 || index >= this.filteredItems.length) return;

    const selected = this.filteredItems[index];
    
    // Salvar busca
    this.saveRecentSearch(this.input.value);

    // Executar ação
    selected.item.action();

    // Fechar palette
    this.close();
  }

  /**
   * Registra itens para busca
   */
  registerItems(items: SearchItem[]): void {
    this.items = items;
  }

  /**
   * Adiciona um item
   */
  addItem(item: SearchItem): void {
    this.items.push(item);
  }

  /**
   * Remove um item
   */
  removeItem(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
  }

  /**
   * Abre o CommandPalette
   */
  open(): void {
    if (this.isOpen) return;

    this.isOpen = true;
    this.overlay.classList.add('active');
    this.container.classList.add('active');
    
    // Focus no input
    setTimeout(() => {
      this.input.focus();
      this.showRecentSearches();
    }, 100);

    // Trap focus
    this.trapFocus();

    // Disparar evento
    window.dispatchEvent(new CustomEvent('command-palette-opened'));
  }

  /**
   * Fecha o CommandPalette
   */
  close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.overlay.classList.remove('active');
    this.container.classList.remove('active');
    
    // Limpar input
    this.input.value = '';
    this.filteredItems = [];
    this.selectedIndex = 0;
    this.resultsContainer.innerHTML = '';

    // Disparar evento
    window.dispatchEvent(new CustomEvent('command-palette-closed'));
  }

  /**
   * Toggle open/close
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Trap focus dentro do palette
   */
  private trapFocus(): void {
    const focusableElements = this.container.querySelectorAll(
      'input, button, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    this.container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  /**
   * Salva busca recente
   */
  private saveRecentSearch(query: string): void {
    if (!query.trim()) return;

    // Remover se já existe
    this.recentSearches = this.recentSearches.filter(s => s !== query);
    
    // Adicionar no início
    this.recentSearches.unshift(query);
    
    // Manter apenas 10
    this.recentSearches = this.recentSearches.slice(0, 10);
    
    // Salvar no localStorage
    localStorage.setItem('command-palette-recent', JSON.stringify(this.recentSearches));
  }

  /**
   * Carrega buscas recentes
   */
  private loadRecentSearches(): void {
    try {
      const stored = localStorage.getItem('command-palette-recent');
      if (stored) {
        this.recentSearches = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
    }
  }

  /**
   * Retorna label da categoria
   */
  private getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'curso': 'Cursos',
      'trilha': 'Trilhas',
      'config': 'Configurações',
      'acao': 'Ações'
    };
    return labels[category] || category;
  }

  /**
   * Destroy
   */
  destroy(): void {
    this.container.remove();
    this.overlay.remove();
  }

  /**
   * Método estático para criar instância singleton
   */
  private static instance: CommandPalette | null = null;

  static getInstance(options?: CommandPaletteOptions): CommandPalette {
    if (!CommandPalette.instance) {
      CommandPalette.instance = new CommandPalette(options);
    }
    return CommandPalette.instance;
  }
}

