<template>
  <div class="min-h-screen py-8">
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <BookingAtomsProgressBar :current-step="2" />

      <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12">
        {{ $t("confirmPage.title") }}
      </h1>

      <CommonAtomsErrDialog
        v-model="showErrDialog"
        :msg="errMsg"
      />

      <CommonAtomsLoadingAnimation
        v-if="loading"
        size="md"
      />

      <div v-show="!loading">
        <div
          class="relative mb-10 space-y-6 pb-10 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gray-300"
        >
          <!-- 集荷情報 -->
          <section class="py-6">
            <h2 class="mb-4 text-xl font-semibold text-gray-800">
              {{ $t("confirmPage.pickupSection") }}
            </h2>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.pickupPlace") }}
                </dt>
                <dd class="text-gray-900">
                  {{ step1Data.pickup_location_name }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.pickupAddress") }}
                </dt>
                <dd class="text-gray-900">
                  {{ step1Data.pickup_location_address }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.pickupDate") }}
                </dt>
                <dd class="text-gray-900">
                  {{ formatDate(step1Data.pickup_date) }}
                </dd>
              </div>
            </dl>
          </section>

          <!-- 配送情報 -->
          <section class="py-6">
            <h2 class="mb-4 text-xl font-semibold text-gray-800">
              {{ $t("confirmPage.deliverySection") }}
            </h2>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.deliveryPlace") }}
                </dt>
                <dd class="text-gray-900">
                  {{ step1Data.delivery_location_name }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.deliveryAddress") }}
                </dt>
                <dd class="text-gray-900">
                  {{ step1Data.delivery_location_address }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.deliveryDate") }}
                </dt>
                <dd class="text-gray-900">
                  {{ formatDate(step1Data.delivery_date) }}
                </dd>
              </div>
              <div v-if="step1Data.notes">
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.notes") }}
                </dt>
                <dd class="whitespace-pre-wrap text-gray-900">
                  {{ step1Data.notes }}
                </dd>
              </div>
            </dl>
          </section>

          <!-- 荷物情報 -->
          <section class="py-6">
            <h2 class="mb-4 text-xl font-semibold text-gray-800">
              {{ $t("confirmPage.luggageSection") }}
            </h2>
            <div
              v-if="luggageItems.length === 0"
              class="text-gray-600"
            >
              {{ $t("confirmPage.noLuggage") }}
            </div>
            <div
              v-else
              class="space-y-3"
            >
              <div
                v-for="item in luggageItems"
                :key="item.key"
                class="flex items-center justify-between border-b border-gray-200 pb-3 last:border-b-0"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="getImageUrl(item.image_src)"
                    :alt="item.displayName"
                    class="h-12 w-12 object-contain"
                  >
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ item.displayName }}
                    </p>
                    <p class="text-sm text-gray-600">
                      ¥{{ item.price.toLocaleString() }} {{ $t("common.perItem") }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">
                    {{ $t("confirmPage.countSuffix", { count: item.count }) }}
                  </p>
                  <p class="text-sm text-gray-600">
                    ¥{{ (item.price * item.count).toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- 顧客情報 -->
          <section class="py-6">
            <h2 class="mb-4 text-xl font-semibold text-gray-800">
              {{ $t("confirmPage.customerSection") }}
            </h2>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.name") }}
                </dt>
                <dd class="text-gray-900">
                  {{ step3Data.customer_name }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.phone") }}
                </dt>
                <dd class="text-gray-900">
                  {{ step3Data.customer_phone_number }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.email") }}
                </dt>
                <dd class="text-gray-900">
                  {{ step3Data.customer_email }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.nationality") }}
                </dt>
                <dd class="text-gray-900">
                  {{ nationalityLabel }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  {{ $t("confirmPage.guestName") }}
                </dt>
                <dd class="text-gray-900">
                  {{ step3Data.guest_name }}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <!-- 決済情報 -->
        <section class="py-6">
          <div
            class="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 via-gray-900 to-black p-6 text-white shadow-xl ring-1 ring-white/10"
          >
            <div
              class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-2xl"
            />
            <div class="relative space-y-4">
              <div
                v-if="luggageItems.length > 0"
                class="space-y-2 border-b border-white/15 pb-4"
              >
                <div
                  v-for="luggageItem in luggageItems"
                  :key="luggageItem.key"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="text-gray-300">
                    {{ $t("confirmPage.itemLine", { name: luggageItem.displayName, count: luggageItem.count }) }}
                  </span>
                  <span class="font-medium text-gray-100">
                    ¥{{ (luggageItem.price * luggageItem.count).toLocaleString() }}
                  </span>
                </div>
              </div>
              <div class="flex items-end justify-between">
                <span class="text-sm font-medium tracking-wide text-gray-400">{{ $t("confirmPage.totalLabel") }}</span>
                <span class="text-3xl font-bold tracking-tight text-white">
                  ¥{{ displayTotalAmount.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- 決済方法 -->
        <section
          v-if="paymentClientSecret"
          class="py-6"
        >
          <h2 class="mb-4 text-sm text-gray-600">
            {{ $t("confirmPage.paymentInputTitle") }}
          </h2>
          <div>
            <CommonAtomsLoadingAnimation
              v-if="paymentLoading"
              size="md"
            />
            <div
              v-if="loadingErr && !paymentLoading"
              class="py-4 text-center"
            >
              <p class="text-red-600">
                {{ loadingErr }}
              </p>
            </div>
            <!-- Payment Elementは常にDOMに存在するようにする -->
            <div v-show="!paymentLoading && !loadingErr">
              <div id="payment-element" />
            </div>
            <div
              v-if="paymentErr && !paymentLoading && !loadingErr"
              class="mt-4 text-center"
            >
              <p class="text-red-600">
                {{ paymentErr }}
              </p>
            </div>
          </div>
        </section>

        <div class="mx-auto flex w-full max-w-[500px] flex-col gap-4 pt-12">
          <button
            type="button"
            class="flex items-center justify-center rounded-md bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
            :disabled="isSubmitting"
            @click="handleConfirm"
          >
            <CommonAtomsLoadingAnimation
              v-if="isSubmitting"
              size="sm"
            />
            <span v-else>{{ $t("confirmPage.confirmButton") }}</span>
          </button>
          <button
            type="button"
            class="rounded-md border-2 border-gray-300 bg-transparent px-8 py-3 font-semibold text-gray-700 hover:opacity-80"
            @click="goPrev()"
          >
            {{ $t("common.back") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { loadStripe } from "@stripe/stripe-js";
import type {
  Stripe,
  StripeElements,
  StripeElementLocale,
  StripePaymentElement,
} from "@stripe/stripe-js";
import { useI18n } from "vue-i18n";
import { useBookingForm } from "~/composables/useBookingForm";
import { useAppLocale } from "~/composables/useLocale";
import { useCsrf } from "~/composables/useCsrf";
import { useSession } from "~/composables/useSession";
import { useBeforeUnload } from "~/composables/useBeforeUnload";
import {
  createStep1Schema,
  createStep2Schema,
  createStep3Schema,
} from "~/composables/useBookingValid";
import type { LuggageItemData, ApiErrRes, BookingData } from "~/types/booking";

definePageMeta({
  layout: "customer",
  middleware: "subdomain",
});

const { t, te, locale } = useI18n();
const { formatLocalizedDate, countryName, stripeLocale, bodyFontFamily }
  = useAppLocale();

const {
  step1Data,
  step2Data,
  step3Data,
  luggageItemsData,
  totalAmount,
  confirmedTotalAmount,
  completeFormData,
  clearAllData,
} = useBookingForm();

// subdomain ミドルウェアで取得した事業者プロフィール
const businessProfileState = useState<{
  id?: string;
  service_areas?: string[];
  pricing_rules?: Record<string, Record<string, number>>;
  operating_days?: string;
  nth_weekday_holidays?: string[];
  daily_max_luggage?: number;
  temporary_closures?: string[];
  support_email?: string;
} | null>("businessProfile", () => null);

// 表示用合計金額: Step2 通過時にロックされた値があればそれを使用
// 未確定の場合はリアルタイム値にフォールバック（onMounted で Step2 へ戻すバリデーションが走るので通常は発生しない）
const displayTotalAmount = computed<number>(
  () => confirmedTotalAmount.value ?? totalAmount.value,
);

const { ensureCsrf, getCsrf } = useCsrf();
const { checkSessionValidity } = useSession();
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

const bookingPath = (step: number | string) => ({
  path: `/booking/${step}`,
  query: route.query,
});
const publicKey = config.public.stripePublishableKey;

const loading = ref(true);
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const errMsg = ref("");
const showErrDialog = ref(false);
const paymentClientSecret = ref<string | null>(null);
// Stripe関連
const paymentLoading = ref(true);
const loadingErr = ref("");
const paymentErr = ref("");
const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const paymentElement = ref<StripePaymentElement | null>(null);
const isConfirmingPayment = ref(false);

// 日付を現在のロケールでフォーマット
const formatDate = (dateString: string) => formatLocalizedDate(dateString);

// 国籍コードを現在のロケールの国名に変換
const nationalityLabel = computed(() => {
  const code = step3Data.value.customer_nationality;
  if (!code) return "";
  return countryName(code);
});

const getImageUrl = (src: string) => {
  return `/img/${src}`;
};

type LuggageItem = LuggageItemData & {
  count: number;
  displayName: string;
};

// 荷物タイプ名を現在のロケールで表示
const localizedLuggageName = (item: LuggageItemData): string => {
  const key = `luggageTypes.${item.key}`;
  return te(key) ? t(key) : item.name;
};

const luggageItems = computed<LuggageItem[]>(() => {
  if (luggageItemsData.value.length === 0) {
    return [];
  }

  return luggageItemsData.value
    .map(item => ({
      ...item,
      count: step2Data.value[item.key] ?? 0,
      displayName: localizedLuggageName(item),
    }))
    .filter(item => item.count > 0);
});

// paymentClientSecret が存在するが、予約がまだ確定されていない状態をチェック
const hasIncompleteBooking = computed(() => {
  return !isSubmitted.value && !!paymentClientSecret.value;
});

// ページを離れる前に警告を表示
useBeforeUnload(isSubmitting, isSubmitted, hasIncompleteBooking);

// Payment Elementの初期化
const initializePaymentElement = async (clientSecret: string) => {
  loadingErr.value = "";
  try {
    if (!publicKey) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Stripe publishable key is not configured");
      }
      loadingErr.value = t("confirmPage.errors.stripeLoadFailed");
      paymentLoading.value = false;
      return;
    }

    // Stripeインスタンスの作成
    stripe.value = await loadStripe(publicKey);

    if (!stripe.value) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Stripe failed to load");
      }
      loadingErr.value = t("confirmPage.errors.stripeLoadFailed");
      paymentLoading.value = false;
      return;
    }

    // Elementsの作成
    const options = {
      clientSecret: clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#f3f4f6",
          colorText: "#1f2937",
          colorDanger: "#dc2626",
          fontFamily: `"${bodyFontFamily.value}", system-ui, sans-serif`,
          spacingUnit: "4px",
          borderRadius: "6px",
        },
      },
      locale: stripeLocale.value as StripeElementLocale,
    };

    elements.value = stripe.value.elements(options);
    const elems = elements.value;
    if (!elems) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Stripe Elements failed to initialize");
      }
      loadingErr.value = t("confirmPage.errors.stripeLoadFailed");
      paymentLoading.value = false;
      return;
    }

    // Payment Elementの作成
    paymentElement.value = elems.create("payment", {
      paymentMethodOrder: [
        "apple_pay",
        "google_pay",
        "card",
        "paypay",
        "alipay",
        "wechat_pay",
        "amazon_pay",
        "paypal",
        "kr_card",
        "kakao_pay",
        "naver_pay",
        "samsung_pay",
      ],
      layout: "tabs" as const,
    });

    const pe = paymentElement.value;
    if (!pe) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("PaymentElement failed to create");
      }
      loadingErr.value = t("confirmPage.errors.stripeLoadFailed");
      paymentLoading.value = false;
      return;
    }

    // #payment-element が存在することを確認（呼び出し前に既に存在することを確認済み）
    const element = document.getElementById("payment-element");
    if (!element) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Payment element not found in DOM");
      }
      loadingErr.value = t("confirmPage.errors.stripeLoadFailed");
      paymentLoading.value = false;
      return;
    }

    pe.mount("#payment-element");

    // エラーイベントのリスナー（入力変更時にエラーをクリア）
    pe.on("change", () => {
      paymentErr.value = "";
    });

    paymentLoading.value = false;
  }
  catch (err: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Stripe initialization error:", err);
    }
    loadingErr.value = t("confirmPage.errors.stripeLoadFailed");
    paymentLoading.value = false;
    return;
  }
};

