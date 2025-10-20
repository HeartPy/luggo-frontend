<template>
  <div class="min-h-screen py-8 md:py-8">
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12">
        アカウント登録
      </h1>
      <p class="mb-6 text-gray-600">
        このページでは、Stripe Customアカウントを作成します。
      </p>

      <div
        v-if="errorMessage"
        class="mb-4 text-red-600"
        role="alert"
        aria-live="polite"
      >
        {{ errorMessage }}
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="inline-flex items-center gap-2">
            <input v-model="acceptTos" type="checkbox" class="h-4 w-4" />
            <span class="text-sm text-gray-700"
              >Stripeの利用規約に同意します</span
            >
          </label>
        </div>

        <div class="md:col-span-2">
          <h2 class="mb-2 text-lg font-semibold">ビジネス情報</h2>
          <label class="mb-1 block text-sm font-medium"
            >ビジネス名（公開）</label
          >
          <input
            v-model="businessProfile.name"
            type="text"
            class="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
          <label class="mb-1 mt-3 block text-sm font-medium"
            >サポートメール</label
          >
          <input
            v-model="businessProfile.support_email"
            type="email"
            class="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div class="md:col-span-2">
          <h2 class="mb-2 text-lg font-semibold">会社情報</h2>
          <label class="mb-1 block text-sm font-medium">法人名（登記名）</label>
          <input
            v-model="company.name"
            type="text"
            class="w-full rounded border border-gray-300 px-3 py-2"
            required
          />

          <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium">国コード</label>
              <input
                v-model="company.address.country"
                type="text"
                class="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="JP"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">郵便番号</label>
              <input
                v-model="company.address.postal_code"
                type="text"
                class="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">都道府県</label>
              <input
                v-model="company.address.state"
                type="text"
                class="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-medium"
                >市区町村・番地</label
              >
              <input
                v-model="company.address.line1"
                type="text"
                class="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium"
                >建物名・部屋番号</label
              >
              <input
                v-model="company.address.line2"
                type="text"
                class="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 md:col-span-2">
          <button
            :disabled="loading || !acceptTos"
            class="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            @click="submit"
          >
            Stripeアカウントを作成
          </button>
        </div>

        <div class="md:col-span-2">
          <h2 class="mb-2 text-lg font-semibold">未完了の要件</h2>
          <ul
            v-if="requirements.currently_due.length"
            class="list-inside list-disc text-sm text-gray-700"
          >
            <li v-for="item in requirements.currently_due" :key="item">
              {{ item }}
            </li>
          </ul>
          <p v-else class="text-sm text-gray-600">
            現在、提出すべき項目はありません。
          </p>
          <p
            v-if="requirements.disabled_reason"
            class="mt-2 text-sm text-red-600"
          >
            状態: {{ requirements.disabled_reason }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRuntimeConfig } from "nuxt/app";

const loading = ref(false);
const errorMessage = ref("");
const acceptTos = ref(false);

type Requirements = {
  currently_due: string[];
  eventually_due: string[];
  past_due: string[];
  disabled_reason?: string | null;
};

const requirements = ref<Requirements>({
  currently_due: [],
  eventually_due: [],
  past_due: [],
  disabled_reason: null,
});

type BusinessProfile = {
  name: string;
  support_email?: string;
};

type Address = {
  country?: string;
  postal_code?: string;
  state?: string;
  line1?: string;
  line2?: string;
};

type Company = {
  name: string;
  address: Address;
};

const businessProfile = reactive<BusinessProfile>({ name: "" });
const company = reactive<Company>({ name: "", address: { country: "JP" } });

async function ensureCsrf(apiBase: string): Promise<void> {
  await fetch(`${apiBase}/api/accounts/csrf`, { credentials: "include" });
}

function getCsrf(): string | undefined {
  const m = document.cookie.split("; ").find((c) => c.startsWith("csrftoken="));
  return m ? m.split("=")[1] : undefined;
}

async function ensureAccount(): Promise<void> {
  const config = useRuntimeConfig();
  const apiBase = String(
    (config as { public: { apiBaseUrl?: string } }).public.apiBaseUrl || "",
  ).replace(/\/$/, "");
  await ensureCsrf(apiBase);
  await fetch(
    `${apiBase}/api/accounts/public/stripe/custom/create-or-get-account`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
      },
    },
  );
}

async function refreshRequirements(): Promise<void> {
  const config = useRuntimeConfig();
  const apiBase = String(
    (config as { public: { apiBaseUrl?: string } }).public.apiBaseUrl || "",
  ).replace(/\/$/, "");
  const res = await fetch(
    `${apiBase}/api/accounts/public/stripe/custom/requirements`,
    { credentials: "include" },
  );
  const body: Partial<Requirements> & { error?: string } = await res
    .json()
    .catch(
      (): Partial<Requirements> & { error?: string } =>
        ({}) as Partial<Requirements> & { error?: string },
    );
  if (res.ok) {
    requirements.value.currently_due = body.currently_due || [];
    requirements.value.eventually_due = body.eventually_due || [];
    requirements.value.past_due = body.past_due || [];
    requirements.value.disabled_reason = body.disabled_reason || null;
  }
}

async function submit(): Promise<void> {
  loading.value = true;
  errorMessage.value = "";
  try {
    const config = useRuntimeConfig();
    const apiBase = String(
      (config as { public: { apiBaseUrl?: string } }).public.apiBaseUrl || "",
    ).replace(/\/$/, "");
    await ensureAccount();
    const res = await fetch(
      `${apiBase}/api/accounts/public/stripe/custom/update-account`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
        },
        body: JSON.stringify({
          business_profile: businessProfile,
          company,
          tos: { user_agent: navigator.userAgent },
        }),
      },
    );
    const body: { error?: string } = await res
      .json()
      .catch((): { error?: string } => ({}));
    if (!res.ok) {
      throw new Error(body.error || `Failed: ${res.status}`);
    }
    await refreshRequirements();
  } catch (e: unknown) {
    errorMessage.value = (e as Error)?.message || "エラーが発生しました";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await ensureAccount();
  await refreshRequirements();
});
</script>
