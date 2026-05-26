<template>
  <div>
    <!-- 保存しない確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showDiscardConfirm"
      title="確認"
      message="入力中の内容を破棄しますか？"
      confirm-label="破棄する"
      cancel-label="キャンセル"
      @confirm="doDiscard"
    />

    <!-- 一時保存を破棄確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showDiscardDraftConfirm"
      title="確認"
      message="一時保存を破棄して、反映されている設定の状態に戻しますか？"
      confirm-label="一時保存を破棄"
      cancel-label="キャンセル"
      @confirm="doDiscardDraft"
    />

    <!-- ページ離脱確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showLeaveConfirm"
      title="確認"
      message="変更が保存されていません。ページを離れますか？"
      confirm-label="離れる"
      cancel-label="キャンセル"
      @confirm="confirmLeave"
    />

    <!-- 保存 / 一時保存 / 保存しないボタン -->
    <div
      class="mb-6 flex items-center justify-end gap-3 border-y border-gray-200 px-8 py-3"
    >
      <button
        type="button"
        class="w-44 rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        :disabled="!canSave || isSaving"
        @click="handleSave"
      >
        <CommonAtomsLoadingAnimation
          v-if="isSaving"
          size="xs"
        />
        <span v-else>保存（設定を反映）</span>
      </button>
      <button
        type="button"
        class="w-60 rounded-md bg-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-300"
        :disabled="!isDirty || isSavingDraft"
        @click="handleSaveDraft"
      >
        <CommonAtomsLoadingAnimation
          v-if="isSavingDraft"
          size="xs"
        />
        <span v-else>一時保存（設定を反映しない）</span>
      </button>
      <button
        type="button"
        class="rounded-md border-2 border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        :disabled="!hasDraftSaveSinceLastRealSave || isDiscardingDraft"
        @click="handleDiscardDraftClick"
      >
        <CommonAtomsLoadingAnimation
          v-if="isDiscardingDraft"
          size="xs"
        />
        <span v-else>一時保存を破棄</span>
      </button>
      <button
        type="button"
        class="rounded-md border-2 border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        :disabled="!isDirty"
        @click="handleDiscardClick"
      >
        保存しない
      </button>
    </div>

    <div class="mx-auto max-w-5xl px-4">
      <!-- 保存エラー -->
      <div
        v-if="saveErr"
        class="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ saveErr }}
      </div>

      <!-- 読み込み中 -->
      <div
        v-if="isLoading"
        class="py-12"
      >
        <CommonAtomsLoadingAnimation size="md" />
      </div>

      <template v-else>
        <!-- 1日の最大荷物個数セクション -->
        <section class="mb-10 space-y-4">
          <h2 class="text-lg font-bold text-gray-800">
            1日の最大荷物個数
          </h2>
          <p class="text-sm text-gray-600">
            1日あたりに集荷・配送できる荷物の合計個数の上限を設定します。0の場合は予約を受け付けません。
          </p>
          <label class="flex w-fit cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 accent-green-600"
              :checked="localDailyMaxLuggage === -1"
              @change="toggleDailyMaxUnlimited"
            >
            <span class="text-sm font-medium text-gray-700">制限なし</span>
          </label>
          <div
            v-if="localDailyMaxLuggage !== -1"
            class="flex items-center gap-3"
          >
            <input
              v-model.number="localDailyMaxLuggage"
              type="number"
              min="0"
              class="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
            <span class="text-sm text-gray-600">個</span>
          </div>
        </section>

        <!-- 定休日セクション -->
        <section class="mb-10 space-y-4">
          <h2 class="text-lg font-bold text-gray-800">
            定休日
          </h2>
          <p class="text-sm text-gray-600">
            チェックした曜日は定休日となり、集荷日・配送日として選択できなくなります。
          </p>
          <div class="flex flex-wrap gap-4">
            <label
              v-for="(dayLabel, displayIdx) in weekdayLabels"
              :key="apiWeekdayIndex(displayIdx)"
              class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
              :class="{
                'border-red-300 bg-red-50':
                  localOperatingDays[apiWeekdayIndex(displayIdx)] === '0',
              }"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300"
                :checked="
                  localOperatingDays[apiWeekdayIndex(displayIdx)] === '0'
                "
                @change="toggleDay(apiWeekdayIndex(displayIdx))"
              >
              <span class="text-sm font-medium text-gray-700">
                {{ dayLabel }}
              </span>
            </label>
          </div>
        </section>

        <!-- 第N週曜日の定休日セクション -->
        <section class="mb-10">
          <h2 class="mb-4 text-lg font-bold text-gray-800">
            週毎の定休日
          </h2>
          <p class="mb-4 text-sm text-gray-600">
            毎月の特定の週・曜日を定休日に設定できます（例：第1月曜、第3水曜）。
          </p>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th
                    class="border border-gray-200 bg-gray-50 px-3 py-2 text-center text-gray-600"
                  />
                  <th
                    v-for="(dayLabel, displayIdx) in weekdayLabelsShort"
                    :key="apiWeekdayIndex(displayIdx)"
                    class="border border-gray-200 bg-gray-50 px-3 py-2 text-center text-gray-600"
                  >
                    {{ dayLabel }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="week in 4"
                  :key="week"
                >
                  <td
                    class="border border-gray-200 bg-gray-50 px-3 py-2 text-center font-medium text-gray-600"
                  >
                    第{{ week }}週
                  </td>
                  <td
                    v-for="(_, displayIdx) in weekdayLabelsShort"
                    :key="apiWeekdayIndex(displayIdx)"
                    class="border border-gray-200"
                  >
                    <label
                      class="inline-flex h-full w-full cursor-pointer items-center px-3 py-2 transition-colors hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        class="mx-auto h-4 w-4 rounded border-gray-300"
                        :checked="
                          localNthWeekdayHolidays.has(
                            `${week}-${apiWeekdayIndex(displayIdx)}`,
                          )
                        "
                        @change="
                          toggleNthWeekday(week, apiWeekdayIndex(displayIdx))
                        "
                      >
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 臨時休業セクション -->
        <section class="mb-10 space-y-4">
          <h2 class="text-lg font-bold text-gray-800">
            臨時休業
          </h2>
          <p class="text-sm text-gray-600">
            特定の日付を臨時休業日に設定できます。設定した日は集荷日・配送日として選択できなくなります。
          </p>

          <!-- 日付追加フォーム -->
          <div class="flex items-end gap-3">
            <div>
              <label
                for="closureDate"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                日付を選択
              </label>
              <div
                class="relative"
                @click="openNativeDatePicker(closureDateInput)"
              >
                <input
                  id="closureDate"
                  ref="closureDateInput"
                  v-model="newClosureDate"
                  type="date"
                  class="w-full cursor-pointer appearance-none rounded-md border border-gray-300 px-3 py-2 pr-12 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                  :min="todayIso"
                >
                <img
                  class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2"
                  src="/img/calendar.svg"
                >
              </div>
            </div>
            <button
              type="button"
              class="rounded-md bg-gray-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="!newClosureDate || newClosureDate < todayIso"
              @click="addClosure"
            >
              追加
            </button>
          </div>

          <!-- 追加済み臨時休業日リスト -->
          <div
            v-if="sortedClosures.length > 0"
            class="space-y-2"
          >
            <div
              v-for="closureDate in sortedClosures"
              :key="closureDate"
              class="flex items-center justify-between rounded-md border border-gray-200 px-4 py-2"
              :class="{ 'opacity-50': closureDate < todayIso }"
            >
              <span class="text-sm text-gray-700">
                {{ formatDateJa(closureDate) }}
              </span>
              <button
                type="button"
                class="text-sm text-red-600 hover:text-red-800"
                @click="removeClosure(closureDate)"
              >
                削除
              </button>
            </div>
          </div>
          <p
            v-else
            class="text-sm text-gray-400"
          >
            臨時休業日は設定されていません。
          </p>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave } from "vue-router";