// 支払いを確認する関数
const confirmPayment = async (): Promise<{
  success: boolean;
  paymentIntentId?: string;
}> => {
  // 既に実行中の場合は処理をスキップ
  if (isConfirmingPayment.value) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.log("Payment confirmation already in progress");
    }
    return {
      success: false,
    };
  }

  paymentErr.value = "";
  isConfirmingPayment.value = true;

  try {
    if (!stripe.value || !elements.value || !paymentClientSecret.value) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Payment system not initialized:", {
          stripe: !!stripe.value,
          elements: !!elements.value,
          clientSecret: !!paymentClientSecret.value,
        });
      }
      loadingErr.value = t("confirmPage.errors.stripeLoadFailed");
      return {
        success: false,
      };
    }

    // Payment Element のバリデーションを実行
    const { error: submitError } = await elements.value.submit();
    if (submitError) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Payment element submit error:", submitError);
      }
      paymentErr.value = t("confirmPage.errors.paymentConfirmFailed");
      return {
        success: false,
      };
    }

    // 顧客情報の必須チェック
    if (!step3Data.value.customer_email) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Customer email is required");
      }
      paymentErr.value = t("confirmPage.errors.emailMissing");
      return {
        success: false,
      };
    }

    if (!step3Data.value.customer_name) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Customer name is required");
      }
      paymentErr.value = t("confirmPage.errors.nameMissing");
      return {
        success: false,
      };
    }

    // 支払いを確認
    const confirmParams: {
      return_url: string;
      receipt_email: string;
      payment_method_data: {
        billing_details: {
          name: string;
          email: string;
        };
      };
    } = {
      return_url:
        typeof window !== "undefined"
          ? `${window.location.origin}/booking/complete`
          : "/booking/complete",
      receipt_email: step3Data.value.customer_email,
      payment_method_data: {
        billing_details: {
          name: step3Data.value.customer_name,
          email: step3Data.value.customer_email,
        },
      },
    };

    const { error: confirmErr, paymentIntent }
      = await stripe.value.confirmPayment({
        elements: elements.value,
        clientSecret: paymentClientSecret.value,
        confirmParams,
        redirect: "if_required",
      });

    if (confirmErr) {
      // Payment Intent が既に成功している場合のエラーを特別に処理
      if (
        confirmErr.code === "payment_intent_unexpected_state"
        && confirmErr.payment_intent?.status === "succeeded"
      ) {
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.log(
            "Payment Intent already succeeded:",
            confirmErr.payment_intent.id,
          );
        }
        return {
          success: true,
          paymentIntentId: confirmErr.payment_intent.id,
        };
      }

      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Payment confirmation error:", confirmErr);
      }
      paymentErr.value = t("confirmPage.errors.paymentConfirmFailed");
      return {
        success: false,
      };
    }
    else if (paymentIntent && paymentIntent.status === "succeeded") {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
      };
    }
    else {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Payment not completed:", {
          paymentIntent: paymentIntent
            ? {
                id: paymentIntent.id,
                status: paymentIntent.status,
              }
            : null,
        });
      }
      paymentErr.value = t("confirmPage.errors.paymentNotCompleted");
      return {
        success: false,
      };
    }
  }
  catch (err: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Payment processing error:", err);
    }
    paymentErr.value = t("confirmPage.errors.paymentProcessFailed");
    return {
      success: false,
    };
  }
  finally {
    isConfirmingPayment.value = false;
  }
};

