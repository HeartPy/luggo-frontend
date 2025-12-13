<template>
  <div class="min-h-screen py-8">
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[800px]">
      <BookingAtomsProgressBar :current-step="3" />

      <div class="mb-8">
        <figure
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
        >
          <img src="/img/check-green.svg" class="h-8 w-8 object-contain" />
        </figure>
        <h1 class="mb-2 text-center text-2xl font-bold text-gray-800">
          予約が完了しました
        </h1>
        <p class="text-gray-600">
          この度はご予約いただき、誠にありがとうございます。予約完了の確認メールもお送りしています。予約IDは下記をご確認ください。
        </p>
      </div>

      <div
        v-if="bookingId"
        class="mb-8 space-y-4 rounded-lg border-2 border-gray-500 bg-gray-50 p-8 text-center"
      >
        <h2 class="text-lg font-semibold text-gray-800">予約ID</h2>
  <div>
          <p
            class="text-2xl font-bold tracking-wider text-gray-800"
            data-testid="booking-id"
          >
            {{ bookingId }}
          </p>
        </div>
        <p class="text-sm text-gray-600">
          この予約IDは予約確認やお問い合わせの際に必要です。<br />メモを取るか、スクリーンショットを保存してください。
        </p>
        <button
          type="button"
          class="rounded-md bg-gray-600 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          @click="copyBookingId"
        >
          {{ copied ? "コピーしました" : "予約IDをコピー" }}
        </button>
      </div>

      <div
        v-else
        class="mb-8 rounded-lg border-2 border-yellow-500 bg-yellow-50 p-8 text-center"
      >
        <p class="text-gray-700">
          予約IDの取得に失敗しました。<br />お手数おかけしますが、お問い合わせの際は、運営にお名前と予約日時をお伝えください。
        </p>
      </div>

      <div class="space-y-2">
        <p class="text-sm text-gray-600">
          配達状況の確認・ご予約のキャンセルは、以下のリンクから行なってください。
        </p>
        <NuxtLink
          to="/booking/status"
          class="block text-blue-600 underline hover:opacity-80"
        >
          http://localhost:3000/booking/status
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const bookingId = ref<string | null>(null);
const copied = ref(false);

// 予約IDをコピーする関数
const copyBookingId = async () => {
  if (!bookingId.value) return;

  try {
    await navigator.clipboard.writeText(bookingId.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy booking number:", err);
    }
    // フォールバック: テキストエリアを使用
    const textarea = document.createElement("textarea");
    textarea.value = bookingId.value;
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
    } catch (err: unknown) {
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
    // sessionStorage から予約IDを取得
    const storedBookingId = sessionStorage.getItem("bookingId");
    if (storedBookingId) {
      bookingId.value = storedBookingId;
    } else {
      // 予約IDが見つからない場合はトップページにリダイレクト
      // （直接アクセスされた場合など）
      await navigateTo("/booking/1");
    }
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    sessionStorage.removeItem("bookingId");
  }
});

useHead({
  title: "予約完了 | LugGo",
  meta: [
    {
      name: "description",
      content: "荷物配送サービスの予約が完了しました。",
    },
  ],
});
</script>
