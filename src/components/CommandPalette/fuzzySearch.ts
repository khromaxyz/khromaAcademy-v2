/**
 * Fuzzy Search Algorithm
 * Implementação simplificada de busca fuzzy com ranking
 */

export interface SearchMatch {
  score: number;
  indices: number[];
}

/**
 * Calcula a similaridade entre duas strings usando fuzzy matching
 */
export function fuzzyMatch(pattern: string, text: string): SearchMatch | null {
  const patternLower = pattern.toLowerCase();
  const textLower = text.toLowerCase();
  
  let patternIdx = 0;
  let score = 0;
  const indices: number[] = [];
  let previousMatchIndex = -1;
  
  for (let i = 0; i < textLower.length; i++) {
    if (patternIdx >= patternLower.length) break;
    
    if (textLower[i] === patternLower[patternIdx]) {
      indices.push(i);
      
      // Bonus para matches consecutivos
      if (previousMatchIndex === i - 1) {
        score += 5;
      }
      
      // Bonus para match no início
      if (i === 0) {
        score += 10;
      }
      
      // Bonus para match após espaço ou hífen
      if (i > 0 && (text[i - 1] === ' ' || text[i - 1] === '-')) {
        score += 8;
      }
      
      // Bonus para match em maiúscula (camelCase)
      if (text[i] !== textLower[i]) {
        score += 7;
      }
      
      score += 1;
      previousMatchIndex = i;
      patternIdx++;
    }
  }
  
  // Se não encontrou todos os caracteres do pattern
  if (patternIdx !== patternLower.length) {
    return null;
  }
  
  // Penalidade pela distância entre matches
  if (indices.length > 1) {
    const spread = indices[indices.length - 1] - indices[0];
    score -= spread * 0.1;
  }
  
  // Bonus proporcional ao tamanho do match
  const matchRatio = pattern.length / text.length;
  score += matchRatio * 20;
  
  return { score, indices };
}

/**
 * Destaca os caracteres que deram match na string
 */
export function highlightMatches(text: string, indices: number[]): string {
  if (indices.length === 0) return text;
  
  let result = '';
  let lastIndex = 0;
  
  indices.forEach(index => {
    result += text.slice(lastIndex, index);
    result += `<mark>${text[index]}</mark>`;
    lastIndex = index + 1;
  });
  
  result += text.slice(lastIndex);
  return result;
}

/**
 * Busca em um array de items com fuzzy matching
 */
export function fuzzySearch<T>(
  pattern: string,
  items: T[],
  getText: (item: T) => string,
  getKeywords?: (item: T) => string[]
): Array<{ item: T; match: SearchMatch }> {
  if (!pattern.trim()) {
    return [];
  }
  
  const results: Array<{ item: T; match: SearchMatch }> = [];
  
  items.forEach(item => {
    const text = getText(item);
    const match = fuzzyMatch(pattern, text);
    
    if (match) {
      results.push({ item, match });
    } else if (getKeywords) {
      // Tentar match nas keywords
      const keywords = getKeywords(item);
      for (const keyword of keywords) {
        const keywordMatch = fuzzyMatch(pattern, keyword);
        if (keywordMatch) {
          // Score menor para matches em keywords
          keywordMatch.score *= 0.8;
          results.push({ item, match: keywordMatch });
          break;
        }
      }
    }
  });
  
  // Ordenar por score (maior primeiro)
  results.sort((a, b) => b.match.score - a.match.score);
  
  return results;
}

