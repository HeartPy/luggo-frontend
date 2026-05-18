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
        <CommonAtomsLoadingAnimation v-if="isSaving" size="xs" />
        <span v-else>保存（設定を反映）</span>
      </button>
      <button
        type="button"
        class="w-60 rounded-md bg-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-300"
        :disabled="!isDirty || isSavingDraft"
        @click="handleSaveDraft"
      >
        <CommonAtomsLoadingAnimation v-if="isSavingDraft" size="xs" />
        <span v-else>一時保存（設定を反映しない）</span>
      </button>
      <button
        type="button"
        class="rounded-md border-2 border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        :disabled="!hasDraftSaveSinceLastRealSave || isDiscardingDraft"
        @click="handleDiscardDraftClick"
      >
        <CommonAtomsLoadingAnimation v-if="isDiscardingDraft" size="xs" />
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
      <div v-if="isLoading" class="py-12">
        <CommonAtomsLoadingAnimation size="md" />
      </div>

      <template v-else>
        <!-- 1日の最大荷物個数セクション -->
        <section class="mb-10">
          <h2 class="mb-4 text-lg font-bold text-gray-800">
            1日の最大荷物個数
          </h2>
          <p class="mb-4 text-sm text-gray-600">
            1日あたりに集荷・配送できる荷物の合計個数の上限を設定します。0の場合は予約を受け付けません。
          </p>
          <label
            class="mb-4 flex cursor-pointer items-center gap-2"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              :checked="localDailyMaxLuggage === -1"
              @change="toggleDailyMaxUnlimited"
            />
            <span class="text-sm font-medium text-gray-700">
              制限なし
            </span>
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
            />
            <span class="text-sm text-gray-600">個</span>
          </div>
        </section>

        <!-- 定休日セクション -->
        <section class="mb-10">
          <h2 class="mb-4 text-lg font-bold text-gray-800">定休日</h2>
          <p class="mb-4 text-sm text-gray-600">
            チェックした曜日は定休日となり、集荷日・配送日として選択できなくなります。
          </p>
          <div class="flex flex-wrap gap-4">
            <label
              v-for="(dayLabel, idx) in weekdayLabels"
              :key="idx"
              class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
              :class="{
                'border-red-300 bg-red-50': localOperatingDays[idx] === '0',
              }"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                :checked="localOperatingDays[idx] === '0'"
                @change="toggleDay(idx)"
              />
              <span class="text-sm font-medium text-gray-700">
                {{ dayLabel }}
              </span>
            </label>
          </div>
        </section>

        <!-- 第N週曜日の定休日セクション -->
        <section class="mb-10">
          <h2 class="mb-4 text-lg font-bold text-gray-800">週毎の定休日</h2>
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
                    v-for="(dayLabel, wdIdx) in weekdayLabelsShort"
                    :key="wdIdx"
                    class="border border-gray-200 bg-gray-50 px-3 py-2 text-center text-gray-600"
                  >
                    {{ dayLabel }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="week in 4" :key="week">
                  <td
                    class="border border-gray-200 bg-gray-50 px-3 py-2 text-center font-medium text-gray-600"
                  >
                    第{{ week }}週
                  </td>
                  <td
                    v-for="(_, wdIdx) in weekdayLabelsShort"
                    :key="wdIdx"
                    class="border border-gray-200 px-3 py-2 text-center"
                  >
                    <label class="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        :checked="
                          localNthWeekdayHolidays.has(`${week}-${wdIdx}`)
                        "
                        @change="toggleNthWeekday(week, wdIdx)"
                      />
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 臨時休業セクション -->
        <section class="mb-10">
          <h2 class="mb-4 text-lg font-bold text-gray-800">臨時休業</h2>
          <p class="mb-4 text-sm text-gray-600">
            特定の日付を臨時休業日に設定できます。設定した日は集荷日・配送日として選択できなくなります。
          </p>

          <!-- 日付追加フォーム -->
          <div class="mb-4 flex items-end gap-3">
            <div>
              <label
                for="closureDate"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                日付を選択
              </label>
              <input
                id="closureDate"
                v-model="newClosureDate"
                type="date"
                class="rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                :min="todayIso"
              />
            </div>
            <button
              type="button"
              class="rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="!newClosureDate || newClosureDate < todayIso"
              @click="addClosure"
            >
              追加
            </button>
          </div>

          <!-- 追加済み臨時休業日リスト -->
          <div v-if="localClosures.length > 0" class="space-y-2">
            <div
              v-for="d in sortedClosures"
              :key="d"
              class="flex items-center justify-between rounded-md border border-gray-200 px-4 py-2"
              :class="{ 'opacity-50': d < todayIso }"
            >
              <span class="text-sm text-gray-700">
                {{ formatDateJa(d) }}
              </span>
              <button
                type="button"
                class="text-sm text-red-600 hover:text-red-800"
                @click="removeClosure(d)"
              >
                削除
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">
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
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
  "日曜日",
];
const weekdayLabelsShort = ["月", "火", "水", "木", "金", "土", "日"];

const isLoading = ref(true);
const isSaving = ref(false);
const isSavingDraft = ref(false);
const isDiscardingDraft = ref(false);
const saveErr = ref<string | null>(null);

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

const todayIso = computed(() => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
});

function cloneLocal(): SettingsSnapshot {
  return {
    operatingDays: localOperatingDays.value,
    nthWeekdayHolidays: [...localNthWeekdayHolidays.value].sort(),
    dailyMaxLuggage: localDailyMaxLuggage.value,
    closures: [...localClosures.value],
  };
}

