/**
 * Gera um ID único baseado no título da disciplina
 * Remove acentos e caracteres especiais, converte para minúsculas
 * e substitui espaços por hífens
 *
 * @param title - Título da disciplina
 * @returns ID normalizado (ex: "algoritmos-e-complexidade")
 */
export function createId(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

