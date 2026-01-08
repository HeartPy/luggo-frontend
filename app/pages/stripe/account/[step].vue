<template>
  <div
    class="min-h-screen w-full bg-gradient-to-br from-gray-600 via-gray-700 via-gray-800 via-gray-900 to-black py-12"
  >
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <div class="rounded-xl bg-white px-4 py-8 md:p-8">
        <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12">
          アカウント登録申請
        </h1>
        <p class="mx-auto mb-6 w-fit text-gray-600">
          本サービスで使用する決済システム(Stripe
          Connect)のアカウント登録申請を行います
        </p>

        <StripeAccountAtomsProgressBar
          :steps="filteredSteps"
          :current-step="currentStep"
        />

        <CommonAtomsErrDialog v-model="showErrDialog" :msg="errMsg" />

        <form novalidate @submit.prevent="handleNext">
          <StripeAccountCompanyInfo
            v-if="currentStep === 1 && requiredSteps.has(1)"
            :form-data="step1Data"
            :errors="errorsStep1"
            :required-fields="Array.from(requiredFieldsByStep[1] || new Set())"
            @update:form-data="Object.assign(step1Data, $event)"
          />

          <StripeAccountRepInfo
            v-if="currentStep === 2 && requiredSteps.has(2)"
            :form-data="step2Data"
            :errors="errorsStep2"
            :required-fields="Array.from(requiredFieldsByStep[2] || new Set())"
            @update:form-data="Object.assign(step2Data, $event)"
          />

          <StripeAccountBankInfo
            v-if="currentStep === 3 && requiredSteps.has(3)"
            :form-data="step3Data"
            :errors="errorsStep3"
            :required-fields="Array.from(requiredFieldsByStep[3] || new Set())"
            @update:form-data="Object.assign(step3Data, $event)"
          />

          <StripeAccountProductDetails
            v-if="currentStep === 4 && requiredSteps.has(4)"
            :form-data="step4Data"
            :errors="errorsStep4"
            :required-fields="Array.from(requiredFieldsByStep[4] || new Set())"
            @update:form-data="Object.assign(step4Data, $event)"
          />

          <StripeAccountVerifDocs
            v-if="currentStep === 5 && requiredSteps.has(5)"
            :form-data="step5Data"
            :errors="errorsStep5"
            :required-fields="Array.from(requiredFieldsByStep[5] || new Set())"
            @file-upload="handleFileUpload"
            @update:form-data="Object.assign(step5Data, $event)"
          />

          <div class="mx-auto flex w-full max-w-[500px] flex-col gap-4 pt-12">
            <button
              type="submit"
              class="flex items-center justify-center rounded-md bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="isSubmitting"
            >
              <CommonAtomsLoadingAnimation v-if="isSubmitting" size="sm" />
              <span v-else>
                {{
                  currentStep ===
                  filteredSteps[filteredSteps.length - 1]?.number
                    ? "Stripeアカウント登録の申請"
                    : "次へ"
                }}
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
  </div>
</template>

<script setup lang="ts">
import { object, string, number, boolean } from "yup";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import type {
  Step1FormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
  Step5FormData,
} from "~/types/stripe-account-register";
import { useStripeAccountForm } from "~/composables/useStripeAccountForm";
import { useCsrf } from "~/composables/useCsrf";
import { useSession } from "~/composables/useSession";
import { useBeforeUnload } from "~/composables/useBeforeUnload";
import { checkAuthentication } from "~/composables/useAuth";
import { analyzeAccountRequirements } from "~/composables/useStripeAccount";

const route = useRoute();

definePageMeta({
  middleware: "auth",
  validate: (route) => {
    const n = Number(route.params.step);
    return Number.isFinite(n) && n >= 1 && n <= 5;
  },
});

const allSteps = [
  { number: 1, label: "利用規約の同意・ビジネス情報/会社情報" },
  { number: 2, label: "代表者情報" },
  { number: 3, label: "銀行口座情報" },
  { number: 4, label: "事業詳細" },
  { number: 5, label: "本人確認書類" },
];

const requiredSteps = ref<Set<number>>(new Set([1, 2, 3, 4, 5]));

