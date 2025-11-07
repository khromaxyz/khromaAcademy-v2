/**
 * Utilitários para manipulação do DOM
 */

/**
 * Aguarda o DOM estar completamente carregado
 */
export function waitForDOMReady(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Cria um elemento HTML com atributos e conteúdo
 */
export function createElement<T extends HTMLElement>(
  tag: string,
  attributes?: Record<string, string>,
  content?: string
): T {
  const element = document.createElement(tag) as T;
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  if (content) {
    element.innerHTML = content;
  }
  return element;
}

/**
 * Remove todos os filhos de um elemento
 */
export function clearElement(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Adiciona ou remove classe baseado em condição
 */
export function toggleClass(element: HTMLElement, className: string, condition: boolean): void {
  if (condition) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}

