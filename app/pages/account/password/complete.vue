<template>
  <div
    class="min-h-screen w-full bg-gradient-to-br from-gray-600 via-gray-700 via-gray-800 via-gray-900 to-black py-12"
  >
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[500px]">
      <div class="rounded-xl bg-white px-4 py-8 md:p-8">
        <div class="flex flex-col items-center justify-center">
          <figure
            class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
          >
            <img
              src="/img/check-green.svg"
              class="h-8 w-8 object-contain"
            >
          </figure>
          <h1
            class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12"
          >
            パスワード再設定が完了しました
          </h1>
        </div>
        <p class="mx-auto mb-6 w-fit text-center text-gray-600">
          パスワードの再設定が完了しました。<br>
          新しいパスワードでログインしてください。
        </p>
        <NuxtLink
          class="mx-auto block w-fit rounded-md bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900"
          to="/account/login"
        >
          ログイン画面へ
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

// トークンをクエリパラメータから取得
const token = computed(() => route.query.token as string | undefined);

// トークンがない場合はパスワード再設定ページにリダイレクト
onMounted(async () => {
  if (!token.value) {
    await navigateTo("/account/password/forgot", { replace: true });
    return;
  }
});

useHead({
  title: "パスワード再設定完了",
  meta: [
    {
      name: "description",
      content: "パスワード再設定完了ページ。",
    },
    {
      property: "og:title",
      content: "パスワード再設定完了 | LugGo(ラグゴー)",
    },
    {
      property: "og:description",
      content: "パスワード再設定完了ページ。",
    },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: "パスワード再設定完了 | LugGo(ラグゴー)",
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content: "パスワード再設定完了ページ。",
    },
  ],
});
</script>