// 戻るボタン
const goPrev = () => {
  router.push(bookingPath(3));
};

// 入力データが有効期限切れ等で失われていないかを確認する
const isBookingDataComplete = (): boolean => {
  const s1 = step1Data.value;
  const hasStep1
    = !!s1.pickup_location_name
      && !!s1.pickup_location_address
      && !!s1.pickup_date
      && !!s1.delivery_location_name
      && !!s1.delivery_location_address
      && !!s1.delivery_date;
  const hasLuggage
    = luggageItemsData.value.length > 0
      && Object.values(step2Data.value).some(count => (count ?? 0) > 0);
  const s3 = step3Data.value;
  const hasStep3 = !!s3.customer_name && !!s3.customer_email;
  return hasStep1 && hasLuggage && hasStep3;
};

// 予約を確定する
const handleConfirm = async () => {
  isSubmitting.value = true;
  errMsg.value = "";

  try {
    // 決済前に入力データの有効期限切れを検出
    if (!isBookingDataComplete()) {
      errMsg.value = t("confirmPage.errors.dataExpired");
      isSubmitting.value = false;
      clearAllData();
      await router.push(bookingPath(1));
      return;
    }

    // セッション有効性をチェック
    const sessionValid = await checkSessionValidity();
    if (!sessionValid) {
      errMsg.value = t("confirmPage.errors.sessionExpired");
      isSubmitting.value = false;
      clearAllData();
      await router.push(bookingPath(1));
      return;
    }

    if (!paymentClientSecret.value) {
      errMsg.value = t("confirmPage.errors.fetchFailedRestart");
      isSubmitting.value = false;
      clearAllData();
      await router.push(bookingPath(1));
      return;
    }

    if (!stripe.value || !elements.value) {
      errMsg.value = t("confirmPage.errors.stripeLoadFailed");
      isSubmitting.value = false;
      return;
    }

    // 決済処理を実行
    const rslt = await confirmPayment();

    if (!rslt.success || !rslt.paymentIntentId) {
      errMsg.value = t("confirmPage.errors.paymentFailedCheck");
      isSubmitting.value = false;
      return;
    }

    try {
      // 予約を確定
      await ensureCsrf(apiBase);

      const maxRetries = 3;
      let retryCount = 0;
      let bookingData: BookingData | null = null;
      let fetchErr: unknown = null;

      // リトライループ
      while (retryCount <= maxRetries) {
        try {
          bookingData = await $fetch<BookingData>(`${apiBase}/api/bookings/`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
            },
            body: {
              ...completeFormData.value,
              payment_intent_id: rslt.paymentIntentId,
            },
          });
          fetchErr = null;

          // 成功した場合
          if (bookingData) {
            break;
          }
        }
        catch (err: unknown) {
          fetchErr = err;

          const apiErr = (err as unknown as ApiErrRes) || { data: {} };
          const statusCode
            = (err as { statusCode?: number; status?: number })?.statusCode
              ?? (err as { status?: number })?.status;

          // 決済が完了していない場合やバリデーションエラーはリトライしない
          if (
            apiErr.data?.payment_status
            || apiErr.data?.valid_errs
            || statusCode === 400
          ) {
            break;
          }

          // リトライ可能なエラーの場合（500エラーなど）
          if (statusCode === 500 && apiErr.data?.retry_recommended) {
            retryCount++;
            if (retryCount <= maxRetries) {
              // 指数バックオフでリトライ
              const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
              if (import.meta.dev) {
                // eslint-disable-next-line no-console
                console.log(
                  `予約送信をリトライします (${retryCount}/${maxRetries}): ${delay}ms後に再試行`,
                );
              }
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }

          // その他のエラーはリトライしない
          break;
        }
      }

      // エラーハンドリング
      if (fetchErr) {
        const apiErr = fetchErr as unknown as ApiErrRes;

        // 決済が完了していない場合
        if (apiErr.data?.payment_status) {
          errMsg.value = t("confirmPage.errors.paymentNotDone");
          isSubmitting.value = false;
          return;
        }
        else if (apiErr.data?.valid_errs) {
          // バリデーションエラー
          if (import.meta.dev) {
            const validErrs = apiErr.data.valid_errs;
            const errMsgs: string[] = [];
            for (const [path, msgs] of Object.entries(validErrs)) {
              const msg = Array.isArray(msgs)
                ? (msgs[0] ?? "")
                : typeof msgs === "string"
                  ? msgs
                  : "";
              errMsgs.push(`${path}: ${msg}`);
            }
            // eslint-disable-next-line no-console
            console.error(
              `Booking validation error:\n${errMsgs.join("\n")}`,
              validErrs,
            );
          }
          errMsg.value = t("confirmPage.errors.saveFailedValidation");
          isSubmitting.value = false;
          return;
        }
        else {
          // 500エラーでリトライを試みたが失敗した場合、
          // またはエラーの種類が不明な場合（いずれも決済は完了している）
          errMsg.value = t("confirmPage.errors.saveFailedContactOps");
          isSubmitting.value = false;
          return;
        }
      }

      // bookingData が存在しない場合
      if (!bookingData) {
        errMsg.value = t("confirmPage.errors.bookingDataMissing");
        isSubmitting.value = false;
        return;
      }

      // 予約番号を取得
      const bookingNumber = bookingData.booking?.booking_number || null;

      clearAllData();
      isSubmitted.value = true;

      if (import.meta.client) {
        sessionStorage.removeItem("paymentClientSecret");
        if (bookingNumber) {
          sessionStorage.setItem("bookingNumber", bookingNumber);
        }
      }

      await router.push({ path: "/booking/complete", query: route.query });
    }
    catch (err: unknown) {
      // 決済後の想定外例外。決済は完了しているため再操作は促さない。
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Post-payment booking error:", err);
      }
      errMsg.value = t("confirmPage.errors.saveFailedContactOps");
    }
  }
  catch (err: unknown) {
    // 決済前の想定外例外。まだ決済されていないため再試行を促してよい。
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Booking confirmation error:", err);
    }
    errMsg.value = t("confirmPage.errors.submitFailedRetry");
  }
  finally {
    isSubmitting.value = false;
  }
};

