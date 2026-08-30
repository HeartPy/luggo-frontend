import { runSeed } from "./seed";

// テスト実行のたびにシードを流し、E2E 用の事業者・配達者・予約を冪等に作成する
export default function globalSetup(): void {
  runSeed();
}