import { useCsrf } from "~/composables/useCsrf";
import { useBeforeUnload } from "~/composables/useBeforeUnload";
import { useBusinessProfile } from "~/composables/useBusinessProfile";

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const { ensureCsrf, getCsrf } = useCsrf();
const { fetchBusinessProfile } = useBusinessProfile();

const weekdayLabels = [
  "日曜日",
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
];
const weekdayLabelsShort = ["日", "月", "火", "水", "木", "金", "土"];

// 保存データは「月曜から」並ぶ7文字
// 画面の左から何番目 →   日 月 火 水 木 金 土
// 保存データの何番目 →   6  0  1  2  3  4  5
const API_WEEKDAY_BY_DISPLAY = [6, 0, 1, 2, 3, 4, 5] as const;

function apiWeekdayIndex(displayIdx: number): number {
  return API_WEEKDAY_BY_DISPLAY[displayIdx] ?? displayIdx;
}

const isLoading = ref(true);
const isSaving = ref(false);
const isSavingDraft = ref(false);
const isDiscardingDraft = ref(false);
const saveErr = ref<string | null>(null);

// 最後の本保存以降に一時保存があるかどうか
const hasDraftSaveSinceLastRealSave = useState(
  "businessSettingsHasDraftSave",
  () => false,
);