watch(errMsg, (newValue) => {
  if (newValue) {
    showErrDialog.value = true;
  }
  else {
    showErrDialog.value = false; // エラーメッセージがクリアされたらダイアログも閉じる
  }
});

onMounted(async () => {
  if (import.meta.client) {
    // 荷物データが存在しない場合はフローを経由していないため Step1 へ戻す
    if (luggageItemsData.value.length === 0) {
      errMsg.value = t("confirmPage.errors.luggageMissing");
      loading.value = false;
      await router.push(bookingPath(1));
      return;
    }

    // Step1が完了しているかチェック
    // 注意: [step].vue と同じ context（事業者プロフィール）を渡さないと
    // 集荷/配達地域テストが空配列で常に失敗し、Step1 へ強制送還ループになる。
    const isStep1Valid = await createStep1Schema(
      {
        departurePrefectures: businessProfileState.value?.service_areas ?? [],
        deliverablePrefectures: Object.keys(
          businessProfileState.value?.pricing_rules ?? {},
        ),
        operatingDays: businessProfileState.value?.operating_days,
        nthWeekdayHolidays: businessProfileState.value?.nth_weekday_holidays,
        temporaryClosures: businessProfileState.value?.temporary_closures,
      },
      t,
    ).isValid(step1Data.value);
    if (!isStep1Valid) {
      errMsg.value = t("confirmPage.errors.incompleteInput");
      loading.value = false;
      await router.push(bookingPath(1));
      return;
    }

    // Step2が完了しているかチェック
    const isStep2Valid = await createStep2Schema(
      luggageItemsData.value,
      t,
    ).isValid(step2Data.value);
    if (!isStep2Valid) {
      errMsg.value = t("confirmPage.errors.incompleteInput");
      loading.value = false;
      await router.push(bookingPath(2));
      return;
    }

    // Step3が完了しているかチェック
    const isStep3Valid = await createStep3Schema(
      t,
      locale.value !== "ja",
    ).isValid(step3Data.value);
    if (!isStep3Valid) {
      errMsg.value = t("confirmPage.errors.incompleteInput");
      loading.value = false;
      await router.push(bookingPath(3));
      return;
    }

    // sessionStorage から paymentClientSecret を復元
    const storedSecret = sessionStorage.getItem("paymentClientSecret");
    if (storedSecret) {
      paymentClientSecret.value = storedSecret;
    }
    else {
      // paymentClientSecret が存在しない場合は Step1 に戻る
      errMsg.value = t("confirmPage.errors.fetchFailedRestart");
      loading.value = false;
      clearAllData();
      await router.push(bookingPath(1));
      return;
    }

    // Payment Element を初期化
    if (paymentClientSecret.value) {
      // loading を false にしてから、paymentLoading を false にする
      // これにより、#payment-element が DOM に存在するようになる
      loading.value = false;

      await nextTick();

      paymentLoading.value = false;

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 50));

      // #payment-element が存在するまで待つ（最大30回、100ms間隔）
      let retries = 0;
      let element: HTMLElement | null = null;
      while (retries < 30) {
        element = document.getElementById("payment-element");
        if (element) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        await nextTick();
        retries++;
      }

      if (!element) {
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.error("Payment element not found after retries", {
            retries,
            hasClientSecret: !!paymentClientSecret.value,
          });
        }
        loadingErr.value = t("confirmPage.errors.stripeLoadFailed");
        return;
      }

      // Payment Element を初期化
      await initializePaymentElement(paymentClientSecret.value);
    }
    else {
      loading.value = false;
    }

    loading.value = false;
  }
});

