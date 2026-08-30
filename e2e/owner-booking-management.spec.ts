import { test, expect } from "@playwright/test";
import { runSeed } from "./seed";

// seed_e2e_booking が作成する事業者のログイン情報
const OWNER_EMAIL = "e2e-owner@example.com";
const OWNER_PASSWORD = "e2e-owner-password";

// バックエンドの E2E_LOGIN_CODE_MOCK=1 で固定される認証コード
const LOGIN_CODE = "000000";

// seed_e2e_booking が作成する owner-booking 用予約の顧客名（一覧のキーワード検索で特定する）
const OWNER_BOOKING_CUSTOMER_NAME = "E2E Owner Booking";

// このテストは owner-booking 用予約のステータスを変更するため、実行のたびに再シードする
// （UI モードの再実行では globalSetup が走らないことがある）
test.beforeEach(() => {
  runSeed("owner-booking");
});

test("事業者がログインして予約のステータスを更新できる", async ({ page }) => {
  // ログイン（メール + パスワード → 固定認証コード）
  await page.goto("/account/login");
  await page.fill("#email", OWNER_EMAIL);
  await page.fill("#password", OWNER_PASSWORD);
  await page.getByTestId("owner-login-submit").click();

  await page.fill("#code", LOGIN_CODE);
  await page.getByTestId("owner-code-submit").click();
  await page.waitForURL(/\/business-owner\/dashboard/);

  // 予約一覧: owner-booking 用シード予約を顧客名で検索して 1 件に絞る
  await page.getByTestId("bookings-search-input").fill(OWNER_BOOKING_CUSTOMER_NAME);
  await page.getByTestId("bookings-search-submit").click();

  const row = page.getByTestId("booking-row");
  await expect(row).toHaveCount(1);
  await expect(row.getByTestId("booking-status-pill")).toHaveText("集荷前");

  // ステータスを「集荷済」に変更して保存
  await row.getByTestId("booking-select").check();
  await page.getByTestId("bulk-status-select").selectOption("picked_up");
  await page.getByTestId("bookings-save").click();

  // 保存成功後の再取得で表示に反映される
  await expect(row.getByTestId("booking-status-pill")).toHaveText("集荷済");
});