type SettingsSnapshot = {
  operatingDays: string;
  nthWeekdayHolidays: string[];
  dailyMaxLuggage: number;
  closures: string[];
};

const snapshot = ref<SettingsSnapshot | null>(null);

const localOperatingDays = ref("1111111");
const localNthWeekdayHolidays = ref<Set<string>>(new Set());
const localDailyMaxLuggage = ref(0);
const localClosures = ref<string[]>([]);
const newClosureDate = ref("");
const closureDateInput = ref<HTMLInputElement>();

// 日付入力フィールド全体をクリックしたときに、ブラウザ標準の日付ピッカーを開く
function openNativeDatePicker(el: HTMLInputElement | undefined) {
  if (!el) return;
  el.focus();
  if (typeof el.showPicker === "function") {
    try {
      el.showPicker();
    }
    catch {
      // フォーカスのみにフォールバック
    }
  }
}

// Date オブジェクトを "YYYY-MM-DD" 形式の文字列に変換
function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const todayIso = computed(() => toIsoDate(new Date()));

// 終了から7日経過した臨時休業日は一覧から非表示（DBには残す）
const closureDisplayCutoffIso = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return toIsoDate(date);
});

// 現在の入力内容を、変更検知や復元用にコピー
function cloneLocal(): SettingsSnapshot {
  return {
    operatingDays: localOperatingDays.value,
    nthWeekdayHolidays: [...localNthWeekdayHolidays.value].sort(),
    dailyMaxLuggage: localDailyMaxLuggage.value,
    closures: [...localClosures.value],
  };
}

// 「保存済み」の基準として現在の内容を覚えておく（以降この値と比較して変更検知）
function takeSnapshot() {
  snapshot.value = cloneLocal();
}

// 入力を、最後に覚えた基準（保存済み or 保存直前の状態）まで戻す
function restoreSnapshot() {
  if (!snapshot.value) return;
  localOperatingDays.value = snapshot.value.operatingDays;
  localNthWeekdayHolidays.value = new Set(snapshot.value.nthWeekdayHolidays);
  localDailyMaxLuggage.value = snapshot.value.dailyMaxLuggage;
  localClosures.value = [...snapshot.value.closures];
}

// 現在の入力が、最後に takeSnapshot() した内容と違うか（未保存の変更があるか）
const isDirty = computed(() => {
  if (!snapshot.value) return false;
  if (localOperatingDays.value !== snapshot.value.operatingDays) return true;
  const nwA = [...localNthWeekdayHolidays.value].sort().join(",");
  const nwB = [...snapshot.value.nthWeekdayHolidays].sort().join(",");
  if (nwA !== nwB) return true;
  if (localDailyMaxLuggage.value !== snapshot.value.dailyMaxLuggage)
    return true;
  const a = [...localClosures.value].sort().join(",");
  const b = [...snapshot.value.closures].sort().join(",");
  return a !== b;
});

