<template>
  <footer
    class="bg-white"
    role="contentinfo"
  >
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <NuxtLink
          class="mb-4 flex w-fit items-center gap-2 p-2.5 hover:opacity-80"
          to="/"
        >
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
        </NuxtLink>
        <nav>
          <ul class="flex flex-wrap items-center">
            <li
              v-for="footerItem in footerItems"
              :key="footerItem.id"
              class="relative after:absolute after:right-0 after:top-0 after:h-full after:w-[1px] after:bg-gray-400 after:content-[''] last:after:content-none"
            >
              <NuxtLink
                :to="footerItem.link"
                class="px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                {{ footerItem.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      <small
        class="ml-auto mr-0 block w-fit text-xs text-gray-400"
        aria-label="著作権情報"
      >&copy; 2025 LugGo</small>
    </div>
  </footer>
</template>

<script setup lang="ts">
type FooterItem = {
  id: number;
  link: string;
  label: string;
};

const footerItems = ref<FooterItem[]>([
  {
    id: 1,
    link: "/transaction-law",
    label: "特定商取引法に基づく表記",
  },
  {
    id: 2,
    link: "/privacy",
    label: "プライバシポリシー",
  },
]);
</script>
