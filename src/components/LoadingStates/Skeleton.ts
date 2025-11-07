/**
 * Skeleton Loading Component
 * Componente de placeholder animado para loading states
 */

import './Skeleton.css';

export interface SkeletonOptions {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  count?: number;
}

/**
 * Classe Skeleton para criar loading placeholders
 */
export class Skeleton {
  /**
   * Cria um elemento skeleton
   */
  static create(options: SkeletonOptions = {}): HTMLElement {
    const {
      width = '100%',
      height = '1rem',
      borderRadius = 'var(--border-radius-small)',
      className = '',
      variant = 'rectangular',
      animation = 'wave',
      count = 1
    } = options;

    const container = document.createElement('div');
    container.className = 'skeleton-container';

    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = `skeleton skeleton-${variant} skeleton-${animation} ${className}`.trim();
      skeleton.style.width = width;
      skeleton.style.height = height;

      if (variant === 'rectangular' || variant === 'rounded') {
        skeleton.style.borderRadius = variant === 'rounded' ? '999px' : borderRadius;
      }

      container.appendChild(skeleton);
    }

    return count === 1 ? container.firstElementChild as HTMLElement : container;
  }

  /**
   * Cria um skeleton de texto (múltiplas linhas)
   */
  static text(lines = 3, lastLineWidth = '60%'): HTMLElement {
    const container = document.createElement('div');
    container.className = 'skeleton-text-container';

    for (let i = 0; i < lines; i++) {
      const isLastLine = i === lines - 1;
      const skeleton = this.create({
        width: isLastLine ? lastLineWidth : '100%',
        height: '1rem',
        variant: 'text'
      });
      container.appendChild(skeleton);
    }

    return container;
  }

  /**
   * Cria um skeleton circular (avatar, ícone)
   */
  static circle(size = '48px'): HTMLElement {
    return this.create({
      width: size,
      height: size,
      variant: 'circular'
    });
  }

  /**
   * Cria um skeleton retangular
   */
  static rectangle(width = '100%', height = '200px'): HTMLElement {
    return this.create({
      width,
      height,
      variant: 'rectangular'
    });
  }

  /**
   * Cria um skeleton de card completo
   */
  static card(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'skeleton-card';

    // Imagem
    const image = this.rectangle('100%', '200px');
    image.style.marginBottom = 'var(--space-m)';
    card.appendChild(image);

    // Título
    const title = this.create({
      width: '80%',
      height: '1.5rem'
    });
    title.style.marginBottom = 'var(--space-s)';
    card.appendChild(title);

    // Descrição
    const description = this.text(2);
    card.appendChild(description);

    return card;
  }

  /**
   * Cria skeleton de lista
   */
  static list(items = 5): HTMLElement {
    const list = document.createElement('div');
    list.className = 'skeleton-list';

    for (let i = 0; i < items; i++) {
      const item = document.createElement('div');
      item.className = 'skeleton-list-item';

      const avatar = this.circle('40px');
      avatar.style.marginRight = 'var(--space-m)';
      item.appendChild(avatar);

      const content = document.createElement('div');
      content.style.flex = '1';
      
      const title = this.create({ width: '60%', height: '1rem' });
      title.style.marginBottom = 'var(--space-xs)';
      content.appendChild(title);

      const subtitle = this.create({ width: '40%', height: '0.875rem' });
      content.appendChild(subtitle);

      item.appendChild(content);
      list.appendChild(item);
    }

    return list;
  }

  /**
   * Cria skeleton de tabela
   */
  static table(rows = 5, columns = 4): HTMLElement {
    const table = document.createElement('div');
    table.className = 'skeleton-table';

    // Header
    const header = document.createElement('div');
    header.className = 'skeleton-table-header';
    for (let i = 0; i < columns; i++) {
      const cell = this.create({ width: '100%', height: '1rem' });
      header.appendChild(cell);
    }
    table.appendChild(header);

    // Rows
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('div');
      row.className = 'skeleton-table-row';
      for (let j = 0; j < columns; j++) {
        const cell = this.create({ width: '100%', height: '1rem' });
        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    return table;
  }

  /**
   * Cria skeleton para sidebar
   */
  static sidebar(): HTMLElement {
    const sidebar = document.createElement('div');
    sidebar.className = 'skeleton-sidebar';

    // Header
    const header = this.create({ width: '80%', height: '1.5rem' });
    header.style.marginBottom = 'var(--space-xl)';
    sidebar.appendChild(header);

    // Nav items
    for (let i = 0; i < 8; i++) {
      const navItem = this.create({ 
        width: `${Math.random() * 30 + 60}%`, 
        height: '1rem' 
      });
      navItem.style.marginBottom = 'var(--space-m)';
      sidebar.appendChild(navItem);
    }

    return sidebar;
  }

  /**
   * Cria skeleton de conteúdo de artigo
   */
  static article(): HTMLElement {
    const article = document.createElement('div');
    article.className = 'skeleton-article';

    // Título
    const title = this.create({ width: '90%', height: '2.5rem' });
    title.style.marginBottom = 'var(--space-l)';
    article.appendChild(title);

    // Meta
    const meta = this.create({ width: '50%', height: '1rem' });
    meta.style.marginBottom = 'var(--space-xl)';
    article.appendChild(meta);

    // Imagem
    const image = this.rectangle('100%', '300px');
    image.style.marginBottom = 'var(--space-xl)';
    article.appendChild(image);

    // Parágrafos
    for (let i = 0; i < 4; i++) {
      const paragraph = this.text(4);
      paragraph.style.marginBottom = 'var(--space-l)';
      article.appendChild(paragraph);
    }

    return article;
  }
}

/**
 * Helper para remover skeleton e mostrar conteúdo real
 */
export function replaceSkeleton(
  skeletonElement: HTMLElement,
  realContent: HTMLElement,
  fadeIn = true
): void {
  if (fadeIn) {
    realContent.style.opacity = '0';
    realContent.style.transition = 'opacity 300ms ease-in';
    
    skeletonElement.replaceWith(realContent);
    
    requestAnimationFrame(() => {
      realContent.style.opacity = '1';
    });
  } else {
    skeletonElement.replaceWith(realContent);
  }
}