const canSave = computed(
  () => isDirty.value || hasDraftSaveSinceLastRealSave.value,
);

const sortedClosures = computed(() =>
  [...localClosures.value]
    .filter(closureDate => closureDate >= closureDisplayCutoffIso.value)
    .sort(),
);

// 定休日チェックの ON/OFF を切り替える（その曜日の operating_days を 1 ⇄ 0 に反転）
function toggleDay(idx: number) {
  const chars = localOperatingDays.value.split("");
  chars[idx] = chars[idx] === "1" ? "0" : "1";
  localOperatingDays.value = chars.join("");
}

// 「制限なし」チェックの ON/OFF を切り替える（-1 ⇄ 0）
function toggleDailyMaxUnlimited() {
  if (localDailyMaxLuggage.value === -1) {
    localDailyMaxLuggage.value = 0;
  }
  else {
    localDailyMaxLuggage.value = -1;
  }
}

// 第N週・曜日のチェック ON/OFF を切り替える（"週-曜日" を Set に追加/削除）
function toggleNthWeekday(week: number, wdIdx: number) {
  const key = `${week}-${wdIdx}`;
  const next = new Set(localNthWeekdayHolidays.value);
  if (next.has(key)) {
    next.delete(key);
  }
  else {
    next.add(key);
  }
  localNthWeekdayHolidays.value = next;
}

// 入力された日付を臨時休業日リストに追加する（過去日・重複はスキップ）
function addClosure() {
  if (!newClosureDate.value || newClosureDate.value < todayIso.value) return;
  if (localClosures.value.includes(newClosureDate.value)) return;
  localClosures.value.push(newClosureDate.value);
  newClosureDate.value = "";
}

// 指定した日付を臨時休業日リストから外す
function removeClosure(closureDate: string) {
  localClosures.value = localClosures.value.filter(c => c !== closureDate);
}

// "YYYY-MM-DD" を「2026年5月19日（火）」のような表示用文字列に整える
function formatDateJa(iso: string): string {
  const [year, month, day] = iso.split("-");
  const dt = new Date(Number(year), Number(month) - 1, Number(day));
  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()];
  return `${year}年${Number(month)}月${Number(day)}日（${dayOfWeek}）`;
}

// サーバーから返ってきたドラフトの中身を検証し、想定どおりの形なら SettingsSnapshot にして返す
function normalizeDraft(raw: unknown): SettingsSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.operatingDays !== "string" || obj.operatingDays.length !== 7)
    return null;
  if (!Array.isArray(obj.closures)) return null;
  const nwh = Array.isArray(obj.nthWeekdayHolidays)
    ? obj.nthWeekdayHolidays.filter((v): v is string => typeof v === "string")
    : [];
  const dml = typeof obj.dailyMaxLuggage === "number" ? obj.dailyMaxLuggage : 0;
  return {
    operatingDays: obj.operatingDays,
    nthWeekdayHolidays: nwh,
    dailyMaxLuggage: dml,
    closures: obj.closures.filter((c): c is string => typeof c === "string"),
  };
}

// サーバー上の一時保存（ドラフト）を取得し、あればフォームに反映
async function loadDraftFromServer(): Promise<boolean> {
  if (!import.meta.client) return false;
  try {
    const res = await $fetch<{ draft: Record<string, unknown> | null }>(
      `${apiBase}/api/business/profile/settings/draft`,
      { method: "GET", credentials: "include" },
    );
    if (!res.draft) return false;

    const layer = normalizeDraft(res.draft);
    if (!layer) return false;

    localOperatingDays.value = layer.operatingDays;
    localNthWeekdayHolidays.value = new Set(layer.nthWeekdayHolidays);
    localDailyMaxLuggage.value = layer.dailyMaxLuggage;
    localClosures.value = [...layer.closures];
    takeSnapshot();
    hasDraftSaveSinceLastRealSave.value = true;
    return true;
  }
  catch (err: unknown) {
    if (
      err
      && typeof err === "object"
      && "status" in err
      && (err as { status: number }).status === 401
    ) {
      saveErr.value
        = "ログインの有効期限が切れました。再ログインしてください。";
      isNavigatingAfterLeaveConfirm.value = true;
      navigateTo("/account/login");
    }
    return false;
  }
}

