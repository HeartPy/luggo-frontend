<template>
  <div class="min-h-screen py-8">
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <BookingAtomsProgressBar :current-step="1" />

      <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12">
        荷物配送予約フォーム
      </h1>

      <CommonAtomsErrDialog v-model="showErrDialog" :msg="errMsg" />

      <form class="space-y-6" novalidate @submit.prevent="handleSubmit">
        <BookingStep1Form
          v-if="currentStep === 1"
          :form-data="step1Data"
          :errors="errsStep1"
          :departure-prefectures="allowedDeparturePrefectures"
          :deliverable-prefectures="allowedDeliverablePrefectures"
          @update:form-data="Object.assign(step1Data, $event)"
        />
        <BookingStep2Form
          v-else-if="currentStep === 2"
          :form-data="step2Data"
          :errors="errsStep2"
          :luggage-items-data="luggageItemsData"
          :luggage-items-loading="luggageItemsLoading"
          :luggage-items-error="luggageItemsErr"
          :support-email="businessProfileState?.support_email ?? ''"
          @update:form-data="Object.assign(step2Data, $event)"
        />
        <BookingStep3Form
          v-else-if="currentStep === 3"
          :form-data="step3Data"
          :errors="errsStep3"
          @update:form-data="Object.assign(step3Data, $event)"
        />

        <div class="mx-auto flex w-full max-w-[500px] flex-col gap-4 pt-12">
          <button
            type="submit"
            class="flex items-center justify-center rounded-md bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
            :disabled="isSubmitting || luggageItemsLoading"
          >
            <CommonAtomsLoadingAnimation v-if="isSubmitting" size="sm" />
            <span v-else>
              {{ currentStep === 3 ? "お支払い情報のご入力へ" : "次へ" }}
            </span>
          </button>
          <button
            v-if="currentStep > 1"
            type="button"
            class="rounded-md border-2 border-gray-300 bg-transparent px-8 py-3 font-semibold text-gray-700 hover:opacity-80"
            @click="goPrev()"
          >
            戻る
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import { useBookingForm } from "~/composables/useBookingForm";
import { useCsrf } from "~/composables/useCsrf";
import { useSession } from "~/composables/useSession";
import { useBeforeUnload } from "~/composables/useBeforeUnload";
import {
  createStep1Schema,
  createStep2Schema,
  createStep3Schema,
} from "~/composables/useBookingValid";
import type {
  Step1FormData,
  LuggageItemData,
  Step2FormData,
  Step3FormData,
  ApiErrRes,
} from "~/types/booking";

const route = useRoute();

definePageMeta({
  layout: "customer",
  middleware: "subdomain",
  validate: (route) => {
    const n = Number(route.params.step);
    return Number.isFinite(n) && n >= 1 && n <= 3;
  },
});

const router = useRouter();

const bookingPath = (step: number | string) => ({
  path: `/booking/${step}`,
  query: route.query,
});

const currentStep = computed(() => {
  const n = Number(route.params.step);
  return Number.isFinite(n) ? Math.max(1, n) : 1;
});

const goPrev = () =>
  navigateTo(bookingPath(Math.max(1, currentStep.value - 1)));

const {
  step1Data,
  step2Data,
  step3Data,
  luggageItemsData,
  errsStep1,
  errsStep2,
  errsStep3,
  completeFormData,
  clearAllData,
} = useBookingForm();

const isSubmitting = ref(false);
const isSubmitted = ref(false);
const errMsg = ref("");
const showErrDialog = ref(false);

const paymentClientSecret = ref<string | null>(null);

const { ensureCsrf, getCsrf } = useCsrf();
const { startSession, checkSessionValidity } = useSession();

const luggageItemsLoading = ref(false);
const luggageItemsErr = ref("");

// サブドメインミドルウェアで取得した事業者プロフィールから集荷/配達可能地域・決済先を取得
const businessProfileState = useState<{
  id?: string;
  service_areas?: string[];
  pricing_rules?: Record<string, Record<string, number>>;
  operating_days?: string;
  nth_weekday_holidays?: string[];
  temporary_closures?: string[];
  support_email?: string;
} | null>("businessProfile", () => null);

