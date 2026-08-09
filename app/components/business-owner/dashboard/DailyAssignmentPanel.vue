<template>
  <section
    class="px-8"
    aria-labelledby="daily-assignment-heading"
  >
    <h1
      id="daily-assignment-heading"
      class="sr-only"
    >
      日次自動割当
    </h1>

    <!-- 予約詳細ポップアップ -->
    <BusinessOwnerDashboardBookingDetailDialog
      v-model="showDetail"
      :booking="detailBooking"
      :drivers="drivers"
      @saved="onDetailSaved"
      @request-cancel="onDetailRequestCancel"
    />

    <!-- 予約キャンセル確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showCancelConfirm"
      title="予約のキャンセル"
      :message="cancelDialogMsg"
      confirm-label="予約をキャンセル"
      cancel-label="戻る"
      @confirm="doCancel"
    >
      <!-- 集荷日前日23時以降の予約が含まれる場合のみ、返金有無を選択できる -->
      <fieldset
        v-if="hasPostDeadlinePendingCancel"
        class="rounded-md border border-gray-200 bg-gray-50 p-3"
      >
        <legend class="mb-1 px-1 text-xs font-semibold text-gray-700">
          集荷日前日23時以降のキャンセルの返金
        </legend>
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm text-gray-800">
            <input
              v-model="refundPostDeadline"
              type="radio"
              name="refund-post-deadline"
              :value="true"
              class="h-4 w-4"
            >
            返金する
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-800">
            <input
              v-model="refundPostDeadline"
              type="radio"
              name="refund-post-deadline"
              :value="false"
              class="h-4 w-4"
            >
            返金しない
          </label>
        </div>
      </fieldset>
    </CommonAtomsConfirmDialog>

    <!-- 予約詳細の取得失敗 -->
    <CommonAtomsConfirmDialog
      v-model="showDetailFetchErr"
      title="エラー"
      message="予約情報の取得に失敗しました。"
      confirm-label="閉じる"
      hide-cancel
    />

    <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <label
          for="routing-date"
          class="mb-1 block text-xs font-medium text-gray-600"
        >
          対象日
        </label>
        <div
          class="relative"
          @click="openNativeDatePicker(serviceDateRef)"
        >
          <input
            id="routing-date"
            ref="serviceDateRef"
            v-model="serviceDate"
            type="date"
            :min="minServiceDate"
            :aria-invalid="isPastDate"
            :aria-describedby="isPastDate ? 'routing-date-past-warning' : undefined"
            class="w-full cursor-pointer appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-12 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
            @change="handleDateChange"
          >
          <img
            class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2"
            src="/img/calendar.svg"
            alt=""
            aria-hidden="true"
          >
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-md bg-purple-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!serviceDate || isPastDate || selectedDriverIds.size === 0 || isStarting || isRunning || isEstimating || estimate?.within_limit === false || estimate?.task_count === 0"
          :aria-busy="isStarting || isRunning"
          :aria-label="isStarting || isRunning ? '配達者を自動割当中' : '配達者を自動割当'"
          @click="startOptimization"
        >
          <CommonAtomsLoadingAnimation
            v-if="isStarting || isRunning"
            size="xs"
          />
          <span v-else>配達者を自動割当</span>
        </button>
      </div>
    </div>

    <!-- エラー・警告は操作バー直下にまとめて表示 -->
    <div
      v-if="hasAlerts"
      class="mb-5 space-y-3"
      role="region"
      aria-label="注意事項"
    >
      <p
        v-if="isPastDate"
        id="routing-date-past-warning"
        role="alert"
        :class="alertErrClass"
      >
        過去の日付は自動割当できません。対象日を今日以降に変更してください。
      </p>
      <p
        v-if="error"
        role="alert"
        :class="alertErrClass"
      >
        {{ error }}
      </p>
      <p
        v-if="panelErr"
        role="alert"
        :class="alertErrClass"
      >
        {{ panelErr }}
      </p>
      <p
        v-if="estimate && estimate.task_count === 0"
        role="alert"
        :class="alertErrClass"
      >
        対象日に割り当て可能な集荷・配達がありません。
      </p>
      <p
        v-if="estimate && !estimate.within_limit"
        role="alert"
        :class="alertErrClass"
      >
        予約、集荷・配達、または配達者数が設定上限を超えています。対象を減らしてください。
      </p>
      <p
        v-if="estimate && !estimate.capacity_sufficient"
        role="status"
        :class="alertWarningClass"
      >
        配達者の訪問可能数が集荷・配達の件数より少ないため、一部が未割当になる可能性があります。
      </p>
      <p
        v-if="estimate && estimate.excluded.length > 0"
        role="status"
        :class="alertWarningClass"
      >
        位置情報不足などにより、事前に除外される集荷・配達が{{ estimate.excluded.length }}件あります。
      </p>
      <p
        v-if="run && run.is_stale && (run.status === 'draft' || run.status === 'applied')"
        role="status"
        :class="alertWarningClass"
      >
        予約または配達者情報が変更されたため、この結果は最新の状態と異なる可能性があります。再割当をおすすめします。
      </p>
    </div>

    <section
      v-if="estimate"
      class="mb-5 rounded-xl bg-gray-50 p-5"
      aria-labelledby="eligible-drivers-heading"
    >
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="eligible-drivers-heading"
            class="mb-1 text-sm font-semibold text-gray-900"
          >
            候補配達者
          </h2>
          <p
            id="eligible-drivers-desc"
            class="text-xs text-gray-500"
          >
            対象日に稼働可能な配達者から選択してください（{{ selectedDriverIds.size }}/{{ estimate.eligible_drivers.length }}人選択）
          </p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            :disabled="isEstimating || estimate.eligible_drivers.length === 0"
            @click="selectAllDrivers"
          >
            すべて選択
          </button>
          <button
            type="button"
            class="text-xs font-semibold text-gray-600 hover:text-gray-900 disabled:text-gray-400"
            :disabled="isEstimating || selectedDriverIds.size === 0"
            @click="clearAllDrivers"
          >
            すべて解除
          </button>
        </div>
      </div>
      <div
        v-if="estimate.eligible_drivers.length > 0"
        class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        role="group"
        aria-labelledby="eligible-drivers-heading"
        aria-describedby="eligible-drivers-desc"
      >
        <label
          v-for="driver in estimate.eligible_drivers"
          :key="driver.id"
          class="flex cursor-pointer items-start gap-2 rounded-lg bg-white px-3 py-2.5 shadow-sm transition-colors hover:bg-blue-50"
        >
          <input
            type="checkbox"
            class="mt-0.5 h-4 w-4 rounded border-gray-300 accent-blue-600"
            :checked="selectedDriverIds.has(driver.id)"
            :disabled="isEstimating"
            @change="toggleDriver(driver.id)"
          >
          <span class="min-w-0">
            <span class="block text-sm font-medium text-gray-800">{{ driver.name }}</span>
            <span class="block truncate text-xs text-gray-500">{{ driver.departure_address }}</span>
          </span>
        </label>
      </div>
      <p
        v-else
        class="mt-3 text-sm text-amber-700"
        role="status"
      >
        対象日に利用可能な配達者がいません。定休日、候補設定、出発地点を確認してください。
      </p>
      <p
        v-if="estimate.eligible_drivers.length > 0 && selectedDriverIds.size === 0"
        class="mt-3 text-sm text-amber-700"
        role="status"
      >
        割当候補の配達者を1人以上選択してください。
      </p>
    </section>

    <section
      v-if="estimate"
      class="mb-5"
      aria-label="実行前の確認"
    >
      <div class="grid gap-3 sm:grid-cols-4">
        <div class="rounded-xl bg-gray-50 p-4">
          <p class="mb-1 text-xs text-gray-500">
            対象予約
          </p>
          <p class="font-semibold text-gray-900">
            {{ estimate.reservation_count }}件
          </p>
        </div>
        <div class="rounded-xl bg-gray-50 p-4">
          <p class="mb-1 text-xs text-gray-500">
            集荷・配達
          </p>
          <p class="font-semibold text-gray-900">
            {{ estimate.task_count }}件
          </p>
        </div>
        <div class="rounded-xl bg-gray-50 p-4">
          <p class="mb-1 text-xs text-gray-500">
            選択中の配達者
          </p>
          <p class="font-semibold text-gray-900">
            {{ estimate.driver_count }}人
          </p>
        </div>
        <div class="rounded-xl bg-gray-50 p-4">
          <p class="mb-1 text-xs text-gray-500">
            訪問可能数
          </p>
          <p class="font-semibold text-gray-900">
            {{ estimate.stop_capacity }}件
          </p>
        </div>
      </div>
    </section>

    <div
      v-if="run"
      class="space-y-5"
    >
      <section aria-labelledby="assignment-result-heading">
        <h2
          id="assignment-result-heading"
          class="mb-2 text-sm font-semibold text-gray-900"
        >
          割当結果
        </h2>
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl bg-blue-50 p-4">
            <p class="mb-1 text-xs text-blue-700">
              状態
            </p>
            <p
              class="font-semibold text-blue-900"
              aria-live="polite"
            >
              {{ statusLabel(run.status) }}
            </p>
          </div>
          <div class="rounded-xl bg-blue-50 p-4">
            <p class="mb-1 text-xs text-blue-700">
              配達者
            </p>
            <p class="text-xl font-bold text-blue-900">
              {{ run.assignment_groups.length }}人
            </p>
          </div>
          <div class="rounded-xl bg-blue-50 p-4">
            <p class="mb-1 text-xs text-blue-700">
              割当した集荷・配達
            </p>
            <p class="text-xl font-bold text-blue-900">
              {{ run.assignment_count }}件
            </p>
          </div>
        </div>
      </section>

      <div
        v-if="isRunning"
        class="rounded-xl bg-blue-50 p-5"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="flex items-center gap-3">
          <CommonAtomsLoadingAnimation size="sm" />
          <div class="space-y-1">
            <p class="font-semibold text-blue-900">
              予約を配達者へ自動割当しています
            </p>
            <p class="text-xs text-blue-700">
              地域、訪問可能数、手動割当、負荷の偏りを考慮しています。
            </p>
          </div>
        </div>
      </div>

      <template v-if="run.status === 'draft' || run.status === 'applied'">
        <div
          class="grid gap-4 lg:grid-cols-2"
          aria-label="配達者ごとの割当内容"
        >
          <article
            v-for="group in run.assignment_groups"
            :key="group.driver_id"
            class="rounded-xl bg-gray-50 p-5"
            :aria-label="`${group.driver_name}（${group.task_count}件）`"
          >
            <h3 class="mb-1 font-semibold text-gray-900">
              {{ group.driver_name }}
            </h3>
            <p class="mb-3 text-xs text-gray-500">
              {{ group.task_count }}件を担当
            </p>
            <ul class="space-y-2">
              <li
                v-for="task in group.tasks"
                :key="task.id"
                class="rounded-lg bg-white p-3 shadow-sm"
              >
                <div class="mb-1 flex flex-wrap items-center gap-2">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="task.task_type === 'pickup'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'"
                  >
                    {{ task.task_type === "pickup" ? "集荷" : "配達" }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ task.booking_number }}
                  </span>
                  <span
                    v-if="task.manually_assigned"
                    class="text-xs font-semibold text-blue-600"
                  >
                    手動割当
                  </span>
                </div>
                <p class="mb-0.5 truncate text-sm font-medium text-gray-800">
                  {{ task.location_name }}
                </p>
                <p class="truncate text-xs text-gray-500">
                  {{ task.location_address }}
                </p>
              </li>
            </ul>
          </article>
        </div>

        <div
          v-if="run.unassigned_tasks.length > 0"
          class="rounded-xl bg-amber-50 p-5"
          aria-labelledby="unassigned-tasks-heading"
        >
          <h3
            id="unassigned-tasks-heading"
            class="mb-2 font-semibold text-amber-900"
          >
            割り当てできなかった集荷・配達（{{ run.unassigned_tasks.length }}件）
          </h3>
          <ul
            id="unassigned-tasks-list"
            class="mb-4 space-y-1 text-sm text-amber-800"
          >
            <li
              v-for="task in displayedUnassignedTasks"
              :key="`${task.booking_id}:${task.task_type}`"
            >
              <button
                type="button"
                class="text-blue-600 underline hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isLoadingDetail"
                :aria-busy="isLoadingDetail"
                :aria-label="`${task.booking_number}の予約詳細を開く`"
                @click="openBookingDetail(task.booking_id)"
              >
                {{ task.booking_number }}
              </button>
              （{{ task.task_type === "pickup" ? "集荷" : "配達" }}）:
              {{ task.reason }}
            </li>
          </ul>
          <button
            v-if="hasMoreUnassignedTasks"
            type="button"
            class="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            aria-controls="unassigned-tasks-list"
            :aria-expanded="showAllUnassigned"
            @click="showAllUnassigned = true"
          >
            <span>もっと見る（残り{{ run.unassigned_tasks.length - displayedUnassignedTasks.length }}件）</span>
            <img
              class="h-3 w-3 rotate-90 object-contain"
              src="/img/right-arrow.svg"
              alt=""
              aria-hidden="true"
            >
          </button>
        </div>

        <div
          v-if="run.status === 'draft'"
          class="fixed bottom-4 left-[calc(240px+2rem)] right-8 flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-lg"
          role="region"
          aria-label="割当の適用"
        >
          <p class="text-sm text-gray-600">
            適用するまで予約の担当者は変更されません。
          </p>
          <button
            type="button"
            class="rounded-md bg-purple-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-800 disabled:opacity-50"
            :disabled="isApplying"
            :aria-busy="isApplying"
            :aria-label="isApplying ? '割当を適用中' : 'この内容で割り当てる'"
            @click="applyOptimization"
          >
            <CommonAtomsLoadingAnimation
              v-if="isApplying"
              size="xs"
            />
            <span v-else>この内容で割り当てる</span>
          </button>
        </div>

        <div
          v-else
          class="rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
          role="status"
        >
          この担当割当を予約へ適用済みです。
        </div>
      </template>

      <div
        v-else-if="run.status === 'failed' || run.status === 'stale'"
        class="rounded-xl bg-red-50 p-5"
        role="alert"
      >
        <p class="font-semibold text-red-800">
          {{ run.status === "stale" ? "予約情報が変更されたため再割当が必要です。" : "自動割当に失敗しました。" }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="rounded-xl bg-gray-50 px-6 py-16 text-center"
      role="status"
    >
      <h2 class="mb-2 font-semibold text-gray-800">
        日次の担当割当はまだ作成されていません
      </h2>
      <p class="text-sm text-gray-500">
        対象日と候補配達者を選び、予約を地域と訪問可能数に基づいて自動割当します。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AssignmentRunStatus } from "~/types/routing";
