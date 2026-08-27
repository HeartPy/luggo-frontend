import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// バックエンド（Django）が docker compose で起動済み・migrate 済みであることが前提。
// テスト実行のたびにシードを流し、E2E 用事業者を冪等に作成する。
const backendDir = fileURLToPath(new URL("../../backend", import.meta.url));

export default function globalSetup(): void {
  const command
    = process.env.E2E_SEED_COMMAND
      ?? "docker compose exec -T backend python manage.py seed_e2e_booking";
  execSync(command, { cwd: backendDir, stdio: "inherit" });
}
