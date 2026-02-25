import { useCsrf } from "~/composables/useCsrf";

// Stripeフィールド名とフォームフィールドのマッピング
export const stripeFieldMapping: Record<
  string,
  { step: number; field: string }
> = {
  // Step1: 事業者情報
  "tos_acceptance": { step: 1, field: "accept_tos" },
  "tos_acceptance.date": { step: 1, field: "accept_tos" },
  "tos_acceptance.ip": { step: 1, field: "accept_tos" },
  "tos_acceptance.user_agent": { step: 1, field: "accept_tos" },
  "business_profile.support_email": {
    step: 1,
    field: "support_email",
  },
  "business_profile.name": { step: 1, field: "company_name" },
  "business_profile.name_kana": { step: 1, field: "company_name_kana" },
  "business_profile.address_kanji": {
    step: 1,
    field: "company_address_kanji",
  },
  "business_profile.address_kana": {
    step: 1,
    field: "company_address_kana",
  },
  "business_profile.address_kanji.postal_code": {
    step: 1,
    field: "company_address_kanji.postal_code",
  },
  "business_profile.address_kanji.state": {
    step: 1,
    field: "company_address_kanji.state",
  },
  "business_profile.address_kanji.city": {
    step: 1,
    field: "company_address_kanji.city",
  },
  "business_profile.address_kanji.line1": {
    step: 1,
    field: "company_address_kanji.line1",
  },
  "business_profile.address_kanji.line2": {
    step: 1,
    field: "company_address_kanji.line2",
  },
  "business_profile.address_kana.postal_code": {
    step: 1,
    field: "company_address_kana.postal_code",
  },
  "business_profile.address_kana.state": {
    step: 1,
    field: "company_address_kana.state",
  },
  "business_profile.address_kana.city": {
    step: 1,
    field: "company_address_kana.city",
  },
  "business_profile.address_kana.line1": {
    step: 1,
    field: "company_address_kana.line1",
  },
  "company.name": { step: 1, field: "company_name_romaji" },
  "company.name_kanji": { step: 1, field: "company_name" },
  "company.name_kana": { step: 1, field: "company_name_kana" },
  "company.phone": { step: 2, field: "rep_phone" },
  "company.tax_id": { step: 1, field: "tax_id" },
  "company.address_kanji": { step: 1, field: "company_address_kanji" },
  "company.address_kana": { step: 1, field: "company_address_kana" },
  "company.address.country": {
    step: 1,
    field: "company_address_kanji.country",
  },
  "company.address.postal_code": {
    step: 1,
    field: "company_address_kanji.postal_code",
  },
  "company.address.state": {
    step: 1,
    field: "company_address_kanji.state",
  },
  "company.address.city": {
    step: 1,
    field: "company_address_kanji.city",
  },
  "company.address.line1": {
    step: 1,
    field: "company_address_kanji.line1",
  },
  "company.address.line2": {
    step: 1,
    field: "company_address_kanji.line2",
  },
  "company.address_kanji.postal_code": {
    step: 1,
    field: "company_address_kanji.postal_code",
  },
  "company.address_kanji.state": {
    step: 1,
    field: "company_address_kanji.state",
  },
  "company.address_kanji.city": {
    step: 1,
    field: "company_address_kanji.city",
  },
  "company.address_kanji.town": {
    step: 1,
    field: "company_address_kanji.town",
  },
  "company.address_kanji.line1": {
    step: 1,
    field: "company_address_kanji.line1",
  },
  "company.address_kanji.line2": {
    step: 1,
    field: "company_address_kanji.line2",
  },
  "company.address_kana.postal_code": {
    step: 1,
    field: "company_address_kana.postal_code",
  },
  "company.address_kana.state": {
    step: 1,
    field: "company_address_kana.state",
  },
  "company.address_kana.city": {
    step: 1,
    field: "company_address_kana.city",
  },
  "company.address_kana.town": {
    step: 1,
    field: "company_address_kana.town",
  },
  "company.address_kana.line1": {
    step: 1,
    field: "company_address_kana.line1",
  },
  "company.directors_provided": { step: 2, field: "directors" },
  "directors": { step: 2, field: "directors" },

  // Step2: 代表者情報
  "individual.first_name_kanji": { step: 2, field: "first_name_kanji" },
  "individual.last_name_kanji": { step: 2, field: "last_name_kanji" },
  "individual.first_name_kana": { step: 2, field: "first_name_kana" },
  "individual.last_name_kana": { step: 2, field: "last_name_kana" },
  "individual.email": { step: 2, field: "rep_email" },
  "individual.phone": { step: 2, field: "rep_phone" },
  "individual.dob": { step: 2, field: "rep_dob" },
  "individual.address_kanji.country": {
    step: 2,
    field: "address_kanji.country",
  },
  "individual.address_kanji.postal_code": {
    step: 2,
    field: "address_kanji.postal_code",
  },
  "individual.address_kanji.state": { step: 2, field: "address_kanji.state" },
  "individual.address_kanji.city": { step: 2, field: "address_kanji.city" },
  "individual.address_kanji.town": { step: 2, field: "address_kanji.town" },
  "individual.address_kanji.line1": { step: 2, field: "address_kanji.line1" },
  "individual.address_kanji.line2": { step: 2, field: "address_kanji.line2" },
  "individual.address_kana.postal_code": {
    step: 2,
    field: "address_kana.postal_code",
  },
  "individual.address_kana.state": { step: 2, field: "address_kana.state" },
  "individual.address_kana.city": { step: 2, field: "address_kana.city" },
  "individual.address_kana.town": { step: 2, field: "address_kana.town" },
  "individual.address_kana.line1": { step: 2, field: "address_kana.line1" },

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
};