const filteredSteps = computed(() => {
  if (requiredSteps.value.size === 0) {
    return allSteps;
  }
  return allSteps.filter((step) => requiredSteps.value.has(step.number));
});

const currentStep = computed(() => {
  const n = Number(route.params.step);
  return Number.isFinite(n) ? Math.max(1, n) : 1;
});

const prevStepPath = computed(
  () => `/stripe/account/${Math.max(1, currentStep.value - 1)}`,
);

const goPrev = () => navigateTo(prevStepPath.value);

const {
  step1Data,
  step2Data,
  step3Data,
  step4Data,
  step5Data,
  errorsStep1,
  errorsStep2,
  errorsStep3,
  errorsStep4,
  errorsStep5,
  clearAllData,
} = useStripeAccountForm();

const isSubmitting = ref(false);
const isSubmitted = ref(false);
const errMsg = ref("");
const showErrDialog = ref(false);

const canProceedStep1 = ref(false);
const canProceedStep2 = ref(false);
const canProceedStep3 = ref(false);
const canProceedStep4 = ref(false);
const canProceedStep5 = ref(false);

const { ensureCsrf, getCsrf } = useCsrf();
const { startSession, checkSessionValidity } = useSession();

const requiredFieldsByStep = ref<Record<number, Set<string>>>({
  1: new Set(),
  2: new Set(),
  3: new Set(),
  4: new Set(),
  5: new Set(),
});

// 未保存の入力データがあるかチェック
const hasUnsavedChanges = computed(() => {
  if (isSubmitted.value) return false;

  return (
    step1Data.value.accept_tos !== false ||
    step1Data.value.product_name !== "" ||
    step1Data.value.support_email !== "" ||
    step1Data.value.company_name !== "" ||
    step2Data.value.first_name_kanji !== "" ||
    step2Data.value.last_name_kanji !== "" ||
    step2Data.value.rep_email !== "" ||
    step2Data.value.rep_phone !== "" ||
    step3Data.value.bank_code !== "" ||
    step3Data.value.account_number !== "" ||
    step4Data.value.product_url !== "" ||
    step4Data.value.product_description !== "" ||
    step5Data.value.document_front !== "" ||
    step5Data.value.document_back !== ""
  );
});

// ページを離れる前に警告を表示
useBeforeUnload(hasUnsavedChanges, isSubmitting, isSubmitted);

const handleFileUpload = async (
  side: "front" | "back",
  event: Event,
): Promise<void> => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    await ensureCsrf(apiBase);

    let res: Response;
    try {
      res = await fetch(
        `${apiBase}/api/business/public/stripe/custom/upload-document`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
          },
          body: formData,
        },
      );
    } catch {
      throw new Error(
        "ネットワークエラーが発生しました。インターネット接続を確認して、もう一度お試しください。",
      );
    }

    const body: { file_id?: string; error?: string; restart?: boolean } =
      await res.json().catch(() => {
        // JSON解析に失敗した場合
        throw new Error(
          "サーバーからの応答の処理に失敗しました。お手数おかけしますが、しばらく時間をおいて再度お試しください。",
        );
      });

    if (!res.ok) {
      if (import.meta.dev && body.error) {
        // eslint-disable-next-line no-console
        console.error("Server error response:", body.error);
      }
      if (res.status === 400) {
        throw new Error(
          "ファイルの形式が正しくないか、ファイルサイズが大きすぎます。",
        );
      } else if (res.status === 401) {
        throw new Error("認証に失敗しました。ページを再読み込みしてください。");
      } else if (res.status === 413) {
        throw new Error(
          "ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。",
        );
      } else if (res.status >= 500) {
        throw new Error(
          "サーバーエラーが発生しました。お手数おかけしますが、しばらく時間をおいて再度お試しください。",
        );
      } else {
        throw new Error(
          "ファイルのアップロードに失敗しました。もう一度お試しください。",
        );
      }
    }

    if (body.file_id) {
      if (side === "front") {
        step5Data.value.document_front = body.file_id;
      } else {
        step5Data.value.document_back = body.file_id;
      }
      errMsg.value = "";
    } else {
      throw new Error(
        "ファイルIDの取得に失敗しました。もう一度お試しください。",
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      errMsg.value = err.message;
    } else if (typeof err === "string") {
      errMsg.value = err;
    } else {
      errMsg.value =
        "ファイルのアップロード中にエラーが発生しました。ネットワーク接続を確認して、もう一度お試しください。";
    }
  }
};

