<template>
  <div
    class="min-h-screen w-full bg-gradient-to-br from-gray-600 via-gray-700 via-gray-800 via-gray-900 to-black py-12"
  >
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <div class="rounded-xl bg-white px-4 py-8 md:p-8">
        <CommonAtomsLoadingAnimation
          v-if="isPageLoading"
          size="md"
        />
        <div v-else>
          <h1
            class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12"
          >
            アカウント登録申請
          </h1>
          <p class="mx-auto mb-6 w-fit text-gray-600">
            本サービスで使用する決済システム(Stripe
            Connect)のアカウント登録申請を行います
          </p>

          <div
            v-if="expiredNotice"
            class="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <p>
              30分以上操作がなかったため、入力内容をリセットしました。ページをリロードして最初から入力し直してください。
            </p>
          </div>

          <StripeAccountAtomsProgressBar
            :steps="filteredSteps"
            :current-step="currentStep"
          />

          <CommonAtomsErrDialog
            v-model="showErrDialog"
            :msg="errMsg"
          />

          <form
            novalidate
            @submit.prevent="handleNext"
          >
            <StripeAccountCompanyInfo
              v-if="currentStep === 1 && requiredSteps.has(1)"
              :form-data="step1Data"
              :errors="errorsStep1"
              :required-fields="getRequiredFields(1)"
              :needs-tos="needsTos"
              @update:form-data="Object.assign(step1Data, $event)"
            />

            <StripeAccountRepInfo
              v-if="currentStep === 2 && requiredSteps.has(2)"
              :form-data="step2Data"
              :errors="errorsStep2"
              :required-fields="getRequiredFields(2)"
              @update:form-data="Object.assign(step2Data, $event)"
            />

            <StripeAccountBankInfo
              v-if="currentStep === 3 && requiredSteps.has(3)"
              :form-data="step3Data"
              :errors="errorsStep3"
              :required-fields="getRequiredFields(3)"
              @update:form-data="Object.assign(step3Data, $event)"
            />

            <StripeAccountProductDetails
              v-if="currentStep === 4 && requiredSteps.has(4)"
              :form-data="step4Data"
              :errors="errorsStep4"
              :required-fields="getRequiredFields(4)"
              @update:form-data="Object.assign(step4Data, $event)"
            />

            <StripeAccountVerifDocs
              v-if="currentStep === 5 && requiredSteps.has(5)"
              :form-data="step5Data"
              :errors="errorsStep5"
              :required-fields="getRequiredFields(5)"
              @file-upload="handleFileUpload"
              @update:form-data="Object.assign(step5Data, $event)"
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
  </div>
</template>

<script setup lang="ts">
import { object, string, number, boolean, array, ValidationError } from "yup";
import type { AnyObjectSchema } from "yup";
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
import { analyzeAccountRequirements } from "~/composables/useStripeAccount";
import { useBusinessProfile } from "~/composables/useBusinessProfile";

const route = useRoute();

definePageMeta({
  layout: "stripe",
  middleware: ["business-owner", "stripe-prerequisite"],
  validate: (route) => {
    const n = Number(route.params.step);
    return Number.isFinite(n) && n >= 1 && n <= 5;
  },
});

const allSteps = [
  { number: 1, label: "利用規約の同意・事業者情報" },
  { number: 2, label: "代表者（取締役）情報" },
  { number: 3, label: "銀行口座情報" },
  { number: 4, label: "事業詳細" },
  { number: 5, label: "本人確認書類" },
];

const requiredSteps = ref<Set<number>>(new Set([1, 2, 3, 4, 5]));

const filteredSteps = computed(() => {
  if (requiredSteps.value.size === 0) {
    return allSteps;
  }
  return allSteps.filter(step => requiredSteps.value.has(step.number));
});

const currentStep = computed(() => {
  const n = Number(route.params.step);
  return Number.isFinite(n) ? Math.max(1, n) : 1;
});

/**
 * このステップで「必須」とされているフィールドのエラーだけ表示するため、
 * path が必須一覧に含まれるか、その親か子かを判定する。
 * requiredSet が空のときは「全部必須」として true を返す。
 *
 * @param path - バリデーションエラーが出ているフィールドのパス（ドット区切り）。
 *   例: "company_name", "company_address_kanji.postal_code"
 *   出典: フォーム送信時のバリデーション結果のキー。
 *
 * @param requiredSet - このステップで必須とされているフィールドパスの集合。
 *   例: Set(["company_name", "support_email", "company_address_kanji.postal_code"])
 *   出典: Stripe の不足要件 API をフォーム用にマッピングした requiredFieldsByStep[step]。
 */
