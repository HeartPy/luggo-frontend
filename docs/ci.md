# CI / CD について

品質チェック（CI）は GitHub Actions、本番デプロイ（CD）は Cloudflare Pages（GitHub 連携）が担当する。

## ブランチ方針

| ブランチ | 用途 |
| --- | --- |
| `develop` | 開発用。機能ブランチのマージ先。CI のみ実行し、本番にはデプロイしない |
| `main` | 本番用。`develop` からリリース時にマージし、本番環境へデプロイする |

```
feature/* → develop（CI）→ main（CI + 本番デプロイ）
```

別途 GitHub Actions にデプロイ用ワークフローを追加する必要はない（基本構成）。

## CI（GitHub Actions）

ワークフローは `.github/workflows/ci.yml`。

### 実行タイミング

- `develop` / `main` への Pull Request
- `develop` / `main` への push（マージ後の再確認）

`develop` と `main` の両方で CI を回し、本番マージ前の品質を担保する。

### 実行内容

| ステップ | 内容 |
| --- | --- |
| 依存インストール | `pnpm install --frozen-lockfile`（Node 22 / pnpm 11） |
| Lint | `pnpm lint` |
| 型チェック | `pnpm type-check` |
| 単体テスト | `pnpm test:unit`（Vitest） |
| ビルド | `pnpm build`（Sentry モジュール込みで通ることの確認） |

E2E（`pnpm test:e2e`）は CI では実行しない。backend の起動が必要なため、
当面はローカル / リリース前の手動実行とする（詳細は `docs/testing.md`）。

### ブランチ保護の設定（GitHub 上で手動・初回のみ）

CI が通らない PR をマージ不可にするには、GitHub リポジトリで以下を設定する。

1. リポジトリの **Settings → Branches → Add branch protection rule** を開く
2. **Branch name pattern** に `develop` を入力
3. **Require status checks to pass before merging** にチェック
4. 検索ボックスで `test`（CI ワークフローのジョブ名）を選択
5. 保存し、`main` にも同じルールを作成する

※ ステータスチェックの候補は、一度 CI が実行された後でないと検索に出てこない。
先に PR を1本作って CI を走らせてから設定するとよい。

## CD（Cloudflare Pages）

GitHub リポジトリと Cloudflare Pages を接続している場合、**本番ブランチ `main` への push** で自動デプロイされる。
`develop` への push では本番デプロイは行わない。

| 項目 | 内容 |
| --- | --- |
| トリガー | `main` への push のみ（本番） |
| 実行場所 | Cloudflare Pages（ダッシュボードのビルド設定に従う） |
| ビルドコマンド（例） | `pnpm install --frozen-lockfile && pnpm build` |

### Pages で設定するもの

Cloudflare ダッシュボード（**Workers & Pages** → プロジェクト → **Settings**）で以下を確認する。

| 設定 | 値 |
| --- | --- |
| 本番ブランチ（Production branch） | **`main`** |
| Node バージョン | `22` |
| 環境変数（Production） | `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_API_BASE_URL` など（`.env.production.example` 参照） |
| カスタムドメイン | `luggo.delivery`, `www.luggo.delivery` |

PR 向けの Preview デプロイを使う場合は、Preview 用の環境変数を別途設定する（本番とは分ける）。

### Worker（Pages とは別）

事業者サブドメイン（`*.luggo.delivery`）は Cloudflare Worker（例: `luggo-subdomain-router`）経由で Pages に中継する。
Worker のコード変更は Pages の Git 連携では自動デプロイされないため、変更時は Worker 側で別途デプロイする。

## スコープ外

- E2E の CI 実行 — ローカルで安定後、nightly / merge 後実行から検討
