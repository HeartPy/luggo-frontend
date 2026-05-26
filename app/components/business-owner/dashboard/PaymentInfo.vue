<template>
  <div>
    <CommonAtomsLoadingAnimation
      v-if="isLoading"
      size="md"
    />

    <div
      v-else-if="error"
      class="p-8 text-center text-red-600"
    >
      {{ error }}
    </div>

    <div
      v-else-if="!hasStripeAccount"
      class="p-8 text-sm text-gray-500"
    >
      決済についての設定が未設定です。
    </div>

    <div
      v-else-if="stripeIsUnderReview"
      class="p-8 text-sm text-yellow-800"
    >
      ただいま決済情報の審査中です。審査完了までお待ちください。
    </div>

    <div
      v-else-if="stripeHasPastDue"
      class="p-8 text-sm text-red-700"
    >
      <NuxtLink
        to="/stripe/account"
        class="text-blue-600 underline hover:text-blue-800"
      >
        こちら
      </NuxtLink>
      から再度入力情報をお確かめのうえ、決済の設定を行なってください。
    </div>

    <div
      v-else-if="account"
      class="mx-auto max-w-3xl space-y-10 px-6 py-8"
    >
      <!-- アカウント状態 -->
      <section>
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          アカウント状態
        </h2>
        <dl class="space-y-4">
          <div class="flex items-start gap-4">
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              決済
            </dt>
            <dd>
              <span
                class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  account.charges_enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                "
              >
                {{ account.charges_enabled ? "有効" : "無効" }}
              </span>
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              振込
            </dt>
            <dd>
              <span
                class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  account.payouts_enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                "
              >
                {{ account.payouts_enabled ? "有効" : "無効" }}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <!-- 事業者情報（Stripe） -->
      <section>
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          事業者情報
        </h2>
        <dl class="space-y-4">
          <div
            v-if="stripeBusinessProfile.support_email"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              メールアドレス
            </dt>
            <dd class="text-gray-900">
              {{ stripeBusinessProfile.support_email }}
            </dd>
          </div>
          <div
            v-if="stripeBusinessProfile.product_description"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              事業内容
            </dt>
            <dd class="whitespace-pre-wrap text-gray-900">
              {{ stripeBusinessProfile.product_description }}
            </dd>
          </div>
          <div
            v-if="companyAddress"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              事業所在地
            </dt>
            <dd class="whitespace-pre-line text-gray-900">
              {{ companyAddress }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- 明細書表記 -->
      <section v-if="hasStatementDescriptor">
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          明細書表記
        </h2>
        <dl class="space-y-4">
          <div
            v-if="account.settings?.payments?.statement_descriptor_kanji"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              明細書表記
            </dt>
            <dd class="text-gray-900">
              {{ account.settings.payments.statement_descriptor_kanji }}
            </dd>
          </div>
          <div
            v-if="account.settings?.payments?.statement_descriptor_kana"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              カナ
            </dt>
            <dd class="text-gray-900">
              {{ account.settings.payments.statement_descriptor_kana }}
            </dd>
          </div>
          <div
            v-if="account.settings?.payments?.statement_descriptor"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              ローマ字 / 英字
            </dt>
            <dd class="text-gray-900">
              {{ account.settings.payments.statement_descriptor }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- 代表者情報 -->
      <section v-if="representative">
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          代表者情報
        </h2>
        <dl class="space-y-4">
          <div
            v-if="repName"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              氏名
            </dt>
            <dd class="text-gray-900">
              {{ repName }}
            </dd>
          </div>
          <div
            v-if="representative.relationship?.title"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              役職
            </dt>
            <dd class="text-gray-900">
              {{ representative.relationship.title }}
            </dd>
          </div>
          <div
            v-if="representative.email"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              メールアドレス
            </dt>
            <dd class="text-gray-900">
              {{ representative.email }}
            </dd>
          </div>
          <div
            v-if="representative.phone"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              電話番号
            </dt>
            <dd class="text-gray-900">
              {{ formatPhone(representative.phone) }}
            </dd>
          </div>
          <div
            v-if="repDob"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              生年月日
            </dt>
            <dd class="text-gray-900">
              {{ repDob }}
            </dd>
          </div>
          <div
            v-if="repAddress"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              住所
            </dt>
            <dd class="whitespace-pre-line text-gray-900">
              {{ repAddress }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- 取締役情報 -->
      <section v-if="directors.length">
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          取締役情報
        </h2>
        <div
          v-for="(director, idx) in directors"
          :key="director.id ?? idx"
          class="mb-6 last:mb-0"
        >
          <h3
            v-if="directors.length > 1"
            class="mb-2 text-sm font-semibold text-gray-500"
          >
            取締役 {{ idx + 1 }}
          </h3>
          <dl class="space-y-4">
            <div
              v-if="directorName(director)"
              class="flex items-start gap-4"
            >
              <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
                氏名
              </dt>
              <dd class="text-gray-900">
                {{ directorName(director) }}
              </dd>
            </div>
            <div
              v-if="director.relationship?.title"
              class="flex items-start gap-4"
            >
              <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
                役職
              </dt>
              <dd class="text-gray-900">
                {{ director.relationship.title }}
              </dd>
            </div>
            <div
              v-if="director.email"
              class="flex items-start gap-4"
            >
              <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
                メールアドレス
              </dt>
              <dd class="text-gray-900">
                {{ director.email }}
              </dd>
            </div>
            <div
              v-if="director.phone"
              class="flex items-start gap-4"
            >
              <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
                電話番号
              </dt>
              <dd class="text-gray-900">
                {{ formatPhone(director.phone) }}
              </dd>
            </div>
            <div
              v-if="directorDob(director)"
              class="flex items-start gap-4"
            >
              <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
                生年月日
              </dt>
              <dd class="text-gray-900">
                {{ directorDob(director) }}
              </dd>
            </div>
            <div
              v-if="directorAddress(director)"
              class="flex items-start gap-4"
            >
              <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
                住所
              </dt>
              <dd class="whitespace-pre-line text-gray-900">
                {{ directorAddress(director) }}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- 銀行口座情報 -->
      <section v-if="bankAccount">
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          銀行口座情報
        </h2>
        <dl class="space-y-4">
          <div
            v-if="bankAccount.bank_name"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              銀行名
            </dt>
            <dd class="text-gray-900">
              {{ bankAccount.bank_name }}
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              口座の種類
            </dt>
            <dd class="text-gray-900">
              {{ bankAccountTypeLabel }}
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              口座番号（下4桁）
            </dt>
            <dd class="text-gray-900">
              ****{{ bankAccount.last4 }}
            </dd>
          </div>
          <div
            v-if="bankAccount.account_holder_name"
            class="flex items-start gap-4"
          >
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              口座名義
            </dt>
            <dd class="text-gray-900">
              {{ bankAccount.account_holder_name }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- 本人確認書類 -->
      <section>
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          本人確認書類
        </h2>
        <dl class="space-y-4">
          <div class="flex items-start gap-4">
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              本人確認書類の表（前面）
            </dt>
            <dd>
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                :class="docFrontStatus.cls"
              >
                {{ docFrontStatus.label }}
              </span>
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-44 shrink-0 text-sm font-semibold text-gray-600">
              本人確認書類の裏（背面）
            </dt>
            <dd>
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                :class="docBackStatus.cls"
              >
                {{ docBackStatus.label }}
              </span>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useCsrf } from "~/composables/useCsrf";

/* eslint-disable @typescript-eslint/no-explicit-any */
type StripeAccount = Record<string, any>;
type StripePerson = Record<string, any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

const { businessProfile, fetchBusinessProfile } = useBusinessProfile();
const { ensureCsrf, getCsrf } = useCsrf();
const { isUnderReview: stripeIsUnderReview, hasPastDue: stripeHasPastDue }
  = useOnboardingBar();

const isLoading = ref(true);
const error = ref<string | null>(null);
const account = ref<StripeAccount | null>(null);
const persons = ref<StripePerson[]>([]);

const hasStripeAccount = computed(
  () => businessProfile.value?.has_stripe_account === true,
);

const fetchAccount = async () => {
  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    await ensureCsrf(apiBase);

    const res = await fetch(`${apiBase}/api/business/stripe/custom/account`, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
    });

    if (!res.ok) {
      error.value = "決済情報の取得に失敗しました。";
      return;
    }

    const data = await res.json();
    account.value = data.account ?? null;
    persons.value = data.persons ?? [];
  }
  catch {
    error.value = "決済情報の取得に失敗しました。";
  }
};

onMounted(async () => {
  try {
    await fetchBusinessProfile();
    if (hasStripeAccount.value) {
      await fetchAccount();
    }
  }
  finally {
    isLoading.value = false;
  }
});

const stripeBusinessProfile = computed(
  () => account.value?.business_profile ?? {},
);

/** +81 形式の国際電話番号を 0 始まりの国内表記に変換 */
const formatPhone = (phone: string | undefined): string => {
  if (!phone) return "";
  if (phone.startsWith("+81")) {
    return `0${phone.slice(3)}`;
  }
  return phone;
};

/** 郵便番号の全角数字・ハイフンを半角に揃える */
const toHalfWidthPostal = (value: string): string => {
  if (!value) return "";
  return value
    .replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/－/g, "-");
};