// クリーンアップ
onBeforeUnmount(() => {
  if (paymentElement.value) {
    paymentElement.value.unmount();
  }
});

// clientSecretが変更された場合の処理
watch(
  () => paymentClientSecret.value,
  async (newClientSecret) => {
    if (newClientSecret && !paymentLoading.value) {
      // 既存のPayment Elementを破棄
      if (paymentElement.value) {
        paymentElement.value.unmount();
        paymentElement.value = null;
      }
      if (elements.value) {
        elements.value = null;
      }

      // paymentLoading を false にして #payment-element を表示
      paymentLoading.value = false;

      await nextTick();

      // #payment-element が存在するまで待つ（最大20回、50ms間隔）
      let retries = 0;
      while (retries < 20) {
        const element = document.getElementById("payment-element");
        if (element) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
        await nextTick();
        retries++;
      }

      const element = document.getElementById("payment-element");
      if (!element) {
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.error("Payment element not found after retries in watch");
        }
        loadingErr.value = t("confirmPage.errors.stripeLoadFailed");
        return;
      }

      // 新しいPayment Elementを初期化
      loadingErr.value = "";
      paymentErr.value = "";
      await initializePaymentElement(newClientSecret);
    }
  },
);

useHead(() => ({
  title: t("pages.confirm.title"),
  meta: [
    {
      name: "description",
      content: t("pages.confirm.description"),
    },
    {
      property: "og:title",
      content: `${t("pages.confirm.title")} | ${t("common.brand")}`,
    },
    {
      property: "og:description",
      content: t("pages.confirm.description"),
    },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: `${t("pages.confirm.title")} | ${t("common.brand")}`,
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content: t("pages.confirm.description"),
    },
  ],
}));
</script>
