<template>
  <footer class="bg-white" role="contentinfo">
    <div class="container mx-auto px-4 py-8">
      <nav>
        <ul class="flex flex-wrap items-center">
          <li
            v-for="footerItem in footerItems"
            :key="footerItem.label"
            class="relative after:absolute after:right-0 after:top-0 after:h-full after:w-[1px] after:bg-gray-400 after:content-[''] last:after:content-none"
          >
            <NuxtLink
              :to="footerItem.to"
              class="px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              {{ footerItem.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
const buildPath = (base: string): string => {
  if (!import.meta.client) return base;
  const params = new URLSearchParams(window.location.search);
  const subdomain = params.get("subdomain");
  if (subdomain) {
    return `${base}?subdomain=${encodeURIComponent(subdomain)}`;
  }
  return base;
};

const footerItems = computed(() => [
  {
    label: "特定商取引法に基づく表記",
    to: buildPath("/booking/transaction-law"),
  },
  {
    label: "プライバシーポリシー",
    to: buildPath("/booking/privacy"),
  },
]);
</script>