import type { OwnerBooking, OwnerDriver } from "~/types/booking";
import { useDailyAssignment } from "~/composables/useDailyAssignment";
import { useCsrf } from "~/composables/useCsrf";

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const { ensureCsrf, getCsrf } = useCsrf();

const {
  run,
  isStarting,
  isApplying,
  error,
  estimate,
  isEstimating,
  assign,
  fetchDaily,
  fetchEstimate,
  applyRun,
} = useDailyAssignment();

function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// バックエンドの割当APIは「今日以降」のみ受付
const minServiceDate = todayIso();

const serviceDate = ref(minServiceDate);
const serviceDateRef = ref<HTMLInputElement>();
const selectedDriverIds = ref<Set<string>>(new Set());
const isRunning = computed(
  () => run.value?.status === "queued" || run.value?.status === "running",
);
const isPastDate = computed(
  () => !!serviceDate.value && serviceDate.value < minServiceDate,
);

// 操作バー直下のエラー・警告バナー共通スタイル
const alertWarningClass = "rounded-md bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800";
const alertErrClass = "rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700";

// キャンセル失敗など、割当API以外のパネル内エラー表示用
const panelErr = ref<string | null>(null);

// 操作バー直下にまとめて出すエラー・警告があるか
const hasAlerts = computed(() => {
  if (isPastDate.value || error.value || panelErr.value) return true;
  const currentEstimate = estimate.value;
  if (currentEstimate) {
    if (
      currentEstimate.task_count === 0
      || !currentEstimate.within_limit
      || !currentEstimate.capacity_sufficient
      || currentEstimate.excluded.length > 0
    ) {
      return true;
    }
  }
  const currentRun = run.value;
  return !!currentRun
    && currentRun.is_stale
    && (currentRun.status === "draft" || currentRun.status === "applied");
});