const allowedDeparturePrefectures = computed<string[]>(
  () => businessProfileState.value?.service_areas ?? [],
);

const allowedDeliverablePrefectures = computed<string[]>(() => {
  const rules = businessProfileState.value?.pricing_rules;
  if (!rules) return [];
  return Object.keys(rules);
});

// バックエンドから荷物情報を取得してStep2FormDataを初期化
const fetchLuggageItems = async () => {
  try {
    luggageItemsLoading.value = true;
    luggageItemsErr.value = "";

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    const bpId = businessProfileState.value?.id ?? "";
    const deliveryPostal = encodeURIComponent(
      step1Data.value.delivery_postal_code || "",
    );

    const data = await $fetch<{
      items: LuggageItemData[];
    }>(
      `${apiBase}/api/bookings/luggage-items?business_owner=${bpId}&delivery_postal_code=${deliveryPostal}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!data?.items) {
      return;
    }

    luggageItemsData.value = data.items;

    // Step2FormDataを初期化（既存の値は保持）
    for (const item of data.items) {
      if (!(item.key in step2Data.value)) {
        step2Data.value[item.key] = 0;
      }
    }
  } catch (err: unknown) {
    luggageItemsErr.value = "荷物情報の取得に失敗しました";
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Error fetching luggage items:", err);
    }
  } finally {
    luggageItemsLoading.value = false;
  }
};

// 未保存の入力データがあるかチェック
const hasUnsavedChanges = computed(() => {
  if (isSubmitted.value) return false;

  const hasStep1Data =
    step1Data.value.pickup_location_name !== "" ||
    step1Data.value.pickup_postal_code !== "" ||
    step1Data.value.pickup_location_address !== "" ||
    step1Data.value.pickup_date !== "" ||
    step1Data.value.delivery_location_name !== "" ||
    step1Data.value.delivery_postal_code !== "" ||
    step1Data.value.delivery_location_address !== "" ||
    step1Data.value.delivery_date !== "" ||
    step1Data.value.notes !== "";

  const hasStep2Data = Object.values(step2Data.value).some(
    (count) => count > 0,
  );

  const hasStep3Data =
    step3Data.value.customer_name !== "" ||
    step3Data.value.customer_phone_number !== "" ||
    step3Data.value.customer_email !== "" ||
    step3Data.value.customer_nationality !== "" ||
    step3Data.value.guest_name !== "";

  return hasStep1Data || hasStep2Data || hasStep3Data;
});

// ページを離れる前に警告を表示
useBeforeUnload(isSubmitting, isSubmitted, hasUnsavedChanges);

const canProceedStep1 = ref(false);
const canProceedStep2 = ref(false);

// sessionStorage から paymentClientSecret を復元
if (import.meta.client) {
  const storedSecret = sessionStorage.getItem("paymentClientSecret");
  if (storedSecret) {
    paymentClientSecret.value = storedSecret;
  }
}

// paymentClientSecret の変化を監視して sessionStorage に保存
watch(paymentClientSecret, (newValue) => {
  if (import.meta.client) {
    if (newValue) {
      sessionStorage.setItem("paymentClientSecret", newValue);
    } else {
      sessionStorage.removeItem("paymentClientSecret");
    }
  }
});

const step1Schema = computed(() =>
  createStep1Schema({
    departurePrefectures: allowedDeparturePrefectures.value,
    deliverablePrefectures: allowedDeliverablePrefectures.value,
    operatingDays: businessProfileState.value?.operating_days,
    nthWeekdayHolidays: businessProfileState.value?.nth_weekday_holidays,
    temporaryClosures: businessProfileState.value?.temporary_closures,
  }),
);

const step2Schema = computed(() => {
  return createStep2Schema(luggageItemsData.value);
});

const step3Schema = computed(() => createStep3Schema());

// vee-validate
const { validate: validateStep1Vv, setValues: setStep1Values } =
  useForm<Step1FormData>({
    validationSchema: computed(() => toTypedSchema(step1Schema.value)),
  });
const { validate: validateStep2Vv, setValues: setStep2Values } =
  useForm<Step2FormData>({
    validationSchema: computed(() => toTypedSchema(step2Schema.value)),
  });
const { validate: validateStep3Vv, setValues: setStep3Values } =
  useForm<Step3FormData>({
    validationSchema: computed(() => toTypedSchema(step3Schema.value)),
  });

watch(
  step1Data,
  async (value) => {
    canProceedStep1.value = await step1Schema.value.isValid(value);
  },
  { deep: true, immediate: true },
);

watch(
  [step2Data, step2Schema],
  async ([value, schema]) => {
    canProceedStep2.value = await schema.isValid(value);
  },
  { deep: true, immediate: true },
);

// Payment Intentを作成する関数
const createPaymentIntent = async (): Promise<string | null> => {
  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    await ensureCsrf(apiBase);

    let data: { client_secret?: string } | null = null;
    try {
      data = await $fetch<{
        client_secret: string;
      }>(`${apiBase}/api/bookings/create-payment-intent`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
        },
        body: {
          ...completeFormData.value,
          business_owner_id: businessProfileState.value?.id ?? "",
        },
      });
    } catch (fetchErr: unknown) {
      const apiErr = fetchErr as unknown as ApiErrRes;

      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Payment intent creation error:", fetchErr);
      }

      // バリデーションエラーの場合
      if (apiErr?.data?.valid_errs) {
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
      } else {
        // その他のエラー
        errMsg.value = "支払い情報の取得に失敗しました";
      }

      return null;
    }

    if (!data?.client_secret) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error(
          "Payment intent creation error: client_secret is missing",
          "Response data:",
          data,
        );
      }
      errMsg.value = "支払い情報の取得に失敗しました";
      return null;
    }

    return data.client_secret;
  } catch (err: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Payment intent creation error:", err);
    }
    errMsg.value = "支払い情報の取得に失敗しました";
    return null;
  }
};

// 送信フォームの処理
const handleSubmit = async () => {
  if (luggageItemsLoading.value) return;

  if (currentStep.value === 1) {
    // 既存エラークリア
    (Object.keys(errsStep1.value) as Array<keyof Step1FormData>).forEach(
      (key) => {
        if (errsStep1.value[key] !== undefined) errsStep1.value[key] = "";
      },
    );
    setStep1Values(step1Data.value);
    const rslt = await validateStep1Vv();

    if (rslt.valid) return navigateTo(bookingPath(2));

    for (const [path, msg] of Object.entries(rslt.errors)) {
      const key = path as keyof Step1FormData;
      errsStep1.value[key] = msg as string;
    }
    return;
  }

  if (currentStep.value === 2) {
    Object.keys(errsStep2.value).forEach((key) => {
      if (errsStep2.value[key] !== undefined) errsStep2.value[key] = "";
    });
    setStep2Values(step2Data.value);
    const rslt = await validateStep2Vv();
    if (!rslt.valid) {
      for (const [path, msg] of Object.entries(rslt.errors)) {
        const key = path || "";
        errsStep2.value[key] = msg as string;
      }
      return;
    }

    const totalItems = Object.values(step2Data.value).reduce(
      (sum: number, count: unknown) => sum + (Number(count) || 0),
      0,
    );
    const ownerId = businessProfileState.value?.id;
    const pickupDate = step1Data.value.pickup_date;
    const deliveryDate = step1Data.value.delivery_date;
    if (ownerId && totalItems > 0) {
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;
      const datesToCheck = [
        { date: pickupDate, label: "集荷日" },
        { date: deliveryDate, label: "配送日" },
      ];
      for (const { date: dt, label } of datesToCheck) {
        if (!dt) continue;
        try {
          const res = await $fetch<{
            remaining: number;
          }>(`${apiBase}/api/bookings/daily-remaining`, {
            method: "GET",
            params: { business_owner: ownerId, date: dt },
          });
          if (res.remaining >= 0 && totalItems > res.remaining) {
            errMsg.value
              = `${label}（${dt}）の荷物受付可能数の残りは${res.remaining}個です。予約個数を${res.remaining}個以下にしてください。`;
            return;
          }
        }
        catch (err: unknown) {
          // 後段（PaymentIntent作成・予約確定）でも上限を再チェックするため、
          // ここでは Step2 をブロックせずに進める（フェイルオープン）
          if (import.meta.dev) {
            // eslint-disable-next-line no-console
            console.error("daily-remaining failed:", err);
          }
        }
      }
    }

    return navigateTo(bookingPath(3));
  }

  if (currentStep.value === 3) {
    (Object.keys(errsStep3.value) as Array<keyof Step3FormData>).forEach(
      (key) => {
        if (errsStep3.value[key] !== undefined) errsStep3.value[key] = "";
      },
    );
    setStep3Values(step3Data.value);
    const rslt = await validateStep3Vv();
    if (!rslt.valid) {
      for (const [path, msg] of Object.entries(rslt.errors)) {
        const key = path as keyof Step3FormData;
        errsStep3.value[key] = msg as string;
      }
      return;
    }

    isSubmitting.value = true;

    // セッション有効性をチェック
    const sessionValid = await checkSessionValidity();
    if (!sessionValid) {
      clearAllData();
      errMsg.value =
        "セッションの有効期限が切れています。お手数おかけしますが、最初から入力し直してください。";
      isSubmitting.value = false;
      await navigateTo(bookingPath(1));
      return;
    }

    try {
      // Payment Intentを作成
      const clientSecret = await createPaymentIntent();
      if (!clientSecret) {
        isSubmitting.value = false;
        return;
      }

      paymentClientSecret.value = clientSecret;

      try {
        await router.push({ path: "/booking/confirm", query: route.query });

        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.log("Navigation to confirm page completed");
        }
      } catch (err: unknown) {
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.error("Navigation failed:", err);
        }
        errMsg.value = "ページの遷移に失敗しました";
        isSubmitting.value = false;
        return;
      }
    } catch (err: unknown) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Payment intent creation error:", err);
      }
      errMsg.value = "支払い情報の取得に失敗しました";
    } finally {
      isSubmitting.value = false;
    }
    return;
  }
};

// 各ステップへの遷移を制御
const checkStepAccess = async () => {
  const step = currentStep.value;

  switch (step) {
    case 1:
      return;

    case 2:
      if (!canProceedStep1.value) {
        await navigateTo(bookingPath(1));
        return;
      }
      break;

    case 3:
      if (!canProceedStep1.value) {
        await navigateTo(bookingPath(1));
        return;
      }
      if (!canProceedStep2.value) {
        await navigateTo(bookingPath(2));
        return;
      }
      break;

    default:
      break;
  }
};

watch(
  currentStep,
  async () => {
    if (import.meta.client) {
      await checkStepAccess();
    }
  },
  { immediate: false },
);

watch(errMsg, (newValue) => {
  if (newValue) {
    showErrDialog.value = true;
  } else {
    showErrDialog.value = false; // エラーメッセージがクリアされたらダイアログも閉じる
  }
});

// 配達先郵便番号が7桁に変わったら荷物情報を再取得
watch(
  () => step1Data.value.delivery_postal_code,
  async (newCode) => {
    if (newCode && newCode.length === 7) {
      await fetchLuggageItems();
    }
  },
);

onMounted(async () => {
  if (import.meta.client) {
    await startSession();

    await fetchLuggageItems();

    await checkStepAccess();
  }
});

useHead({
  title: "荷物配送予約フォーム",
  meta: [
    {
      name: "description",
      content:
        "旅行者向け荷物配送サービス「LugGo」の予約フォーム。集荷・配送の場所と日時を入力して、簡単に予約できます。",
    },
    { property: "og:title", content: "荷物配送予約フォーム | LugGo(ラグゴー)" },
    {
      property: "og:description",
      content:
        "旅行者向け荷物配送サービス「LugGo」の予約フォーム。集荷・配送の場所と日時を入力して、簡単に予約できます。",
    },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: "荷物配送予約フォーム | LugGo(ラグゴー)",
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content:
        "旅行者向け荷物配送サービス「LugGo」の予約フォーム。集荷・配送の場所と日時を入力して、簡単に予約できます。",
    },
  ],
});
</script>
