<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="handleClose"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-detail-title"
        :aria-busy="isLoading || isSaving"
        class="relative z-10 flex max-h-[88vh] w-[min(94vw,640px)] flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        @keydown.esc="handleClose"
      >
        <!-- ヘッダー（タイトル＋操作ボタン） -->
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="driver-detail-title"
              class="text-lg font-semibold text-gray-900"
            >
              {{ isCreateMode ? "配達者の追加" : "配達者の詳細" }}
            </h2>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                :disabled="(!isCreateMode && !isDirty) || isSaving || isLoading"
                :aria-busy="isSaving"
                :aria-label="isSaving
                  ? '保存中'
                  : (isCreateMode ? '登録確認メールを送信' : '保存')"
                @click="handleSave"
              >
                <CommonAtomsLoadingAnimation
                  v-if="isSaving"
                  size="xs"
                />
                <span v-else>{{ isCreateMode ? "登録確認メールを送信" : "保存" }}</span>
              </button>
              <button
                type="button"
                class="rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="isSaving"
                @click="handleClose"
              >
                保存しない
              </button>
              <button
                v-if="!isCreateMode"
                type="button"
                class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                :disabled="isSaving || isLoading"
                @click="handleDelete"
              >
                配達者を削除
              </button>
            </div>
          </div>
          <p
            v-if="saveErr"
            class="mt-2 text-sm text-red-600"
            role="alert"
          >
            {{ saveErr }}
          </p>
        </div>

        <!-- 本文 -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <!-- 読み込み中 -->
          <div
            v-if="isLoading"
            class="py-12"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="配達者情報を読み込み中"
          >
            <CommonAtomsLoadingAnimation size="md" />
          </div>

          <div
            v-else
            class="space-y-4"
          >
            <!-- ID（編集不可） -->
            <div
              v-if="!isCreateMode && detail"
              class="flex items-start justify-between gap-4 border-b border-gray-100 pb-4"
            >
              <dt class="pt-0.5 text-xs font-medium text-gray-500">
                ID（自動設定）
              </dt>
              <dd class="break-all text-right text-sm text-gray-800">
                {{ detail.id }}
              </dd>
            </div>

            <!-- プロフィール画像 -->
            <div class="border-b border-gray-100 pb-4">
              <label class="mb-1 block text-xs font-medium text-gray-500">
                プロフィール画像
              </label>
              <div class="flex items-center gap-4">
                <img
                  v-if="picturePreviewUrl"
                  :src="picturePreviewUrl"
                  alt="プロフィール画像のプレビュー"
                  class="h-16 w-16 rounded-full border border-gray-200 object-cover"
                >
                <div
                  v-else
                  class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-500"
                  aria-hidden="true"
                >
                  {{ avatarInitial }}
                </div>
                <div class="flex flex-col gap-2">
                  <input
                    ref="pictureInputRef"
                    type="file"
                    accept="image/jpeg,image/png"
                    class="hidden"
                    aria-label="プロフィール画像ファイル"
                    @change="onPictureSelected"
                  >
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                      @click="pictureInputRef?.click()"
                    >
                      画像を選択
                    </button>
                    <button
                      v-if="picturePreviewUrl"
                      type="button"
                      class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-gray-50"
                      @click="removePicture"
                    >
                      画像を削除
                    </button>
                  </div>
                  <p class="text-xs text-gray-400">
                    JPEG / PNG（10MB以下）
                  </p>
                </div>
              </div>
              <p
                v-if="fieldErrs.profile_picture"
                :class="fieldErrClass"
                role="alert"
              >
                {{ fieldErrs.profile_picture }}
              </p>
            </div>

            <!-- 会社名 -->
            <div>
              <label
                for="driver-company-name"
                class="mb-1 block text-xs font-medium text-gray-500"
              >
                会社名
              </label>
              <input
                id="driver-company-name"
                v-model="form.company_name"
                type="text"
                :class="inputClass"
              >
              <p
                v-if="fieldErrs.company_name"
                :class="fieldErrClass"
              >
                {{ fieldErrs.company_name }}
              </p>
            </div>

            <!-- 名前 -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  for="driver-last-name"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  姓 <span class="text-red-500">*</span>
                </label>
                <input
                  id="driver-last-name"
                  v-model="form.last_name"
                  type="text"
                  :class="inputClass"
                >
                <p
                  v-if="fieldErrs.last_name"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.last_name }}
                </p>
              </div>
              <div>
                <label
                  for="driver-first-name"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  名 <span class="text-red-500">*</span>
                </label>
                <input
                  id="driver-first-name"
                  v-model="form.first_name"
                  type="text"
                  :class="inputClass"
                >
                <p
                  v-if="fieldErrs.first_name"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.first_name }}
                </p>
              </div>
            </div>

            <!-- ルート最適化用の正確な出発地点・稼働条件 -->
            <div
              class="space-y-3 rounded-lg border border-purple-200 bg-purple-50 p-4"
            >
              <h3 class="text-sm font-semibold text-purple-900">
                自動割り当て設定
              </h3>

              <div>
                <label
                  for="driver-departure-address"
                  class="mb-1 block text-xs font-medium text-gray-600"
                >
                  出発地点（番地まで）
                </label>
                <input
                  id="driver-departure-address"
                  :value="form.departure_address"
                  type="text"
                  autocomplete="off"
                  placeholder="例) 東京都千代田区丸の内1-9-1"
                  :class="inputClass"
                  @input="handleDepartureAddressInput"
                >
                <p
                  v-if="fieldErrs.departure_address"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.departure_address }}
                </p>
                <p
                  v-else-if="form.departure_latitude !== null"
                  class="mt-1 text-xs text-green-700"
                >
                  位置情報を取得済み
                </p>
                <p
                  v-else-if="form.departure_address.trim()"
                  class="mt-1 text-xs text-gray-500"
                >
                  保存時に位置情報を取得します
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    for="driver-shift-start"
                    class="mb-1 block text-xs font-medium text-gray-600"
                  >
                    稼働開始
                  </label>
                  <div
                    class="relative"
                    @click="openNativeDatePicker(shiftStartInput)"
                  >
                    <input
                      id="driver-shift-start"
                      ref="shiftStartInput"
                      v-model="form.shift_start"
                      type="time"
                      :class="dateInputClass"
                    >
                    <img
                      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      src="/img/clock.svg"
                      alt=""
                      aria-hidden="true"
                    >
                  </div>
                </div>
                <div>
                  <label
                    for="driver-license-expiry"
                    class="mb-1 block text-xs font-medium text-gray-600"
                  >
                    免許証有効期限 <span class="text-red-500">*</span>
                  </label>
                  <div
                    class="relative"
                    @click="openNativeDatePicker(licenseExpiryInput)"
                  >
                    <input
                      id="driver-license-expiry"
                      ref="licenseExpiryInput"
                      v-model="form.license_expiry"
                      type="date"
                      required
                      :class="dateInputClass"
                    >
                    <img
                      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      src="/img/calendar.svg"
                      alt=""
                      aria-hidden="true"
                    >
                  </div>
                  <p
                    v-if="fieldErrs.license_expiry"
                    :class="fieldErrClass"
                  >
                    {{ fieldErrs.license_expiry }}
                  </p>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    for="driver-max-stops"
                    class="mb-1 block text-xs font-medium text-gray-600"
                  >
                    1日の最大訪問数
                  </label>
                  <input
                    id="driver-max-stops"
                    v-model.number="form.max_daily_stops"
                    type="number"
                    min="1"
                    max="500"
                    placeholder="空欄の場合は上限なし"
                    :class="inputClass"
                  >
                  <p class="mt-1 text-xs text-gray-500">
                    空欄の場合は上限なしとして扱われます。
                  </p>
                  <p
                    v-if="fieldErrs.max_daily_stops"
                    :class="fieldErrClass"
                  >
                    {{ fieldErrs.max_daily_stops }}
                  </p>
                </div>
                <div>
                  <label
                    for="driver-max-luggage-count"
                    class="mb-1 block text-xs font-medium text-gray-600"
                  >
                    1日の最大荷物個数
                  </label>
                  <input
                    id="driver-max-luggage-count"
                    v-model.number="form.max_daily_luggage_count"
                    type="number"
                    min="1"
                    max="9999"
                    placeholder="空欄の場合は上限なし"
                    :class="inputClass"
                  >
                  <p class="mt-1 text-xs text-gray-500">
                    空欄の場合は上限なしとして扱われます。
                  </p>
                  <p
                    v-if="fieldErrs.max_daily_luggage_count"
                    :class="fieldErrClass"
                  >
                    {{ fieldErrs.max_daily_luggage_count }}
                  </p>
                </div>
              </div>

              <div>
                <p
                  id="driver-operating-days-label"
                  class="mb-2 text-xs font-medium text-gray-600"
                >
                  定休日
                </p>
                <div
                  class="flex flex-wrap gap-2"
                  role="group"
                  aria-labelledby="driver-operating-days-label"
                >
                  <label
                    v-for="(dayLabel, displayIdx) in weekdayLabels"
                    :key="dayLabel"
                    class="flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs transition-colors"
                    :class="form.operating_days[apiWeekdayIdx(displayIdx)] === '0'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700'"
                  >
                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300"
                      :checked="form.operating_days[apiWeekdayIdx(displayIdx)] === '0'"
                      @change="toggleOperatingDay(apiWeekdayIdx(displayIdx))"
                    >
                    {{ dayLabel }}
                  </label>
                </div>
                <p
                  v-if="fieldErrs.operating_days"
                  :class="fieldErrClass"
                  role="alert"
                >
                  {{ fieldErrs.operating_days }}
                </p>
              </div>

              <label class="flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  v-model="form.is_available"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 accent-green-600"
                >
                自動割り当ての候補に含める
              </label>
            </div>

            <!-- メールアドレス -->
            <div>
              <label
                for="driver-email"
                class="mb-1 block text-xs font-medium text-gray-500"
              >
                メールアドレス <span class="text-red-500">*</span>
              </label>
              <input
                id="driver-email"
                v-model="form.email"
                type="email"
                :class="inputClass"
              >
              <p
                v-if="fieldErrs.email"
                :class="fieldErrClass"
              >
                {{ fieldErrs.email }}
              </p>
            </div>

            <!-- 配達の割当操作と実績表示 -->
            <template v-if="!isCreateMode && detail">
              <!-- 配達の割り当て -->
              <div
                class="!mt-8 rounded-lg border border-gray-300 p-4"
                aria-labelledby="driver-assign-heading"
              >
                <div class="flex items-center justify-between gap-3">
                  <h3
                    id="driver-assign-heading"
                    class="text-xs font-semibold tracking-wide text-gray-600"
                  >
                    配達の割り当て（未割り当ての配達）
                  </h3>
                  <button
                    type="button"
                    class="rounded-md bg-gray-800 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="selectedAssignIds.size === 0 || isAssigning"
                    :aria-busy="isAssigning"
                    :aria-label="isAssigning ? '割り当て中' : 'この配達者に割り当てる'"
                    @click="handleAssign"
                  >
                    <CommonAtomsLoadingAnimation
                      v-if="isAssigning"
                      size="xs"
                    />
                    <span v-else>この配達者に割り当てる</span>
                  </button>
                </div>
                <p
                  v-if="assignErr"
                  class="mt-2 text-xs text-red-600"
                  role="alert"
                >
                  {{ assignErr }}
                </p>
                <p
                  v-if="detail.assignable_bookings.length === 0"
                  class="mt-3 text-sm text-gray-400"
                  role="status"
                >
                  割り当て可能な配達はありません。
                </p>
                <ul
                  v-else
                  class="mt-3 max-h-52 space-y-1 overflow-y-auto"
                  role="group"
                  aria-labelledby="driver-assign-heading"
                >
                  <li
                    v-for="booking in detail.assignable_bookings"
                    :key="booking.id"
                  >
                    <label class="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-gray-50">
                      <input
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 accent-blue-600"
                        :checked="selectedAssignIds.has(booking.id)"
                        @change="toggleAssignSelect(booking.id)"
                      >
                      <span class="flex-1">
                        {{ bookingRouteLabel(booking) }}
                      </span>
                      <span class="whitespace-nowrap text-xs text-gray-500">
                        {{ formatDate(booking.pickup_date) }} 集荷
                      </span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- 直近の配達予定 -->
              <div
                class="rounded-lg border border-gray-300 bg-gray-100 p-4"
                aria-labelledby="driver-upcoming-heading"
              >
                <div class="flex items-center justify-between gap-3">
                  <h3
                    id="driver-upcoming-heading"
                    class="text-xs font-semibold tracking-wide text-gray-600"
                  >
                    直近の配達予定
                  </h3>
                  <button
                    type="button"
                    class="rounded-md border border-red-300 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="selectedUnassignIds.size === 0 || isUnassigning"
                    :aria-busy="isUnassigning"
                    :aria-label="isUnassigning ? '割り当て解除中' : '割り当てを解除'"
                    @click="handleUnassign"
                  >
                    <CommonAtomsLoadingAnimation
                      v-if="isUnassigning"
                      size="xs"
                    />
                    <span v-else>割り当てを解除</span>
                  </button>
                </div>
                <p
                  v-if="unassignErr"
                  class="mt-2 text-xs text-red-600"
                  role="alert"
                >
                  {{ unassignErr }}
                </p>
                <p
                  v-if="detail.upcoming_deliveries.length === 0"
                  class="mt-3 text-sm text-gray-400"
                  role="status"
                >
                  配達予定はありません。
                </p>
                <ul
                  v-else
                  class="mt-3 space-y-2"
                  role="group"
                  aria-labelledby="driver-upcoming-heading"
                >
                  <li
                    v-for="booking in detail.upcoming_deliveries"
                    :key="booking.id"
                  >
                    <label class="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      <input
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 accent-blue-600"
                        :checked="selectedUnassignIds.has(booking.id)"
                        @change="toggleUnassignSelect(booking.id)"
                      >
                      <span class="flex-1">{{ bookingRouteLabel(booking) }}</span>
                      <span class="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-purple-700">
                        {{ assignmentRoleLabel(booking.assignment_role) }}
                      </span>
                      <span class="whitespace-nowrap text-xs text-gray-500">
                        {{ formatDate(booking.pickup_date) }} → {{ formatDate(booking.delivery_date) }}
                      </span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- 過去の配達履歴 -->
              <div
                class="rounded-lg border border-gray-300 bg-gray-100 p-4"
                aria-labelledby="driver-past-heading"
              >
                <h3
                  id="driver-past-heading"
                  class="text-xs font-semibold tracking-wide text-gray-600"
                >
                  過去の配達履歴
                </h3>
                <p
                  v-if="detail.past_deliveries.length === 0"
                  class="mt-3 text-sm text-gray-400"
                  role="status"
                >
                  配達履歴はありません。
                </p>
                <ul
                  v-else
                  class="mt-3 space-y-2"
                  aria-labelledby="driver-past-heading"
                >
                  <li
                    v-for="booking in detail.past_deliveries"
                    :key="booking.id"
                    class="flex items-center justify-between gap-3 text-sm text-gray-800"
                  >
                    <span class="flex-1">{{ bookingRouteLabel(booking) }}</span>
                    <span
                      v-if="booking.assignment_role"
                      class="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-purple-700"
                    >
                      {{ assignmentRoleLabel(booking.assignment_role) }}
                    </span>
                    <span
                      v-if="booking.attributed_sales != null"
                      class="whitespace-nowrap text-xs font-medium text-gray-700"
                    >
                      ¥{{ booking.attributed_sales.toLocaleString() }}
                    </span>
                    <span class="whitespace-nowrap text-xs text-gray-500">
                      {{ formatDate(booking.delivery_date) }} 配達
                    </span>
                  </li>
                </ul>
              </div>

              <!-- 月別の集荷・配達件数・売上 -->
              <div
                class="rounded-lg border border-gray-300 bg-gray-100 p-4"
                aria-labelledby="driver-monthly-stats-heading"
              >
                <h3
                  id="driver-monthly-stats-heading"
                  class="mb-1 text-xs font-semibold tracking-wide text-gray-600"
                >
                  月別の集荷・配達件数・売上（直近12か月）
                </h3>
                <p
                  id="driver-monthly-stats-desc"
                  class="mb-3 text-xs text-gray-500"
                >
                  集荷・配達をそれぞれ1件として数えます。分業した予約の売上は折半して計上します。
                </p>
                <table
                  class="w-full text-sm"
                  aria-describedby="driver-monthly-stats-desc"
                >
                  <caption class="sr-only">
                    月別の集荷・配達件数・売上（直近12か月）
                  </caption>
                  <thead>
                    <tr class="border-b border-gray-300 text-left text-xs text-gray-500">
                      <th
                        scope="col"
                        class="py-1.5 font-medium"
                      >
                        月
                      </th>
                      <th
                        scope="col"
                        class="py-1.5 text-right font-medium"
                      >
                        件数
                      </th>
                      <th
                        scope="col"
                        class="py-1.5 text-right font-medium"
                      >
                        売上
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="stat in detail.monthly_stats"
                      :key="stat.month"
                      class="border-b border-gray-200 last:border-b-0"
                    >
                      <th
                        scope="row"
                        class="py-1.5 text-left font-normal text-gray-800"
                      >
                        {{ formatMonth(stat.month) }}
                      </th>
                      <td class="py-1.5 text-right text-gray-800">
                        {{ stat.count }} 件
                      </td>
                      <td class="py-1.5 text-right text-gray-800">
                        ¥{{ stat.sales.toLocaleString() }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useCsrf } from "~/composables/useCsrf";
