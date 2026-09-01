<template>
  <div class="min-h-screen">
    <div class="bg-white px-4 py-20">
      <div class="mx-auto max-w-4xl">
        <main
          :aria-label="$t('pages.privacy.title')"
          :aria-busy="isLoading"
        >
          <div
            v-if="isLoading"
            role="status"
            aria-live="polite"
            aria-busy="true"
            class="py-8"
          >
            <CommonAtomsLoadingAnimation
              size="md"
              aria-hidden="true"
            />
            <p class="sr-only">
              {{ $t("privacy.loadingSr") }}
            </p>
          </div>

          <div
            v-else-if="fetchErr"
            role="alert"
            aria-live="assertive"
            class="py-8 text-center text-red-600"
          >
            {{ fetchErr }}
          </div>

          <article
            v-else
            aria-labelledby="privacy-policy-title"
            aria-describedby="privacy-policy-intro"
          >
            <h1
              id="privacy-policy-title"
              class="relative mb-8 text-2xl font-bold tracking-wide after:absolute after:-bottom-2 after:left-0 after:h-[1px] after:w-full after:bg-gray-600 after:content-['']"
            >
              {{ $t("pages.privacy.title") }}
            </h1>
            <p
              id="privacy-policy-intro"
              class="mb-5 text-sm"
            >
              {{ $t("privacy.intro", { company: companyName }) }}
            </p>
            <ul
              class="grid gap-6"
              role="list"
              :aria-label="$t('privacy.listAria')"
            >
              <li
                v-for="privacyPolicyItem in privacyPolicyItems"
                :key="privacyPolicyItem.id"
                role="listitem"
              >
                <section
                  :aria-labelledby="`privacy-policy-item-${privacyPolicyItem.id}-title`"
                >
                  <h2
                    :id="`privacy-policy-item-${privacyPolicyItem.id}-title`"
                    class="mb-1 text-sm font-bold"
                  >
                    {{ privacyPolicyItem.ttl }}
                  </h2>
                  <div
                    class="text-sm"
                    v-html="privacyPolicyItem.txt"
                  />
                </section>
              </li>
            </ul>
          </article>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { resolveSubdomain } from "~/composables/useSubdomain";

definePageMeta({
  layout: "customer",
  middleware: "subdomain",
});

type PrivacyPolicyItem = {
  id: number;
  ttl: string;
  txt: string;
};

const { t, locale } = useI18n();
const { brandName } = useSeoBrand();

const isLoading = ref(true);
const fetchErr = ref("");
const companyName = ref("");
const supportEmail = ref("");

// ポリシー条文一覧
const privacyPolicyItems = computed<PrivacyPolicyItem[]>(() => {
  void locale.value;
  const email = supportEmail.value || t("common.dash");

  return Array.from({ length: 15 }, (_, i) => {
    const id = i + 1;
    return {
      id,
      ttl: t(`privacy.a${id}.ttl`),
      txt: t(`privacy.a${id}.txt`, { email }),
    };
  });
});

// サブドメインに紐づくプライバシーポリシーデータを API から取得
onMounted(async () => {
  try {
    const subdomain = resolveSubdomain();
    if (!subdomain) {
      fetchErr.value = t("law.businessFetchFailed");
      return;
    }

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    const res = await fetch(
      `${apiBase}/api/business/subdomain/transaction-law?subdomain=${encodeURIComponent(subdomain)}`,
      { method: "GET", credentials: "include" },
    );

    if (!res.ok) {
      fetchErr.value = t("privacy.fetchFailed");
      return;
    }

    const data = await res.json();
    companyName.value = data.company_name || "";
    supportEmail.value = data.support_email || "";
  }
  catch {
    fetchErr.value = t("privacy.fetchFailed");
  }
  finally {
    isLoading.value = false;
  }
});

useAppSeo({
  title: () => t("pages.privacy.title"),
  description: () => t("pages.privacy.description", { company: brandName.value }),
  breadcrumbs: () => [
    { name: brandName.value, item: "/booking/1" },
    { name: t("pages.privacy.title") },
  ],
});
</script>
