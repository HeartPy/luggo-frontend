import { test, expect } from "@playwright/test";

// seed_e2e_booking が作成する事業者のサブドメイン
const SUBDOMAIN = "etoe";

// JST 基準で今日から days 日後の日付（YYYY-MM-DD）を返す。
// 予約は JST 23 時以降になると最短集荷日が翌々日にずれるため、
// 締切の影響を受けない「今日 + 3 日」を集荷日に使う。
function jstDatePlusDays(days: number): string {
  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  jstNow.setUTCDate(jstNow.getUTCDate() + days);
  return jstNow.toISOString().slice(0, 10);
}

test("ユーザー（旅行者）が予約を完了して予約番号が表示される", async ({ page }) => {
  const pickupDate = jstDatePlusDays(3);
  const deliveryDate = jstDatePlusDays(4);

  // Step1: 集荷・配達情報（Google Maps は使わず郵便番号 + 住所を手入力）
  await page.goto(`/booking/1?subdomain=${SUBDOMAIN}`);

  // ハイドレーション完了を待つ。完了前に操作すると @submit.prevent が
  // まだ効かず素のフォーム送信になり、入力値もハイドレーションで消える。
  // onMounted で走る荷物情報取得のレスポンスを完了の合図にする。
  await page.waitForResponse(
    response => response.url().includes("/api/bookings/luggage-items"),
  );

  await page.fill("#pickupLocationName", "東京駅");
  await page.fill("#pickupPostalCode", "1000001");
  await page.fill("#pickupLocationAddress", "東京都千代田区丸の内1-1");
  await page.fill("#pickupDate", pickupDate);
  await page.fill("#deliveryLocationName", "新宿駅");
  await page.fill("#deliveryPostalCode", "1600001");
  await page.fill("#deliveryLocationAddress", "東京都新宿区西新宿1-1");
  await page.fill("#deliveryDate", deliveryDate);
  await page.getByTestId("booking-step-submit").click();
  await page.waitForURL(/\/booking\/2/);

  // Step2: 機内持ち込みサイズを 1 個選択
  await page.getByTestId("step2-increment-cabin").click();
  await page.getByTestId("booking-step-submit").click();
  await page.waitForURL(/\/booking\/3/);

  // Step3: 顧客情報
  await page.fill("#customerName", "テスト太郎");
  await page.fill("#customerEmail", "e2e-guest@example.com");
  await page.fill("#customerPhoneNumber", "09012345678");
  await page.selectOption("#customerNationality", "JP");
  await page.fill("#guestName", "Taro Test");
  await page.getByTestId("booking-step-submit").click();

  // 確認画面: モック決済で支払う
  await page.waitForURL(/\/booking\/confirm/);
  await page.getByTestId("confirm-pay").click();

  // 完了画面: LG 始まりの予約番号が表示される
  await page.waitForURL(/\/booking\/complete/);
  await expect(page.getByTestId("booking-number")).toHaveText(/^LG-/);
});
