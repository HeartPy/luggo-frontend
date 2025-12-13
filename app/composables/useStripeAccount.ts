import { useCsrf } from "~/composables/useCsrf";

// Stripeフィールド名とフォームフィールドのマッピング
export const stripeFieldMapping: Record<
  string,
  { step: number; field: string }
> = {
  // Step1: ビジネス情報/会社情報
  "business_profile.name": {
    step: 1,
    field: "product_name",
  },
  "business_profile.support_email": {
    step: 1,
    field: "support_email",
  },
  "company.name": { step: 1, field: "company_name" },
  "company.address.country": {
    step: 1,
    field: "company_address.country",
  },
  "company.address.postal_code": {
    step: 1,
    field: "company_address.postal_code",
  },
  "company.address.state": {
    step: 1,
    field: "company_address.state",
  },
  "company.address.line1": {
    step: 1,
    field: "company_address.line1",
  },
  "company.address.line2": {
    step: 1,
    field: "company_address.line2",
  },
  // Step2: 代表者情報
  "individual.first_name_kanji": { step: 2, field: "first_name_kanji" },
  "individual.last_name_kanji": { step: 2, field: "last_name_kanji" },
  "individual.first_name_kana": { step: 2, field: "first_name_kana" },
  "individual.last_name_kana": { step: 2, field: "last_name_kana" },
  "individual.email": { step: 2, field: "rep_email" },
  "individual.phone": { step: 2, field: "rep_phone" },
  "individual.dob": { step: 2, field: "rep_dob" },
  "individual.address_kanji.country": { step: 2, field: "rep_address.country" },
  "individual.address_kanji.postal_code": {
    step: 2,
    field: "rep_address.postal_code",
  },
  "individual.address_kanji.state": { step: 2, field: "rep_address.state" },
  "individual.address_kanji.city": { step: 2, field: "rep_address.city" },
  "individual.address_kanji.line1": { step: 2, field: "rep_address.line1" },
  "individual.address_kanji.line2": { step: 2, field: "rep_address.line2" },
  "individual.address_kana.postal_code": {
    step: 2,
    field: "rep_address.postal_code",
  },
  "individual.address_kana.state": { step: 2, field: "rep_address.state_kana" },
  "individual.address_kana.city": { step: 2, field: "rep_address.city_kana" },
  "individual.address_kana.line1": { step: 2, field: "rep_address.line1_kana" },
  // Step3: 銀行口座情報
  // prettier-ignore
  "external_account": { step: 3, field: "bank_info" },
  // Step4: 事業詳細
  "business_profile.url": { step: 4, field: "product_url" },
  "business_profile.product_description": {
    step: 4,
    field: "product_description",
  },
  "business_profile.mcc": { step: 4, field: "product_mcc" },
  // Step5: 本人確認書類
  "verification.document.front": { step: 5, field: "document_front" },
  "verification.document.back": { step: 5, field: "document_back" },
  "verification.address_kana": { step: 5, field: "address_kana" },
};

// 認証状態を確認する関数
export const checkAuthentication = async (): Promise<boolean> => {
  if (!import.meta.client) return false;

  const { ensureCsrf, getCsrf } = useCsrf();

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    await ensureCsrf(apiBase);

    const res = await fetch(`${apiBase}/api/business/stripe/custom/account`, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
      },
    });

    return res.ok;
  } catch {
    return false;
  }
};

// アカウントを確保する関数（認証状態も返す）
export const ensureAccount = async (): Promise<boolean> => {
  const { ensureCsrf, getCsrf } = useCsrf();
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBaseUrl;
  await ensureCsrf(apiBase);

  // ログイン済みの場合はアカウント作成は不要（既にBusinessProfileに保存されている）
  const isAuthenticated = await checkAuthentication();
  if (isAuthenticated) {
    return true;
  }

  // 未ログインの場合のみセッション用アカウントを作成
  await fetch(
    `${apiBase}/api/business/public/stripe/custom/create-or-get-account`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
      },
    },
  );

  return false;
};