const isPathRequired = (
  path: string,
  requiredSet: Set<string> | undefined,
): boolean => {
  if (!requiredSet || requiredSet.size === 0) return true;
  for (const required of requiredSet) {
    if (path === required) return true;
    if (path.startsWith(`${required}.`)) return true;
    if (required.startsWith(`${path}.`)) return true;
  }
  return false;
};

/**
 * バリデーションエラーを「このステップで表示すべきもの」だけに絞り込む。
 * requiredSet が空のときは全エラーをそのまま返し、
 * 指定されているときは必須フィールド（とその親子）のエラーのみ返す。
 */
const filterErrorsForStep = (
  errors: Record<string, string | undefined>,
  requiredSet: Set<string> | undefined,
): Record<string, string> => {
  const filtered: Record<string, string> = {};
  if (!requiredSet || requiredSet.size === 0) {
    for (const [path, msg] of Object.entries(errors)) {
      if (msg) {
        filtered[path] = msg;
      }
    }
    return filtered;
  }
  for (const [path, msg] of Object.entries(errors)) {
    if (msg && isPathRequired(path, requiredSet)) {
      filtered[path] = msg;
    }
  }
  return filtered;
};

/**
 * ドット区切りのパスで、オブジェクトの入れ子の値を取り出す。
 * 例: getPathValue(data, "company_address_kanji.postal_code") で
 *     data.company_address_kanji.postal_code に相当する値を取得。
 * buildStepPayload で requiredSet の各パスに対応する値をフォームデータから取得する際に使用。
 */
const getPathValue = (obj: unknown, path: string): unknown => {
  if (!obj) return undefined;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (
      acc
      && typeof acc === "object"
      && key in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

/**
 * ドット区切りのパスで、オブジェクトの入れ子の場所に値を書き込む。
 * 途中のオブジェクトが無ければ {} を作ってから代入する。
 * 例: setPathValue(picked, "company_address_kanji.postal_code", "100-0001") で
 *     picked.company_address_kanji.postal_code がセットされる（company_address_kanji が無ければ作成）。
 * buildStepPayload で getPathValue で取り出した値を、同じパス構造で送信用オブジェクトに詰める際に使用。
 */
const setPathValue = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void => {
  const parts = path.split(".");
  if (parts.length === 0) {
    return;
  }
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!key) {
      return;
    }
    const next = current[key];
    if (!next || typeof next !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  const lastKey = parts[parts.length - 1];
  if (!lastKey) {
    return;
  }
  current[lastKey] = value;
};

/**
 * オブジェクト・配列から「空」の値を再帰的に取り除く。
 * 空とみなすもの: "" / null / undefined、および中身を刈り込んだ結果空になった配列・オブジェクト。
 * buildStepPayload の送信ペイロードに適用し、API に送るデータから不要な空項目を除く。
 */
const pruneEmpty = (value: unknown): unknown => {
  if (value === "" || value === null || value === undefined) return undefined;

  if (Array.isArray(value)) {
    const prunedArray = value
      .map(item => pruneEmpty(item))
      .filter(item => item !== undefined);
    return prunedArray.length > 0 ? prunedArray : undefined;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const prunedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      const prunedVal = pruneEmpty(val);
      if (prunedVal !== undefined) {
        prunedObj[key] = prunedVal;
      }
    }
    return Object.keys(prunedObj).length > 0 ? prunedObj : undefined;
  }

  return value;
};

// ステップのフォームデータから、API送信用のペイロードを組立
const buildStepPayload = (
  data: Record<string, unknown>,
  requiredSet: Set<string> | undefined,
): Record<string, unknown> | null => {
  const base
    = !requiredSet || requiredSet.size === 0
      ? data
      : (() => {
          const picked: Record<string, unknown> = {};
          for (const path of requiredSet) {
            const val = getPathValue(data, path);
            if (val !== undefined) {
              setPathValue(picked, path, val);
            }
          }
          return picked;
        })();

  const pruned = pruneEmpty(base);
  if (!pruned || typeof pruned !== "object") return null;
  return pruned as Record<string, unknown>;
};

/**
 * API のエラーオブジェクトのキーを角括弧表記からドット表記に揃える。
 * 例: "directors[0].first_name_kanji" → "directors.0.first_name_kanji"
 */
const normalizeErrorPaths = (
  errors: Record<string, string | undefined>,
): Record<string, string | undefined> => {
  const normalized: Record<string, string | undefined> = {};
  for (const [path, msg] of Object.entries(errors)) {
    if (!path) continue;
    const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
    normalized[normalizedPath] = msg;
  }
  return normalized;
};

// Yupの複数フィールドのエラーに対応
// 取締役などの動的フィールドにも正しくエラー表示できるようにするため
const getYupErrors = (err: unknown): Record<string, string | undefined> => {
  if (!(err instanceof ValidationError)) {
    return {};
  }
  const errors: Record<string, string | undefined> = {};
  if (err.inner && err.inner.length > 0) {
    for (const innerErr of err.inner) {
      if (innerErr.path && !errors[innerErr.path]) {
        errors[innerErr.path] = innerErr.message;
      }
    }
    return normalizeErrorPaths(errors);
  }
  if (err.path) {
    errors[err.path] = err.message;
  }
  return normalizeErrorPaths(errors);
};

// このステップのデータが「次へ進んでよい」かどうかを判定
// 必須以外の項目だけエラーの場合は次へ進めるようにするため
const isStepDataValid = async (
  value: unknown,
  schema: AnyObjectSchema,
  requiredSet: Set<string> | undefined,
): Promise<boolean> => {
  if (!requiredSet || requiredSet.size === 0) {
    return schema.isValid(value);
  }
  try {
    await schema.validate(value, { abortEarly: false });
    return true;
  }
  catch (err) {
    const filteredErrors = filterErrorsForStep(getYupErrors(err), requiredSet);
    return Object.keys(filteredErrors).length === 0;
  }
};

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
  checkAndClearIfDifferentUser,
  expiredNotice,
} = useStripeAccountForm();