/** 7桁の郵便番号を 123-4567 形式に整形 */
const formatJapanesePostal = (value: string | undefined): string => {
  const half = toHalfWidthPostal(value ?? "").trim();
  const digits = half.replace(/\D/g, "");
  if (digits.length === 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return half;
};

const formatAddressWithPostal = (
  postalCode: string | undefined,
  parts: string[],
): string | null => {
  const postal = formatJapanesePostal(postalCode);
  const rest = parts.filter(Boolean).join("");
  if (!postal && !rest) return null;
  if (!postal) return rest;
  if (!rest) return `〒${postal}`;
  return `〒${postal}\n${rest}`;
};

// 法人: company.address_kanji、個人: individual.address_kanji
const companyAddress = computed(() => {
  const bt = account.value?.business_type;
  const addr
    = bt === "company"
      ? account.value?.company?.address_kanji
      : account.value?.individual?.address_kanji;
  if (!addr) return null;
  const parts = [addr.state, addr.city, addr.town, addr.line1, addr.line2];
  return formatAddressWithPostal(addr.postal_code, parts);
});

// 法人: Persons API の representative、個人: individual
const representative = computed(() => {
  const bt = account.value?.business_type;
  if (bt === "individual") return account.value?.individual ?? null;
  return (
    persons.value.find(person => person.relationship?.representative) ?? null
  );
});

const directors = computed(() =>
  persons.value
    .filter(
      person =>
        person.relationship?.director && !person.relationship?.representative,
    )
    .sort((a, b) => (a.created ?? 0) - (b.created ?? 0)),
);

const directorName = (person: StripePerson): string => {
  const last = person.last_name_kanji ?? "";
  const first = person.first_name_kanji ?? "";
  return last || first ? `${last} ${first}`.trim() : "";
};

const directorDob = (person: StripePerson): string => {
  const dob = person.dob;
  if (!dob || !dob.year) return "";
  return `${dob.year}年${dob.month}月${dob.day}日`;
};

const directorAddress = (person: StripePerson): string => {
  const addr = person.address_kanji;
  if (!addr) return "";
  const parts = [addr.state, addr.city, addr.town, addr.line1, addr.line2];
  return formatAddressWithPostal(addr.postal_code, parts) ?? "";
};

const repName = computed(() => {
  const r = representative.value;
  if (!r) return "";
  const last = r.last_name_kanji ?? "";
  const first = r.first_name_kanji ?? "";
  return last || first ? `${last} ${first}`.trim() : "";
});

const repDob = computed(() => {
  const dob = representative.value?.dob;
  if (!dob || !dob.year) return "";
  return `${dob.year}年${dob.month}月${dob.day}日`;
});

const repAddress = computed(() => {
  const addr = representative.value?.address_kanji;
  if (!addr) return "";
  const parts = [addr.state, addr.city, addr.town, addr.line1, addr.line2];
  return formatAddressWithPostal(addr.postal_code, parts) ?? "";
});

type DocStatusInfo = { label: string; cls: string };

// business_type に応じて正しい verification を参照する
// 法人の場合は代表者 person の verification を使用
const verification = computed(() => {
  const bt = account.value?.business_type;
  if (bt === "company") {
    return representative.value?.verification ?? null;
  }
  return account.value?.individual?.verification ?? null;
});

// charges_enabled + requirements が空 → アカウント全体が審査完了
const isAccountFullyVerified = computed(() => {
  const acc = account.value;
  if (!acc) return false;
  return (
    acc.charges_enabled === true
    && acc.payouts_enabled === true
    && (acc.requirements?.currently_due?.length ?? 0) === 0
    && (acc.requirements?.past_due?.length ?? 0) === 0
  );
});

/**
 * 本人確認書類の審査状態を整形する。
 * Stripe は審査完了後にファイル ID をクリアするため、
 * アカウント全体の状態も合わせて判定する。
 */
const resolveDocStatus = (
  fileId: string | null | undefined,
  detailsCode: string | null | undefined,
  verificationStatus: string | null | undefined,
): DocStatusInfo => {
  if (verificationStatus === "verified" || isAccountFullyVerified.value) {
    return { label: "審査完了", cls: "bg-green-100 text-green-800" };
  }
  if (detailsCode) {
    return { label: "審査エラー", cls: "bg-red-100 text-red-700" };
  }
  if (fileId) {
    return { label: "審査中", cls: "bg-yellow-100 text-yellow-800" };
  }
  return { label: "未提出", cls: "bg-gray-100 text-gray-600" };
};

const docFrontStatus = computed<DocStatusInfo>(() => {
  const verif = verification.value;
  return resolveDocStatus(
    verif?.document?.front,
    verif?.document?.details_code,
    verif?.status,
  );
});

const docBackStatus = computed<DocStatusInfo>(() => {
  const verif = verification.value;
  return resolveDocStatus(
    verif?.document?.back,
    verif?.document?.details_code,
    verif?.status,
  );
});

const bankAccount = computed(() => {
  const extAcc = account.value?.external_accounts;
  if (!extAcc?.data?.length) return null;
  return extAcc.data[0];
});

const BANK_ACCOUNT_TYPE_LABELS: Record<string, string> = {
  futsu: "普通預金",
  toza: "当座預金",
  checking: "当座預金",
  savings: "普通預金",
};

const bankAccountTypeLabel = computed(() => {
  const accType = bankAccount.value?.account_type;
  if (!accType || typeof accType !== "string") {
    return "未設定";
  }
  return BANK_ACCOUNT_TYPE_LABELS[accType] ?? accType;
});

const hasStatementDescriptor = computed(() => {
  const payments = account.value?.settings?.payments;
  if (!payments) return false;
  return !!(
    payments.statement_descriptor
    || payments.statement_descriptor_kanji
    || payments.statement_descriptor_kana
  );
});
</script>