import type { DriverBookingSummary, OwnerDriverDetail } from "~/types/driver";

type Props = {
  modelValue: boolean;
  // null のときは追加（新規作成）モード
  driverId: string | null;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [message?: string];
  "request-delete": [id: string];
}>();

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const { ensureCsrf, getCsrf } = useCsrf();

const inputClass
  = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100";

const dateInputClass = `${inputClass} cursor-pointer appearance-none pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden`;

const fieldErrClass = "mt-1 text-xs text-red-600";

const licenseExpiryInput = ref<HTMLInputElement>();
const shiftStartInput = ref<HTMLInputElement>();

// 日付・時刻入力フィールド全体をクリックしたときに、ブラウザ標準のピッカーを開く
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

// driverId が無いときは新規作成モード
const isCreateMode = computed(() => props.driverId === null);

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];
const API_WEEKDAY_BY_DISPLAY = [6, 0, 1, 2, 3, 4, 5] as const;

// 画面の曜日順（日〜土）を API の曜日インデックス（月=0〜日=6）へ変換
function apiWeekdayIdx(displayIdx: number): number {
  return API_WEEKDAY_BY_DISPLAY[displayIdx] ?? displayIdx;
}

type FormState = {
  last_name: string;
  first_name: string;
  company_name: string;
  email: string;
  departure_address: string;
  departure_place_id: string;
  departure_latitude: number | null;
  departure_longitude: number | null;
  shift_start: string;
  max_daily_stops: number | null;
  max_daily_luggage_count: number | null;
  license_expiry: string;
  operating_days: string;
  is_available: boolean;
};