const isSubmitting = ref(false);
const isSubmitted = ref(false);
const isPageLoading = ref(true);
const errMsg = ref("");
const showErrDialog = ref(false);
const needsTos = ref(false);

const canProceedStep1 = ref(false);
const canProceedStep2 = ref(false);
const canProceedStep3 = ref(false);
const canProceedStep4 = ref(false);
const canProceedStep5 = ref(false);

const { ensureCsrf, getCsrf } = useCsrf();
const { startSession, checkSessionValidity } = useSession();
const { businessProfile, fetchBusinessProfile } = useBusinessProfile();

const requiredFieldsByStep = ref<Record<number, Set<string>>>({
  1: new Set(),
  2: new Set(),
  3: new Set(),
  4: new Set(),
  5: new Set(),
});

const getRequiredFields = (step: number): string[] | undefined => {
  // 初回登録は全表示したいので、requiredFieldsを未指定にする
  if (!businessProfile.value?.has_stripe_account) {
    return undefined;
  }
  const fields = requiredFieldsByStep.value[step];
  return fields ? Array.from(fields) : [];
};

// ページを離れる前に警告を表示
useBeforeUnload(isSubmitting, isSubmitted);

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
        `${apiBase}/api/business/stripe/custom/upload-document`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
          },
          body: formData,
        },
      );
    }
    catch {
      throw new Error(
        "ネットワークエラーが発生しました。インターネット接続を確認して、もう一度お試しください。",
      );
    }

    const body: { file_id?: string; error?: string; restart?: boolean }
      = await res.json().catch(() => {
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
      }
      else if (res.status === 401) {
        throw new Error("認証に失敗しました。ページを再読み込みしてください。");
      }
      else if (res.status === 413) {
        throw new Error(
          "ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。",
        );
      }
      else if (res.status >= 500) {
        throw new Error(
          "サーバーエラーが発生しました。お手数おかけしますが、しばらく時間をおいて再度お試しください。",
        );
      }
      else {
        throw new Error(
          "ファイルのアップロードに失敗しました。もう一度お試しください。",
        );
      }
    }

    if (body.file_id) {
      if (side === "front") {
        step5Data.value.document_front = body.file_id;
      }
      else {
        step5Data.value.document_back = body.file_id;
      }
      errMsg.value = "";
    }
    else {
      throw new Error(
        "ファイルIDの取得に失敗しました。もう一度お試しください。",
      );
    }
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      errMsg.value = err.message;
    }
    else if (typeof err === "string") {
      errMsg.value = err;
    }
    else {
      errMsg.value
        = "ファイルのアップロード中にエラーが発生しました。ネットワーク接続を確認して、もう一度お試しください。";
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
    errMsg.value
      = "セッションの有効期限が切れています。お手数おかけしますが、最初から入力し直してください。";
    const firstRequiredStep = filteredSteps.value[0]?.number || 1;
    await navigateTo(`/stripe/account/${firstRequiredStep}`);
    return;
  }

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    await ensureCsrf(apiBase);

    // Stripeアカウントが存在するかどうかでエンドポイントを決定
    const hasStripeAccount = businessProfile.value?.has_stripe_account ?? false;
    const endpoint = hasStripeAccount
      ? `${apiBase}/api/business/stripe/custom/update-account`
      : `${apiBase}/api/business/stripe/custom/create-account`;

    // リクエストボディを構築（必要なフィールドのみ送信）
    const step1Required = requiredFieldsByStep.value[1];
    const step2Required = requiredFieldsByStep.value[2];
    const step3Required = requiredFieldsByStep.value[3];
    const step4Required = requiredFieldsByStep.value[4];
    const step5Required = requiredFieldsByStep.value[5];

    const step1Payload = buildStepPayload(step1Data.value, step1Required);
    // Step2用の送信元オブジェクト。生年月日が未入力・不完全な場合は rep_dob を送らない。
    const step2PayloadSource: Record<string, unknown> = { ...step2Data.value };
    const repDob = step2PayloadSource.rep_dob as
      | { year?: number; month?: number; day?: number }
      | undefined;
    if (!repDob || !repDob.year || !repDob.month || !repDob.day) {
      delete step2PayloadSource.rep_dob;
    }
    let step2Payload = buildStepPayload(step2PayloadSource, step2Required);
    const step3Payload = buildStepPayload(step3Data.value, step3Required);
    const step4Payload = buildStepPayload(step4Data.value, step4Required);
    const step5Payload = buildStepPayload(step5Data.value, step5Required);

    let productCompanyPayload: Record<string, unknown> | null = null;

    if (step1Payload) {
      const { tax_id, ...baseProductCompany } = step1Payload as {
        tax_id?: unknown;
      };

      // 明細書表記：入力がありトリム後も中身がある項目だけ送信用オブジェクトに詰める
      const statementDescriptorPayload: Record<string, string> = {};
      if (step1Data.value.statement_descriptor_romaji?.trim()) {
        statementDescriptorPayload.statement_descriptor
          = step1Data.value.statement_descriptor_romaji.trim();
      }
      if (step1Data.value.statement_descriptor_kana?.trim()) {
        statementDescriptorPayload.statement_descriptor_kana
          = step1Data.value.statement_descriptor_kana.trim();
      }
      if (step1Data.value.statement_descriptor?.trim()) {
        statementDescriptorPayload.statement_descriptor_kanji
          = step1Data.value.statement_descriptor.trim();
      }

      // 会社住所をフォームからコピーして送信用に用意
      const addressKanji = step1Data.value.company_address_kanji
        ? { ...step1Data.value.company_address_kanji }
        : undefined;
      const addressKana = step1Data.value.company_address_kana
        ? { ...step1Data.value.company_address_kana }
        : undefined;

      // 事業者タイプに応じてproduct_company（送信データ）を組立（法人のみ法人番号・会社住所を含める）
      const baseWithStatement
        = businessProfile.value?.business_type === "company"
          ? {
              ...baseProductCompany,
              ...(tax_id !== undefined ? { tax_id } : {}),
              ...statementDescriptorPayload,
              ...(addressKanji ? { company_address_kanji: addressKanji } : {}),
              ...(addressKana ? { company_address_kana: addressKana } : {}),
            }
          : {
              ...baseProductCompany,
              ...statementDescriptorPayload,
            };
      productCompanyPayload = baseWithStatement;
    }

    // 利用規約に同意済みなら送信データに accept_tos: true を必ず含める（productCompanyPayload が null のときも送る）
    if (step1Data.value.accept_tos === true) {
      productCompanyPayload = productCompanyPayload
        ? { ...productCompanyPayload, accept_tos: true }
        : { accept_tos: true };
    }

    const requestBody: Record<string, unknown> = {};
    if (productCompanyPayload) {
      requestBody.product_company = productCompanyPayload;
    }

    // 取締役が要求されているときは送信データに directors を必ず含める
    const requiresDirectors = !!step2Required && step2Required.has("directors");
    if (requiresDirectors) {
      if (!step2Payload) {
        step2Payload = { directors: [] };
      }
      else if (!("directors" in step2Payload)) {
        step2Payload = { ...step2Payload, directors: [] };
      }
    }

    // 代表者情報を送信。役職が要求されておらず「代表取締役」のみのときは送らない（不要な送信を避ける）
    const isRepTitleRequired
      = !!step2Required && step2Required.has("rep_title");
    if (step2Payload) {
      const repInfoPayload = { ...step2Payload };
      if (
        !isRepTitleRequired
        && repInfoPayload.rep_title === "代表取締役"
        && Object.keys(repInfoPayload).length === 1
      ) {
        // 代表取締役のみの送信は不要なので除外
      }
      else {
        requestBody.rep_info = repInfoPayload;
      }
    }

    if (step3Payload) {
      requestBody.bank_info = step3Payload;
    }

    if (step4Payload) {
      requestBody.product_details = step4Payload;
    }

    if (step5Payload) {
      requestBody.verif_docs = step5Payload;
    }

    // 新規作成時はbusiness_typeも送信
    if (!hasStripeAccount && businessProfile.value?.business_type) {
      requestBody.business_type = businessProfile.value.business_type;
    }

    let body: {
      error?: string;
      restart?: boolean;
      needs_tos?: boolean;
    } | null = null;

    try {
      body = await $fetch<{
        error?: string;
        restart?: boolean;
        needs_tos?: boolean;
      }>(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
        },
        body: requestBody,
      });
    }
    catch (fetchErr: unknown) {
      const errData = (fetchErr as {
        data?: { error?: string; restart?: boolean; needs_tos?: boolean };
      })?.data;
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.log("fetchErr data:", errData);
      }
      if (errData?.needs_tos) {
        needsTos.value = true;
        errorsStep1.value.accept_tos = "利用規約に同意してください。";
        errMsg.value = errData.error || "利用規約に同意してください。";
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.log("needsTos set to true:", needsTos.value);
        }
        if (currentStep.value !== 1) {
          await navigateTo("/stripe/account/1");
        }
        return;
      }
      throw new Error(
        "送信に失敗しました。お手数おかけしますが、しばらく時間をおいて再度お試しください。",
      );
    }

    if (body?.error) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Server error response:", body.error);
      }
      if (body.needs_tos) {
        needsTos.value = true;
        errorsStep1.value.accept_tos = "利用規約に同意してください。";
        errMsg.value = body.error || "利用規約に同意してください。";
        if (currentStep.value !== 1) {
          await navigateTo("/stripe/account/1");
        }
        return;
      }
      if (body.restart) {
        // セッションが失われた場合、データをクリアして最初のステップに戻る
        clearAllData();
        errMsg.value
          = "セッションが失われました。最初から登録をやり直してください。";
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
    needsTos.value = false;
    errorsStep1.value.accept_tos = "";
    clearAllData();

    // 送信完了フラグをsessionStorageに保存
    if (import.meta.client) {
      sessionStorage.setItem("stripeAccountSubmitted", "true");
    }

    await navigateTo("/stripe/account/complete");
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      errMsg.value = err.message;
    }
    else if (typeof err === "string") {
      errMsg.value = err;
    }
    else {
      errMsg.value
        = "送信に失敗しました。お手数おかけしますが、しばらく時間をおいて再度お試しください。";
    }
  }
  finally {
    isSubmitting.value = false;
  }
};