// 審査結果を取得する関数
const fetchAccountRequirements = async (): Promise<{
  currently_due: string[];
  eventually_due: string[];
  past_due: string[];
} | null> => {
  const { ensureCsrf, getCsrf } = useCsrf();

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    await ensureCsrf(apiBase);

    const isAuthenticated = await checkAuthentication();
    const endpoint = isAuthenticated
      ? `${apiBase}/api/business/stripe/custom/requirements`
      : `${apiBase}/api/business/public/stripe/custom/requirements`;

    const res = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return {
      currently_due: data.currently_due || [],
      eventually_due: data.eventually_due || [],
      past_due: data.past_due || [],
    };
  } catch {
    return null;
  }
};

// Stripeのフィールド名（例: "individual.first_name_kanji"）を
// アプリケーションのステップ番号とフォームフィールド名にマッピングする関数
const analyzeStripeFields = (
  neededFields: Set<string>,
): {
  steps: Set<number>;
  fieldsByStep: Record<number, Set<string>>;
} => {
  const steps = new Set<number>();
  const fieldsByStep: Record<number, Set<string>> = {
    1: new Set(),
    2: new Set(),
    3: new Set(),
    4: new Set(),
    5: new Set(),
  };

  neededFields.forEach((stripeField) => {
    // フィールド名のマッチング（完全一致を優先、部分一致も考慮）
    let matched = false;

    // まず完全一致をチェック
    for (const [stripeKey, mapping] of Object.entries(stripeFieldMapping)) {
      if (stripeField === stripeKey) {
        steps.add(mapping.step);
        const stepFields = fieldsByStep[mapping.step];
        if (stepFields) {
          stepFields.add(mapping.field);
        }
        matched = true;
        break;
      }
    }

    // 完全一致がない場合のみ部分一致をチェック
    if (!matched) {
      for (const [stripeKey, mapping] of Object.entries(stripeFieldMapping)) {
        if (
          stripeField.startsWith(stripeKey + ".") ||
          stripeKey.startsWith(stripeField + ".")
        ) {
          steps.add(mapping.step);
          const stepFields = fieldsByStep[mapping.step];
          if (stepFields) {
            stepFields.add(mapping.field);
          }
          break;
        }
      }
    }

    // external_accountの特別処理
    if (stripeField.startsWith("external_account")) {
      steps.add(3);
      const stepFields = fieldsByStep[3];
      if (stepFields) {
        stepFields.add("bank_info");
      }
    }

    // verification.documentの特別処理
    if (stripeField.startsWith("verification.document")) {
      steps.add(5);
      const stepFields = fieldsByStep[5];
      if (stepFields) {
        if (stripeField.includes("front")) {
          stepFields.add("document_front");
        }
        if (stripeField.includes("back")) {
          stepFields.add("document_back");
        }
      }
    }
  });

  return { steps, fieldsByStep };
};

// currently_due、eventually_due、past_dueを統合して必要なフィールドのSetを作成する関数
const getNeededFields = async (): Promise<Set<string> | null> => {
  const requirements = await fetchAccountRequirements();
  if (!requirements) {
    return null;
  }

  const neededFields = new Set([
    ...requirements.currently_due,
    ...requirements.eventually_due,
    ...requirements.past_due,
  ]);

  return neededFields.size === 0 ? null : neededFields;
};

// 必要なステップ番号のSetと各ステップごとの必須フィールドのMapを返す関数
export const analyzeAccountRequirements = async (): Promise<{
  steps: Set<number>;
  fieldsByStep: Record<number, Set<string>>;
} | null> => {
  const neededFields = await getNeededFields();
  if (!neededFields) {
    return null;
  }

  const { steps, fieldsByStep } = analyzeStripeFields(neededFields);
  return steps.size === 0 ? null : { steps, fieldsByStep };
};

// analyzeAccountRequirements()が返す必要なステップ番号のSetの中から
// 最小のステップ番号（最初に完了すべきステップ）を返す関数
export const determineFirstRequiredStep = async (): Promise<number> => {
  const rslt = await analyzeAccountRequirements();
  if (!rslt) {
    return 1;
  }

  const sortedSteps = Array.from(rslt.steps).sort((a, b) => a - b);
  return sortedSteps[0] ?? 1;
};