// 予約詳細ポップアップ（詳細内の担当者セレクト用に配達者一覧が必要）
const drivers = ref<OwnerDriver[]>([]);
const showDetail = ref(false);
const detailBooking = ref<OwnerBooking | null>(null);
const isLoadingDetail = ref(false);
const showDetailFetchErr = ref(false);

// 予約キャンセルの確認ダイアログ
const showCancelConfirm = ref(false);
const pendingCancelBooking = ref<OwnerBooking | null>(null);
const refundPostDeadline = ref(true);
const isCancelling = ref(false);

// 集荷日前日23時以降のキャンセルは通常返金対象外のため、返金有無を選択させる
const hasPostDeadlinePendingCancel = computed(
  () => pendingCancelBooking.value?.is_refundable_on_cancel === false,
);
const cancelDialogMsg = computed(() => {
  const booking = pendingCancelBooking.value;
  if (!booking) return "";
  if (hasPostDeadlinePendingCancel.value) {
    return `${booking.booking_number} の予約をキャンセルします。集荷日前日23時を過ぎた予約のため、返金有無を選択してください。`;
  }
  return `${booking.booking_number} の予約をキャンセルし、決済を全額返金します。よろしいですか？`;
});

// 未割当一覧は初期10件。日付変更・再割当で run が変わったら折りたたみに戻す
const showAllUnassigned = ref(false);
const displayedUnassignedTasks = computed(() => {
  const tasks = run.value?.unassigned_tasks ?? [];
  return showAllUnassigned.value ? tasks : tasks.slice(0, 10);
});
const hasMoreUnassignedTasks = computed(
  () => (run.value?.unassigned_tasks.length ?? 0) > displayedUnassignedTasks.value.length,
);

