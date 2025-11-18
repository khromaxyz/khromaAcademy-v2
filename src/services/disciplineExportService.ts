/**
 * Serviço para exportar e importar disciplinas como arquivos Markdown
 */

import type { Discipline, SubModule } from '@/types/discipline';

/**
 * Exporta uma disciplina completa para um arquivo Markdown
 * @param discipline - Disciplina a ser exportada
 * @param disciplineId - ID da disciplina
 * @returns Promise que resolve quando o arquivo é baixado
 */
export async function exportDisciplineToMarkdown(
  discipline: Discipline,
  disciplineId: string
): Promise<void> {
  // Construir conteúdo Markdown completo
  let markdown = `# ${discipline.title}\n\n`;
  
  // Metadados no front matter
  markdown += `---\n`;
  markdown += `id: ${disciplineId}\n`;
  markdown += `code: ${discipline.code}\n`;
  markdown += `title: ${discipline.title}\n`;
  markdown += `period: ${discipline.period}\n`;
  markdown += `description: ${discipline.description || ''}\n`;
  markdown += `color: ${discipline.color}\n`;
  markdown += `progress: ${discipline.progress}\n`;
  markdown += `prerequisites: ${JSON.stringify(discipline.prerequisites || [])}\n`;
  markdown += `syllabus: ${JSON.stringify(discipline.syllabus || [])}\n`;
  if (discipline.category) {
    markdown += `category: ${discipline.category}\n`;
  }
  if (discipline.contextGeneratedAt) {
    markdown += `contextGeneratedAt: ${discipline.contextGeneratedAt}\n`;
  }
  markdown += `---\n\n`;

  // Descrição
  if (discipline.description) {
    markdown += `${discipline.description}\n\n`;
  }

  // Contexto geral (se existir)
  if (discipline.context) {
    markdown += `## Contexto Geral\n\n${discipline.context}\n\n`;
  }

  // Módulos e Submódulos
  if (discipline.modules && discipline.modules.length > 0) {
    // Ordenar módulos por order
    const sortedModules = [...discipline.modules].sort((a, b) => a.order - b.order);

    for (const module of sortedModules) {
      markdown += `# ${module.title}\n\n`;
      
      if (module.description) {
        markdown += `${module.description}\n\n`;
      }

      // Submódulos
      if (module.subModules && module.subModules.length > 0) {
        // Ordenar submódulos por order
        const sortedSubModules = [...module.subModules].sort((a, b) => a.order - b.order);

        for (const subModule of sortedSubModules) {
          markdown += `## ${subModule.title}\n\n`;
          
          if (subModule.description) {
            markdown += `*${subModule.description}*\n\n`;
          }

          // Conteúdo do submódulo
          const content = discipline.subModuleContent?.[subModule.id] || subModule.content || '';
          if (content.trim()) {
            markdown += `${content}\n\n`;
          } else {
            markdown += `*Conteúdo ainda não gerado*\n\n`;
          }
        }
      }
    }
  }

  // Criar nome do arquivo
  const sanitizedName = discipline.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const fileName = `${discipline.code}-${sanitizedName}.md`;

  // Criar blob e fazer download
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`📄 [DisciplineExport] Disciplina exportada: ${fileName}`);
}

/**
 * Importa uma disciplina de um arquivo Markdown
 * @param markdownContent - Conteúdo Markdown do arquivo
 * @param fileName - Nome do arquivo (opcional)
 * @returns Objeto com disciplina e ID, ou null se inválido
 */
