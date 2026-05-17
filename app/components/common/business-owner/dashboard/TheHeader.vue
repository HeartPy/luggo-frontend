<template>
  <header class="fixed z-20 h-16 w-[calc(100%-240px)] bg-gray-200">
    <div class="flex h-full items-center justify-between px-8">
      <div>
        <a
          v-if="canShowSite"
          class="bg-white px-2 py-2 text-sm text-gray-600 hover:opacity-80"
          :href="bookingUrl!"
          target="_blank"
          rel="noopener noreferrer"
        >
          サイトを表示
        </a>
        <span
          v-else
          class="cursor-not-allowed bg-gray-50 px-2 py-2 text-sm text-gray-400"
          :title="disabledReason"
        >
          サイトを表示
        </span>
      </div>
      <div class="relative w-40">
        <div class="ml-auto h-10 w-10 cursor-pointer" @click="toggleDropdown">
          <figure
            class="flex h-full w-full items-center justify-center rounded-full bg-white"
          >
            <img src="/img/user.svg" alt="" class="h-8 w-8 object-contain" />
          </figure>
        </div>
        <div
          v-show="isDropdownOpen"
          class="absolute right-0 top-12 z-10 bg-white p-2 shadow-md"
        >
          <ul class="border-b border-gray-200 pb-2">
            <li
              class="flex cursor-pointer justify-center p-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              @click="goToBusinessInfo"
            >
              <span>ユーザー情報</span>
            </li>
            <li
              class="flex cursor-pointer justify-center p-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              @click="goToPaymentInfo"
            >
              <span>決済設定情報</span>
            </li>
          </ul>
          <ul class="pt-2">
            <li
              class="flex cursor-pointer items-center justify-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              @click="handleLogout"
            >
              <img
                src="/img/logout.svg"
                alt="ログアウト"
                class="h-4 w-4 shrink-0 object-contain"
              />
              <span>ログアウト</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { logout } from "~/composables/useAuth";
import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useCsrf } from "~/composables/useCsrf";
import { useOnboardingProgress } from "~/composables/useOnboardingProgress";

const { businessProfile, fetchBusinessProfile } = useBusinessProfile();
const { ensureCsrf, getCsrf } = useCsrf();
const {
  pricingHasAnyPrice,
  pricingHasPickupArea,
  pricingCleared,
  businessSettingsCleared,
  consentGiven,
} = useOnboardingProgress();

const isDropdownOpen = ref(false);
const isLoggingOut = ref(false);
const isStripeVerified = ref(false);

const bookingUrl = computed(() => {
  const subdomain = businessProfile.value?.subdomain;
  if (!subdomain || !import.meta.client) return null;

  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const portStr = port ? `:${port}` : "";
    return `${protocol}//${host}${portStr}/booking?subdomain=${subdomain}`;
  }

  const parts = host.split(".");
  const baseDomain = parts.length >= 3 ? parts.slice(1).join(".") : host;
  return `${protocol}//${subdomain}.${baseDomain}/booking`;
});

// 「サイトを表示」を有効化する条件:
// 料金設定・事業設定・公開情報の同意が完了し、Stripe 審査通過済みで予約フォーム URL があること
const canShowSite = computed(
  () =>
    isStripeVerified.value &&
    !!bookingUrl.value &&
    pricingCleared.value &&
    businessSettingsCleared.value &&
    consentGiven.value,
);

const disabledReason = computed(() => {
  const reasons: string[] = [];
  if (!pricingHasPickupArea.value) {
    reasons.push("料金設定で集荷地域を1つ以上選択してください");
  }
  if (!pricingHasAnyPrice.value) {
    reasons.push(
      "料金設定で配達可能な荷物を1つ以上選択し、配達地域を1つ以上「配達可」にして料金を入力してください",
    );
  }
  if (!businessSettingsCleared.value) {
    reasons.push(
      "事業設定で1日の最大荷物個数を1以上、または「制限なし」に設定してください",
    );
  }
  if (!consentGiven.value) {
    reasons.push("ユーザーへの公開情報の表示について同意してください");
  }
  if (!isStripeVerified.value) {
    reasons.push("Stripeの審査を完了してください");
  }
  return reasons.join("\n");
});

const checkStripeVerification = async () => {
  if (!businessProfile.value?.has_stripe_account) {
    isStripeVerified.value = false;
    return;
  }

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
      isStripeVerified.value = false;
      return;
    }

    const data = await res.json();
    isStripeVerified.value = data.account?.charges_enabled === true;
  } catch {
    isStripeVerified.value = false;
  }
};

onMounted(async () => {
  await fetchBusinessProfile();
  await checkStripeVerification();
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const goToBusinessInfo = () => {
  isDropdownOpen.value = false;
  navigateTo("/business-owner/dashboard/business-info", { replace: true });
};

const goToPaymentInfo = () => {
  isDropdownOpen.value = false;
  navigateTo("/business-owner/dashboard/payment-info", { replace: true });
};

const handleLogout = async () => {
  if (isLoggingOut.value) return;
  isLoggingOut.value = true;

  try {
    const success = await logout();
    if (success) {
      await navigateTo("/account/login", { replace: true });
    }
  } finally {
    isLoggingOut.value = false;
    isDropdownOpen.value = false;
  }
};
</script>
