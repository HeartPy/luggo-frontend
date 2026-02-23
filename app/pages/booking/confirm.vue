<template>
  <div class="min-h-screen py-8">
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <BookingAtomsProgressBar :current-step="2" />

      <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12">
        お支払い情報のご入力
      </h1>

      <CommonAtomsErrDialog v-model="showErrDialog" :msg="errMsg" />

      <CommonAtomsLoadingAnimation v-if="loading" size="md" />

      <div v-show="!loading">
        <div
          class="relative mb-10 space-y-6 pb-10 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gray-300"
        >
          <!-- 集荷情報 -->
          <section class="py-6">
            <h2 class="mb-4 text-xl font-semibold text-gray-800">集荷情報</h2>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-600">集荷場所</dt>
                <dd class="text-gray-900">
                  {{ step1Data.pickup_location_name }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">集荷住所</dt>
                <dd class="text-gray-900">
                  {{ step1Data.pickup_location_address }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">集荷日</dt>
                <dd class="text-gray-900">
                  {{ formatDate(step1Data.pickup_date) }}
                </dd>
              </div>
            </dl>
          </section>

          <!-- 配送情報 -->
          <section class="py-6">
            <h2 class="mb-4 text-xl font-semibold text-gray-800">配送情報</h2>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-600">配送場所</dt>
                <dd class="text-gray-900">
                  {{ step1Data.delivery_location_name }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">配送住所</dt>
                <dd class="text-gray-900">
                  {{ step1Data.delivery_location_address }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">配送日</dt>
                <dd class="text-gray-900">
                  {{ formatDate(step1Data.delivery_date) }}
                </dd>
              </div>
              <div v-if="step1Data.notes">
                <dt class="text-sm font-medium text-gray-600">備考</dt>
                <dd class="whitespace-pre-wrap text-gray-900">
                  {{ step1Data.notes }}
                </dd>
              </div>
            </dl>
          </section>

          <!-- 荷物情報 -->
          <section class="py-6">
            <h2 class="mb-4 text-xl font-semibold text-gray-800">荷物情報</h2>
            <div v-if="luggageItems.length === 0" class="text-gray-600">
              荷物が選択されていません
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="item in luggageItems"
                :key="item.key"
                class="flex items-center justify-between border-b border-gray-200 pb-3 last:border-b-0"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="getImageUrl(item.image_src)"
                    :alt="item.name"
                    class="h-12 w-12 object-contain"
                  />
                  <div>
                    <p class="font-medium text-gray-900">{{ item.name }}</p>
                    <p class="text-sm text-gray-600">
                      ¥{{ item.price.toLocaleString() }} / 個
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">{{ item.count }} 個</p>
                  <p class="text-sm text-gray-600">
                    ¥{{ (item.price * item.count).toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- 顧客情報 -->
          <section class="py-6">
            <h2 class="mb-4 text-xl font-semibold text-gray-800">お客様情報</h2>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-600">お名前</dt>
                <dd class="text-gray-900">{{ step3Data.customer_name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">電話番号</dt>
                <dd class="text-gray-900">
                  {{ step3Data.customer_phone_number }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">
                  メールアドレス
                </dt>
                <dd class="text-gray-900">{{ step3Data.customer_email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">国籍</dt>
                <dd class="text-gray-900">
                  {{ nationalityLabel }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">宿泊者名</dt>
                <dd class="text-gray-900">{{ step3Data.guest_name }}</dd>
              </div>
            </dl>
          </section>
        </div>

        <!-- 決済情報 -->
        <section class="py-6">
          <div class="space-y-3">
            <div
              v-if="luggageItems.length > 0"
              class="space-y-2 border-b border-gray-200 pb-3"
            >
              <div
                v-for="item in luggageItems"
                :key="item.key"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-700">
                  {{ item.name }} × {{ item.count }} 個
                </span>
                <span class="font-medium text-gray-900">
                  ¥{{ (item.price * item.count).toLocaleString() }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-lg font-semibold text-gray-800"
                >合計金額（税込）</span
              >
              <span class="text-2xl font-bold text-gray-900">
                ¥{{ totalAmount.toLocaleString() }}
              </span>
            </div>
          </div>
        </section>

        <!-- 決済方法 -->
        <section v-if="paymentClientSecret" class="py-6">
          <h2 class="mb-4 text-sm text-gray-600">お支払い情報のご入力</h2>
          <div>
            <CommonAtomsLoadingAnimation v-if="paymentLoading" size="md" />
            <div v-if="loadingErr && !paymentLoading" class="py-4 text-center">
              <p class="text-red-600">{{ loadingErr }}</p>
            </div>
            <!-- Payment Elementは常にDOMに存在するようにする -->
            <div v-show="!paymentLoading && !loadingErr">
              <div id="payment-element" />
            </div>
            <div
              v-if="paymentErr && !paymentLoading && !loadingErr"
              class="mt-4 text-center"
            >
              <p class="text-red-600">{{ paymentErr }}</p>
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
            <CommonAtomsLoadingAnimation v-if="isSubmitting" size="sm" />
            <span v-else>予約を確定する</span>
          </button>
          <button
            type="button"
            class="rounded-md border-2 border-gray-300 bg-transparent px-8 py-3 font-semibold text-gray-700 hover:opacity-80"
            @click="goPrev()"
          >
            戻る
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
  StripePaymentElement,
} from "@stripe/stripe-js";
import countries from "i18n-iso-countries";
import ja from "i18n-iso-countries/langs/ja.json";
import { useBookingForm } from "~/composables/useBookingForm";
import { useCsrf } from "~/composables/useCsrf";
import { useSession } from "~/composables/useSession";
import { useBeforeUnload } from "~/composables/useBeforeUnload";
import {
  createStep1Schema,
  createStep2Schema,
  createStep3Schema,
} from "~/composables/useBookingValid";
import type { LuggageItemData, ApiErrRes, BookingData } from "~/types/booking";

const { step1Data, step2Data, step3Data, completeFormData, clearAllData } =
  useBookingForm();

const { ensureCsrf, getCsrf } = useCsrf();
const { checkSessionValidity } = useSession();
const router = useRouter();
const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const publicKey = config.public.stripePublishableKey;

const loading = ref(true);
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const errMsg = ref("");
const showErrDialog = ref(false);
const paymentClientSecret = ref<string | null>(null);
const luggageItemsData = ref<LuggageItemData[]>([]);

// Stripe関連
const paymentLoading = ref(true);
const loadingErr = ref("");
const paymentErr = ref("");
const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const paymentElement = ref<StripePaymentElement | null>(null);
const isConfirmingPayment = ref(false);

// 日付をフォーマット
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// 国籍コードを国名に変換
countries.registerLocale(ja);
const nationalityLabel = computed(() => {
  const code = step3Data.value.customer_nationality;
  if (!code) return "";
  return countries.getName(code, "ja") || code;
});

const getImageUrl = (src: string) => {
  return `/img/${src}`;
};

type LuggageItem = LuggageItemData & {
  count: number;
};

const luggageItems = computed<LuggageItem[]>(() => {
  if (luggageItemsData.value.length === 0) {
    return [];
  }

  return luggageItemsData.value
    .map((item) => ({
      ...item,
      count: step2Data.value[item.key] ?? 0,
    }))
    .filter((item) => item.count > 0);
});

const totalAmount = computed(() => {
  return luggageItems.value.reduce((acc, item) => {
    return acc + item.price * item.count;
  }, 0);
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
      loadingErr.value = "支払いシステムの読み込みに失敗しました";
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
      loadingErr.value = "支払いシステムの読み込みに失敗しました";
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
          fontFamily: '"Noto Sans JP", system-ui, sans-serif',
          spacingUnit: "4px",
          borderRadius: "6px",
        },
      },
      locale: "ja" as const,
    };

    elements.value = stripe.value.elements(options);
    const elems = elements.value;
    if (!elems) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Stripe Elements failed to initialize");
      }
      loadingErr.value = "支払いシステムの読み込みに失敗しました";
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
      loadingErr.value = "支払いシステムの読み込みに失敗しました";
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
      loadingErr.value = "支払いシステムの読み込みに失敗しました";
      paymentLoading.value = false;
      return;
    }

    pe.mount("#payment-element");

    // エラーイベントのリスナー（入力変更時にエラーをクリア）
    pe.on("change", () => {
      paymentErr.value = "";
    });

    paymentLoading.value = false;
  } catch (err: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Stripe initialization error:", err);
    }
    loadingErr.value = "支払いシステムの読み込みに失敗しました";
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
      loadingErr.value = "支払いシステムの読み込みに失敗しました";
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
      paymentErr.value =
        "支払い情報の確認に失敗しました。カード情報をご確認の上、再度お試しください。";
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
      paymentErr.value =
        "メールアドレスが入力されていません。顧客情報入力画面で入力してください。";
      return {
        success: false,
      };
    }

    if (!step3Data.value.customer_name) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Customer name is required");
      }
      paymentErr.value =
        "お名前が入力されていません。顧客情報入力画面で入力してください。";
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

    const { error: confirmErr, paymentIntent } =
      await stripe.value.confirmPayment({
        elements: elements.value,
        clientSecret: paymentClientSecret.value,
        confirmParams,
        redirect: "if_required",
      });

    if (confirmErr) {
      // Payment Intent が既に成功している場合のエラーを特別に処理
      if (
        confirmErr.code === "payment_intent_unexpected_state" &&
        confirmErr.payment_intent?.status === "succeeded"
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
      paymentErr.value =
        "支払い情報の確認に失敗しました。カード情報をご確認の上、再度お試しください。";
      return {
        success: false,
      };
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
      };
    } else {
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
      paymentErr.value = "支払いが完了していません";
      return {
        success: false,
      };
    }
  } catch (err: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Payment processing error:", err);
    }
    paymentErr.value = "支払いの処理に失敗しました";
    return {
      success: false,
    };
  } finally {
    isConfirmingPayment.value = false;
  }
};

// 戻るボタン
const goPrev = () => {
  router.push("/booking/3");
};

// 予約を確定する
const handleConfirm = async () => {
  isSubmitting.value = true;
  errMsg.value = "";

  try {
    // セッション有効性をチェック
    const sessionValid = await checkSessionValidity();
    if (!sessionValid) {
      errMsg.value =
        "セッションの有効期限が切れています。お手数おかけしますが、最初から入力し直してください。";
      isSubmitting.value = false;
      clearAllData();
      await router.push("/booking/1");
      return;
    }

    if (!paymentClientSecret.value) {
      errMsg.value =
        "情報の取得に失敗しました。お手数をおかけしますが、最初から入力し直してください。";
      isSubmitting.value = false;
      clearAllData();
      await router.push("/booking/1");
      return;
    }

    if (!stripe.value || !elements.value) {
      errMsg.value = "支払いシステムの読み込みに失敗しました";
      isSubmitting.value = false;
      return;
    }

    // 決済処理を実行
    const rslt = await confirmPayment();

    if (!rslt.success || !rslt.paymentIntentId) {
      errMsg.value =
        "支払いの処理に失敗しました。支払い情報をご確認してください。";
      isSubmitting.value = false;
      return;
    }

    // 予約を確定
    await ensureCsrf(apiBase);

    const maxRetries = 3;
    let retryCount = 0;
    let bookingData: Ref<BookingData | null | undefined> | null = null;
    let fetchErr: Ref<unknown> | null = null;

    // リトライループ
    while (retryCount <= maxRetries) {
      const fetchRslt = await useFetch<BookingData>(
        `${apiBase}/api/bookings/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
          },
          body: {
            ...completeFormData.value,
            payment_intent_id: rslt.paymentIntentId,
          },
        },
      );

      bookingData = fetchRslt.data;
      fetchErr = fetchRslt.error;

      // 成功した場合
      if (!fetchErr?.value && bookingData?.value) {
        break;
      }

      const apiErr = (fetchErr?.value as unknown as ApiErrRes) || {
        data: {},
      };

      // 決済が完了していない場合やバリデーションエラーはリトライしない
      if (
        apiErr.data.payment_status ||
        apiErr.data.valid_errs ||
        (fetchErr?.value as { statusCode?: number })?.statusCode === 400
      ) {
        break;
      }

      // リトライ可能なエラーの場合（500エラーなど）
      if (
        (fetchErr?.value as { statusCode?: number })?.statusCode === 500 &&
        apiErr.data.retry_recommended
      ) {
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
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // その他のエラーはリトライしない
      break;
    }

    // エラーハンドリング
    if (fetchErr?.value) {
      const apiErr = fetchErr.value as unknown as ApiErrRes;

      // 決済が完了していない場合
      if (apiErr.data.payment_status) {
        errMsg.value =
          "決済処理が完了していません。お支払い情報に問題がないかご確認いただき、再度予約手続きを行ってください。";
        isSubmitting.value = false;
        return;
      } else if (apiErr.data.valid_errs) {
        // バリデーションエラーが発生している場合
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
        errMsg.value = `入力内容に誤りがあります。以下の項目をご確認ください。\n${errMsgs.join(", ")}`;
        isSubmitting.value = false;
        return;
      } else {
        // 500エラーでリトライを試みたが失敗した場合
        if (retryCount >= maxRetries) {
          errMsg.value =
            "決済は正常に完了していますが、予約情報の保存に失敗しました。お手数をおかけしますが、運営にご連絡ください。";
        } else {
          // その他のエラーの場合（決済は完了しているが、エラーの種類が不明）
          errMsg.value =
            "予約の送信に失敗しました。しばらく時間をおいて再度お試しください。";
        }
        isSubmitting.value = false;
        return;
      }
    }

    // bookingData が存在しない場合
    if (!bookingData?.value) {
      errMsg.value =
        "決済は完了していますが、予約情報の取得に失敗しました。お手数をおかけしますが、運営にご連絡ください。";
      isSubmitting.value = false;
      return;
    }

    // 予約番号を取得
    const bookingId = bookingData.value.booking?.booking_number || null;

    clearAllData();
    isSubmitted.value = true;

    if (import.meta.client) {
      sessionStorage.removeItem("paymentClientSecret");
      if (bookingId) {
        sessionStorage.setItem("bookingId", bookingId);
      }
    }

    await router.push("/booking/complete");
  } catch (err: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Booking confirmation error:", err);
    }
    errMsg.value =
      "予約の送信に失敗しました。しばらく時間をおいて再度お試しください。";
  } finally {
    isSubmitting.value = false;
  }
};

watch(errMsg, (newValue) => {
  if (newValue) {
    showErrDialog.value = true;
  } else {
    showErrDialog.value = false; // エラーメッセージがクリアされたらダイアログも閉じる
  }
});

onMounted(async () => {
  if (import.meta.client) {
    // 荷物情報を取得（Step2のバリデーションにも必要）
    try {
      const { data, error: fetchErr } = await useFetch<{
        items: LuggageItemData[];
      }>(`${apiBase}/api/bookings/luggage-items`, {
        method: "GET",
        credentials: "include",
      });

      if (fetchErr.value || !data.value?.items) {
        errMsg.value = "荷物情報の取得に失敗しました";
        loading.value = false;
        return;
      }

      luggageItemsData.value = data.value.items;
    } catch (err: unknown) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Error fetching luggage items:", err);
      }
      errMsg.value = "荷物情報の取得に失敗しました";
      loading.value = false;
      return;
    }

    // Step1が完了しているかチェック
    const isStep1Valid = await createStep1Schema().isValid(step1Data.value);
    if (!isStep1Valid) {
      errMsg.value =
        "入力内容が完了していません。お手数をおかけしますが、入力内容をご確認ください。";
      loading.value = false;
      await router.push("/booking/1");
      return;
    }

    // Step2が完了しているかチェック
    const isStep2Valid = await createStep2Schema(
      luggageItemsData.value,
    ).isValid(step2Data.value);
    if (!isStep2Valid) {
      errMsg.value =
        "入力内容が完了していません。お手数をおかけしますが、入力内容をご確認ください。";
      loading.value = false;
      await router.push("/booking/2");
      return;
    }

    // Step3が完了しているかチェック
    const isStep3Valid = await createStep3Schema().isValid(step3Data.value);
    if (!isStep3Valid) {
      errMsg.value =
        "入力内容が完了していません。お手数をおかけしますが、入力内容をご確認ください。";
      loading.value = false;
      await router.push("/booking/3");
      return;
    }

    // sessionStorage から paymentClientSecret を復元
    const storedSecret = sessionStorage.getItem("paymentClientSecret");
    if (storedSecret) {
      paymentClientSecret.value = storedSecret;
    } else {
      // paymentClientSecret が存在しない場合は Step1 に戻る
      errMsg.value =
        "情報の取得に失敗しました。お手数をおかけしますが、最初から入力し直してください。";
      loading.value = false;
      clearAllData();
      await router.push("/booking/1");
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
      await new Promise((resolve) => setTimeout(resolve, 50));

      // #payment-element が存在するまで待つ（最大30回、100ms間隔）
      let retries = 0;
      let element: HTMLElement | null = null;
      while (retries < 30) {
        element = document.getElementById("payment-element");
        if (element) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
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
        loadingErr.value = "支払いシステムの読み込みに失敗しました";
        return;
      }

      // Payment Element を初期化
      await initializePaymentElement(paymentClientSecret.value);
    } else {
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
        await new Promise((resolve) => setTimeout(resolve, 50));
        await nextTick();
        retries++;
      }

      const element = document.getElementById("payment-element");
      if (!element) {
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.error("Payment element not found after retries in watch");
        }
        loadingErr.value = "支払いシステムの読み込みに失敗しました";
        return;
      }

      // 新しいPayment Elementを初期化
      loadingErr.value = "";
      paymentErr.value = "";
      await initializePaymentElement(newClientSecret);
    }
  },
);

useHead({
  title: "予約確認",
  meta: [
    {
      name: "description",
      content: "荷物配送サービスの予約確認ページ。",
    },
    { property: "og:title", content: "予約確認 | LugGo(ラグゴー)" },
    {
      property: "og:description",
      content: "荷物配送サービスの予約確認ページ。",
    },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: "予約確認 | LugGo(ラグゴー)",
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content: "荷物配送サービスの予約確認ページ。",
    },
  ],
});
</script>