// 現在の入力内容をサーバーに一時保存（ドラフト）として送る
async function saveDraftToServer(): Promise<boolean> {
  if (!import.meta.client) return false;
  try {
    isSavingDraft.value = true;
    await ensureCsrf(apiBase);
    const draft = cloneLocal();
    await $fetch(`${apiBase}/api/business/profile/settings/draft`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
      body: { draft },
    });
    return true;
  }
  catch (err: unknown) {
    if (
      err
      && typeof err === "object"
      && "status" in err
      && (err as { status: number }).status === 401
    ) {
      saveErr.value
        = "ログインの有効期限が切れました。再ログインしてください。";
      isNavigatingAfterLeaveConfirm.value = true;
      navigateTo("/account/login");
      return false;
    }
    saveErr.value = "一時保存に失敗しました。";
    return false;
  }
  finally {
    isSavingDraft.value = false;
  }
}

// サーバーから「本保存」済みの設定を取得して、フォームに反映
async function fetchSettings() {
  isLoading.value = true;
  try {
    const data = await $fetch<{
      operating_days: string;
      nth_weekday_holidays: string[];
      daily_max_luggage: number;
      temporary_closures: string[];
    }>(`${apiBase}/api/business/profile/settings`, {
      method: "GET",
      credentials: "include",
    });
    localOperatingDays.value = data.operating_days;
    localNthWeekdayHolidays.value = new Set(data.nth_weekday_holidays ?? []);
    localDailyMaxLuggage.value = data.daily_max_luggage ?? 0;
    localClosures.value = [...data.temporary_closures];
    takeSnapshot();
  }
  catch (err: unknown) {
    if (
      err
      && typeof err === "object"
      && "status" in err
      && (err as { status: number }).status === 401
    ) {
      saveErr.value
        = "ログインの有効期限が切れました。再ログインしてください。";
      isNavigatingAfterLeaveConfirm.value = true;
      navigateTo("/account/login");
      return;
    }
    saveErr.value = "設定の取得に失敗しました。";
  }
  finally {
    isLoading.value = false;
  }
}

// 「保存する」ボタン: 現在の入力をサーバーに本保存し、結果をフォームに反映
async function handleSave() {
  isSaving.value = true;
  saveErr.value = null;
  try {
    await ensureCsrf(apiBase);
    const data = await $fetch<{
      operating_days: string;
      nth_weekday_holidays: string[];
      daily_max_luggage: number;
      temporary_closures: string[];
    }>(`${apiBase}/api/business/profile/settings`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
      body: {
        operating_days: localOperatingDays.value,
        nth_weekday_holidays: [...localNthWeekdayHolidays.value],
        daily_max_luggage: localDailyMaxLuggage.value,
        temporary_closures: localClosures.value,
      },
    });
    localOperatingDays.value = data.operating_days;
    localNthWeekdayHolidays.value = new Set(data.nth_weekday_holidays ?? []);
    localDailyMaxLuggage.value = data.daily_max_luggage ?? 0;
    localClosures.value = [...data.temporary_closures];
    takeSnapshot();
    hasDraftSaveSinceLastRealSave.value = false;
    // ヘッダーの「サイトを表示」ボタンの活性判定で参照する businessProfile を最新化
    await fetchBusinessProfile();
  }
  catch (err: unknown) {
    if (
      err
      && typeof err === "object"
      && "status" in err
      && (err as { status: number }).status === 401
    ) {
      saveErr.value
        = "ログインの有効期限が切れました。再ログインしてください。";
      isNavigatingAfterLeaveConfirm.value = true;
      navigateTo("/account/login");
      return;
    }
    saveErr.value = "設定の保存に失敗しました。";
  }
  finally {
    isSaving.value = false;
  }
}