const form = reactive<FormState>({
  last_name: "",
  first_name: "",
  company_name: "",
  email: "",
  departure_address: "",
  departure_place_id: "",
  departure_latitude: null,
  departure_longitude: null,
  shift_start: "09:00",
  max_daily_stops: 10,
  max_daily_luggage_count: 20,
  license_expiry: "",
  operating_days: "1111111",
  is_available: true,
});

const detail = ref<OwnerDriverDetail | null>(null);
// 現在の form と比較して未保存変更（isDirty）かどうかの判定用
const originalJson = ref("");

const isLoading = ref(false);
const isSaving = ref(false);
const isAssigning = ref(false);
const isUnassigning = ref(false);
const saveErr = ref<string | null>(null);
const assignErr = ref<string | null>(null);
const unassignErr = ref<string | null>(null);
const fieldErrs = ref<Record<string, string>>({});

// プロフィール画像
const pictureInputRef = ref<HTMLInputElement>();
const pictureFile = ref<File | null>(null);
const pictureRemoved = ref(false);
const pictureObjectUrl = ref<string | null>(null);

// 割り当てで選択中の予約
const selectedAssignIds = ref<Set<string>>(new Set());
// 割り当て解除で選択中の予約
const selectedUnassignIds = ref<Set<string>>(new Set());