// Stripeから不足している要件を取得する関数
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

    const res = await fetch(
      `${apiBase}/api/business/stripe/custom/requirements`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
        },
      },
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return {
      currently_due: data.currently_due || [],
      eventually_due: data.eventually_due || [],
      past_due: data.past_due || [],
    };
  }
  catch {
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
          stripeField.startsWith(stripeKey + ".")
          || stripeKey.startsWith(stripeField + ".")
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
    // "verification.document.*" と "individual.verification.document.*" の両方に対応
    if (stripeField.includes("verification.document")) {
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

    // directorsの特別処理
    if (stripeField.startsWith("directors.")) {
      steps.add(2);
      const stepFields = fieldsByStep[2];
      if (stepFields) {
        stepFields.add("directors");
      }
    }

    // person_***の特別処理（代表者/取締役の不足）
    // Stripeは person_<動的ID>.フィールド名 の形式で要件を返すため、
    // person_ で始まるすべての要件を Step2 に誘導する。
    if (stripeField.startsWith("person_")) {
      if (stripeField.includes("verification.document")) {
        // person の本人確認書類は Step5 に誘導（取締役セクションは表示しない）
        steps.add(5);
        const step5Fields = fieldsByStep[5];
        if (step5Fields) {
          if (stripeField.includes("front")) {
            step5Fields.add("document_front");
          }
          if (stripeField.includes("back")) {
            step5Fields.add("document_back");
          }
        }
      }
      else {
        // 代表者・取締役どちらの不足か不明なため、取締役セクションも表示
        steps.add(2);
        const stepFields = fieldsByStep[2];
        if (stepFields) {
          stepFields.add("directors");

          if (stripeField.includes("relationship")) {
            stepFields.add("rep_title");
            stepFields.add("directors.title");
          }
          else if (stripeField.includes("first_name")) {
            stepFields.add("first_name_kanji");
            stepFields.add("first_name_kana");
          }
          else if (stripeField.includes("last_name")) {
            stepFields.add("last_name_kanji");
            stepFields.add("last_name_kana");
          }
          else if (stripeField.includes("phone")) {
            stepFields.add("rep_phone");
          }
          else if (stripeField.includes("email")) {
            stepFields.add("rep_email");
          }
          else if (stripeField.includes("dob")) {
            stepFields.add("rep_dob");
          }
          else if (stripeField.includes("address_kanji")) {
            stepFields.add("address_kanji");
          }
          else if (stripeField.includes("address_kana")) {
            stepFields.add("address_kana");
          }
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
