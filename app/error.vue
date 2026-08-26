<template>
  <div class="flex min-h-screen flex-col bg-white">
    <CommonTheHeader v-if="!isBusinessPage" />
    <main class="flex flex-1 items-center justify-center px-4 py-20">
      <div class="w-full max-w-lg text-center">
        <p class="mb-4 text-7xl font-bold text-gray-800">
          {{ statusCode }}
        </p>
        <h1 class="mb-4 text-2xl font-bold tracking-wide text-gray-800">
          {{ heading }}
        </h1>
        <p class="mb-10 text-sm text-gray-600">
          {{ description }}
        </p>
        <div class="space-y-3">
          <button
            v-if="!isBusinessPage"
            type="button"
            class="mx-auto w-full max-w-[500px] rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900"
            @click="goHome"
          >
            トップページへ戻る
          </button>
          <template v-else>
            <button
              v-if="canGoBack"
              type="button"
              class="mx-auto w-full max-w-[500px] rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900"
              @click="goBack"
            >
              前のページへ戻る
            </button>
            <button
              type="button"
              class="mx-auto w-full max-w-[500px] rounded-lg px-8 py-3 font-semibold"
              :class="
                canGoBack
                  ? 'border border-gray-300 text-gray-800 hover:bg-gray-50'
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              "
              @click="reload"
            >
              再読み込み
            </button>
          </template>
        </div>
      </div>
    </main>
    <CommonTheFooter v-if="!isBusinessPage" />
  </div>
</template>

<script setup lang="ts">
const error = useError();
const { isBusinessPage } = useSeoBrand();

const statusCode = computed(() => error.value?.status ?? error.value?.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);

const heading = computed(() =>
  isNotFound.value
    ? "お探しのページが見つかりませんでした"
    : "エラーが発生しました",
);

const description = computed(() =>
  isNotFound.value
    ? "URLが変更されたか、ページが削除された可能性があります。"
    : "予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。",
);

const pageTtl = computed(() =>
  isNotFound.value ? "ページが見つかりません" : "エラーが発生しました",
);

useHead({
  title: pageTtl,
});

const backPath = ref<string | null>(null);
const canGoBack = computed(() => Boolean(backPath.value));

onMounted(() => {
  const back = window.history.state?.back;
  if (typeof back === "string" && back) {
    backPath.value = back;
  }
});

const goHome = () => {
  clearError({ redirect: "/" });
};

const goBack = () => {
  if (!backPath.value) {
    return;
  }
  clearError({ redirect: backPath.value });
};

const reload = () => {
  if (import.meta.client) {
    window.location.reload();
  }
};
</script>