// プロフィール画像のプレビューURL
const picturePreviewUrl = computed(() => {
  if (pictureObjectUrl.value) return pictureObjectUrl.value;
  if (pictureRemoved.value) return null;
  return detail.value?.profile_picture_url ?? null;
});

// プロフィール画像未設定時のアバター表示用
const avatarInitial = computed(() => {
  const name = `${form.last_name}${form.first_name}`.trim();
  return name ? name.charAt(0) : "？";
});

// フォーム＋画像の未保存変更があるか
const isDirty = computed(
  () =>
    JSON.stringify(form) !== originalJson.value
    || pictureFile.value !== null
    || pictureRemoved.value,
);

function bookingRouteLabel(booking: DriverBookingSummary): string {
  const pickup = booking.pickup_location_name || "—";
  const delivery = booking.delivery_location_name || "—";
  return `${pickup} → ${delivery}`;
}

// 集荷・配達の担当区分ラベル
function assignmentRoleLabel(
  role: DriverBookingSummary["assignment_role"],
): string {
  if (role === "pickup") return "集荷担当";
  if (role === "delivery") return "配達担当";
  return "集荷・配達";
}

// "YYYY-MM-DD" → "YYYY/MM/DD"
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return iso.replace(/-/g, "/");
}

// "YYYY-MM" → "YYYY年M月"
function formatMonth(month: string): string {
  const [year, monthNum] = month.split("-");
  if (!year || !monthNum) return month;
  return `${year}年${Number(monthNum)}月`;
}