watch(
  () => run.value?.id,
  () => {
    showAllUnassigned.value = false;
  },
);

// 詳細ダイアログの担当者セレクト用。失敗してもダイアログ自体は開ける
async function fetchDrivers() {
  try {
    const data = await $fetch<{ results: OwnerDriver[] }>(`${apiBase}/api/business/drivers`, {
      method: "GET",
      credentials: "include",
    });
    drivers.value = data.results;
  }
  catch {
    drivers.value = [];
  }
}

// 未割当は ID 等の要約のみなので、詳細ダイアログ用に予約フルデータを取得
async function openBookingDetail(bookingId: string) {
  isLoadingDetail.value = true;
  panelErr.value = null;
  try {
    const response = await $fetch<{ booking: OwnerBooking }>(
      `${apiBase}/api/business/bookings/${bookingId}`,
      { credentials: "include" },
    );
    detailBooking.value = response.booking;
    showDetail.value = true;
  }
  catch {
    showDetailFetchErr.value = true;
  }
  finally {
    isLoadingDetail.value = false;
  }
}

// 詳細で予約を編集すると割当結果が古くなる可能性があるため、日次結果を再取得
async function onDetailSaved() {
  await fetchDaily(serviceDate.value);
}

// 詳細ダイアログを閉じてから確認ダイアログを開く（重ね表示を避ける）
function onDetailRequestCancel(id: string) {
  if (!detailBooking.value || detailBooking.value.id !== id) return;
  pendingCancelBooking.value = detailBooking.value;
  showDetail.value = false;
  refundPostDeadline.value = true;
  showCancelConfirm.value = true;
}

