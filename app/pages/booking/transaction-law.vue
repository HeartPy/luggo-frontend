<template>
  <div class="min-h-screen">
    <div class="bg-white px-4 py-20">
      <div class="mx-auto max-w-4xl">
        <main
          :aria-label="$t('pages.transactionLaw.title')"
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
              {{ $t("law.loadingSr", { title: $t("pages.transactionLaw.title") }) }}
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
            aria-labelledby="transaction-law-title"
          >
            <h1
              id="transaction-law-title"
              class="relative mb-8 text-2xl font-bold tracking-wide after:absolute after:-bottom-2 after:left-0 after:h-[1px] after:w-full after:bg-gray-600 after:content-['']"
            >
              {{ $t("pages.transactionLaw.title") }}
            </h1>
            <ul
              class="grid gap-8"
              role="list"
              :aria-label="$t('law.listAria')"
            >
              <li
                v-for="item in transactionLawItems"
                :key="item.id"
                role="listitem"
              >
                <section
                  :aria-labelledby="`transaction-law-item-${item.id}-title`"
                >
                  <h2
                    :id="`transaction-law-item-${item.id}-title`"
                    class="mb-2 text-sm font-bold"
                  >
                    {{ item.ttl }}
                  </h2>
                  <div
                    class="text-sm"
                    v-html="item.txt"
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
import { useTransactionLaw } from "~/composables/useTransactionLaw";

definePageMeta({
  layout: "customer",
  middleware: "subdomain",
});

const { t } = useI18n();
const { isLoading, fetchErr, transactionLawItems } = useTransactionLaw();

useHead(() => ({
  title: t("pages.transactionLaw.title"),
  meta: [
    {
      name: "description",
      content: t("pages.transactionLaw.title"),
    },
  ],
}));
</script>