// 「一時保存」ボタン: 現在の入力をドラフトとして保存（本保存はしない）
async function handleSaveDraft() {
  saveErr.value = null;
  const ok = await saveDraftToServer();
  if (!ok) return;
  takeSnapshot();
  hasDraftSaveSinceLastRealSave.value = true;
}

// サーバー上のドラフトを削除（フォームの再反映は呼び出し側で行う）
async function discardDraftFromServer(): Promise<boolean> {
  if (!import.meta.client) return false;
  try {
    isDiscardingDraft.value = true;
    await ensureCsrf(apiBase);
    await $fetch(`${apiBase}/api/business/profile/settings/draft`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
    });
    return true;
  }
  catch (err: unknown) {
    if (
      err
      && typeof err === "object"
      && "status" in err
      && (err as { status: number }).status === 401
    ) {
      saveErr.value
        = "ログインの有効期限が切れました。再ログインしてください。";
      isNavigatingAfterLeaveConfirm.value = true;
      navigateTo("/account/login");
      return false;
    }
    saveErr.value = "一時保存の破棄に失敗しました。";
    return false;
  }
  finally {
    isDiscardingDraft.value = false;
  }
}

// 事業設定に未保存の変更があるを共有
const businessSettingsCanSaveState = useState(
  "businessSettingsCanSave",
  () => false,
);

watch(
  isDirty,
  (value) => {
    businessSettingsCanSaveState.value = value;
  },
  { immediate: true },
);

const showDiscardConfirm = ref(false);
const showDiscardDraftConfirm = ref(false);
const showLeaveConfirm = ref(false);
const pendingLeavePath = ref<string | null>(null);
const isNavigatingAfterLeaveConfirm = ref(false);

// 「保存しない」ボタン: 変更を取り消す前に確認ダイアログを表示
function handleDiscardClick() {
  showDiscardConfirm.value = true;
}

// 確認後、入力を最後に覚えた基準まで戻す
function doDiscard() {
  restoreSnapshot();
}

// 「一時保存を破棄」ボタン: 破棄前に確認ダイアログを表示
function handleDiscardDraftClick() {
  showDiscardDraftConfirm.value = true;
}

// 確認後、サーバー上のドラフトを削除し、保存済みの値でフォームを再初期化
async function doDiscardDraft() {
  saveErr.value = null;
  const ok = await discardDraftFromServer();
  if (!ok) return;
  await fetchSettings();
  hasDraftSaveSinceLastRealSave.value = false;
}

// 「ページから離れる」確認ダイアログで OK されたとき、入力を戻してから遷移
function confirmLeave() {
  const path = pendingLeavePath.value;
  pendingLeavePath.value = null;
  showLeaveConfirm.value = false;
  if (path) {
    isNavigatingAfterLeaveConfirm.value = true;
    restoreSnapshot();
    navigateTo(path);
  }
}

// アプリ内で別ページへ移動するとき: 未保存なら確認ダイアログを出して遷移を止める
onBeforeRouteLeave((to, _from, next) => {
  if (isNavigatingAfterLeaveConfirm.value) {
    isNavigatingAfterLeaveConfirm.value = false;
    next();
    return;
  }
  if (isDirty.value) {
    next(false);
    pendingLeavePath.value = to.fullPath;
    showLeaveConfirm.value = true;
  }
  else {
    next();
  }
});

// タブを閉じる・更新するなど: 未保存かつ保存中でなければブラウザ標準の確認を出す
useBeforeUnload(isSaving, ref(false), isDirty);

// 画面表示時: 本保存を読み込み → あればドラフトで上書き
onMounted(async () => {
  await fetchSettings();

  if (await loadDraftFromServer()) {
    return;
  }

  // ドラフト取得に失敗したが一時保存フラグだけ残っているときのフォールバック
  if (hasDraftSaveSinceLastRealSave.value) {
    takeSnapshot();
    return;
  }
});

// 画面を離れるとき: タブ切替用フラグをクリアし、未保存なら入力を基準状態に戻す
onUnmounted(() => {
  businessSettingsCanSaveState.value = false;

  if (isDirty.value) {
    restoreSnapshot();
  }
});
</script>
