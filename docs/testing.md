# テスト方針

Luggo のテストは「壊れたらサービスとして致命的な経路」を優先して守る。全部を E2E にはせず、層ごとに役割を分ける。

フロントエンド / バックエンドは別リポジトリで管理する。本ドキュメントは全体方針の本体で、バックエンド側の短い案内は backend リポジトリの `docs/testing.md` を参照する。

## 層の役割

| 層 | ツール | 見るもの |
| --- | --- | --- |
| BE 結合 | Django `TestCase` / `APITestCase` | API 契約、認可、状態遷移、外部 API モック後の業務ロジック |
| FE 単体 | Vitest | 純ロジック（バリデーション、料金、日付、URL 生成など） |
| E2E | Playwright | 画面が繋がって主要操作ができること（少数のみ） |

## 実行コマンド

```bash
# Backend（backend リポジトリ）
python manage.py test

# Frontend 単体（このリポジトリ）
pnpm test:unit

# E2E（下記「E2E の実行手順」を参照）
pnpm test:e2e
```

## E2E の実行手順

E2E は FE + BE を実起動し、**Stripe だけモック**して予約完了まで通す。
Google Maps は使わない（郵便番号 7 桁 + 住所手入力で Step1 を通す）。

前提: バックエンドが docker compose で起動済み・migrate 済みであること。

```bash
# 1. バックエンドを Stripe モック有効で起動（backend リポジトリ）
E2E_STRIPE_MOCK=1 docker compose up -d backend

# 2. E2E を実行（このリポジトリ。dev サーバー起動・シード投入は Playwright が自動で行う）
pnpm test:e2e
```

仕組み:

- `E2E_STRIPE_MOCK=1`（BE）: `DEBUG` のときだけ有効。`create_payment_intent` と
  予約作成時の `PaymentIntent.retrieve` が Stripe SDK を呼ばず、成功済み扱いの
  モック PaymentIntent（`pi_e2e_...`）を返す（backend の `bookings/stripe_mock.py`）
- `NUXT_PUBLIC_E2E_MOCK_STRIPE=1`（FE）: Stripe.js / Payment Element を読み込まず、
  「支払う」で confirmPayment をスキップして予約 POST に進む
  （`playwright.config.ts` の webServer が自動設定する）
- シード: backend の `python manage.py seed_e2e_booking` が E2E 用事業者
  （subdomain `etoe`・東京エリア・年中無休）を冪等に作成する。
  Playwright の `globalSetup` が毎回 docker compose 経由で実行する
- 本番では `E2E_STRIPE_MOCK` は `DEBUG=False` のため常に無効

## クリティカルパス（8 本）

| ID | パス | BE 結合 | FE 単体 | E2E |
| --- | --- | --- | --- | --- |
| CP1 | ユーザー（旅行者）が予約を完了する（入力 → 決済 → 予約番号発行） | ○ 予約作成・PaymentIntent 検証・日付/締切 | ○ yup / JST 締切 / 料金計算 | ○ ハッピーパス 1 本（最優先） |
| CP2 | ユーザー（旅行者）が予約を照会しキャンセルする | ○ lookup・cancel・返金 | - | ×（BE で十分） |
| CP3 | 事業者がアカウント登録しログインする | ○ register・ログインコード・セッション | - | △ CP4 の前段としてログインのみ |
| CP4 | 事業者が予約を管理する（一覧・ステータス・割当） | ○ 自社スコープ認可・更新・割当 | - | ○ ログイン → 一覧 → ステータス更新 |
| CP5 | 事業者が Stripe オンボーディングを完了する | ○ アカウント API（Stripe モック） | - | ×（ホスト画面依存でフレーク） |
| CP6 | 配達者が招待受諾・ログイン・配達完了する | ○ 招待・login・担当予約のステータス更新 | - | ○ ログイン → 担当表示 → 配達完了 |
| CP7 | 自動ルート割当が機能する | ○ assign → apply → 配達者公開 | ○ 済（ナビ URL 生成） | ×（ソルバーが重い） |
| CP8 | 配達完了後に事業者へ送金される | ○ transfer・二重送金防止 | - | × |

## モック方針

- Stripe / Google Maps / メール送信は全層でモックする
- E2E のメールコード認証は、実装時にテスト用バックドアまたは固定コード方式を決める
- 認可（自社・担当のみ見える）は全パス共通で BE 結合に置く

## E2E の範囲

E2E は次の 3 本のみとする。

1. CP1 ユーザー（旅行者）予約
2. CP4 事業者の予約管理
3. CP6 配達者フロー

決済・送金・ルーティングの正しさは BE で担保し、E2E は「画面が繋がって操作できる」ことだけを見る。

## 実装の進め方（推奨順）

1. CP1 の FE 単体（`useBookingValid` など）✅
2. Playwright 基盤 + CP1 の E2E ✅
3. 足りない BE 結合ケースの追加（CP2〜CP8）✅
4. CP4 / CP6 の E2E

## 現状

- Backend: CP1〜CP8 のクリティカルパスを BE 結合でカバー済み
  （予約作成/PaymentIntent、照会/キャンセル/返金、事業者登録/ログインコード、
  事業者予約管理 API、Stripe オンボーディング、配達者ログイン/配達完了、
  自動割当 apply → 配達者公開、配達完了時の送金）
- Frontend: Vitest 導入済み。`tests/unit/` に utils / composables テストあり
- E2E: Playwright 導入済み。`e2e/` に CP1 ユーザー（旅行者）予約のハッピーパス 1 本あり。
  CP4 / CP6 の E2E は未実装（次ステップ）