// ローカル選択画像のプレビュー用 blob URL を解放する
function revokePictureObjectUrl() {
  if (pictureObjectUrl.value) {
    URL.revokeObjectURL(pictureObjectUrl.value);
    pictureObjectUrl.value = null;
  }
}

// プロフィール画像選択時: ファイル保持・削除フラグ解除・プレビュー用 URL 生成
function onPictureSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  if (!file) return;
  revokePictureObjectUrl();
  pictureFile.value = file;
  pictureRemoved.value = false;
  pictureObjectUrl.value = URL.createObjectURL(file);
  // 同じファイルを選び直せるようにリセット
  input.value = "";
}

// プロフィール画像を削除
function removePicture() {
  revokePictureObjectUrl();
  pictureFile.value = null;
  // 既存画像がある場合は「削除」として保存時にサーバーへ伝える
  pictureRemoved.value = !!detail.value?.profile_picture_url;
}

// 未割当リストの予約選択のトグル関数
function toggleAssignSelect(id: string) {
  const next = new Set(selectedAssignIds.value);
  if (next.has(id)) {
    next.delete(id);
  }
  else {
    next.add(id);
  }
  selectedAssignIds.value = next;
}

// 割当済みリストの予約選択のトグル関数
function toggleUnassignSelect(id: string) {
  const next = new Set(selectedUnassignIds.value);
  if (next.has(id)) {
    next.delete(id);
  }
  else {
    next.add(id);
  }
  selectedUnassignIds.value = next;
}

