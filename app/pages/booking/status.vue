<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <CommonAtomsErrDialog
        v-model="showErrDialog"
        :msg="errMsg"
      />

      <CommonAtomsConfirmDialog
        v-model="showCancelConfirm"
        :title="$t('status.cancelDialogTitle')"
        :message="$t('status.cancelDialogMessage')"
        :confirm-label="$t('status.cancelDialogConfirm')"
        :cancel-label="$t('status.cancelDialogCancel')"
        @confirm="cancelBooking"
      />

      <!-- 予約番号の入力 -->
      <section
        v-if="!booking"
        class="mx-auto mt-6 max-w-[520px] rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-10"
      >
        <div class="mb-8 text-center">
          <span
            class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-white"
          >
            <img
              class="h-7 w-7 object-contain"
              src="/img/search.svg"
              alt=""
            >
          </span>
          <h1 class="mb-2 text-xl font-bold text-gray-900">
            {{ $t("status.lookupTitle") }}
          </h1>
          <p class="text-sm text-gray-500">
            {{ $t("status.lookupHint") }}
          </p>
        </div>

        <form
          class="flex flex-col gap-5"
          @submit.prevent="lookupBooking"
        >
          <input
            v-model="bookingNumberInput"
            type="text"
            inputmode="text"
            autocomplete="off"
            placeholder="LG-XXXX-XXXX-XXXX"
            class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 text-center tracking-wider text-gray-900 transition-colors placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="booking-number-input"
          >
          <button
            type="submit"
            class="flex w-full items-center justify-center rounded-md bg-gray-800 px-8 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
            :disabled="isLooking || !bookingNumberInput.trim()"
          >
            <CommonAtomsLoadingAnimation
              v-if="isLooking"
              size="sm"
            />
            <span v-else>{{ $t("status.lookupButton") }}</span>
          </button>
        </form>
      </section>

      <!-- 予約内容の確認・キャンセル -->
      <template v-else>
        <!-- 配達状況トラッカー -->
        <section class="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div class="mb-8 flex flex-col items-center gap-2">
            <span class="text-xs font-medium uppercase tracking-wider text-gray-400">
              {{ $t("status.deliveryStatus") }}
            </span>
            <span
              class="rounded-full px-4 py-1.5 font-bold"
              :class="statusBadgeClass"
              data-testid="delivery-status-label"
            >
              {{ deliveryStatusLabel }}
            </span>
          </div>

          <p
            v-if="isCancelled"
            class="text-center text-sm text-gray-500"
          >
            {{ $t("status.cancelledNote") }}
          </p>

          <!-- 進捗ステッパー -->
          <div
            v-else
            class="relative px-1 pt-1"
          >
            <!-- ベースライン -->
            <div
              class="absolute left-6 right-6 top-6 h-1 -translate-y-1/2 rounded-full bg-gray-200"
            />
            <!-- 進捗ライン -->
            <div
              class="absolute left-6 top-6 h-1 -translate-y-1/2 rounded-full"
              :class="fillLineClass"
              :style="{ width: fillWidth }"
            />

            <ol class="relative flex justify-between">
              <li
                v-for="statusStep in statusSteps"
                :key="statusStep.value"
                class="flex flex-col items-center gap-2.5"
              >
                <span
                  class="z-10 flex h-12 w-12 items-center justify-center rounded-full border-2"
                  :class="nodeStateClass(statusStep.order)"
                >
                  <img
                    :src="stepIconSrc(statusStep)"
                    alt=""
                    class="h-5 w-5"
                  >
                </span>
                <span
                  class="text-xs font-bold sm:text-sm"
                  :class="labelStateClass(statusStep.order)"
                >
                  {{ statusStep.label }}
                </span>
              </li>
            </ol>
          </div>
        </section>

        <p
          v-if="cancelDone"
          class="mb-8 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          role="status"
        >
          <img
            class="h-5 w-5 shrink-0 object-contain"
            src="/img/check-circle-green.svg"
            alt=""
          >
          <span>{{ $t("status.cancelDone") }}</span>
        </p>

        <!-- ページトップ: 重要事項 + キャンセルボタン -->
        <div class="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <BookingTransactionLawBox
            :items="confirmationLawItems"
            :is-loading="lawLoading"
            :fetch-err="lawErr"
            :title="confirmationLawTitle"
          />
          <div class="mx-auto mt-6 max-w-[520px]">
            <button
              v-if="booking.can_cancel"
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-8 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="isCancelling"
              @click="showCancelConfirm = true"
            >
              <CommonAtomsLoadingAnimation
                v-if="isCancelling"
                size="sm"
              />
              <template v-else>
                <img
                  class="h-5 w-5"
                  src="/img/cancel.svg"
                  alt=""
                >
                <span>{{ $t("status.cancelButton") }}</span>
              </template>
            </button>
            <button
              v-else-if="booking.can_download_receipt"
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 px-8 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="isDownloadingReceipt"
              @click="downloadReceipt"
            >
              <CommonAtomsLoadingAnimation
                v-if="isDownloadingReceipt"
                size="sm"
              />
              <template v-else>
                <img
                  class="h-5 w-5"
                  src="/img/download-white.svg"
                  alt=""
                >
                <span>{{ $t("status.receiptButton") }}</span>
              </template>
            </button>
          </div>
        </div>

        <!-- 予約内容のご確認 -->
        <h2 class="mb-5 text-center text-lg font-bold text-gray-900">
          {{ $t("status.sectionTitle") }}
        </h2>

        <div
          class="mb-8 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <!-- 基本情報 -->
          <section class="p-6 md:p-8">
            <h3 class="mb-4 flex items-center gap-2 font-bold text-gray-900">
              <span class="h-4 w-1 rounded-full bg-gray-900" />
              {{ $t("status.basicInfo") }}
            </h3>
            <dl class="divide-y divide-gray-100">
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.bookingNumber") }}
                </dt>
                <dd class="text-sm font-semibold text-gray-900 sm:text-right">
                  {{ booking.booking_number }}
                </dd>
              </div>
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.name") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ booking.customer_name }}
                </dd>
              </div>
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.email") }}
                </dt>
                <dd class="break-all text-sm font-medium text-gray-900 sm:text-right">
                  {{ booking.customer_email }}
                </dd>
              </div>
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.phone") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ booking.customer_phone_number }}
                </dd>
              </div>
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.nationality") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ nationalityLabel }}
                </dd>
              </div>
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.guestNameRoman") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ booking.guest_name }}
                </dd>
              </div>
            </dl>
          </section>

          <!-- 配送情報 -->
          <section class="p-6 md:p-8">
            <h3 class="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
              <span class="h-4 w-1 rounded-full bg-gray-900" />
              {{ $t("status.deliveryInfo") }}
            </h3>
            <dl class="divide-y divide-gray-100">
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.pickupPlaceName") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ booking.pickup_location_name }}
                </dd>
              </div>
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.pickupPlaceAddress") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ booking.pickup_location_address }}
                </dd>
              </div>
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.pickupDate") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ formatDate(booking.pickup_date) }}
                </dd>
              </div>
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.deliveryPlaceName") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ booking.delivery_location_name }}
                </dd>
              </div>
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.deliveryPlaceAddress") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ booking.delivery_location_address }}
                </dd>
              </div>
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.deliveryDate") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ formatDate(booking.delivery_date) }}
                </dd>
              </div>
              <div
                v-if="booking.notes"
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.notes") }}
                </dt>
                <dd class="whitespace-pre-wrap text-sm font-medium text-gray-900 sm:text-right">
                  {{ booking.notes }}
                </dd>
              </div>
            </dl>
          </section>

          <!-- ご依頼荷物 -->
          <section class="p-6 md:p-8">
            <h3 class="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
              <span class="h-4 w-1 rounded-full bg-gray-900" />
              {{ $t("status.luggageSection") }}
            </h3>
            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-gray-500">
                    <th class="px-4 py-2.5 text-left font-medium">
                      {{ $t("status.luggageType") }}
                    </th>
                    <th class="px-4 py-2.5 text-right font-medium">
                      {{ $t("status.count") }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="luggageRow in luggageRows"
                    :key="luggageRow.key"
                  >
                    <td
                      class="px-4 py-2.5"
                      :class="luggageRow.count > 0 ? 'text-gray-900' : 'text-gray-400'"
                    >
                      {{ luggageRow.label }}
                    </td>
                    <td
                      class="px-4 py-2.5 text-right font-semibold"
                      :class="luggageRow.count > 0 ? 'text-gray-900' : 'text-gray-400'"
                    >
                      {{ $t("common.pieces", { count: luggageRow.count }) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- お支払い情報 -->
          <section class="p-6 md:p-8">
            <h3 class="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
              <span class="h-4 w-1 rounded-full bg-gray-900" />
              {{ $t("status.paymentSection") }}
            </h3>
            <dl class="mb-4 divide-y divide-gray-100">
              <div
                class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <dt class="shrink-0 text-sm text-gray-500">
                  {{ $t("status.paymentMethod") }}
                </dt>
                <dd class="text-sm font-medium text-gray-900 sm:text-right">
                  {{ paymentMethodLabel }}
                </dd>
              </div>
              <template v-if="cardPayment">
                <div
                  v-if="cardPayment.brand"
                  class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <dt class="shrink-0 text-sm text-gray-500">
                    {{ $t("status.cardBrand") }}
                  </dt>
                  <dd class="text-sm font-medium uppercase text-gray-900 sm:text-right">
                    {{ cardPayment.brand }}
                  </dd>
                </div>
                <div
                  v-if="cardPayment.last4"
                  class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <dt class="shrink-0 text-sm text-gray-500">
                    {{ $t("status.paymentDetail") }}
                  </dt>
                  <dd
                    class="font-mono text-sm font-medium tracking-wider text-gray-900 sm:text-right"
                  >
                    •••• •••• •••• {{ cardPayment.last4 }}
                  </dd>
                </div>
                <div
                  v-if="cardExpiry"
                  class="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <dt class="shrink-0 text-sm text-gray-500">
                    {{ $t("status.expiry") }}
                  </dt>
                  <dd class="font-mono text-sm font-medium text-gray-900 sm:text-right">
                    {{ cardExpiry }}
                  </dd>
                </div>
              </template>
            </dl>

            <div class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-4">
              <span class="text-sm font-semibold text-gray-700">{{ $t("status.amountLabel") }}</span>
              <span class="text-2xl font-bold text-gray-900">
                ¥{{ booking.total_amount.toLocaleString() }}
              </span>
            </div>
          </section>
        </div>

        <!-- ページ下部: 重要事項 + キャンセルボタン -->
        <div class="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <BookingTransactionLawBox
            :items="confirmationLawItems"
            :is-loading="lawLoading"
            :fetch-err="lawErr"
            :title="confirmationLawTitle"
          />
          <div class="mx-auto mt-6 max-w-[520px]">
            <button
              v-if="booking.can_cancel"
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="isCancelling"
              @click="showCancelConfirm = true"
            >
              <CommonAtomsLoadingAnimation
                v-if="isCancelling"
                size="sm"
              />
              <template v-else>
                <img
                  class="h-5 w-5"
                  src="/img/cancel.svg"
                  alt=""
                >
                <span>{{ $t("status.cancelButton") }}</span>
              </template>
            </button>
            <button
              v-else-if="booking.can_download_receipt"
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-800 px-8 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="isDownloadingReceipt"
              @click="downloadReceipt"
            >
              <CommonAtomsLoadingAnimation
                v-if="isDownloadingReceipt"
                size="sm"
              />
              <template v-else>
                <img
                  class="h-5 w-5"
                  src="/img/download-white.svg"
                  alt=""
                >
                <span>{{ $t("status.receiptButton") }}</span>
              </template>
            </button>
          </div>
        </div>

        <div class="text-center">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            @click="resetLookup"
          >
            <img
              class="h-4 w-4"
              src="/img/back-arrow.svg"
              alt=""
            >
            {{ $t("status.anotherLookup") }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useCsrf } from "~/composables/useCsrf";
import { useAppLocale } from "~/composables/useLocale";

definePageMeta({
  layout: "customer",
  middleware: "subdomain",
});

const { t, te } = useI18n();
const { formatLocalizedDate, countryName, currentLocale } = useAppLocale();

type CardPayment = {
  method: string;
  wallet?: string;
  brand?: string;
  last4?: string;
  exp_month?: number | null;
  exp_year?: number | null;
};

type StatusBooking = {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone_number: string;
  customer_nationality: string;
  guest_name: string;
  delivery_status: string;
  delivery_status_label: string;
  can_cancel: boolean;
  can_download_receipt: boolean;
  pickup_location_name: string;
  pickup_location_address: string;
  pickup_date: string;
  delivery_location_name: string;
  delivery_location_address: string;
  delivery_date: string;
  notes: string;
  luggage_items: Record<string, number> | null;
  total_amount: number;
  payment: CardPayment | null;
};

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const { ensureCsrf, getCsrf } = useCsrf();

const { isLoading: lawLoading, fetchErr: lawErr, transactionLawItems } = useTransactionLaw();

const confirmationLawTitle = computed(() => t("status.confirmationTitle"));

// 予約確認画面では一部の項目（事業者情報・配送料金・決済方法）は表示しない
const HIDDEN_LAW_KEYS = new Set([
  "business",
  "representative",
  "address",
  "pricing",
  "payment",
]);
const confirmationLawItems = computed(() =>
  transactionLawItems.value.filter(item => !HIDDEN_LAW_KEYS.has(item.key)),
);

const bookingNumberInput = ref("");
const booking = ref<StatusBooking | null>(null);
const isLooking = ref(false);
const isCancelling = ref(false);
const isDownloadingReceipt = ref(false);
const cancelDone = ref(false);

const errMsg = ref("");
const showErrDialog = ref(false);
const showCancelConfirm = ref(false);

watch(errMsg, (value) => {
  showErrDialog.value = !!value;
});

// 配達状況のステップ表示
const statusSteps = computed(() => [
  { value: "before_pickup", label: t("status.statusLabels.before_pickup"), order: 1 },
  { value: "picked_up", label: t("status.statusLabels.picked_up"), order: 2 },
  { value: "delivered", label: t("status.statusLabels.delivered"), order: 3 },
] as const);

// 配達状況ラベル
const deliveryStatusLabel = computed(() => {
  const status = booking.value?.delivery_status ?? "";
  const key = `status.statusLabels.${status}`;
  if (status && te(key)) return t(key);
  return booking.value?.delivery_status_label ?? "";
});

const STATUS_ORDER: Record<string, number> = {
  before_pickup: 1,
  picked_up: 2,
  delivered: 3,
};

const isCancelled = computed(() => booking.value?.delivery_status === "cancelled");

const currentStatusStep = computed(() => {
  if (!booking.value || isCancelled.value) return 0;
  return STATUS_ORDER[booking.value.delivery_status] ?? 0;
});

// 進捗ラインの充填割合（集荷前=0、集荷済=0.5、配達済=1）から幅を算出
const fillRatio = computed(() => {
  if (isCancelled.value || currentStatusStep.value <= 1) return 0;
  return Math.min((currentStatusStep.value - 1) / (statusSteps.value.length - 1), 1);
});
// ノード（直径3rem）の中心からライン両端を引いた幅に対する充填幅
const fillWidth = computed(() => `calc((100% - 3rem) * ${fillRatio.value})`);

// 集荷前=グレー / 集荷済=青 / 配達済=緑
type StatusTheme = {
  badge: string;
  node: string;
  ring: string;
  line: string;
};

const GRAY_THEME: StatusTheme = {
  badge: "bg-gray-300 text-gray-700",
  node: "border-gray-400 bg-gray-400 text-white",
  ring: "ring-gray-200",
  line: "bg-gray-400",
};

const STATUS_THEME: Record<number, StatusTheme> = {
  1: GRAY_THEME,
  2: {
    badge: "bg-blue-600 text-white",
    node: "border-blue-600 bg-blue-600 text-white",
    ring: "ring-blue-100",
    line: "bg-blue-600",
  },
  3: {
    badge: "bg-green-600 text-white",
    node: "border-green-600 bg-green-600 text-white",
    ring: "ring-green-100",
    line: "bg-green-600",
  },
};

const currentTheme = computed<StatusTheme>(
  () => STATUS_THEME[currentStatusStep.value] ?? GRAY_THEME,
);

// 配達状況バッジの配色
const statusBadgeClass = computed(() =>
  isCancelled.value ? "bg-red-600 text-white" : currentTheme.value.badge,
);

// 進捗ラインの配色
const fillLineClass = computed(() => currentTheme.value.line);

// ステッパーアイコン（完了=白チェック / 現在=白 / 未到達・キャンセル=グレー）
const STATUS_CHECK_ICON = "/img/check-white.svg";

const stepIconSrc = (statusStep: (typeof statusSteps)["value"][number]): string => {
  if (!isCancelled.value && statusStep.order < currentStatusStep.value) {
    return STATUS_CHECK_ICON;
  }
  const base = statusStep.value.replace(/_/g, "-");
  const variant
    = !isCancelled.value && statusStep.order === currentStatusStep.value ? "white" : "gray";
  return `/img/${base}-${variant}.svg`;
};

// ステッパー各ノードの状態別スタイル
const nodeStateClass = (order: number): string => {
  if (isCancelled.value) return "border-gray-200 bg-white text-gray-300";
  const theme = currentTheme.value;
  if (order < currentStatusStep.value) {
    return theme.node;
  }
  if (order === currentStatusStep.value) {
    return `${theme.node} ring-4 ${theme.ring}`;
  }
  return "border-gray-300 bg-white text-gray-400";
};

// ステッパー各ラベルの状態別スタイル
const labelStateClass = (order: number): string => {
  if (!isCancelled.value && order <= currentStatusStep.value) {
    return "text-gray-900";
  }
  return "text-gray-400";
};

// 国籍コードを現在のロケールの国名に変換
const nationalityLabel = computed(() => {
  const code = booking.value?.customer_nationality;
  if (!code) return "";
  return countryName(code);
});

const LUGGAGE_ORDER = ["cabin", "checked", "oversize"];

const luggageRows = computed(() => {
  const items = booking.value?.luggage_items ?? {};
  return LUGGAGE_ORDER.map(key => ({
    key,
    label: te(`luggageTypes.${key}Short`) ? t(`luggageTypes.${key}Short`) : key,
    count: Number(items[key] ?? 0),
  }));
});

const cardPayment = computed<CardPayment | null>(() => {
  const payment = booking.value?.payment;
  if (payment && payment.method === "card") return payment;
  return null;
});

const paymentMethodLabel = computed(() => {
  const payment = booking.value?.payment;
  if (!payment) return t("status.onlinePayment");
  if (payment.method === "card") {
    if (payment.wallet === "apple_pay") return "Apple Pay";
    if (payment.wallet === "google_pay") return "Google Pay";
    return t("status.creditCard");
  }
  return payment.method;
});

const cardExpiry = computed(() => {
  const card = cardPayment.value;
  if (!card || !card.exp_month || !card.exp_year) return "";
  const month = String(card.exp_month).padStart(2, "0");
  const year = String(card.exp_year).slice(-2);
  return `${month}/${year}`;
});

// ISO日付（YYYY-MM-DD）を現在のロケールの日付表記に変換
const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  return formatLocalizedDate(dateString);
};

// 照会中の予約番号を同一タブ内にのみ短時間保持するためのキー。
// 予約番号のみを保存し、リロード時の自動再照会に使う。
const STORAGE_KEY = "booking.status.number";

const persistBookingNumber = (bookingNumber: string) => {
  if (!import.meta.client) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, bookingNumber);
  }
  catch {
    // ストレージ保存失敗は無視（プライベートモード等）
  }
};

