<template>
  <div
    class="min-h-screen w-full bg-gradient-to-br from-gray-600 via-gray-700 via-gray-800 via-gray-900 to-black py-12"
  >
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <div class="rounded-xl bg-white px-4 py-8 md:p-8">
        <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12">
          アカウント登録申請の完了
        </h1>
        <p class="mx-auto mb-6 w-fit text-gray-600">
          アカウント登録申請が完了しました。<br /><br />Stripeによる審査結果は１〜２営業日以内に、ユーザー登録時に入力いただいたメールアドレス宛にお知らせいたします。
        </p>
        <NuxtLink
          class="mx-auto block w-fit rounded-md border-2 border-gray-300 bg-transparent px-8 py-3 font-semibold text-gray-700 hover:opacity-80"
          to="/account/login"
        >
          管理画面にログイン
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
onMounted(async () => {
  if (import.meta.client) {
    // 送信完了フラグをチェック
    const submitted = sessionStorage.getItem("stripeAccountSubmitted");
    if (!submitted) {
      await navigateTo("/stripe/account");
      return;
    }

    sessionStorage.removeItem("stripeAccountSubmitted");
  }
});
</script>
