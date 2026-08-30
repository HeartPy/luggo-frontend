import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// バックエンド（Django）が docker compose で起動済み・migrate 済みであることが前提
const backendDir = fileURLToPath(new URL("../../backend", import.meta.url));

/** seed_e2e_booking --only に渡すフロー名 */
export type E2ESeedOnly = "owner-booking" | "driver-delivery";

/**
 * E2E 用シードを実行する
 *
 * only を指定すると、そのテスト用の予約だけを再シードする
 * （owner-booking / driver-delivery が並列実行されても互いの予約を消さないため）。
 * Playwright UI モードの再実行では globalSetup が走らないことがあるため、
 * 状態を変更するスペックは beforeEach から自分の分を再シードする。
 */
export function runSeed(only?: E2ESeedOnly): void {
  const base
    = process.env.E2E_SEED_COMMAND
      ?? "docker compose exec -T backend python manage.py seed_e2e_booking";
  const command = only ? `${base} --only ${only}` : base;
  execSync(command, { cwd: backendDir, stdio: "inherit" });
}
