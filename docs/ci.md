# CI について

GitHub Actions で PR ごとに自動チェックを回す。ワークフローは `.github/workflows/ci.yml`。

## 実行タイミング

- `develop` / `main` への Pull Request
- `develop` / `main` への push（マージ後の再確認）

## 実行内容

| ステップ | 内容 |
| --- | --- |
| 依存インストール | `pnpm install --frozen-lockfile`（Node 22 / pnpm 11） |
| Lint | `pnpm lint` |
| 型チェック | `pnpm type-check` |
| 単体テスト | `pnpm test:unit`（Vitest） |
| ビルド | `pnpm build`（Sentry モジュール込みで通ることの確認） |

E2E（`pnpm test:e2e`）は CI では実行しない。backend の起動が必要なため、
当面はローカル / リリース前の手動実行とする（詳細は `docs/testing.md`）。

## ブランチ保護の設定（GitHub 上で手動・初回のみ）

CI が通らない PR をマージ不可にするには、GitHub リポジトリで以下を設定する。

1. リポジトリの **Settings → Branches → Add branch protection rule** を開く
2. **Branch name pattern** に `develop` を入力
3. **Require status checks to pass before merging** にチェック
4. 検索ボックスで `test`（CI ワークフローのジョブ名）を選択
5. 保存し、`main` にも同じルールを作成する

※ ステータスチェックの候補は、一度 CI が実行された後でないと検索に出てこない。
先に PR を1本作って CI を走らせてから設定するとよい。

## スコープ外

- 自動デプロイ（CD）— 本番デプロイ手順が固まってから別途整備
- E2E の CI 実行 — ローカルで安定後、nightly / merge 後実行から検討
