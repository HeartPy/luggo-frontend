<template>
  <div>
    <div
      class="flex h-screen flex-col items-center justify-start border-r-[2px] border-gray-200"
    >
      <div class="flex h-16 items-center gap-2 bg-white">
        <figure class="h-6 w-6">
          <img
            src="/img/luggo.svg"
            alt="LugGo"
            class="h-full w-full object-contain"
          >
        </figure>
        <span class="whitespace-nowrap text-xl font-bold text-gray-800">
          LugGo
        </span>
      </div>
      <div class="overflow-y-auto">
        <nav>
          <ul class="flex flex-col items-center">
            <li
              v-for="navItem in navItems"
              :key="navItem.id"
            >
              <NuxtLink
                class="flex w-full items-center py-4 font-semibold hover:opacity-80"
                to="#"
              >
                <img
                  v-if="navItem.icon"
                  :src="navItem.icon"
                  alt=""
                  class="mr-2 h-4 w-4 object-contain"
                >
                <span>{{ navItem.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type NavItem = {
  id: number;
  icon?: string;
  label: string;
};

const navItems = ref<NavItem[]>([
  {
    id: 1,
    label: "予約一覧",
  },
  {
    id: 2,
    label: "配達者一覧",
  },
  {
    id: 3,
    label: "売上管理",
  },
  {
    id: 4,
    icon: "/img/settings.svg",
    label: "料金の設定",
  },
]);
</script>
