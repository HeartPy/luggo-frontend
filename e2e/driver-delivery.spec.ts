import { test, expect, type Page } from "@playwright/test";
import { runSeed } from "./seed";

// seed_e2e_booking が作成する配達者のログイン情報
const DRIVER_EMAIL = "e2e-driver@example.com";
const DRIVER_PASSWORD = "e2e-driver-password";

// seed_e2e_booking が作成する driver-delivery 用予約の表示名（カードの特定に使う）
const DRIVER_DELIVERY_NAME = "E2E Driver Delivery";

// 署名キャンバスにマウス操作で線を描く（配達完了の必須条件）
async function drawSignature(page: Page) {
  const canvas = page.getByTestId("signature-canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("署名キャンバスが表示されていません");

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.5;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3, { steps: 5 });
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 5 });
  await page.mouse.up();
}

// このテストは driver-delivery 用予約のステータスを変更するため、実行のたびに再シードする
// （UI モードの再実行では globalSetup が走らないことがある）
test.beforeEach(() => {
  runSeed("driver-delivery");
});

test("配達者がログインして担当予約を集荷完了 → 配達完了にできる", async ({ page }) => {
  // ログイン（メール + パスワードのみ）
  await page.goto("/driver/login");
  await page.fill("#email", DRIVER_EMAIL);
  await page.fill("#password", DRIVER_PASSWORD);
  await page.getByTestId("driver-login-submit").click();
  await page.waitForURL(/\/driver\/dashboard/);

  // 当日の担当予約に driver-delivery 用シード予約が表示される
  const card = page
    .getByTestId("driver-booking-card")
    .filter({ hasText: DRIVER_DELIVERY_NAME });
  await expect(card).toHaveCount(1);
  await expect(card.getByTestId("driver-booking-status")).toHaveText("集荷前");

  // 詳細を開いて集荷完了（成功するとダイアログは自動で閉じる）。
  // カード中央はミニマップ（クリック無効領域）のため、表示名をクリックする
  await card.getByText(DRIVER_DELIVERY_NAME, { exact: true }).click();
  const primaryAction = page.getByTestId("booking-primary-action").first();
  await expect(primaryAction).toHaveText("集荷完了");
  await primaryAction.click();
  await expect(card.getByTestId("driver-booking-status")).toHaveText("集荷済");

  // 再度詳細を開き、署名を描いて配達完了
  await card.getByText(DRIVER_DELIVERY_NAME, { exact: true }).click();
  await expect(primaryAction).toHaveText("配達完了");
  await drawSignature(page);
  await expect(primaryAction).toBeEnabled();
  await primaryAction.click();
  await expect(card.getByTestId("driver-booking-status")).toHaveText("配達済");
});