// 出発地点の入力ハンドラー。住所変更に伴い古い位置情報をクリアする
function handleDepartureAddressInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  form.departure_address = value;
  form.departure_place_id = "";
  form.departure_latitude = null;
  form.departure_longitude = null;
}

// 定休日のトグル関数
function toggleOperatingDay(index: number) {
  const days = form.operating_days.split("");
  days[index] = days[index] === "1" ? "0" : "1";
  form.operating_days = days.join("");
}

// フォーム状態のリセット
function resetFormState() {
  form.last_name = detail.value?.last_name ?? "";
  form.first_name = detail.value?.first_name ?? "";
  form.company_name = detail.value?.company_name ?? "";
  form.email = detail.value?.email ?? "";
  form.departure_address = detail.value?.departure_address ?? "";
  form.departure_place_id = detail.value?.departure_place_id ?? "";
  form.departure_latitude = detail.value?.departure_latitude ?? null;
  form.departure_longitude = detail.value?.departure_longitude ?? null;
  form.shift_start = detail.value?.shift_start?.slice(0, 5) ?? "09:00";
  // 新規作成時はデフォルト10。編集時に未設定（上限なし）なら空欄のまま。
  form.max_daily_stops = detail.value == null
    ? 10
    : (detail.value.max_daily_stops ?? null);
  // 新規作成時はデフォルト20。編集時に未設定（上限なし）なら空欄のまま。
  form.max_daily_luggage_count = detail.value == null
    ? 20
    : (detail.value.max_daily_luggage_count ?? null);
  form.license_expiry = detail.value?.license_expiry ?? "";
  form.operating_days = detail.value?.operating_days ?? "1111111";
  form.is_available = detail.value?.is_available ?? true;
  originalJson.value = JSON.stringify(form);
  revokePictureObjectUrl();
  pictureFile.value = null;
  pictureRemoved.value = false;
  selectedAssignIds.value = new Set();
  selectedUnassignIds.value = new Set();
  saveErr.value = null;
  assignErr.value = null;
  unassignErr.value = null;
  fieldErrs.value = {};
}