function takeSnapshot() {
  snapshot.value = cloneLocal();
}

function restoreSnapshot() {
  if (!snapshot.value) return;
  localOperatingDays.value = snapshot.value.operatingDays;
  localNthWeekdayHolidays.value = new Set(snapshot.value.nthWeekdayHolidays);
  localDailyMaxLuggage.value = snapshot.value.dailyMaxLuggage;
  localClosures.value = [...snapshot.value.closures];
}

const isDirty = computed(() => {
  if (!snapshot.value) return false;
  if (localOperatingDays.value !== snapshot.value.operatingDays) return true;
  const nwA = [...localNthWeekdayHolidays.value].sort().join(",");
  const nwB = [...snapshot.value.nthWeekdayHolidays].sort().join(",");
  if (nwA !== nwB) return true;
  if (localDailyMaxLuggage.value !== snapshot.value.dailyMaxLuggage) return true;
  const a = [...localClosures.value].sort().join(",");
  const b = [...snapshot.value.closures].sort().join(",");
  return a !== b;
});

const canSave = computed(
  () => isDirty.value || hasDraftSaveSinceLastRealSave.value,
);

const sortedClosures = computed(() => [...localClosures.value].sort());

function toggleDay(idx: number) {
  const chars = localOperatingDays.value.split("");
  chars[idx] = chars[idx] === "1" ? "0" : "1";
  localOperatingDays.value = chars.join("");
}

function toggleDailyMaxUnlimited() {
  if (localDailyMaxLuggage.value === -1) {
    localDailyMaxLuggage.value = 0;
  }
  else {
    localDailyMaxLuggage.value = -1;
  }
}

function toggleNthWeekday(week: number, wdIdx: number) {
  const key = `${week}-${wdIdx}`;
  const next = new Set(localNthWeekdayHolidays.value);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  localNthWeekdayHolidays.value = next;
}

function addClosure() {
  if (!newClosureDate.value || newClosureDate.value < todayIso.value) return;
  if (localClosures.value.includes(newClosureDate.value)) return;
  localClosures.value.push(newClosureDate.value);
  newClosureDate.value = "";
}

function removeClosure(d: string) {
  localClosures.value = localClosures.value.filter((c) => c !== d);
}

function formatDateJa(iso: string): string {
  const [y, m, d] = iso.split("-");
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()];
  return `${y}年${Number(m)}月${Number(d)}日（${dayOfWeek}）`;
}

function normalizeDraft(raw: unknown): SettingsSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.operatingDays !== "string" || obj.operatingDays.length !== 7)
    return null;
  if (!Array.isArray(obj.closures)) return null;
  const nwh = Array.isArray(obj.nthWeekdayHolidays)
    ? obj.nthWeekdayHolidays.filter((v): v is string => typeof v === "string")
    : [];
  const dml = typeof obj.dailyMaxLuggage === "number"
    ? obj.dailyMaxLuggage
    : 0;
  return {
    operatingDays: obj.operatingDays,
    nthWeekdayHolidays: nwh,
    dailyMaxLuggage: dml,
    closures: obj.closures.filter((c): c is string => typeof c === "string"),
  };
}

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
  } catch {
    return false;
  }
}

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
  } catch {
    return false;
  } finally {
    isSavingDraft.value = false;
  }
}

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
  } catch {
    saveErr.value = "設定の取得に失敗しました。";
  } finally {
    isLoading.value = false;
  }
}

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
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "status" in err &&
      (err as { status: number }).status === 401
    ) {
      saveErr.value =
        "ログインの有効期限が切れました。再ログインしてください。";
      isNavigatingAfterLeaveConfirm.value = true;
      navigateTo("/account/login");
      return;
    }
    saveErr.value = "設定の保存に失敗しました。";
  } finally {
    isSaving.value = false;
  }
}

async function handleSaveDraft() {
  takeSnapshot();
  hasDraftSaveSinceLastRealSave.value = true;
  await saveDraftToServer();
}

// 一時保存（ドラフト）を破棄して、サーバー保存済みの状態に戻す
//   - DB 上のドラフトを DELETE
//   - その後、サーバー値で再フェッチして反映
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
  } catch {
    return false;
  } finally {
    isDiscardingDraft.value = false;
  }
}

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
const showLeaveConfirm = ref(false);
const pendingLeavePath = ref<string | null>(null);
const isNavigatingAfterLeaveConfirm = ref(false);

function handleDiscardClick() {
  showDiscardConfirm.value = true;
}

function doDiscard() {
  restoreSnapshot();
}

const showDiscardDraftConfirm = ref(false);

function handleDiscardDraftClick() {
  showDiscardDraftConfirm.value = true;
}

async function doDiscardDraft() {
  const ok = await discardDraftFromServer();
  if (!ok) {
    saveErr.value = "一時保存の破棄に失敗しました。";
    return;
  }
  // サーバー値（最新の保存済み設定）でフォームを再初期化
  await fetchSettings();
  hasDraftSaveSinceLastRealSave.value = false;
}

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
  } else {
    next();
  }
});

useBeforeUnload(isSaving, ref(false), isDirty);

onMounted(async () => {
  await fetchSettings();

  if (await loadDraftFromServer()) {
    return;
  }

  if (hasDraftSaveSinceLastRealSave.value) {
    takeSnapshot();
    return;
  }
});

onUnmounted(() => {
  businessSettingsCanSaveState.value = false;

  if (isDirty.value) {
    restoreSnapshot();
  }
});
</script>