const clearStoredBookingNumber = () => {
  if (!import.meta.client) return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  catch {
    // ストレージ削除失敗は無視
  }
};

// 予約番号から予約情報を取得
const lookupBooking = async () => {
  const bookingNumber = bookingNumberInput.value.trim();
  if (!bookingNumber || isLooking.value) return;

  isLooking.value = true;
  errMsg.value = "";

  try {
    const data = await $fetch<StatusBooking>(`${apiBase}/api/bookings/lookup`, {
      method: "GET",
      params: { booking_number: bookingNumber },
      credentials: "include",
    });
    booking.value = data;
    cancelDone.value = false;
    // 照会成功時のみ番号を保持
    persistBookingNumber(bookingNumber);
  }
  catch (err: unknown) {
    // 失敗時は保持中の番号を破棄し、無効な番号での再照会ループを防ぐ
    clearStoredBookingNumber();
    const apiErr = err as { data?: { errMsg?: string } };
    errMsg.value
      = apiErr?.data?.errMsg ?? t("status.errors.lookupFailed");
  }
  finally {
    isLooking.value = false;
  }
};

// 予約をキャンセル
const cancelBooking = async () => {
  if (!booking.value || isCancelling.value) return;

  isCancelling.value = true;
  errMsg.value = "";

  try {
    await ensureCsrf(apiBase);
    await $fetch(`${apiBase}/api/bookings/${booking.value.id}/cancel`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
    });

    booking.value = {
      ...booking.value,
      delivery_status: "cancelled",
      delivery_status_label: t("status.statusLabels.cancelled"),
      can_cancel: false,
      can_download_receipt: false,
    };
    cancelDone.value = true;
  }
  catch (err: unknown) {
    const apiErr = err as { data?: { errMsg?: string } };
    errMsg.value
      = apiErr?.data?.errMsg ?? t("status.errors.cancelFailed");
  }
  finally {
    isCancelling.value = false;
  }
};

