/**
 * Serviço para pesquisar e validar bibliotecas npm
 * Busca versões atualizadas, valida existência e mantém cache
 */

interface LibraryInfo {
  name: string;
  version: string;
  exists: boolean;
  lastChecked: number;
  description?: string;
  homepage?: string;
}

interface CachedLibraryInfo extends LibraryInfo {
  cachedAt: number;
}

interface NpmPackageInfo {
  name: string;
  version: string;
  description?: string;
  homepage?: string;
  'dist-tags'?: {
    latest: string;
  };
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
const CACHE_KEY = 'khroma-library-research-cache';
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

class LibraryResearchService {
  private cache: Map<string, CachedLibraryInfo> = new Map();

  constructor() {
    this.loadCache();
  }

  /**
   * Carrega cache do localStorage
   */
  private loadCache(): void {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Record<string, CachedLibraryInfo>;
        const now = Date.now();
        
        // Limpar entradas expiradas
        Object.entries(parsed).forEach(([key, value]) => {
          if (now - value.cachedAt < CACHE_TTL) {
            this.cache.set(key, value);
          }
        });
      }
    } catch (error) {
      console.warn('⚠️ [LibraryResearchService] Erro ao carregar cache:', error);
      this.cache.clear();
    }
  }

  /**
   * Salva cache no localStorage
   */
  private saveCache(): void {
    try {
      const cacheObj: Record<string, CachedLibraryInfo> = {};
      this.cache.forEach((value, key) => {
        cacheObj[key] = value;
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    } catch (error) {
      console.warn('⚠️ [LibraryResearchService] Erro ao salvar cache:', error);
    }
  }

  /**
   * Pesquisa informações de uma biblioteca no npm
   */
  private async fetchLibraryInfo(packageName: string): Promise<LibraryInfo | null> {
    try {
      const response = await fetch(`${NPM_REGISTRY_URL}/${packageName}/latest`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            name: packageName,
            version: 'unknown',
            exists: false,
            lastChecked: Date.now(),
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as NpmPackageInfo;
      
      return {
        name: data.name,
        version: data['dist-tags']?.latest || data.version,
        exists: true,
        lastChecked: Date.now(),
        description: data.description,
        homepage: data.homepage,
      };
    } catch (error) {
      console.error(`❌ [LibraryResearchService] Erro ao buscar ${packageName}:`, error);
      return null;
    }
  }

  /**
   * Obtém informações de uma biblioteca (com cache)
   */
  async getLibraryInfo(packageName: string, useCache: boolean = true): Promise<LibraryInfo | null> {
    const normalizedName = packageName.toLowerCase().trim();

    // Verificar cache primeiro
    if (useCache) {
      const cached = this.cache.get(normalizedName);
      if (cached) {
        const now = Date.now();
        if (now - cached.cachedAt < CACHE_TTL) {
          return {
            name: cached.name,
            version: cached.version,
            exists: cached.exists,
            lastChecked: cached.lastChecked,
            description: cached.description,
            homepage: cached.homepage,
          };
        }
      }
    }

    // Buscar no npm
    const info = await this.fetchLibraryInfo(normalizedName);
    
    if (info) {
      // Salvar no cache
      this.cache.set(normalizedName, {
        ...info,
        cachedAt: Date.now(),
      });
      this.saveCache();
      return info;
    }

    return null;
  }

  /**
   * Obtém informações de múltiplas bibliotecas em paralelo
   */
  async getMultipleLibraryInfo(
    packageNames: string[],
    useCache: boolean = true
  ): Promise<Map<string, LibraryInfo>> {
    const results = new Map<string, LibraryInfo>();
    const toFetch: string[] = [];

    // Verificar cache primeiro
    if (useCache) {
      packageNames.forEach((name) => {
        const normalizedName = name.toLowerCase().trim();
        const cached = this.cache.get(normalizedName);
        const now = Date.now();

        if (cached && now - cached.cachedAt < CACHE_TTL) {
          results.set(normalizedName, {
            name: cached.name,
            version: cached.version,
            exists: cached.exists,
            lastChecked: cached.lastChecked,
            description: cached.description,
            homepage: cached.homepage,
          });
        } else {
          toFetch.push(name);
        }
      });
    } else {
      toFetch.push(...packageNames);
    }

    // Buscar as que não estão em cache
    if (toFetch.length > 0) {
      const fetchPromises = toFetch.map((name) => this.getLibraryInfo(name, false));
      const fetchedResults = await Promise.allSettled(fetchPromises);

      fetchedResults.forEach((result, index) => {
        const packageName = toFetch[index];
        const normalizedName = packageName.toLowerCase().trim();

        if (result.status === 'fulfilled' && result.value) {
          results.set(normalizedName, result.value);
        } else {
          // Fallback: biblioteca não encontrada ou erro
          results.set(normalizedName, {
            name: packageName,
            version: 'unknown',
            exists: false,
            lastChecked: Date.now(),
          });
        }
      });
    }

    return results;
  }

  /**
   * Valida se uma biblioteca existe e está disponível
   */
  async validateLibrary(packageName: string): Promise<boolean> {
    const info = await this.getLibraryInfo(packageName);
    return info?.exists ?? false;
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(CACHE_KEY);
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const libraryResearchService = new LibraryResearchService();

