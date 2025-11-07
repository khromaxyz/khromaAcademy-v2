declare module 'markdown-it-katex' {
  import type MarkdownIt from 'markdown-it';
  
  interface KatexOptions {
    throwOnError?: boolean;
    errorColor?: string;
  }
  
  const markdownItKatex: MarkdownIt.PluginWithOptions<KatexOptions>;
  
  export = markdownItKatex;
}

