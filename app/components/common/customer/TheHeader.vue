<template>
  <header class="h-16 w-full bg-gray-400">
    <div
      class="mx-auto flex h-full w-[calc(100%-8vw)] max-w-[800px] items-center justify-end"
    >
      <div class="relative">
        <button
          type="button"
          class="flex items-center justify-center bg-white p-2 text-sm hover:opacity-90"
          :aria-expanded="active"
          aria-controls="languageMenu"
          @click="click"
        >
          <img
            src="/img/language-logo.svg"
            alt=""
            aria-hidden="true"
            class="mr-2 block h-auto w-4"
          >
          <span class="block">LANGUAGE</span>
        </button>
        <ul
          id="languageMenu"
          class="duration-400 absolute left-1/2 top-11 z-10 w-fit min-w-[150px] -translate-x-1/2 list-none border border-gray-300 bg-white transition-all"
          :class="
            active
              ? '[clip-path:inset(0_0_0_0)]'
              : '[clip-path:inset(0_0_100%_0)]'
          "
          role="menu"
          :aria-label="$t('accessibility.languageMenu')"
        >
          <li
            v-for="language in languages"
            :key="language.value"
            class="flex items-center border-b border-gray-300 last:border-b-0"
            role="none"
          >
            <button
              class="block h-full w-full py-2.5 text-center text-xs font-light text-gray-600 hover:opacity-70"
              :class="{ 'font-semibold text-gray-900': language.value === currentLocale }"
              type="button"
              role="menuitem"
              @click="selectLanguage(language.value)"
            >
              {{ language.ttl }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAppLocale } from "~/composables/useLocale";
import type { AppLocale } from "~/plugins/i18n";

const emit = defineEmits<{
  (e: "change-locale", localeName: string): void;
}>();

const { currentLocale } = useAppLocale();

const active = ref(false);

const click = (): void => {
  active.value = !active.value;
};

const selectLanguage = (localeName: AppLocale): void => {
  emit("change-locale", localeName);
  active.value = false;
};

type Language = {
  ttl: string;
  value: AppLocale;
};

const languages: Language[] = [
  { ttl: "日本語", value: "ja" },
  { ttl: "English", value: "en" },
  { ttl: "简体中文", value: "zh-Hans" },
  { ttl: "繁體中文", value: "zh-Hant" },
];
</script>
