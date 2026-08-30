<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="close"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-booking-detail-title"
        class="relative z-10 flex max-h-[88vh] w-[min(94vw,640px)] flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        @keydown.esc="close"
      >
        <!-- ヘッダー -->
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="driver-booking-detail-title"
              class="text-lg font-semibold text-gray-900"
            >
              配達情報の詳細
            </h2>
            <div class="flex items-center gap-2">
              <button
                v-if="primaryAction"
                type="button"
                data-testid="booking-primary-action"
                class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isPrimaryDisabled"
                @click="() => void runPrimaryAction()"
              >
                {{ primaryAction.headerLabel }}
              </button>
              <button
                type="button"
                class="rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isSaving"
                @click="close"
              >
                {{ closeLabel }}
              </button>
            </div>
          </div>
          <p
            v-if="errMsg"
            class="mt-2 text-sm text-red-600"
            role="alert"
          >
            {{ errMsg }}
          </p>
        </div>

        <!-- 配達情報 / 費用入力 -->
        <div
          v-if="detail"
          class="flex border-b border-gray-300"
          role="group"
          aria-label="詳細の表示切替"
        >
          <button
            v-for="tab in DETAIL_TABS"
            :key="tab.key"
            type="button"
            class="flex-1 px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="activeTab === tab.key
              ? 'bg-gray-800 text-white'
              : 'text-gray-700 hover:bg-gray-100'"
            :aria-pressed="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 本文 -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <div
            v-if="isLoading"
            class="flex justify-center py-16"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="配達情報を読み込み中"
          >
            <CommonAtomsLoadingAnimation size="md" />
          </div>

          <div
            v-else-if="detail"
            class="space-y-4"
          >
            <div
              v-show="activeTab === 'info'"
              class="space-y-4"
            >
              <div>
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  配達状況
                </p>
                <span
                  data-testid="booking-detail-status"
                  class="inline-block whitespace-nowrap rounded-full px-3 py-1 text-center text-xs font-semibold"
                  :class="statusPillClass"
                >
                  {{ statusLabel }}
                </span>
              </div>

              <!-- 宿泊予約者名・顧客名 -->
              <div>
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  宿泊予約者名
                </p>
                <p class="text-sm text-gray-800">
                  {{ detail.guest_name || "未登録" }}
                </p>
              </div>
              <div>
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  顧客名
                </p>
                <p class="text-sm text-gray-800">
                  {{ detail.customer_name || "未登録" }}
                </p>
              </div>

              <!-- 電話番号 -->
              <div>
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  電話番号
                </p>
                <a
                  v-if="detail.customer_phone_number"
                  :href="`tel:${detail.customer_phone_number}`"
                  class="text-sm font-semibold text-blue-700 underline"
                >
                  {{ detail.customer_phone_number }}
                </a>
                <p
                  v-else
                  class="text-sm text-gray-800"
                >
                  未登録
                </p>
              </div>

              <!-- 集荷場所 -->
              <div>
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  集荷場所
                </p>
                <div class="flex items-center gap-x-3">
                  <div>
                    <p class="mb-1 text-sm text-gray-800">
                      {{ detail.pickup.name }}
                    </p>
                    <p class="min-w-0 text-xs text-gray-500">
                      {{ detail.pickup.address }}
                    </p>
                  </div>
                  <a
                    v-if="pickupNavUrl"
                    :href="pickupNavUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border-2 border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :aria-label="`${detail.pickup.name}へのナビをGoogle Mapで開く`"
                  >
                    ナビ
                  </a>
                </div>
              </div>

              <!-- 集荷日 -->
              <div>
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  集荷日
                </p>
                <p class="text-sm text-gray-800">
                  {{ formatDate(detail.pickup.date) }}
                </p>
              </div>

              <!-- 集荷時間（記録済みのときのみ・read only） -->
              <div v-if="detail.picked_up_at">
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  集荷時間
                </p>
                <p class="text-sm text-gray-800">
                  {{ formatDateTime(detail.picked_up_at) }}
                </p>
              </div>

              <!-- 配達場所 -->
              <div>
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  配達場所
                </p>
                <div class="flex items-center gap-x-3">
                  <div>
                    <p class="mb-1 text-sm text-gray-800">
                      {{ detail.delivery.name }}
                    </p>
                    <p class="min-w-0 text-xs text-gray-500">
                      {{ detail.delivery.address }}
                    </p>
                  </div>
                  <a
                    v-if="deliveryNavUrl"
                    :href="deliveryNavUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border-2 border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :aria-label="`${detail.delivery.name}へのナビをGoogle Mapで開く`"
                  >
                    ナビ
                  </a>
                </div>
              </div>

              <!-- 配達日 -->
              <div>
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  配達日
                </p>
                <p class="text-sm text-gray-800">
                  {{ formatDate(detail.delivery.date) }}
                </p>
              </div>

              <!-- 配達時間（記録済みのときのみ・read only） -->
              <div v-if="detail.delivered_at">
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  配達時間
                </p>
                <p class="text-sm text-gray-800">
                  {{ formatDateTime(detail.delivered_at) }}
                </p>
              </div>

              <!-- 荷物の内訳 -->
              <div>
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  荷物の内訳
                </p>
                <div class="space-y-1 text-sm text-gray-800">
                  <div
                    v-for="item in luggageBreakdown"
                    :key="item.key"
                    class="flex justify-between"
                  >
                    <span>{{ item.label }}</span>
                    <span>{{ item.count }} 個</span>
                  </div>
                  <div class="flex justify-between border-t border-gray-200 pt-1 font-semibold">
                    <span>合計</span>
                    <span>{{ detail.luggage_count }} 個</span>
                  </div>
                </div>
              </div>

              <!-- 備考 -->
              <div>
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  備考
                </p>
                <p class="whitespace-pre-wrap text-sm text-gray-800">
                  {{ detail.notes || "なし" }}
                </p>
              </div>

              <!-- 手書きサイン -->
              <div v-if="detail.delivery_status === 'picked_up'">
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  手書きサイン <span class="text-red-500">*</span>
                </p>
                <DriverDashboardAtomsSignaturePad
                  ref="signaturePad"
                  @update:is-empty="isSignatureEmpty = $event"
                />
              </div>
              <div v-else-if="detail.delivery_signature">
                <p class="mb-1 block text-xs font-medium text-gray-500">
                  手書きサイン
                </p>
                <img
                  :src="detail.delivery_signature"
                  alt="配達完了時の手書きサイン"
                  class="h-48 w-full rounded-md border border-gray-300 bg-white object-contain"
                >
              </div>
            </div>

            <!-- 費用入力（どの配達状況でも入力可） -->
            <div
              v-show="activeTab === 'fees'"
              class="space-y-4"
            >
              <div>
                <label
                  :for="`facility-fee-${detail.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  施設側の手数料（円）
                </label>
                <input
                  :id="`facility-fee-${detail.id}`"
                  v-model="facilityFeeInput"
                  type="text"
                  inputmode="numeric"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>
              <div>
                <label
                  :for="`transport-cost-${detail.id}`"
                  class="mb-1 block text-xs font-medium text-gray-500"
                >
                  高速代などの交通費（円）
                </label>
                <input
                  :id="`transport-cost-${detail.id}`"
                  v-model="transportCostInput"
                  type="text"
                  inputmode="numeric"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>
            </div>

            <!-- 下部アクション -->
            <div class="space-y-3 pt-2">
              <button
                v-if="primaryAction"
                type="button"
                class="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isPrimaryDisabled"
                @click="() => void runPrimaryAction()"
              >
                {{ primaryAction.label }}
              </button>
              <button
                type="button"
                class="w-full rounded-md bg-gray-400 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isSaving"
                @click="close"
              >
                {{ closeLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type {
  DriverBookingDetail,
  DriverBookingDetailResponse,
  DriverBookingStatus,
} from "~/types/driver-dashboard";
import { navigationUrl } from "~/utils/googleMapsNavigation";

const props = defineProps<{
  modelValue: boolean;
  bookingId: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  // ステータス変更・費用保存が行われた後に通知（親で一覧を再取得）
  "saved": [];
}>();

const STATUS_LABELS: Record<DriverBookingStatus, string> = {
  before_pickup: "集荷前",
  picked_up: "集荷済",
  delivered: "配達済",
  cancelled: "キャンセル",
};

const STATUS_PILL_CLASSES: Record<DriverBookingStatus, string> = {
  before_pickup: "bg-gray-300 text-gray-700",
  picked_up: "bg-blue-600 text-white",
  delivered: "bg-green-600 text-white",
  cancelled: "bg-red-600 text-white",
};

const DETAIL_TABS = [
  { key: "info" as const, label: "配達情報" },
  { key: "fees" as const, label: "費用入力" },
];

type DetailTab = (typeof DETAIL_TABS)[number]["key"];

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const { ensureCsrf, getCsrf } = useCsrf();

const detail = ref<DriverBookingDetail | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);
const errMsg = ref<string | null>(null);
// 保存成功後、閉じるときに親へ一覧再取得を依頼する
const hasChanged = ref(false);

const signaturePad = ref<{ toDataUrl: () => string | null } | null>(null);
const isSignatureEmpty = ref(true);
const facilityFeeInput = ref("");
const transportCostInput = ref("");
const activeTab = ref<DetailTab>("info");

const statusLabel = computed(() => {
  const status = detail.value?.delivery_status;
  if (!status) return "";
  return Object.hasOwn(STATUS_LABELS, status)
    ? STATUS_LABELS[status]
    : "不明";
});
const statusPillClass = computed(() => {
  const status = detail.value?.delivery_status;
  if (!status) return "bg-gray-300 text-gray-700";
  return Object.hasOwn(STATUS_PILL_CLASSES, status)
    ? STATUS_PILL_CLASSES[status]
    : "bg-gray-300 text-gray-700";
});

const pickupNavUrl = computed(() => {
  const pickup = detail.value?.pickup;
  if (!pickup || pickup.lat === null || pickup.lng === null) return null;
  return navigationUrl(pickup.lat, pickup.lng);
});
const deliveryNavUrl = computed(() => {
  const delivery = detail.value?.delivery;
  if (!delivery || delivery.lat === null || delivery.lng === null) return null;
  return navigationUrl(delivery.lat, delivery.lng);
});

const luggageBreakdown = computed(() => {
  const labels: Record<string, string> = {
    cabin: "機内持ち込みサイズ",
    checked: "受託手荷物サイズ",
    oversize: "規格外サイズ",
  };
  const items = detail.value?.luggage_items ?? {};
  return Object.keys(labels).map(key => ({
    key,
    label: labels[key]!,
    count: Number(items[key] ?? 0),
  }));
});

// 表示中タブと配達状況に合わせた主要アクション（担当外なら出さない）
const primaryAction = computed(() => {
  if (activeTab.value === "fees") {
    return { headerLabel: "保存", label: "保存する", run: saveFees };
  }
  switch (detail.value?.delivery_status) {
    case "before_pickup":
      return detail.value.is_pickup_assignee
        ? { headerLabel: "集荷完了", label: "集荷完了にする", run: completePickup }
        : null;
    case "picked_up":
      return detail.value.is_delivery_assignee
        ? { headerLabel: "配達完了", label: "配達完了にする", run: completeDelivery }
        : null;
    default:
      return null;
  }
});

const isPrimaryDisabled = computed(() => {
  if (isSaving.value) return true;
  if (activeTab.value === "fees") return false;
  // 配達完了は手書きサイン必須
  if (detail.value?.delivery_status === "picked_up") return isSignatureEmpty.value;
  return false;
});

const closeLabel = computed(() =>
  activeTab.value === "fees" ? "保存しない" : "戻る",
);

// "YYYY-MM-DD" → "YYYY/MM/DD"
function formatDate(value: string): string {
  if (!value) return "未登録";
  return value.replace(/-/g, "/");
}

// ISO日時 → "YYYY/MM/DD HH:MM"
function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 取得・保存後の予約を画面の入力欄へ反映
function applyDetail(booking: DriverBookingDetail) {
  detail.value = booking;
  facilityFeeInput.value
    = booking.facility_fee !== null ? String(booking.facility_fee) : "";
  transportCostInput.value
    = booking.transport_cost !== null ? String(booking.transport_cost) : "";
}

// 予約詳細を取得
async function fetchDetail() {
  if (!props.bookingId) return;
  isLoading.value = true;
  errMsg.value = null;

  try {
    const data = await $fetch<DriverBookingDetailResponse>(
      `${apiBase}/api/drivers/me/bookings/${props.bookingId}`,
      { method: "GET", credentials: "include" },
    );
    applyDetail(data.booking);
  }
  catch (err: unknown) {
    const errData = (err as { data?: { errMsg?: string } })?.data;
    errMsg.value = errData?.errMsg ?? "配達情報の取得に失敗しました。";
    detail.value = null;
  }
  finally {
    isLoading.value = false;
  }
}

// 集荷完了・配達完了・費用保存の共通 PATCH
async function patchBooking(body: Record<string, unknown>): Promise<boolean> {
  if (!props.bookingId) return false;
  isSaving.value = true;
  errMsg.value = null;

  try {
    await ensureCsrf(apiBase);
    const data = await $fetch<DriverBookingDetailResponse>(
      `${apiBase}/api/drivers/me/bookings/${props.bookingId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
        },
        body,
      },
    );
    applyDetail(data.booking);
    hasChanged.value = true;
    return true;
  }
  catch (err: unknown) {
    const errData = (err as { data?: { errMsg?: string } })?.data;
    errMsg.value = errData?.errMsg
      ?? "更新に失敗しました。しばらく時間をおいて再度お試しください。";
    return false;
  }
  finally {
    isSaving.value = false;
  }
}

// 保存中は閉じない。変更があれば親に通知してから閉じる
function close() {
  if (isSaving.value) return;
  if (hasChanged.value) emit("saved");
  emit("update:modelValue", false);
}

// 集荷完了を保存し、成功したらダイアログを閉じる
async function completePickup() {
  const succeeded = await patchBooking({ action: "pickup_complete" });
  if (succeeded) close();
}

// 手書きサイン付きで配達完了を保存し、成功したらダイアログを閉じる
async function completeDelivery() {
  const signature = signaturePad.value?.toDataUrl();
  if (!signature) {
    errMsg.value = "配達完了には手書きサインが必要です。";
    return;
  }
  const succeeded = await patchBooking({ action: "deliver_complete", signature });
  if (succeeded) close();
}

// 空欄は未入力(null)、数字以外はエラー(undefined)
function parseFee(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed)) return undefined;
  return Number(trimmed);
}

// 費用を検証して保存し、成功したらダイアログを閉じる
async function saveFees() {
  const facilityFee = parseFee(facilityFeeInput.value);
  const transportCost = parseFee(transportCostInput.value);
  if (facilityFee === undefined || transportCost === undefined) {
    errMsg.value = "金額は0以上の整数で入力してください。";
    return;
  }
  const succeeded = await patchBooking({
    facility_fee: facilityFee,
    transport_cost: transportCost,
  });
  if (succeeded) close();
}

// 表示中の主要ボタン（集荷完了・配達完了・保存）を実行
async function runPrimaryAction() {
  await primaryAction.value?.run();
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      // 前回の内容が残らないよう初期化し、背景スクロールを止める
      detail.value = null;
      errMsg.value = null;
      hasChanged.value = false;
      isSignatureEmpty.value = true;
      activeTab.value = "info";
      document.body.style.overflow = "hidden";
      void fetchDetail();
    }
    else {
      document.body.style.overflow = "";
    }
  },
);

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>
