<template>
  <div class="pb-16">
    <div class="max-w-5xl px-8 py-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="settingsItem in settingsItems"
          :key="settingsItem.key"
          :to="settingsItem.to"
          class="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:border-gray-300 hover:bg-gray-50"
        >
          <h2 class="mb-2 text-base font-bold text-gray-900">
            {{ settingsItem.title }}
          </h2>
          <p class="text-sm leading-relaxed text-gray-600">
            {{ settingsItem.description }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardNav } from "~/composables/useDashboardNav";

definePageMeta({
  layout: "business-owner",
  middleware: "business-owner",
});

const route = useRoute();
const { syncFromRoute } = useDashboardNav();

syncFromRoute();

watch(
  () => route.path,
  () => syncFromRoute(),
);

const settingsItems = [
  {
    key: "pricing",
    title: "料金設定",
    description:
      "配達可能な荷物タイプや集荷地域、各都道府県への配達料金などを設定します。",
    to: "/business-owner/dashboard/settings/pricing",
  },
  {
    key: "business",
    title: "事業設定",
    description:
      "1日の最大荷物個数、定休日、臨時休業日など、事業運営に関する設定を行います。",
    to: "/business-owner/dashboard/settings/business",
  },
  {
    key: "invoice",
    title: "インボイス設定",
    description:
      "適格請求書発行事業者登録番号を設定します。設定すると領収書に登録番号が表示されます。任意の設定です。",
    to: "/business-owner/dashboard/settings/invoice",
  },
];
</script>
