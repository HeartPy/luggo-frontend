<template>
  <div>
    <div
      class="fixed z-30 flex h-full min-h-screen w-60 flex-col items-center justify-start border-r-[2px] border-gray-200 bg-white"
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
      <div class="w-full overflow-y-auto">
        <nav>
          <ul class="flex flex-col items-center">
            <li
              v-for="navItem in navItems"
              :key="navItem.key"
              class="w-full"
            >
              <button
                type="button"
                class="relative flex w-full items-center justify-center py-4 font-semibold hover:opacity-80"
                :class="{
                  'bg-gray-200 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gray-800':
                    isItemActive(navItem),
                }"
                @click="emit('select', navItem.key)"
              >
                <img
                  v-if="navItem.icon"
                  :src="navItem.icon"
                  alt=""
                  class="mr-2 h-4 w-4 object-contain"
                >
                <span>{{ navItem.label }}</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type NavItem = {
  key: string;
  icon?: string;
  label: string;
  matchPrefixes?: string[];
};

const props = defineProps<{
  currentView: string;
}>();

const emit = defineEmits<{
  select: [key: string];
}>();

const navItems = ref<NavItem[]>([
  { key: "reservations", label: "予約一覧" },
  { key: "drivers", label: "配達者一覧" },
  { key: "revenue", label: "売上管理" },
  {
    key: "settings",
    icon: "/img/settings.svg",
    label: "各種設定",
    matchPrefixes: ["settings-"],
  },
]);

// 「各種設定」のように、自身のキーとは異なる currentView でもアクティブ扱いにできるよう拡張
const isItemActive = (item: NavItem) => {
  if (item.key === props.currentView) return true;
  if (
    item.matchPrefixes?.some(prefix => props.currentView.startsWith(prefix))
  ) {
    return true;
  }
  return false;
};
</script>