// 領収書PDFをダウンロード
const downloadReceipt = async () => {
  if (!booking.value || isDownloadingReceipt.value) return;

  isDownloadingReceipt.value = true;
  errMsg.value = "";

  try {
    const blob = await $fetch<Blob>(`${apiBase}/api/bookings/${booking.value.id}/receipt`, {
      method: "GET",
      params: { lang: currentLocale.value },
      credentials: "include",
      responseType: "blob",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${booking.value.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
  catch (err: unknown) {
    const apiErr = err as { data?: { errMsg?: string } };
    errMsg.value
      = apiErr?.data?.errMsg ?? t("status.errors.receiptFailed");
  }
  finally {
    isDownloadingReceipt.value = false;
  }
};

// 別の予約番号を確認するために入力画面に戻る
const resetLookup = () => {
  booking.value = null;
  bookingNumberInput.value = "";
  cancelDone.value = false;
  errMsg.value = "";
  clearStoredBookingNumber();
};

// 照会成功後、一定時間操作がなければ予約内容の表示を終了し、入力画面に戻す
const VIEW_SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1時間
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"] as const;
let viewSessionTimer: ReturnType<typeof setTimeout> | null = null;

const clearViewSessionTimer = () => {
  if (viewSessionTimer) {
    clearTimeout(viewSessionTimer);
    viewSessionTimer = null;
  }
};

// 無操作タイマーを再起動する（操作のたびに呼ばれる）
const resetViewSessionTimer = () => {
  if (!booking.value) return;
  clearViewSessionTimer();
  viewSessionTimer = setTimeout(() => {
    booking.value = null;
    bookingNumberInput.value = "";
    cancelDone.value = false;
    // タイムアウト時は保持中の番号も破棄し、リロードしても自動復帰しないようにする
    clearStoredBookingNumber();
    errMsg.value = t("status.errors.sessionTimeout");
  }, VIEW_SESSION_TIMEOUT_MS);
};

const addActivityListeners = () => {
  if (!import.meta.client) return;
  for (const evt of ACTIVITY_EVENTS) {
    window.addEventListener(evt, resetViewSessionTimer, { passive: true });
  }
};

const removeActivityListeners = () => {
  if (!import.meta.client) return;
  for (const evt of ACTIVITY_EVENTS) {
    window.removeEventListener(evt, resetViewSessionTimer);
  }
};

// 予約内容の表示開始・終了に合わせて、無操作タイマーと操作監視を制御する
watch(booking, (value) => {
  if (value) {
    addActivityListeners();
    resetViewSessionTimer();
  }
  else {
    clearViewSessionTimer();
    removeActivityListeners();
  }
});

onMounted(() => {
  // 同一タブで照会済みの番号があれば、それを使って自動的に再照会する。
  // リロード後も予約確認画面へ復帰させるため。
  let storedNumber: string | null = null;
  if (import.meta.client) {
    try {
      storedNumber = sessionStorage.getItem(STORAGE_KEY);
    }
    catch {
      storedNumber = null;
    }
  }
  if (storedNumber) {
    bookingNumberInput.value = storedNumber;
    void lookupBooking();
    return;
  }
});

onUnmounted(() => {
  clearViewSessionTimer();
  removeActivityListeners();
});

useHead(() => ({
  title: t("pages.status.title"),
  meta: [
    {
      name: "description",
      content: t("pages.status.description"),
    },
    {
      property: "og:title",
      content: `${t("pages.status.title")} | ${t("common.brand")}`,
    },
    {
      property: "og:description",
      content: t("pages.status.description"),
    },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: `${t("pages.status.title")} | ${t("common.brand")}`,
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content: t("pages.status.description"),
    },
  ],
}));
</script>