// 詳細を取得（編集モード）
async function fetchDetail() {
  if (!props.driverId) return;
  isLoading.value = true;
  try {
    const data = await $fetch<{ driver: OwnerDriverDetail }>(
      `${apiBase}/api/business/drivers/manage/${props.driverId}`,
      { method: "GET", credentials: "include" },
    );
    detail.value = data.driver;
    resetFormState();
  }
  catch {
    saveErr.value = "配達者情報の取得に失敗しました。";
  }
  finally {
    isLoading.value = false;
  }
}

function handleClose() {
  emit("update:modelValue", false);
}

function handleDelete() {
  if (!props.driverId) return;
  emit("request-delete", props.driverId);
}

// API のエラーレスポンスを解釈し、フィールド別エラー（fieldErrs）と
// ヘッダーに出す総括メッセージ（saveErr）に振り分ける。
function applyErr(err: unknown, fallback: string) {
  fieldErrs.value = {};
  const data
    = err && typeof err === "object" && "data" in err
      ? (err as { data?: { errMsg?: string; valid_errs?: Record<string, string[]> } }).data
      : undefined;

  if (data?.valid_errs) {
    const nextFieldErrs: Record<string, string> = {};
    const generalMsgs: string[] = [];
    const knownFields = new Set([...Object.keys(form), "profile_picture"]);
    for (const [key, msgs] of Object.entries(data.valid_errs)) {
      const text = msgs.join(" ");
      if (!text) continue;
      if (knownFields.has(key)) {
        nextFieldErrs[key] = text;
      }
      else {
        generalMsgs.push(text);
      }
    }
    fieldErrs.value = nextFieldErrs;

    if (generalMsgs.length > 0) {
      saveErr.value = generalMsgs.join(" ");
      return;
    }
    if (Object.keys(nextFieldErrs).length > 0) {
      saveErr.value = data.errMsg ?? "入力内容を確認してください。";
      return;
    }
  }

  saveErr.value = data?.errMsg ?? fallback;
}

