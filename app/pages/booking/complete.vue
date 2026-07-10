<template>
  <div class="min-h-screen py-8">
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <BookingAtomsProgressBar :current-step="3" />

      <div class="mb-8">
        <figure
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
        >
          <img
            src="/img/check-green.svg"
            class="h-8 w-8 object-contain"
          >
        </figure>
        <h1 class="mb-2 text-center text-2xl font-bold text-gray-800">
          {{ $t("complete.title") }}
        </h1>
        <p class="text-gray-600">
          {{ $t("complete.message") }}
        </p>
      </div>

      <div
        v-if="bookingNumber"
        class="mb-8 space-y-4 rounded-lg border-2 border-gray-500 bg-gray-50 p-8 text-center"
      >
        <h2 class="text-lg font-semibold text-gray-800">
          {{ $t("complete.bookingNumber") }}
        </h2>
        <div>
          <p
            class="text-2xl font-bold tracking-wider text-gray-800"
            data-testid="booking-number"
          >
            {{ bookingNumber }}
          </p>
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p
          class="text-sm text-gray-600"
          v-html="$t('complete.keepNote')"
        />
        <button
          type="button"
          class="rounded-md bg-gray-600 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          @click="copyBookingNumber"
        >
          {{ copied ? $t("complete.copied") : $t("complete.copy") }}
        </button>
      </div>

      <div
        v-else
        class="mb-8 rounded-lg border-2 border-yellow-500 bg-yellow-50 p-8 text-center"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p
          class="text-gray-700"
          v-html="$t('complete.numberFailed')"
        />
      </div>

      <div class="space-y-2">
        <p class="text-sm text-gray-600">
          {{ $t("complete.statusGuide") }}
        </p>
        <NuxtLink
          :to="statusLinkTo"
          class="block text-blue-600 underline hover:opacity-80"
        >
          {{ statusLinkDisplayUrl }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

definePageMeta({
  layout: "customer",
  middleware: "subdomain",
});

const { t } = useI18n();

const route = useRoute();
const bookingNumber = ref<string | null>(null);
const copied = ref(false);

// 配達状況確認ページへのリンク
const statusLinkTo = computed(() => ({
  path: "/booking/status",
  query: route.query,
}));

// 表示用のフル URL 文字列
const statusLinkDisplayUrl = computed(() => {
  const requestUrl = useRequestURL();
  const url = new URL("/booking/status", requestUrl.origin);
  for (const [key, value] of Object.entries(route.query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null) {
          url.searchParams.append(key, String(v));
        }
      }
    }
    else {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
});

// 予約番号をコピーする関数
const copyBookingNumber = async () => {
  if (!bookingNumber.value) return;

  try {
    await navigator.clipboard.writeText(bookingNumber.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
  catch (err: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy booking number:", err);
    }
    // フォールバック: テキストエリアを使用
    const textarea = document.createElement("textarea");
    textarea.value = bookingNumber.value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    }
    catch (err: unknown) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Failed to copy booking number (fallback):", err);
      }
    }
    document.body.removeChild(textarea);
  }
};

onMounted(async () => {
  if (import.meta.client) {
    // sessionStorage から予約番号を取得
    const storedBookingNumber = sessionStorage.getItem("bookingNumber");
    if (storedBookingNumber) {
      bookingNumber.value = storedBookingNumber;
    }
    else {
      // 予約番号が見つからない場合はトップページにリダイレクト
      // （直接アクセスされた場合など）
      await navigateTo({ path: "/booking/1", query: route.query });
    }
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    sessionStorage.removeItem("bookingNumber");
  }
});

useHead(() => ({
  title: t("pages.complete.title"),
  meta: [
    {
      name: "description",
      content: t("pages.complete.description"),
    },
    {
      property: "og:title",
      content: `${t("pages.complete.title")} | ${t("common.brand")}`,
    },
    {
      property: "og:description",
      content: t("pages.complete.description"),
    },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: `${t("pages.complete.title")} | ${t("common.brand")}`,
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content: t("pages.complete.description"),
    },
  ],
}));
</script>
