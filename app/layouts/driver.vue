<template>
  <div class="min-h-screen bg-white">
    <header class="fixed inset-x-0 top-0 z-20 h-16 bg-gray-200">
      <div class="flex h-full items-center justify-end px-4 sm:px-8">
        <div class="relative">
          <button
            type="button"
            class="block h-10 w-10"
            aria-label="アカウントメニュー"
            :aria-expanded="isDropdownOpen"
            aria-controls="accountMenu"
            @click="isDropdownOpen = !isDropdownOpen"
          >
            <figure
              class="flex h-full w-full items-center justify-center rounded-full bg-white"
            >
              <img
                src="/img/user.svg"
                alt=""
                aria-hidden="true"
                class="h-8 w-8 object-contain"
              >
            </figure>
          </button>
          <ul
            v-show="isDropdownOpen"
            id="accountMenu"
            class="absolute right-0 top-12 z-10 w-40 list-none bg-white p-2 shadow-md"
            role="menu"
            aria-label="アカウントメニュー"
          >
            <li role="none">
              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                :disabled="isLoggingOut"
                @click="handleLogout"
              >
                <img
                  src="/img/logout.svg"
                  alt=""
                  aria-hidden="true"
                  class="h-4 w-4 shrink-0 object-contain"
                >
                <span>ログアウト</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-2xl px-4 pb-16 pt-20 sm:px-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { logout } from "~/composables/useAuth";

const isDropdownOpen = ref(false);
const isLoggingOut = ref(false);

const handleLogout = async () => {
  if (isLoggingOut.value) return;
  isLoggingOut.value = true;

  try {
    const success = await logout();
    if (success) {
      await navigateTo("/driver/login", { replace: true });
    }
  }
  finally {
    isLoggingOut.value = false;
    isDropdownOpen.value = false;
  }
};
</script>