export function importDisciplineFromMarkdown(
  markdownContent: string,
  fileName?: string
): { discipline: Discipline; disciplineId: string } | null {
  try {
    // Remover título inicial se existir (linha que começa com #)
    let processedContent = markdownContent.trim();
    const titleMatch = processedContent.match(/^#\s+(.+?)\n\n/);
    if (titleMatch) {
      // Remover título inicial
      processedContent = processedContent.replace(/^#\s+.+?\n\n/, '');
    }

    // Extrair front matter (pode estar no início ou após título removido)
    const frontMatterMatch = processedContent.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontMatterMatch) {
      throw new Error('Front matter não encontrado');
    }

    const frontMatter = frontMatterMatch[1];
    const content = processedContent.replace(/^---\n[\s\S]*?\n---\n/, '').trim();

    // Parse front matter (formato simples: key: value)
    const metadata: Record<string, any> = {};
    frontMatter.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Procurar por padrão key: value (usar primeiro : como separador)
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex === -1) return;
      
      const key = trimmedLine.substring(0, colonIndex).trim();
      let value = trimmedLine.substring(colonIndex + 1).trim();
      
      // Tentar parsear JSON se começar com [ ou {
      if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
        try {
          metadata[key] = JSON.parse(value);
        } catch {
          // Manter como string se não for JSON válido
          metadata[key] = value;
        }
      } else {
        metadata[key] = value;
      }
    });

    // Extrair ID
    const disciplineId = metadata.id || fileName?.replace('.md', '') || `imported-${Date.now()}`;

    // Construir disciplina
    let syllabus: string[] = [];
    if (metadata.syllabus) {
      if (typeof metadata.syllabus === 'string') {
        try {
          syllabus = JSON.parse(metadata.syllabus);
        } catch {
          // Se não for JSON válido, tratar como array de uma string
          syllabus = [metadata.syllabus];
        }
      } else if (Array.isArray(metadata.syllabus)) {
        syllabus = metadata.syllabus;
      }
    }

    let prerequisites: string[] = [];
    if (metadata.prerequisites) {
      if (typeof metadata.prerequisites === 'string') {
        try {
          prerequisites = JSON.parse(metadata.prerequisites);
        } catch {
          prerequisites = [];
        }
      } else if (Array.isArray(metadata.prerequisites)) {
        prerequisites = metadata.prerequisites;
      }
    }

    const discipline: Discipline = {
      code: metadata.code || '',
      title: metadata.title || 'Disciplina Importada',
      period: typeof metadata.period === 'string' ? parseInt(metadata.period.replace('º', ''), 10) : (metadata.period || 1),
      description: metadata.description || '',
      syllabus,
      progress: typeof metadata.progress === 'string' ? parseInt(metadata.progress, 10) : (metadata.progress || 0),
      color: metadata.color || '#41FF41',
      prerequisites,
      position: { x: 50, y: 50 },
      icon: '<svg>...</svg>',
      category: metadata.category,
      contextGeneratedAt: metadata.contextGeneratedAt,
    };

    // Parsear conteúdo em módulos e submódulos
    const modules: Discipline['modules'] = [];
    const subModuleContent: Record<string, string> = {};

    // Remover descrição inicial (texto antes do primeiro módulo)
    let contentToParse = content.trim();
    
    // Encontrar o primeiro módulo (# título que não é ##)
    const firstModuleIndex = contentToParse.search(/^# [^#]/m);
    if (firstModuleIndex > 0) {
      // Há texto antes do primeiro módulo (descrição da disciplina)
      contentToParse = contentToParse.substring(firstModuleIndex);
    }

    // Encontrar todas as posições de módulos (# título)
    const lines = contentToParse.split('\n');
    const moduleStarts: number[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Verifica se é um título de módulo (# título) e não submódulo (## título)
      if (line.match(/^# [^#]/)) {
        moduleStarts.push(i);
      }
    }

    // Processar cada módulo
    for (let i = 0; i < moduleStarts.length; i++) {
      const startLine = moduleStarts[i];
      const endLine = i < moduleStarts.length - 1 ? moduleStarts[i + 1] : lines.length;
      
      const moduleLines = lines.slice(startLine, endLine);
      const moduleText = moduleLines.join('\n');
      
      // Extrair título do módulo
      const moduleTitleMatch = moduleText.match(/^# ([^\n]+)/);
      if (!moduleTitleMatch) continue;
      
      const moduleTitle = moduleTitleMatch[1].trim();
      let moduleContent = moduleText.replace(/^# [^\n]+\n\n?/, '').trim();

      // Extrair descrição do módulo (texto antes do primeiro submódulo ##)
      let moduleDescription = '';
      const firstSubModuleIndex = moduleContent.search(/^## [^#]/m);
      if (firstSubModuleIndex > 0) {
        const descText = moduleContent.substring(0, firstSubModuleIndex).trim();
        // Se não começa com #, é descrição
        if (!descText.startsWith('#')) {
          moduleDescription = descText;
          moduleContent = moduleContent.substring(firstSubModuleIndex).trim();
        }
      } else if (firstSubModuleIndex === -1) {
        // Não há submódulos, todo o conteúdo é descrição
        if (!moduleContent.startsWith('#')) {
          moduleDescription = moduleContent;
          moduleContent = '';
        }
      }

      // Extrair submódulos (## Título) - encontrar todas as posições
      const subModules: SubModule[] = [];
      const moduleContentLines = moduleContent.split('\n');
      const subModuleStarts: number[] = [];
      
      for (let k = 0; k < moduleContentLines.length; k++) {
        const line = moduleContentLines[k].trim();
        if (line.match(/^## [^#]/)) {
          subModuleStarts.push(k);
        }
      }

      // Processar cada submódulo
      for (let j = 0; j < subModuleStarts.length; j++) {
        const subStartLine = subModuleStarts[j];
        const subEndLine = j < subModuleStarts.length - 1 ? subModuleStarts[j + 1] : moduleContentLines.length;
        
        const subModuleLines = moduleContentLines.slice(subStartLine, subEndLine);
        const subModuleText = subModuleLines.join('\n');
        
        // Extrair título e conteúdo do submódulo
        const subModuleTitleMatch = subModuleText.match(/^## ([^\n]+)/);
        if (!subModuleTitleMatch) continue;
        
        const subModuleTitle = subModuleTitleMatch[1].trim();
        let subModuleContentText = subModuleText.replace(/^## [^\n]+\n\n?/, '').trim();

        // Extrair descrição (texto em itálico no início: *texto*)
        let subModuleDescription = '';
        const descMatch = subModuleContentText.match(/^\*([^*]+)\*\s*\n\n?/);
        if (descMatch) {
          subModuleDescription = descMatch[1].trim();
          subModuleContentText = subModuleContentText.replace(/^\*[^*]+\*\s*\n\n?/, '').trim();
        }

        // Remover "Conteúdo ainda não gerado"
        subModuleContentText = subModuleContentText.replace(/\*Conteúdo ainda não gerado\*\n\n?/g, '').trim();

        const subModuleId = `submodule-${i}-${j}`;
        subModules.push({
          id: subModuleId,
          title: subModuleTitle,
          description: subModuleDescription || undefined,
          order: j,
          content: subModuleContentText || undefined,
        });

        if (subModuleContentText) {
          subModuleContent[subModuleId] = subModuleContentText;
        }
      }

      modules.push({
        id: `module-${i}`,
        title: moduleTitle,
        description: moduleDescription || undefined,
        order: i,
        subModules,
      });
    }

    // Verificar se há contexto geral antes dos módulos
    if (content.trim().startsWith('## Contexto Geral')) {
      const contextMatch = content.match(/^## Contexto Geral\n\n(.+?)(?=\n\n# |$)/s);
      if (contextMatch) {
        discipline.context = contextMatch[1].trim();
      }
    }

    discipline.modules = modules;
    discipline.subModuleContent = subModuleContent;

    console.log(`📥 [DisciplineExport] Disciplina importada: ${discipline.title} (${modules.length} módulos)`);

    return { discipline, disciplineId };
  } catch (error: any) {
    console.error('❌ [DisciplineExport] Erro ao importar disciplina:', error);
    // Log mais detalhado para debug
    if (error.message) {
      console.error('❌ [DisciplineExport] Mensagem de erro:', error.message);
    }
    if (error.stack) {
      console.error('❌ [DisciplineExport] Stack trace:', error.stack);
    }
    return null;
  }
}

/**
 * Sincroniza uma disciplina com um arquivo Markdown usando File System Access API
 * @param disciplineId - ID da disciplina
 * @param discipline - Disciplina atual
 * @returns FileSystemFileHandle se suportado, null caso contrário
 */
export async function syncDisciplineWithFile(
  disciplineId: string,
  discipline: Discipline
): Promise<FileSystemFileHandle | null> {
  // Verificar suporte para File System Access API
  if (!('showSaveFilePicker' in window)) {
    console.warn('⚠️ [DisciplineExport] File System Access API não suportado neste navegador');
    return null;
  }

  try {
    const sanitizedName = discipline.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const fileName = `${discipline.code}-${sanitizedName}.md`;

    // Construir conteúdo Markdown
    let markdown = `# ${discipline.title}\n\n`;
    markdown += `---\n`;
    markdown += `id: ${disciplineId}\n`;
    markdown += `code: ${discipline.code}\n`;
    markdown += `title: ${discipline.title}\n`;
    markdown += `period: ${discipline.period}\n`;
    markdown += `description: ${discipline.description || ''}\n`;
    markdown += `color: ${discipline.color}\n`;
    markdown += `progress: ${discipline.progress}\n`;
    markdown += `prerequisites: ${JSON.stringify(discipline.prerequisites || [])}\n`;
    markdown += `syllabus: ${JSON.stringify(discipline.syllabus || [])}\n`;
    if (discipline.category) {
      markdown += `category: ${discipline.category}\n`;
    }
    if (discipline.contextGeneratedAt) {
      markdown += `contextGeneratedAt: ${discipline.contextGeneratedAt}\n`;
    }
    markdown += `---\n\n`;

    if (discipline.description) {
      markdown += `${discipline.description}\n\n`;
    }

    if (discipline.context) {
      markdown += `## Contexto Geral\n\n${discipline.context}\n\n`;
    }

    if (discipline.modules && discipline.modules.length > 0) {
      const sortedModules = [...discipline.modules].sort((a, b) => a.order - b.order);

      for (const module of sortedModules) {
        markdown += `# ${module.title}\n\n`;
        
        if (module.description) {
          markdown += `${module.description}\n\n`;
        }

        if (module.subModules && module.subModules.length > 0) {
          const sortedSubModules = [...module.subModules].sort((a, b) => a.order - b.order);

          for (const subModule of sortedSubModules) {
            markdown += `## ${subModule.title}\n\n`;
            
            if (subModule.description) {
              markdown += `*${subModule.description}*\n\n`;
            }

            const content = discipline.subModuleContent?.[subModule.id] || subModule.content || '';
            if (content.trim()) {
              markdown += `${content}\n\n`;
            } else {
              markdown += `*Conteúdo ainda não gerado*\n\n`;
            }
          }
        }
      }
    }

    // Abrir seletor de arquivo para salvar
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: fileName,
      types: [{
        description: 'Markdown files',
        accept: { 'text/markdown': ['.md'] },
      }],
    });

    // Escrever arquivo
    const writable = await fileHandle.createWritable();
    await writable.write(markdown);
    await writable.close();

    console.log(`💾 [DisciplineExport] Arquivo sincronizado: ${fileName}`);

    // Retornar handle para monitoramento futuro
    return fileHandle;
  } catch (error: any) {
    // Se o usuário cancelar, não é um erro
    if (error.name === 'AbortError') {
      console.log('📄 [DisciplineExport] Exportação cancelada pelo usuário');
      return null;
    }
    console.error('❌ [DisciplineExport] Erro ao sincronizar arquivo:', error);
    return null;
  }
}

/**
 * Lê um arquivo Markdown e atualiza a disciplina automaticamente
 * @param fileHandle - Handle do arquivo (File System Access API)
 * @returns Disciplina atualizada ou null
 */
export async function readAndUpdateDisciplineFromFile(
  fileHandle: FileSystemFileHandle
): Promise<{ discipline: Discipline; disciplineId: string } | null> {
  try {
    const file = await fileHandle.getFile();
    const content = await file.text();
    const fileName = file.name;

    return importDisciplineFromMarkdown(content, fileName);
  } catch (error) {
    console.error('❌ [DisciplineExport] Erro ao ler arquivo:', error);
    return null;
  }
}

