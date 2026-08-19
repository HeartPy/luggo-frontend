export type PaginationItem = number | "...";

// ページ番号の表示（現在ページ前後 + 先頭末尾、間は省略記号）
export function displayedPages(total: number, current: number): PaginationItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: PaginationItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}