// Step 1: 事業者情報
const step1Schema = object({
  accept_tos: boolean()
    .required("利用規約への同意は必須です")
    .oneOf([true], "利用規約に同意してください"),
  support_email: string()
    .trim()
    .required("お問い合わせメールアドレスは必須です")
    .email("有効なメールアドレスを入力してください"),
  company_name: string()
    .trim()
    .required("法人名または屋号は必須です")
    .max(100, "法人名または屋号は100文字以内で入力してください"),
  company_name_kana: string()
    .trim()
    .required("法人名または屋号（カナ）は必須です")
    .max(100, "法人名または屋号（カナ）は100文字以内で入力してください")
    .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
  company_name_romaji: string()
    .trim()
    .required("法人名または屋号（ローマ字）は必須です")
    .max(100, "法人名または屋号（ローマ字）は100文字以内で入力してください")
    .matches(/^[a-zA-Z0-9\s.\-,'&()]+$/u, "半角英数字で入力してください"),
  // 法人の場合のみ必須
  tax_id: string()
    .trim()
    .test(
      "tax-id-format",
      "法人番号は13桁の半角数字で入力してください",
      value => !value || /^\d{13}$/u.test(value),
    )
    .test("company-tax-id-required", "法人番号は必須です", (value) => {
      if (businessProfile.value?.business_type !== "company") return true;
      return !!value;
    }),
  // 法人の場合のみ必須
  company_address_kanji: object({
    country: string().trim().optional(),
    postal_code: string().trim().optional(),
    state: string().trim().optional(),
    city: string().trim().optional(),
    town: string().trim().optional().nullable(),
    line1: string().trim().optional(),
    line2: string().trim().optional().nullable(),
  }).test(
    "company-address-kanji-when-company",
    "会社住所（漢字）は必須です",
    function (value) {
      if (businessProfile.value?.business_type !== "company") return true;
      if (!value?.postal_code?.trim())
        return this.createError({ message: "郵便番号は必須です" });
      if (!value?.state?.trim())
        return this.createError({ message: "都道府県は必須です" });
      if (!value?.city?.trim())
        return this.createError({ message: "市区町村は必須です" });
      if (!value?.line1?.trim())
        return this.createError({ message: "番地は必須です" });
      return true;
    },
  ),
  company_address_kana: object({
    country: string().trim().optional(),
    postal_code: string().trim().optional(),
    state: string()
      .trim()
      .optional()
      .matches(/^[ァ-ヶー\s]*$/u, "カタカナで入力してください"),
    city: string()
      .trim()
      .optional()
      .matches(/^[ァ-ヶー\s]*$/u, "カタカナで入力してください"),
    town: string()
      .trim()
      .optional()
      .nullable()
      .matches(/^[ァ-ヶー\s]*$/u, "カタカナで入力してください"),
    line1: string()
      .trim()
      .optional()
      .matches(
        /^[ァ-ヶー０-９0-9\s\-－−・の]*$/u,
        "カタカナ・数字で入力してください",
      ),
  }).test(
    "company-address-kana-when-company",
    "会社住所（カナ）は必須です",
    function (value) {
      if (businessProfile.value?.business_type !== "company") return true;
      if (!value?.postal_code?.trim())
        return this.createError({ message: "郵便番号は必須です" });
      if (!value?.state?.trim())
        return this.createError({ message: "都道府県（カナ）は必須です" });
      if (!value?.city?.trim())
        return this.createError({ message: "市区町村（カナ）は必須です" });
      if (!value?.line1?.trim())
        return this.createError({ message: "番地（カナ）は必須です" });
      if (value?.state && !/^[ァ-ヶー\s]+$/u.test(value.state))
        return this.createError({ message: "カタカナで入力してください" });
      if (value?.city && !/^[ァ-ヶー\s]+$/u.test(value.city))
        return this.createError({ message: "カタカナで入力してください" });
      if (value?.town && !/^[ァ-ヶー\s]+$/u.test(value.town))
        return this.createError({ message: "カタカナで入力してください" });
      if (value?.line1 && !/^[ァ-ヶー０-９0-9\s\-－−・の]+$/u.test(value.line1))
        return this.createError({
          message: "カタカナ・数字で入力してください",
        });
      return true;
    },
  ),
  statement_descriptor: string()
    .trim()
    .max(17, "明細書表記は17文字以内で入力してください")
    .test(
      "statement-descriptor-forbidden",
      "文字 &lt;&lt; &gt;&gt; \\ ' \" * ＊ は使用できません",
      v =>
        !v
        || (!/[<>\\'"*＊]/.test(v) && !v.includes("<<") && !v.includes(">>")),
    )
    .optional(),
  statement_descriptor_kana: string()
    .trim()
    .max(22, "明細書表記（カナ）は22文字以内で入力してください")
    .test(
      "statement-descriptor-kana-chars",
      "カタカナ・ハイフン・ドットのみ使用できます",
      v => !v || v.length === 0 || /^[ァ-ヶー\s\-.]+$/u.test(v),
    )
    .optional(),
  statement_descriptor_romaji: string()
    .trim()
    .max(22, "明細書表記（ローマ字/英字）は22文字以内で入力してください")
    .test(
      "statement-descriptor-length",
      "明細書表記（ローマ字/英字）は5文字以上22文字以内で入力してください",
      v => !v || v.length === 0 || (v.length >= 5 && v.length <= 22),
    )
    .test(
      "statement-descriptor-latin",
      "大文字の半角英数字で入力してください（スペースは不可）。使用できる記号はハイフン・ドットのみです。1文字以上は英字が必要です。",
      (v) => {
        if (!v || v.length === 0) return true;
        if (!/^[A-Z0-9\-.]+$/u.test(v)) return false;
        return /[A-Z]/.test(v);
      },
    )
    .test(
      "statement-descriptor-forbidden",
      "文字 &lt; &gt; \\ ' \" * は使用できません",
      v => !v || !/[<>\\'"*]/.test(v),
    )
    .optional(),
});

// Step 2: 代表者情報
const step2Schema = object({
  last_name_kanji: string()
    .trim()
    .required("姓は必須です")
    .max(50, "姓は50文字以内で入力してください"),
  first_name_kanji: string()
    .trim()
    .required("名は必須です")
    .max(50, "名は50文字以内で入力してください"),
  last_name_kana: string()
    .trim()
    .required("姓（カナ）は必須です")
    .max(50, "姓（カナ）は50文字以内で入力してください")
    .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
  first_name_kana: string()
    .trim()
    .required("名（カナ）は必須です")
    .max(50, "名（カナ）は50文字以内で入力してください")
    .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
  rep_title: string()
    .trim()
    .required("役職は必須です")
    .max(50, "役職は50文字以内で入力してください"),
  rep_email: string()
    .trim()
    .required("メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください"),
  rep_phone: string()
    .trim()
    .required("電話番号は必須です")
    .transform(value =>
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
        date.getFullYear() !== year
        || date.getMonth() !== month - 1
        || date.getDate() !== day
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
    town: string().trim().optional().nullable(),
    line1: string().trim().required("番地は必須です"),
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
    town: string()
      .trim()
      .optional()
      .nullable()
      .matches(/^[ァ-ヶー\s]*$/u, "カタカナで入力してください"),
    line1: string()
      .trim()
      .required("番地（カナ）は必須です")
      .matches(
        /^[ァ-ヶー０-９0-9\s\-－−・の]+$/u,
        "カタカナ・数字で入力してください",
      ),
  }),
  directors: array()
    .of(
      object({
        last_name_kanji: string()
          .trim()
          .required("姓は必須です")
          .max(50, "姓は50文字以内で入力してください"),
        first_name_kanji: string()
          .trim()
          .required("名は必須です")
          .max(50, "名は50文字以内で入力してください"),
        last_name_kana: string()
          .trim()
          .required("姓（カナ）は必須です")
          .max(50, "姓（カナ）は50文字以内で入力してください")
          .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
        first_name_kana: string()
          .trim()
          .required("名（カナ）は必須です")
          .max(50, "名（カナ）は50文字以内で入力してください")
          .matches(/^[ァ-ヶー\s]+$/u, "カタカナで入力してください"),
        title: string()
          .trim()
          .required("役職は必須です")
          .max(50, "役職は50文字以内で入力してください"),
        email: string()
          .trim()
          .required("メールアドレスは必須です")
          .email("有効なメールアドレスを入力してください"),
        phone: string()
          .trim()
          .required("電話番号は必須です")
          .transform(value =>
            typeof value === "string" ? value.replace(/[\s-]/g, "") : value,
          )
          .matches(/^\d{10,11}$/u, "有効な電話番号を入力してください"),
        dob: object({
          year: number()
            .typeError("生年月日は正しい形式で入力してください")
            .required("生年月日は必須です")
            .min(1900, "生年月日は有効な日付を入力してください")
            .max(
              new Date().getFullYear(),
              "生年月日は有効な日付を入力してください",
            ),
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

            const date = new Date(year, month - 1, day);
            if (
              date.getFullYear() !== year
              || date.getMonth() !== month - 1
              || date.getDate() !== day
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
          town: string().trim().optional().nullable(),
          line1: string().trim().required("番地は必須です"),
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
          town: string()
            .trim()
            .optional()
            .nullable()
            .matches(/^[ァ-ヶー\s]*$/u, "カタカナで入力してください"),
          line1: string()
            .trim()
            .required("番地（カナ）は必須です")
            .matches(
              /^[ァ-ヶー０-９0-9\s\-－−・の]+$/u,
              "カタカナ・数字で入力してください",
            ),
        }),
      }),
    )
    .optional()
    .default([]),
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
const { validate: validateStep1Vv, setValues: setStep1Values }
  = useForm<Step1FormData>({
    validationSchema: toTypedSchema(step1Schema),
  });
const { validate: validateStep2Vv, setValues: setStep2Values }
  = useForm<Step2FormData>({
    validationSchema: toTypedSchema(step2Schema),
  });
const { validate: validateStep3Vv, setValues: setStep3Values }
  = useForm<Step3FormData>({
    validationSchema: toTypedSchema(step3Schema),
  });
const { validate: validateStep4Vv, setValues: setStep4Values }
  = useForm<Step4FormData>({
    validationSchema: toTypedSchema(step4Schema),
  });
const { validate: validateStep5Vv, setValues: setStep5Values }
  = useForm<Step5FormData>({
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
        canProceed = await isStepDataValid(
          step1Data.value,
          step1Schema,
          requiredFieldsByStep.value[1],
        );
        break;
      case 2:
        canProceed = await isStepDataValid(
          step2Data.value,
          step2Schema,
          requiredFieldsByStep.value[2],
        );
        break;
      case 3:
        canProceed = await isStepDataValid(
          step3Data.value,
          step3Schema,
          requiredFieldsByStep.value[3],
        );
        break;
      case 4:
        canProceed = await isStepDataValid(
          step4Data.value,
          step4Schema,
          requiredFieldsByStep.value[4],
        );
        break;
      case 5:
        canProceed = await isStepDataValid(
          step5Data.value,
          step5Schema,
          requiredFieldsByStep.value[5],
        );
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
    step => step.number === currentStep.value,
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

    const step1Required = requiredFieldsByStep.value[1];
    const normalizedErrors = normalizeErrorPaths(rslt.errors);
    const filteredErrors = filterErrorsForStep(normalizedErrors, step1Required);
    const isValid
      = !step1Required || step1Required.size === 0
        ? rslt.valid
        : Object.keys(filteredErrors).length === 0;

    if (isValid) {
      const nextStepNumber = getNextStep();
      if (nextStepNumber) {
        await navigateTo(`/stripe/account/${nextStepNumber}`);
      }
      else {
        await submit();
      }
      return;
    }

    const errorsToShow
      = !step1Required || step1Required.size === 0
        ? normalizedErrors
        : filteredErrors;
    for (const [path, msg] of Object.entries(errorsToShow)) {
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

    const step2Required = requiredFieldsByStep.value[2];
    const normalizedErrors = normalizeErrorPaths(rslt.errors);
    const filteredErrors = filterErrorsForStep(normalizedErrors, step2Required);
    const isValid
      = !step2Required || step2Required.size === 0
        ? rslt.valid
        : Object.keys(filteredErrors).length === 0;

    if (isValid) {
      const nextStepNumber = getNextStep();
      if (nextStepNumber) {
        await navigateTo(`/stripe/account/${nextStepNumber}`);
      }
      else {
        await submit();
      }
      return;
    }

    const errorsToShow
      = !step2Required || step2Required.size === 0
        ? normalizedErrors
        : filteredErrors;
    for (const [path, msg] of Object.entries(errorsToShow)) {
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

    const step3Required = requiredFieldsByStep.value[3];
    const normalizedErrors = normalizeErrorPaths(rslt.errors);
    const filteredErrors = filterErrorsForStep(normalizedErrors, step3Required);
    const isValid
      = !step3Required || step3Required.size === 0
        ? rslt.valid
        : Object.keys(filteredErrors).length === 0;

    if (isValid) {
      const nextStepNumber = getNextStep();
      if (nextStepNumber) {
        await navigateTo(`/stripe/account/${nextStepNumber}`);
      }
      else {
        await submit();
      }
      return;
    }

    const errorsToShow
      = !step3Required || step3Required.size === 0
        ? normalizedErrors
        : filteredErrors;
    for (const [path, msg] of Object.entries(errorsToShow)) {
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

    const step4Required = requiredFieldsByStep.value[4];
    const normalizedErrors = normalizeErrorPaths(rslt.errors);
    const filteredErrors = filterErrorsForStep(normalizedErrors, step4Required);
    const isValid
      = !step4Required || step4Required.size === 0
        ? rslt.valid
        : Object.keys(filteredErrors).length === 0;

    if (isValid) {
      const nextStepNumber = getNextStep();
      if (nextStepNumber) {
        await navigateTo(`/stripe/account/${nextStepNumber}`);
      }
      else {
        await submit();
      }
      return;
    }

    const errorsToShow
      = !step4Required || step4Required.size === 0
        ? normalizedErrors
        : filteredErrors;
    for (const [path, msg] of Object.entries(errorsToShow)) {
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

    const step5Required = requiredFieldsByStep.value[5];
    const normalizedErrors = normalizeErrorPaths(rslt.errors);
    const filteredErrors = filterErrorsForStep(normalizedErrors, step5Required);
    const isValid
      = !step5Required || step5Required.size === 0
        ? rslt.valid
        : Object.keys(filteredErrors).length === 0;

    if (!isValid) {
      const errorsToShow
        = !step5Required || step5Required.size === 0
          ? normalizedErrors
          : filteredErrors;
      for (const [path, msg] of Object.entries(errorsToShow)) {
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
  }
  else {
    showErrDialog.value = false; // エラーメッセージがクリアされたらダイアログも閉じる
  }
});

// ステップ遷移時または不足要件更新時に、前のステップの完了状態をチェック
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

  await fetchBusinessProfile();

  // 現在のユーザーIDと保存されているユーザーIDを比較し、異なる場合はデータをクリア
  if (businessProfile.value?.id) {
    checkAndClearIfDifferentUser(businessProfile.value.id);
  }

  try {
    // Stripeから不足している要件を取得
    const rslt = await analyzeAccountRequirements();
    if (rslt) {
      requiredSteps.value = rslt.steps;
      requiredFieldsByStep.value = rslt.fieldsByStep;
    }
    else {
      // 不足要件が取得できない、または空の場合
      // Stripeアカウントが存在しない場合は全ステップを表示
      // 既にStripeアカウントが存在する場合は要件が満たされていると判断が、念のため同様に全ステップを表示
      if (!businessProfile.value?.has_stripe_account) {
        requiredSteps.value = new Set([1, 2, 3, 4, 5]);
      }
      else {
        requiredSteps.value = new Set([1, 2, 3, 4, 5]);
      }
    }
  }
  catch (error) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("不足要件の取得に失敗しました:", error);
    }
    // 安全側に倒して全ステップを表示
    requiredSteps.value = new Set([1, 2, 3, 4, 5]);
  }

  await checkStepAccess();
  isPageLoading.value = false;
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