// キャンセル後は未割当一覧からも消えることがあるため、日次結果を再取得
async function doCancel() {
  const booking = pendingCancelBooking.value;
  if (!booking) return;

  isCancelling.value = true;
  panelErr.value = null;
  try {
    await ensureCsrf(apiBase);
    const res = await $fetch<{
      refund_failed_count?: number;
      message?: string;
    }>(`${apiBase}/api/business/bookings/cancel`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
      body: { ids: [booking.id], refund: refundPostDeadline.value },
    });

    await fetchDaily(serviceDate.value);

    // キャンセル本体は成功しても返金だけ失敗する場合がある
    if (res?.refund_failed_count && res.refund_failed_count > 0) {
      panelErr.value
        = res.message
          ?? "返金に失敗したため、キャンセルされていません。時間をおいて再度お試しください。";
    }
  }
  catch {
    panelErr.value = "予約のキャンセルに失敗しました。";
  }
  finally {
    isCancelling.value = false;
    pendingCancelBooking.value = null;
    refundPostDeadline.value = true;
  }
}

// 日付入力フィールド全体をクリックしたときに、ブラウザ標準のピッカーを開く
function openNativeDatePicker(el: HTMLInputElement | undefined) {
  if (!el || el.disabled) return;
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

// 現在の対象日・選択中配達者で見積もりを取り直す
async function refreshEstimateForSelection() {
  await fetchEstimate(
    serviceDate.value,
    [...selectedDriverIds.value],
  );
}

// 配達者の選択／解除を切り替え、見積もりを更新する
async function toggleDriver(driverId: string) {
  const next = new Set(selectedDriverIds.value);
  if (next.has(driverId)) next.delete(driverId);
  else next.add(driverId);
  selectedDriverIds.value = next;
  // 選択人数で見積（件数・キャパ）が変わるため都度取り直す
  await refreshEstimateForSelection();
}

// 候補配達者をすべて選択し、見積もりを更新する
async function selectAllDrivers() {
  selectedDriverIds.value = new Set(
    estimate.value?.eligible_drivers.map(driver => driver.id) ?? [],
  );
  await refreshEstimateForSelection();
}

// 配達者の選択をすべて解除し、見積もりを更新する
async function clearAllDrivers() {
  selectedDriverIds.value = new Set();
  await refreshEstimateForSelection();
}

// 自動割当を開始（実行直前に見積もりを再確認）
async function startOptimization() {
  // 実行直前に過去日・処理上限を再チェック
  if (isPastDate.value) return;
  const selected = [...selectedDriverIds.value];
  await fetchEstimate(serviceDate.value, selected);
  if (estimate.value?.within_limit === false) return;
  await assign(serviceDate.value, selected);
}

// 対象日変更時に日次結果・見積もりを再取得し、候補配達者を全選択する
async function handleDateChange() {
  // 対象日が変わると候補配達者も変わるため、いったん解除してから全選択し直す
  selectedDriverIds.value = new Set();
  await Promise.all([fetchDaily(serviceDate.value), fetchEstimate(serviceDate.value)]);
  selectedDriverIds.value = new Set(
    estimate.value?.eligible_drivers.map(driver => driver.id) ?? [],
  );
}

// 割当ドラフトを本番適用し、成功したら日次結果を再取得
async function applyOptimization() {
  const applied = await applyRun();
  // 適用後の状態（applied など）を画面に反映
  if (applied) await fetchDaily(serviceDate.value);
}

function statusLabel(status: AssignmentRunStatus): string {
  const labels: Record<AssignmentRunStatus, string> = {
    queued: "実行待ち",
    running: "自動割当中",
    draft: "割当提案を確認中",
    failed: "失敗",
    stale: "再割当が必要",
    applied: "適用済み",
  };
  return labels[status];
}

onMounted(async () => {
  await Promise.all([
    fetchDaily(serviceDate.value),
    fetchEstimate(serviceDate.value),
    fetchDrivers(),
  ]);
  // 初期表示は候補全員を選択済みにする
  selectedDriverIds.value = new Set(
    estimate.value?.eligible_drivers.map(driver => driver.id) ?? [],
  );
});
</script>
