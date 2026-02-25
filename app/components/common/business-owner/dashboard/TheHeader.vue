<template>
  <header class="h-16 w-full bg-gray-200">
    <div class="relative flex h-full items-center justify-end px-8">
      <div class="cursor-pointer" @click="toggleDropdown">
        <figure
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <img src="/img/user.svg" alt="" class="h-8 w-8 object-contain" />
        </figure>
      </div>
      <div
        v-show="isDropdownOpen"
        class="absolute right-8 top-14 bg-white p-2 shadow-md"
      >
        <ul>
          <li
            class="flex cursor-pointer items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
  </header>
</template>

<script setup lang="ts">
import { logout } from "~/composables/useAuth";

const isDropdownOpen = ref(false);
const isLoggingOut = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
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
