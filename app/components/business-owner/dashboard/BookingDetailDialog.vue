<template>
  <Teleport to="body">
    <div
      v-if="modelValue && booking"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="handleDiscard"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-detail-title"
        class="relative z-10 flex max-h-[88vh] w-[min(94vw,640px)] flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        @keydown.esc="handleDiscard"
      >
        <!-- ヘッダー（タイトル＋操作ボタン） -->
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="booking-detail-title"
              class="text-lg font-semibold text-gray-900"
            >
              予約の詳細
            </h2>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                :disabled="!isDirty || isSaving || isCancelled"
                @click="handleSave"
              >
                <CommonAtomsLoadingAnimation
                  v-if="isSaving"
                  size="xs"
                />
                <span v-else>保存</span>
              </button>
              <button
                type="button"
                class="rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="isSaving"
                @click="handleDiscard"
              >
                保存しない
              </button>
              <button
                type="button"
                class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                :disabled="!booking.can_cancel || isSaving"
                @click="handleCancel"
              >
                予約をキャンセル
              </button>
            </div>
          </div>
          <p
            v-if="isCancelled"
            class="mt-2 text-sm text-red-600"
          >
            この予約はキャンセル済みのため編集できません。
          </p>
          <p
            v-if="saveErr"
            class="mt-2 text-sm text-red-600"
          >
            {{ saveErr }}
          </p>
        </div>

        <!-- 本文 -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <div class="space-y-4">
            <!-- 編集不可 -->
            <BusinessOwnerDashboardAtomsBookingDetailRow
              label="予約番号"
              :value="booking.booking_number"
            />
            <BusinessOwnerDashboardAtomsBookingDetailRow
              label="予約日時"
              :value="formatDateTime(booking.created_at)"
            />

            <div class="space-y-4">
              <div>
                <label
                  :for="`status-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  配達状況
                </label>
                <div class="relative">
                  <select
                    :id="`status-${booking.id}`"
                    v-model="form.delivery_status"
                    :disabled="isCancelled"
                    :class="selectClass"
                  >
                    <option
                      v-for="statusOption in statusOptions"
                      :key="statusOption.value"
                      :value="statusOption.value"
                    >
                      {{ statusOption.label }}
                    </option>
                  </select>
                  <img
                    class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
                    src="/img/down-arrow.svg"
                    alt=""
                  >
                </div>
                <p
                  v-if="fieldErrs.delivery_status"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.delivery_status }}
                </p>
              </div>

              <div>
                <label class="mb-3 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    v-model="form.split_drivers"
                    type="checkbox"
                    :disabled="isCancelled"
                    class="h-4 w-4 rounded border-gray-300"
                    @change="handleSplitChange"
                  >
                  集荷担当と配達担当を分ける
                </label>

                <div v-if="!form.split_drivers">
                  <label
                    :for="`driver-${booking.id}`"
                    class="mb-1 block text-xs font-medium text-gray-500"
                  >
                    配達者（集荷・配達）
                  </label>
                  <div class="relative">
                    <select
                      :id="`driver-${booking.id}`"
                      v-model="form.driver"
                      :disabled="isCancelled"
                      :class="selectClass"
                    >
                      <option value="">
                        未割り当て
                      </option>
                      <option
                        v-for="driver in drivers"
                        :key="driver.id"
                        :value="driver.id"
                      >
                        {{ driver.name }}
                      </option>
                    </select>
                    <img
                      class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
                      src="/img/down-arrow.svg"
                      alt=""
                    >
                  </div>
                </div>

                <div
                  v-else
                  class="grid gap-3 sm:grid-cols-2"
                >
                  <div>
                    <label
                      :for="`pickup-driver-${booking.id}`"
                      class="mb-1 block text-xs font-medium text-gray-500"
                    >
                      集荷担当
                    </label>
                    <div class="relative">
                      <select
                        :id="`pickup-driver-${booking.id}`"
                        v-model="form.pickup_driver"
                        :disabled="isCancelled"
                        :class="selectClass"
                      >
                        <option value="">
                          選択してください
                        </option>
                        <option
                          v-for="driver in drivers"
                          :key="driver.id"
                          :value="driver.id"
                        >
                          {{ driver.name }}
                        </option>
                      </select>
                      <img
                        class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
                        src="/img/down-arrow.svg"
                        alt=""
                      >
                    </div>
                    <p
                      v-if="fieldErrs.pickup_driver"
                      :class="fieldErrClass"
                    >
                      {{ fieldErrs.pickup_driver }}
                    </p>
                  </div>
                  <div>
                    <label
                      :for="`delivery-driver-${booking.id}`"
                      class="mb-1 block text-xs font-medium text-gray-500"
                    >
                      配達担当
                    </label>
                    <div class="relative">
                      <select
                        :id="`delivery-driver-${booking.id}`"
                        v-model="form.driver"
                        :disabled="isCancelled"
                        :class="selectClass"
                      >
                        <option value="">
                          選択してください
                        </option>
                        <option
                          v-for="driver in drivers"
                          :key="driver.id"
                          :value="driver.id"
                        >
                          {{ driver.name }}
                        </option>
                      </select>
                      <img
                        class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
                        src="/img/down-arrow.svg"
                        alt=""
                      >
                    </div>
                  </div>
                </div>
                <p
                  v-if="fieldErrs.driver"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.driver }}
                </p>
              </div>
            </div>

            <div class="space-y-4 border-t border-gray-100 pt-4">
              <div>
                <label
                  :for="`pickup-name-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  集荷場所
                </label>
                <input
                  :id="`pickup-name-${booking.id}`"
                  v-model="form.pickup_location_name"
                  type="text"
                  :disabled="isCancelled"
                  :class="inputClass"
                >
                <p
                  v-if="fieldErrs.pickup_location_name"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.pickup_location_name }}
                </p>
              </div>
              <BusinessOwnerDashboardAtomsBookingDetailRow
                label="集荷場所の郵便番号"
                :value="booking.pickup_postal_code"
              />
              <div>
                <label
                  :for="`pickup-addr-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  集荷場所の住所
                </label>
                <textarea
                  :id="`pickup-addr-${booking.id}`"
                  v-model="form.pickup_location_address"
                  rows="2"
                  :disabled="isCancelled"
                  :class="inputClass"
                />
                <p
                  v-if="fieldErrs.pickup_location_address"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.pickup_location_address }}
                </p>
              </div>
              <div>
                <label
                  :for="`pickup-date-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  集荷日
                </label>
                <div
                  class="relative"
                  @click="openNativeDatePicker(pickupDateInput)"
                >
                  <input
                    :id="`pickup-date-${booking.id}`"
                    ref="pickupDateInput"
                    v-model="form.pickup_date"
                    type="date"
                    :disabled="isCancelled"
                    :class="dateInputClass"
                  >
                  <img
                    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    src="/img/calendar.svg"
                    alt=""
                  >
                </div>
                <p
                  v-if="fieldErrs.pickup_date"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.pickup_date }}
                </p>
              </div>
            </div>

            <div class="space-y-4 border-t border-gray-100 pt-4">
              <div>
                <label
                  :for="`delivery-name-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  配達場所
                </label>
                <input
                  :id="`delivery-name-${booking.id}`"
                  v-model="form.delivery_location_name"
                  type="text"
                  :disabled="isCancelled"
                  :class="inputClass"
                >
                <p
                  v-if="fieldErrs.delivery_location_name"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.delivery_location_name }}
                </p>
              </div>
              <BusinessOwnerDashboardAtomsBookingDetailRow
                label="配達場所の郵便番号"
                :value="booking.delivery_postal_code"
              />
              <div>
                <label
                  :for="`delivery-addr-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  配達場所の住所
                </label>
                <textarea
                  :id="`delivery-addr-${booking.id}`"
                  v-model="form.delivery_location_address"
                  rows="2"
                  :disabled="isCancelled"
                  :class="inputClass"
                />
                <p
                  v-if="fieldErrs.delivery_location_address"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.delivery_location_address }}
                </p>
              </div>
              <div>
                <label
                  :for="`delivery-date-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  配達日
                </label>
                <div
                  class="relative"
                  @click="openNativeDatePicker(deliveryDateInput)"
                >
                  <input
                    :id="`delivery-date-${booking.id}`"
                    ref="deliveryDateInput"
                    v-model="form.delivery_date"
                    type="date"
                    :disabled="isCancelled"
                    :class="dateInputClass"
                  >
                  <img
                    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    src="/img/calendar.svg"
                    alt=""
                  >
                </div>
                <p
                  v-if="fieldErrs.delivery_date"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.delivery_date }}
                </p>
              </div>
            </div>

            <div class="space-y-4 border-t border-gray-100 pt-4">
              <div>
                <label
                  :for="`customer-name-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  顧客名
                </label>
                <input
                  :id="`customer-name-${booking.id}`"
                  v-model="form.customer_name"
                  type="text"
                  :disabled="isCancelled"
                  :class="inputClass"
                >
                <p
                  v-if="fieldErrs.customer_name"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.customer_name }}
                </p>
              </div>
              <div>
                <label
                  :for="`guest-name-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  宿泊予約者名
                </label>
                <input
                  :id="`guest-name-${booking.id}`"
                  v-model="form.guest_name"
                  type="text"
                  :disabled="isCancelled"
                  :class="inputClass"
                >
                <p
                  v-if="fieldErrs.guest_name"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.guest_name }}
                </p>
              </div>
              <div>
                <label
                  :for="`email-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  メールアドレス
                </label>
                <input
                  :id="`email-${booking.id}`"
                  v-model="form.customer_email"
                  type="email"
                  :disabled="isCancelled"
                  :class="inputClass"
                >
                <p
                  v-if="fieldErrs.customer_email"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.customer_email }}
                </p>
              </div>
              <div>
                <label
                  :for="`phone-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  電話番号
                </label>
                <input
                  :id="`phone-${booking.id}`"
                  v-model="form.customer_phone_number"
                  type="tel"
                  :disabled="isCancelled"
                  :class="inputClass"
                >
                <p
                  v-if="fieldErrs.customer_phone_number"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.customer_phone_number }}
                </p>
              </div>
              <div>
                <label
                  :for="`nationality-${booking.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  国籍
                </label>
                <div class="relative">
                  <select
                    :id="`nationality-${booking.id}`"
                    v-model="form.customer_nationality"
                    :disabled="isCancelled"
                    :class="selectClass"
                  >
                    <option
                      value=""
                      disabled
                    >
                      国籍を選択してください
                    </option>
                    <option
                      v-for="nationalityItem in nationalityItems"
                      :key="nationalityItem.value"
                      :value="nationalityItem.value"
                    >
                      {{ nationalityItem.label }}
                    </option>
                  </select>
                  <img
                    class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
                    src="/img/down-arrow.svg"
                    alt=""
                  >
                </div>
                <p
                  v-if="fieldErrs.customer_nationality"
                  :class="fieldErrClass"
                >
                  {{ fieldErrs.customer_nationality }}
                </p>
              </div>
            </div>

            <div class="border-t border-gray-100 pt-4">
              <label
                :for="`notes-${booking.id}`"
                class="mb-1 block text-xs font-medium text-gray-500"
              >
                備考
              </label>
              <textarea
                :id="`notes-${booking.id}`"
                v-model="form.notes"
                rows="3"
                :disabled="isCancelled"
                :class="inputClass"
              />
              <p
                v-if="fieldErrs.notes"
                :class="fieldErrClass"
              >
                {{ fieldErrs.notes }}
              </p>
            </div>

            <!-- （編集不可） -->
            <div class="!mt-8 rounded-lg border border-gray-300 bg-gray-100 p-4">
              <div>
                <dt class="text-xs font-semibold tracking-wide text-gray-600">
                  荷物
                </dt>
                <dd class="mt-2 space-y-2 text-sm text-gray-800">
                  <div class="space-y-1">
                    <div
                      v-for="item in luggageBreakdown"
                      :key="item.key"
                      class="flex justify-between"
                    >
                      <span>{{ item.label }}</span>
                      <span>{{ item.count }} 個</span>
                    </div>
                  </div>
                  <div class="flex justify-between border-t border-gray-300 pt-2 font-semibold">
                    <span>合計</span>
                    <span>{{ booking.total_luggage_count }} 個</span>
                  </div>
                </dd>
              </div>
              <div class="mt-3 flex items-center justify-between border-t border-gray-300 pt-3">
                <span class="text-xs font-semibold tracking-wide text-gray-600">合計金額</span>
                <span class="text-xl font-bold text-gray-900">
                  ¥{{ booking.total_amount.toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- 配達実績（配達者が入力・編集不可） -->
            <div class="rounded-lg border border-gray-300 bg-gray-100 p-4">
              <dt class="mb-2 text-xs font-semibold tracking-wide text-gray-600">
                配達実績
              </dt>
              <dd class="space-y-2 text-sm text-gray-800">
                <div class="flex justify-between">
                  <span>集荷時間</span>
                  <span>{{ booking.picked_up_at ? formatDateTime(booking.picked_up_at) : "未記録" }}</span>
                </div>
                <div class="flex justify-between">
                  <span>配達時間</span>
                  <span>{{ booking.delivered_at ? formatDateTime(booking.delivered_at) : "未記録" }}</span>
                </div>
                <div class="flex justify-between">
                  <span>施設側の手数料</span>
                  <span>{{ booking.facility_fee !== null ? `¥${booking.facility_fee.toLocaleString()}` : "未入力" }}</span>
                </div>
                <div class="flex justify-between">
                  <span>高速代などの交通費</span>
                  <span>{{ booking.transport_cost !== null ? `¥${booking.transport_cost.toLocaleString()}` : "未入力" }}</span>
                </div>
                <div>
                  <span>手書きサイン</span>
                  <img
                    v-if="booking.delivery_signature"
                    :src="booking.delivery_signature"
                    alt="配達完了時の手書きサイン"
                    class="mt-1 h-40 w-full rounded-md border border-gray-300 bg-white object-contain"
                  >
                  <p
                    v-else
                    class="mt-1 text-gray-500"
                  >
                    未記録
                  </p>
                </div>
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import countries from "i18n-iso-countries";
import ja from "i18n-iso-countries/langs/ja.json";
import { useCsrf } from "~/composables/useCsrf";
import type { OwnerBooking, OwnerDeliveryStatus, OwnerDriver } from "~/types/booking";

type Props = {
  modelValue: boolean;
  booking: OwnerBooking | null;
  drivers?: OwnerDriver[];
};

const props = withDefaults(defineProps<Props>(), {
  drivers: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "saved": [];
  "request-cancel": [id: string];
}>();

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const { ensureCsrf, getCsrf } = useCsrf();

const inputClass
  = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100";

const selectClass = `${inputClass} cursor-pointer appearance-none pr-10`;

const dateInputClass = `${inputClass} cursor-pointer appearance-none pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden`;

const fieldErrClass = "mt-1 text-xs text-red-600";

const pickupDateInput = ref<HTMLInputElement>();
const deliveryDateInput = ref<HTMLInputElement>();

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

const statusOptions: { value: OwnerDeliveryStatus; label: string }[] = [
  { value: "before_pickup", label: "集荷前" },
  { value: "picked_up", label: "集荷済" },
  { value: "delivered", label: "配達済" },
];

countries.registerLocale(ja);
const nationalityItems = Object.entries(countries.getNames("ja"))
  .map(([code, name]) => ({ value: code, label: name as string }))
  .sort((a, b) => a.label.localeCompare(b.label, "ja"));

function normalizeNationality(code: string | null | undefined): string {
  const value = (code ?? "").trim();
  if (!value) return "";
  // alpha-3 コード（例: JPN）→ alpha-2（例: JP）
  if (/^[A-Za-z]{3}$/.test(value)) {
    const alpha2 = countries.alpha3ToAlpha2(value.toUpperCase());
    return alpha2 ?? value.toUpperCase();
  }
  // alpha-2 コード（例: jp）→ 大文字化
  if (/^[A-Za-z]{2}$/.test(value)) {
    return value.toUpperCase();
  }
  // 国名（例: 日本 / アメリカ合衆国）が保存されている場合は alpha-2 に変換
  const alpha2FromName = countries.getAlpha2Code(value, "ja");
  return alpha2FromName ?? value;
}

type FormState = {
  delivery_status: OwnerDeliveryStatus;
  driver: string;
  pickup_driver: string;
  split_drivers: boolean;
  pickup_location_name: string;
  pickup_location_address: string;
  pickup_date: string;
  delivery_location_name: string;
  delivery_location_address: string;
  delivery_date: string;
  customer_name: string;
  guest_name: string;
  customer_email: string;
  customer_phone_number: string;
  customer_nationality: string;
  notes: string;
};

function buildForm(booking: OwnerBooking): FormState {
  return {
    delivery_status:
      booking.delivery_status === "cancelled" ? "before_pickup" : booking.delivery_status,
    driver: booking.driver ?? "",
    pickup_driver: booking.pickup_driver ?? booking.driver ?? "",
    split_drivers: booking.is_split_assignment ?? false,
    pickup_location_name: booking.pickup_location_name ?? "",
    pickup_location_address: booking.pickup_location_address ?? "",
    pickup_date: booking.pickup_date ?? "",
    delivery_location_name: booking.delivery_location_name ?? "",
    delivery_location_address: booking.delivery_location_address ?? "",
    delivery_date: booking.delivery_date ?? "",
    customer_name: booking.customer_name ?? "",
    guest_name: booking.guest_name ?? "",
    customer_email: booking.customer_email ?? "",
    customer_phone_number: booking.customer_phone_number ?? "",
    customer_nationality: normalizeNationality(booking.customer_nationality),
    notes: booking.notes ?? "",
  };
}

// マウント時点では表示対象の予約が未確定なことがあるため、buildForm 用の仮データで
// reactive な form を先に用意する。ダイアログを開いたときに resetForm で本物の予約に差し替える。
const form = reactive<FormState>(
  buildForm({
    delivery_status: "before_pickup",
  } as OwnerBooking),
);

const originalJson = ref("");
const isSaving = ref(false);
const saveErr = ref<string | null>(null);
// フィールド名 -> そのフィールドのエラーメッセージ（各入力欄の下に表示する）
const fieldErrs = ref<Record<string, string>>({});

const isCancelled = computed(() => props.booking?.delivery_status === "cancelled");
const isDirty = computed(() => JSON.stringify(form) !== originalJson.value);

function handleSplitChange() {
  fieldErrs.value = {};
  if (form.split_drivers) {
    form.pickup_driver = form.pickup_driver || form.driver;
  }
  else {
    form.pickup_driver = form.driver;
  }
}

const luggageBreakdown = computed(() => {
  const labels: Record<string, string> = {
    cabin: "機内持ち込みサイズ",
    checked: "受託手荷物サイズ",
    oversize: "規格外サイズ",
  };
  const items = props.booking?.luggage_items ?? {};
  return Object.keys(labels).map(key => ({
    key,
    label: labels[key],
    count: Number(items[key] ?? 0),
  }));
});

// ISO日時 → "YYYY/MM/DD HH:MM"
function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

function resetForm() {
  if (!props.booking) return;
  Object.assign(form, buildForm(props.booking));
  originalJson.value = JSON.stringify(form);
  saveErr.value = null;
  fieldErrs.value = {};
}

function handleDiscard() {
  emit("update:modelValue", false);
}

function handleCancel() {
  if (!props.booking) return;
  emit("request-cancel", props.booking.id);
}

// API のエラーレスポンスを解釈し、フィールド別エラー（fieldErrs）と
// ヘッダーに出す総括メッセージ（saveErr）に振り分ける。
function applyErr(err: unknown) {
  fieldErrs.value = {};
  const data
    = err && typeof err === "object" && "data" in err
      ? (err as { data?: { errMsg?: string; valid_errs?: Record<string, string[]> } }).data
      : undefined;

  if (data?.valid_errs) {
    const nextFieldErrs: Record<string, string> = {};
    // フィールドに紐づかないエラー（non_field_errors など）はヘッダーにまとめる
    const generalMsgs: string[] = [];
    for (const [key, msgs] of Object.entries(data.valid_errs)) {
      const text = msgs.join(" ");
      if (!text) continue;
      if (key in form) {
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

  saveErr.value = data?.errMsg ?? "予約の更新に失敗しました。";
}

async function handleSave() {
  if (!props.booking || !isDirty.value) return;
  if (form.split_drivers) {
    fieldErrs.value = {};
    if (!form.pickup_driver) {
      fieldErrs.value.pickup_driver = "集荷担当を選択してください。";
    }
    if (!form.driver) {
      fieldErrs.value.driver = "配達担当を選択してください。";
    }
    if (form.pickup_driver && form.pickup_driver === form.driver) {
      fieldErrs.value.pickup_driver = "配達担当とは別の配達者を選択してください。";
    }
    if (Object.keys(fieldErrs.value).length > 0) return;
  }
  isSaving.value = true;
  saveErr.value = null;
  fieldErrs.value = {};
  const { split_drivers: splitDrivers, ...payload } = form;
  try {
    await ensureCsrf(apiBase);
    await $fetch(`${apiBase}/api/business/bookings/${props.booking.id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
      body: {
        ...payload,
        driver: form.driver || null,
        pickup_driver: splitDrivers ? form.pickup_driver || null : null,
        customer_nationality: normalizeNationality(form.customer_nationality),
      },
    });
    emit("saved");
    emit("update:modelValue", false);
  }
  catch (err: unknown) {
    applyErr(err);
  }
  finally {
    isSaving.value = false;
  }
}

watch(
  () => [props.modelValue, props.booking?.id],
  () => {
    if (import.meta.client) {
      document.body.style.overflow = props.modelValue ? "hidden" : "";
    }
    if (props.modelValue && props.booking) {
      resetForm();
    }
  },
  { immediate: true },
);
</script>
