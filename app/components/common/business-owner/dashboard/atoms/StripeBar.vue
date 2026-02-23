<template>
  <NuxtLink
    v-if="shouldShowBar"
    :to="isUnderReview ? undefined : '/stripe/account'"
    :class="[
      barClass,
      'block w-full p-2 text-sm',
      { 'duration-200 hover:opacity-80': !isUnderReview },
    ]"
  >
    {{ messageText }}
  </NuxtLink>
</template>

<script setup lang="ts">
import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useCsrf } from "~/composables/useCsrf";

const { businessProfile, fetchBusinessProfile } = useBusinessProfile();
const { ensureCsrf, getCsrf } = useCsrf();

const isUnderReview = ref(false);
const hasPastDue = ref(false);
const isLoading = ref(true);

// Stripeアカウントの審査状態を取得
const fetchAccountRequirements = async (): Promise<{
  currently_due: string[];
  eventually_due: string[];
  past_due: string[];
} | null> => {
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
  } catch {
    return null;
  }
};

// プロフィール情報と審査状態を取得
onMounted(async () => {
  await fetchBusinessProfile();

  // Stripeアカウントが存在する場合のみ審査状態を確認
  if (businessProfile.value?.has_stripe_account) {
    try {
      const requirements = await fetchAccountRequirements();
      if (requirements) {
        // past_dueが空でない場合は審査不合格
        hasPastDue.value = requirements.past_due.length > 0;
        // currently_dueが空でない場合は審査中（past_dueがない場合のみ）
        isUnderReview.value =
          requirements.currently_due.length > 0 && !hasPastDue.value;
      }
    } catch {
      // エラー時は審査中とみなす
      isUnderReview.value = true;
      hasPastDue.value = false;
    }
  }

  isLoading.value = false;
});

const shouldShowBar = computed(() => {
  if (isLoading.value) return false;

  // Stripeアカウントが存在しない場合は表示
  if (!businessProfile.value?.has_stripe_account) {
    return true;
  }

  // Stripeアカウントが存在し、審査中または審査不合格の場合は表示
  // 審査完了（isUnderReviewがfalseかつhasPastDueがfalse）の場合は非表示
  return isUnderReview.value || hasPastDue.value;
});

const messageText = computed(() => {
  // Stripeアカウントが存在しない場合
  if (!businessProfile.value?.has_stripe_account) {
    return "決済情報の設定を行なってください。";
  }

  // 審査中の場合
  if (isUnderReview.value) {
    return "ただいま決済情報の審査中です。審査完了までお待ちください。";
  }

  // 審査不合格の場合
  if (hasPastDue.value) {
    return "再度入力情報をお確かめのうえ、決済情報の設定を行なってください。";
  }

  // フォールバック（通常は表示されない）
  return "決済情報の設定を行なってください。";
});

// バーの背景色とテキスト色
const barClass = computed(() => {
  // 審査中は黄色
  if (isUnderReview.value) {
    return "bg-yellow-100 text-yellow-800";
  }
  // 審査不合格または新規作成時は赤色
  return "bg-red-100 text-red-800";
});
</script>
