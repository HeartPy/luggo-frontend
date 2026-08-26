import { describe, it, expect } from "vitest";
import { displayedPages } from "~/utils/pagination";

describe("displayedPages", () => {
  it("total が 0 のとき空配列を返す", () => {
    expect(displayedPages(0, 1)).toEqual([]);
  });

  it("total が 1 のときページ 1 のみを返す", () => {
    expect(displayedPages(1, 1)).toEqual([1]);
  });

  it("total が 7 以下のとき全ページを返す", () => {
    expect(displayedPages(7, 4)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("total が 8 以上のとき先頭と末尾のページを常に含む", () => {
    const pages = displayedPages(10, 5);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(10);
  });

  it("現在ページが先頭付近のとき前側の省略記号を付けない", () => {
    expect(displayedPages(10, 1)).toEqual([1, 2, "...", 10]);
    expect(displayedPages(10, 2)).toEqual([1, 2, 3, "...", 10]);
  });

  it("現在ページが中央のとき両側に省略記号を付ける", () => {
    expect(displayedPages(10, 5)).toEqual([1, "...", 4, 5, 6, "...", 10]);
  });

  it("現在ページが末尾付近のとき後側の省略記号を付けない", () => {
    expect(displayedPages(10, 9)).toEqual([1, "...", 8, 9, 10]);
    expect(displayedPages(10, 10)).toEqual([1, "...", 9, 10]);
  });
});