// 保存 API 送信用の FormData を組み立てる
function buildFormData(): FormData {
  const body = new FormData();
  body.set("last_name", form.last_name);
  body.set("first_name", form.first_name);
  body.set("company_name", form.company_name);
  body.set("email", form.email);
  body.set("departure_address", form.departure_address);
  body.set("shift_start", form.shift_start);
  // v-model.number は空欄のとき数値化できず空文字のままになるため、有効な数値のときだけ送る
  const stopsCount = form.max_daily_stops;
  body.set(
    "max_daily_stops",
    typeof stopsCount === "number" && Number.isFinite(stopsCount)
      ? String(stopsCount)
      : "",
  );
  const luggageCount = form.max_daily_luggage_count;
  body.set(
    "max_daily_luggage_count",
    typeof luggageCount === "number" && Number.isFinite(luggageCount)
      ? String(luggageCount)
      : "",
  );
  body.set("license_expiry", form.license_expiry);
  body.set("operating_days", form.operating_days);
  body.set("is_available", form.is_available ? "true" : "false");
  if (pictureFile.value) {
    body.set("profile_picture", pictureFile.value);
  }
  if (pictureRemoved.value) {
    body.set("remove_picture", "true");
  }
  return body;
}

// 配達者の新規作成または更新を保存
async function handleSave() {
  if (isSaving.value) return;
  isSaving.value = true;
  saveErr.value = null;
  fieldErrs.value = {};
  try {
    await ensureCsrf(apiBase);
    const headers = getCsrf() ? { "X-CSRFToken": getCsrf()! } : undefined;
    let successMsg: string | undefined;
    if (isCreateMode.value) {
      const response = await $fetch<{ message: string }>(`${apiBase}/api/business/drivers/manage`, {
        method: "POST",
        credentials: "include",
        headers,
        body: buildFormData(),
      });
      successMsg = response.message;
    }
    else {
      await $fetch(`${apiBase}/api/business/drivers/manage/${props.driverId}`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: buildFormData(),
      });
    }
    emit("saved", successMsg);
    emit("update:modelValue", false);
  }
  catch (err: unknown) {
    applyErr(
      err,
      isCreateMode.value ? "配達者の追加に失敗しました。" : "配達者の更新に失敗しました。",
    );
  }
  finally {
    isSaving.value = false;
  }
}

// 選択した配達をこの配達者へ割り当てる
async function handleAssign() {
  if (!props.driverId || selectedAssignIds.value.size === 0) return;
  isAssigning.value = true;
  assignErr.value = null;
  try {
    await ensureCsrf(apiBase);
    const data = await $fetch<{ driver: OwnerDriverDetail }>(
      `${apiBase}/api/business/drivers/manage/${props.driverId}/assign`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
        },
        body: { booking_ids: [...selectedAssignIds.value] },
      },
    );
    detail.value = data.driver;
    selectedAssignIds.value = new Set();
    emit("saved");
  }
  catch (err: unknown) {
    const data
      = err && typeof err === "object" && "data" in err
        ? (err as { data?: { errMsg?: string } }).data
        : undefined;
    assignErr.value = data?.errMsg ?? "配達の割り当てに失敗しました。";
  }
  finally {
    isAssigning.value = false;
  }
}

// 選択した配達について、この配達者への割り当てを解除する
async function handleUnassign() {
  if (!props.driverId || selectedUnassignIds.value.size === 0) return;
  isUnassigning.value = true;
  unassignErr.value = null;
  try {
    await ensureCsrf(apiBase);
    const data = await $fetch<{ driver: OwnerDriverDetail }>(
      `${apiBase}/api/business/drivers/manage/${props.driverId}/unassign`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
        },
        body: { booking_ids: [...selectedUnassignIds.value] },
      },
    );
    detail.value = data.driver;
    selectedUnassignIds.value = new Set();
    emit("saved");
  }
  catch (err: unknown) {
    const data
      = err && typeof err === "object" && "data" in err
        ? (err as { data?: { errMsg?: string } }).data
        : undefined;
    unassignErr.value = data?.errMsg ?? "配達の割り当て解除に失敗しました。";
  }
  finally {
    isUnassigning.value = false;
  }
}

watch(
  () => [props.modelValue, props.driverId],
  () => {
    if (import.meta.client) {
      document.body.style.overflow = props.modelValue ? "hidden" : "";
    }
    if (props.modelValue) {
      detail.value = null;
      resetFormState();
      if (props.driverId) {
        fetchDetail();
      }
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  revokePictureObjectUrl();
});
</script>