const submit = async (): Promise<void> => {
  isSubmitting.value = true;
  errMsg.value = "";

  // セッション有効性をチェック
  const sessionValid = await checkSessionValidity();
  if (!sessionValid) {
    clearAllData();
    errMsg.value =
      "セッションの有効期限が切れています。お手数おかけしますが、最初から入力し直してください。";
    const firstRequiredStep = filteredSteps.value[0]?.number || 1;
    await navigateTo(`/stripe/account/${firstRequiredStep}`);
    return;
  }

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    await ensureCsrf(apiBase);

    // ログイン状態に応じてエンドポイントを切り替え
    const isAuthenticated = await checkAuthentication();
    const endpoint = isAuthenticated
      ? `${apiBase}/api/business/stripe/custom/update-account`
      : `${apiBase}/api/business/public/stripe/custom/update-account`;

    const { data: body, error: fetchErr } = await useFetch<{
      error?: string;
      restart?: boolean;
    }>(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
      },
      body: {
        product_company: step1Data.value,
        rep_info: step2Data.value,
        bank_info: step3Data.value,
        product_details: step4Data.value,
        verif_docs: step5Data.value,
      },
    });

    if (fetchErr.value) {
      throw new Error(
        "送信に失敗しました。お手数おかけしますが、しばらく時間をおいて再度お試しください。",
      );
    }

    if (body.value?.error) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Server error response:", body.value.error);
      }
      if (body.value.restart) {
        // セッションが失われた場合、データをクリアして最初のステップに戻る
        clearAllData();
        errMsg.value =
          "セッションが失われました。最初から登録をやり直してください。";
        const firstRequiredStep = filteredSteps.value[0]?.number || 1;
        await navigateTo(`/stripe/account/${firstRequiredStep}`);
        return;
      }
      throw new Error(
        "送信に失敗しました。お手数おかけしますが、しばらく時間をおいて再度お試しください。",
      );
    }

    // 送信成功後、localStorageのデータを削除
    isSubmitted.value = true;
    clearAllData();

    // 送信完了フラグをsessionStorageに保存
    if (import.meta.client) {
      sessionStorage.setItem("stripeAccountSubmitted", "true");
    }

    await navigateTo("/stripe/account/complete");
  } catch (err: unknown) {
    if (err instanceof Error) {
      errMsg.value = err.message;
    } else if (typeof err === "string") {
      errMsg.value = err;
    } else {
      errMsg.value =
        "送信に失敗しました。お手数おかけしますが、しばらく時間をおいて再度お試しください。";
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Step 1: ビジネス情報・会社情報
const step1Schema = object({
  accept_tos: boolean()
    .required("利用規約への同意は必須です")
    .oneOf([true], "利用規約に同意してください"),
  product_name: string().trim().required("事業名は必須です"),
  support_email: string()
    .trim()
    .required("お問い合わせメールアドレスは必須です")
    .email("有効なメールアドレスを入力してください"),
  company_name: string().trim().required("法人名または屋号は必須です"),
  company_address: object({
    country: string().trim().required(),
    postal_code: string().trim().required("郵便番号は必須です"),
    state: string().trim().required("都道府県は必須です"),
    line1: string().trim().required("市区町村・町名番地は必須です"),
    line2: string().trim().optional().nullable(),
  }),
});

// Step 2: 代表者情報
const step2Schema = object({
  first_name_kanji: string().trim().required("名は必須です"),
  last_name_kanji: string().trim().required("姓は必須です"),
  first_name_kana: string()
    .trim()
    .required("名（カナ）は必須です")
    .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
  last_name_kana: string()
    .trim()
    .required("姓（カナ）は必須です")
    .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
  rep_email: string()
    .trim()
    .required("メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください"),
  rep_phone: string()
    .trim()
    .required("電話番号は必須です")
    .transform((value) =>
      typeof value === "string" ? value.replace(/[\s-]/g, "") : value,
    )
    .matches(/^\d{10,11}$/u, "有効な電話番号を入力してください"),
  rep_dob: object({
    year: number()
      .typeError("生年月日は正しい形式で入力してください")
      .required("生年月日は必須です")
      .min(1900, "生年月日は有効な日付を入力してください")
      .max(new Date().getFullYear(), "生年月日は有効な日付を入力してください"),
    month: number()
      .typeError("生年月日は正しい形式で入力してください")
      .required("生年月日は必須です")
      .min(1, "生年月日は有効な日付を入力してください")
      .max(12, "生年月日は有効な日付を入力してください"),
    day: number()
      .typeError("生年月日は正しい形式で入力してください")
      .required("生年月日は必須です")
      .min(1, "生年月日は有効な日付を入力してください")
      .max(31, "生年月日は有効な日付を入力してください"),
  }).test(
    "valid-date",
    "生年月日は有効な日付を入力してください",
    function (value) {
      if (!value || !value.year || !value.month || !value.day) {
        return this.createError({
          message: "生年月日は必須です",
        });
      }
      const year = value.year;
      const month = value.month;
      const day = value.day;

      if (year < 1900 || year > new Date().getFullYear()) {
        return this.createError({
          message: "生年月日は有効な日付を入力してください",
        });
      }
      if (month < 1 || month > 12) {
        return this.createError({
          message: "生年月日は有効な日付を入力してください",
        });
      }
      if (day < 1 || day > 31) {
        return this.createError({
          message: "生年月日は有効な日付を入力してください",
        });
      }

      // 実際の日付として有効かチェック（例：2月30日などは無効）
      const date = new Date(year, month - 1, day);
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        return this.createError({
          message: "生年月日は有効な日付を入力してください",
        });
      }

      return true;
    },
  ),
  address_kanji: object({
    postal_code: string().trim().required("郵便番号は必須です"),
    state: string().trim().required("都道府県は必須です"),
    city: string().trim().required("市区町村は必須です"),
    line1: string().trim().required("町名番地は必須です"),
    line2: string().trim().optional().nullable(),
  }),
  address_kana: object({
    postal_code: string().trim().required("郵便番号は必須です"),
    state: string()
      .trim()
      .required("都道府県（カナ）は必須です")
      .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
    city: string()
      .trim()
      .required("市区町村（カナ）は必須です")
      .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
    line1: string()
      .trim()
      .required("町名番地（カナ）は必須です")
      .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
  }),
});

// Step 3: 銀行口座情報
const step3Schema = object({
  bank_code: string()
    .trim()
    .required("銀行コードは必須です")
    .matches(/^\d{4}$/u, "銀行コードは4桁の数字で入力してください"),
  branch_code: string()
    .trim()
    .required("支店コードは必須です")
    .matches(/^\d{3}$/u, "支店コードは3桁の数字で入力してください"),
  account_type: string()
    .trim()
    .required("口座種別は必須です")
    .oneOf(["futsu", "toza"], "有効な口座種別を選択してください"),
  account_number: string()
    .trim()
    .required("口座番号は必須です")
    .matches(/^\d{7}$/u, "口座番号は7桁の数字で入力してください"),
  account_holder_name: string()
    .trim()
    .required("口座名義（カナ）は必須です")
    .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
});

// Step 4: 事業詳細
const step4Schema = object({
  product_mcc: string().trim().required("業種は必須です"),
  product_url: string()
    .trim()
    .required("サービスサイトのURLは必須です")
    .url("有効なURLを入力してください"),
  product_description: string().trim().required("事業内容は必須です"),
});

// Step 5: 本人確認書類
const step5Schema = object({
  document_front: string().required("本人確認書類の表（前面）は必須です"),
  document_back: string().required("本人確認書類の裏（背面）は必須です"),
});

// vee-validate
const { validate: validateStep1Vv, setValues: setStep1Values } =
  useForm<Step1FormData>({
    validationSchema: toTypedSchema(step1Schema),
  });
const { validate: validateStep2Vv, setValues: setStep2Values } =
  useForm<Step2FormData>({
    validationSchema: toTypedSchema(step2Schema),
  });
const { validate: validateStep3Vv, setValues: setStep3Values } =
  useForm<Step3FormData>({
    validationSchema: toTypedSchema(step3Schema),
  });
const { validate: validateStep4Vv, setValues: setStep4Values } =
  useForm<Step4FormData>({
    validationSchema: toTypedSchema(step4Schema),
  });
const { validate: validateStep5Vv, setValues: setStep5Values } =
  useForm<Step5FormData>({
    validationSchema: toTypedSchema(step5Schema),
  });

watch(
  step1Data,
  async (value) => {
    canProceedStep1.value = await step1Schema.isValid(value);
  },
  { deep: true, immediate: true },
);

watch(
  step2Data,
  async (value) => {
    canProceedStep2.value = await step2Schema.isValid(value);
  },
  { deep: true, immediate: true },
);

watch(
  step3Data,
  async (value) => {
    canProceedStep3.value = await step3Schema.isValid(value);
  },
  { deep: true, immediate: true },
);

watch(
  step4Data,
  async (value) => {
    canProceedStep4.value = await step4Schema.isValid(value);
  },
  { deep: true, immediate: true },
);

watch(
  step5Data,
  async (value) => {
    canProceedStep5.value = await step5Schema.isValid(value);
  },
  { deep: true, immediate: true },
);

// 各ステップへの遷移を制御
const checkStepAccess = async () => {
  const step = currentStep.value;

  // 必要なステップのリストを取得
  const requiredStepsList: number[] = Array.from(requiredSteps.value).sort(
    (a: number, b: number) => a - b,
  );

  // 現在のステップが不要なステップの場合は、最初の必要なステップにリダイレクト
  if (!requiredSteps.value.has(step)) {
    const firstRequiredStep = filteredSteps.value[0]?.number;
    if (firstRequiredStep) {
      await navigateTo(`/stripe/account/${firstRequiredStep}`);
    }
    return;
  }

  // 現在のステップより前の必要なステップが完了しているかチェック
  const currentStepIndex = requiredStepsList.indexOf(step);
  if (currentStepIndex === -1) {
    return; // 現在のステップがrequiredStepsListにない場合（通常は発生しない）
  }

  // 最初のステップの場合はチェック不要
  if (currentStepIndex === 0) {
    return;
  }

  // 前の必要なステップを順番にチェック
  for (let i = 0; i < currentStepIndex; i++) {
    const prevStep = requiredStepsList[i];
    let canProceed = false;

    switch (prevStep) {
      case 1:
        canProceed = canProceedStep1.value;
        break;
      case 2:
        canProceed = canProceedStep2.value;
        break;
      case 3:
        canProceed = canProceedStep3.value;
        break;
      case 4:
        canProceed = canProceedStep4.value;
        break;
      case 5:
        canProceed = canProceedStep5.value;
        break;
      default:
        canProceed = true; // 不明なステップの場合は許可
        break;
    }

    // 前のステップが完了していない場合は、そのステップにリダイレクト
    if (!canProceed) {
      await navigateTo(`/stripe/account/${prevStep}`);
      return;
    }
  }
};

// 次の必要なステップを取得する関数
const getNextStep = (): number | null => {
  const currentIndex = filteredSteps.value.findIndex(
    (step) => step.number === currentStep.value,
  );

  if (currentIndex === -1) {
    return null; // 現在のステップがfilteredStepsにない場合
  }

  const nextStep = filteredSteps.value[currentIndex + 1];
  return nextStep ? nextStep.number : null; // 最後のステップの場合はnull
};

const handleNext = async (): Promise<void> => {
  if (currentStep.value === 1) {
    // 既存エラークリア
    Object.keys(errorsStep1.value).forEach((key: string) => {
      if (errorsStep1.value[key] !== undefined) {
        errorsStep1.value[key] = "";
      }
    });
    setStep1Values(step1Data.value);
    const rslt = await validateStep1Vv();

    if (rslt.valid) {
      const nextStepNumber = getNextStep();
      if (nextStepNumber) {
        await navigateTo(`/stripe/account/${nextStepNumber}`);
      } else {
        await submit();
      }
      return;
    }

    for (const [path, msg] of Object.entries(rslt.errors)) {
      errorsStep1.value[path] = msg as string;
    }
    return;
  }

  if (currentStep.value === 2) {
    Object.keys(errorsStep2.value).forEach((key: string) => {
      if (errorsStep2.value[key] !== undefined) {
        errorsStep2.value[key] = "";
      }
    });
    setStep2Values(step2Data.value);
    const rslt = await validateStep2Vv();

    if (rslt.valid) {
      const nextStepNumber = getNextStep();
      if (nextStepNumber) {
        await navigateTo(`/stripe/account/${nextStepNumber}`);
      } else {
        await submit();
      }
      return;
    }

    for (const [path, msg] of Object.entries(rslt.errors)) {
      errorsStep2.value[path] = msg as string;
    }
    return;
  }

  if (currentStep.value === 3) {
    Object.keys(errorsStep3.value).forEach((key: string) => {
      if (errorsStep3.value[key] !== undefined) {
        errorsStep3.value[key] = "";
      }
    });
    setStep3Values(step3Data.value);
    const rslt = await validateStep3Vv();

    if (rslt.valid) {
      const nextStepNumber = getNextStep();
      if (nextStepNumber) {
        await navigateTo(`/stripe/account/${nextStepNumber}`);
      } else {
        await submit();
      }
      return;
    }

    for (const [path, msg] of Object.entries(rslt.errors)) {
      errorsStep3.value[path] = msg as string;
    }
    return;
  }

  if (currentStep.value === 4) {
    Object.keys(errorsStep4.value).forEach((key: string) => {
      if (errorsStep4.value[key] !== undefined) {
        errorsStep4.value[key] = "";
      }
    });
    setStep4Values(step4Data.value);
    const rslt = await validateStep4Vv();

    if (rslt.valid) {
      const nextStepNumber = getNextStep();
      if (nextStepNumber) {
        await navigateTo(`/stripe/account/${nextStepNumber}`);
      } else {
        await submit();
      }
      return;
    }

    for (const [path, msg] of Object.entries(rslt.errors)) {
      errorsStep4.value[path] = msg as string;
    }
    return;
  }

  if (currentStep.value === 5) {
    Object.keys(errorsStep5.value).forEach((key: string) => {
      if (errorsStep5.value[key] !== undefined) {
        errorsStep5.value[key] = "";
      }
    });
    setStep5Values(step5Data.value);
    const rslt = await validateStep5Vv();

    if (!rslt.valid) {
      for (const [path, msg] of Object.entries(rslt.errors)) {
        errorsStep5.value[path] = msg as string;
      }
      return;
    }

    await submit();
  }
};

watch(errMsg, (newValue) => {
  if (newValue) {
    showErrDialog.value = true;
  } else {
    showErrDialog.value = false; // エラーメッセージがクリアされたらダイアログも閉じる
  }
});

// ステップ遷移時または審査結果更新時に、前のステップの完了状態をチェック
watch(
  [currentStep, requiredSteps],
  async () => {
    if (import.meta.client) {
      await checkStepAccess();
    }
  },
  { immediate: false },
);

onMounted(async () => {
  if (import.meta.client) {
    await startSession();
  }
  try {
    // middlewareで認証チェック済みなので、審査結果のみ取得
    const rslt = await analyzeAccountRequirements();
    if (rslt) {
      requiredSteps.value = rslt.steps;
      requiredFieldsByStep.value = rslt.fieldsByStep;
    }
  } catch {
    // エラーを無視
  }

  await checkStepAccess();
});

useHead({
  title: "アカウント登録申請",
  meta: [
    {
      name: "description",
      content: "アカウント登録申請ページ。",
    },
    { property: "og:title", content: "アカウント登録申請 | LugGo(ラグゴー)" },
    {
      property: "og:description",
      content: "アカウント登録申請ページ。",
    },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: "アカウント登録申請 | LugGo(ラグゴー)",
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content: "アカウント登録申請ページ。",
    },
  ],
});
</script>
