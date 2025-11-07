import * as math from 'mathjs';

/**
 * Serviço para cálculos matemáticos avançados com Math.js
 */
class MathService {
  constructor() {
    // Inicialização se necessário
  }

  /**
   * Avalia uma expressão matemática
   */
  evaluate(expression: string): any {
    try {
      return math.evaluate(expression);
    } catch (error) {
      console.error('Erro ao avaliar expressão:', error);
      throw error;
    }
  }

  /**
   * Calcula derivada simbólica
   */
  derivative(expression: string, variable: string): string {
    try {
      const node = math.parse(expression);
      const derivative = math.derivative(node, variable);
      return derivative.toString();
    } catch (error) {
      console.error('Erro ao calcular derivada:', error);
      throw error;
    }
  }

  /**
   * Simplifica uma expressão
   */
  simplify(expression: string): string {
    try {
      const node = math.parse(expression);
      const simplified = math.simplify(node);
      return simplified.toString();
    } catch (error) {
      console.error('Erro ao simplificar:', error);
      throw error;
    }
  }

  /**
   * Resolve equações
   */
  solve(equation: string, variable: string): any {
    try {
      return math.evaluate(`solve(${equation}, ${variable})`);
    } catch (error) {
      console.error('Erro ao resolver equação:', error);
      throw error;
    }
  }

  /**
   * Operações com matrizes
   */
  matrix(values: number[][]): math.Matrix {
    return math.matrix(values);
  }

  /**
   * Processa blocos de cálculo matemático
   */
  processAll(container: HTMLElement): void {
    const mathElements = container.querySelectorAll('[data-math-calc]');

    mathElements.forEach((el) => {
      try {
        const expression = el.getAttribute('data-math-calc');
        if (!expression) return;

        const result = this.evaluate(expression);
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'math-calc-result';
        resultDiv.innerHTML = `
          <div class="math-calc-expression">${expression}</div>
          <div class="math-calc-equals">=</div>
          <div class="math-calc-value">${math.format(result, { precision: 14 })}</div>
        `;
        
        el.appendChild(resultDiv);
      } catch (error) {
        console.error('Erro ao processar cálculo matemático:', error);
        (el as HTMLElement).innerHTML = `
          <div class="math-error">
            <strong>⚠️ Erro no cálculo</strong>
            <p>${(error as Error).message}</p>
          </div>
        `;
      }
    });
  }
}

export const mathService = new MathService();

