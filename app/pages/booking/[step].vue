<template>
  <div class="min-h-screen py-8">
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <BookingAtomsProgressBar :current-step="1" />

      <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12">
        荷物配送予約フォーム
      </h1>

      <CommonAtomsErrDialog
        v-model="showErrDialog"
        :msg="errMsg"
      />

      <form
        class="space-y-6"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <BookingStep1Form
          v-if="currentStep === 1"
          :form-data="step1Data"
          :errors="errsStep1"
          @update:form-data="Object.assign(step1Data, $event)"
        />
        <BookingStep2Form
          v-else-if="currentStep === 2"
          :form-data="step2Data"
          :errors="errsStep2"
          :luggage-items-data="luggageItemsData"
          :luggage-items-loading="luggageItemsLoading"
          :luggage-items-error="luggageItemsErr"
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
            :disabled="isSubmitting"
          >
            <CommonAtomsLoadingAnimation
              v-if="isSubmitting"
              size="sm"
            />
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

const currentStep = computed(() => {
  const n = Number(route.params.step);
  return Number.isFinite(n) ? Math.max(1, n) : 1;
});

const prevStepPath = computed(
  () => `/booking/${Math.max(1, currentStep.value - 1)}`,
);

const goPrev = () => navigateTo(prevStepPath.value);

const {
  step1Data,
  step2Data,
  step3Data,
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

const luggageItemsData = ref<LuggageItemData[]>([]);
const luggageItemsLoading = ref(false);
const luggageItemsErr = ref("");

// バックエンドから荷物情報を取得してStep2FormDataを初期化
const fetchLuggageItems = async () => {
  try {
    luggageItemsLoading.value = true;
    luggageItemsErr.value = "";

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    const { data, error: fetchErr } = await useFetch<{
      items: LuggageItemData[];
    }>(`${apiBase}/api/bookings/luggage-items`, {
      method: "GET",
      credentials: "include",
    });

    if (fetchErr.value) {
      luggageItemsErr.value = "荷物情報の取得に失敗しました";
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch luggage items:", fetchErr.value);
      }
      return;
    }

    if (!data.value?.items) {
      return;
    }

    luggageItemsData.value = data.value.items;

    // Step2FormDataを初期化（既存の値は保持）
    for (const item of data.value.items) {
      if (!(item.key in step2Data.value)) {
        step2Data.value[item.key] = 0;
      }
    }
  }
  catch (err: unknown) {
    luggageItemsErr.value = "荷物情報の取得に失敗しました";
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Error fetching luggage items:", err);
    }
  }
  finally {
    luggageItemsLoading.value = false;
  }
};

// 未保存の入力データがあるかチェック
const hasUnsavedChanges = computed(() => {
  if (isSubmitted.value) return false;

  const hasStep1Data
    = step1Data.value.pickup_location_name !== ""
      || step1Data.value.pickup_location_address !== ""
      || step1Data.value.pickup_date !== ""
      || step1Data.value.delivery_location_name !== ""
      || step1Data.value.delivery_location_address !== ""
      || step1Data.value.delivery_date !== ""
      || step1Data.value.notes !== "";

  const hasStep2Data = Object.values(step2Data.value).some(
    count => count > 0,
  );

  const hasStep3Data
    = step3Data.value.customer_name !== ""
      || step3Data.value.customer_phone_number !== ""
      || step3Data.value.customer_email !== ""
      || step3Data.value.customer_nationality !== ""
      || step3Data.value.guest_name !== "";

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
    }
    else {
      sessionStorage.removeItem("paymentClientSecret");
    }
  }
});

const step1Schema = computed(() => createStep1Schema());

const step2Schema = computed(() => {
  return createStep2Schema(luggageItemsData.value);
});

const step3Schema = computed(() => createStep3Schema());

// vee-validate
const { validate: validateStep1Vv, setValues: setStep1Values }
  = useForm<Step1FormData>({
    validationSchema: computed(() => toTypedSchema(step1Schema.value)),
  });
const { validate: validateStep2Vv, setValues: setStep2Values }
  = useForm<Step2FormData>({
    validationSchema: computed(() => toTypedSchema(step2Schema.value)),
  });
const { validate: validateStep3Vv, setValues: setStep3Values }
  = useForm<Step3FormData>({
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

    const { data, error: fetchErr } = await useFetch<{
      client_secret: string;
    }>(`${apiBase}/api/bookings/create-payment-intent`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
      },
      body: completeFormData.value,
    });

    if (fetchErr.value) {
      const apiErr = fetchErr.value as unknown as ApiErrRes;

      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Payment intent creation error:", fetchErr.value);
      }

      // バリデーションエラーの場合
      if (apiErr.data.valid_errs) {
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
      }
      else {
        // その他のエラー
        errMsg.value = "支払い情報の取得に失敗しました";
      }

      return null;
    }

    if (!data.value?.client_secret) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error(
          "Payment intent creation error: client_secret is missing",
          "Response data:",
          data.value,
        );
      }
      errMsg.value = "支払い情報の取得に失敗しました";
      return null;
    }

    return data.value.client_secret;
  }
  catch (err: unknown) {
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
  if (currentStep.value === 1) {
    // 既存エラークリア
    (Object.keys(errsStep1.value) as Array<keyof Step1FormData>).forEach(
      (key) => {
        if (errsStep1.value[key] !== undefined) errsStep1.value[key] = "";
      },
    );
    setStep1Values(step1Data.value);
    const rslt = await validateStep1Vv();

    if (rslt.valid) return navigateTo("/booking/2");

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
    if (rslt.valid) return navigateTo("/booking/3");
    for (const [path, msg] of Object.entries(rslt.errors)) {
      const key = path || "";
      errsStep2.value[key] = msg as string;
    }
    return;
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
      errMsg.value
        = "セッションの有効期限が切れています。お手数おかけしますが、最初から入力し直してください。";
      isSubmitting.value = false;
      await navigateTo("/booking/1");
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
        await router.push("/booking/confirm");

        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.log("Navigation to confirm page completed");
        }
      }
      catch (err: unknown) {
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.error("Navigation failed:", err);
        }
        errMsg.value = "ページの遷移に失敗しました";
        isSubmitting.value = false;
        return;
      }
    }
    catch (err: unknown) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Payment intent creation error:", err);
      }
      errMsg.value = "支払い情報の取得に失敗しました";
    }
    finally {
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
        await navigateTo("/booking/1");
        return;
      }
      break;

    case 3:
      if (!canProceedStep1.value) {
        await navigateTo("/booking/1");
        return;
      }
      if (!canProceedStep2.value) {
        await navigateTo("/booking/2");
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
  }
  else {
    showErrDialog.value = false; // エラーメッセージがクリアされたらダイアログも閉じる
  }
});

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
