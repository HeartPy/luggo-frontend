<template>
  <section class="bg-white px-4 py-20">
    <div class="mx-auto max-w-6xl">
      <TopAtomsSecTtl>
        <template #secSubTtl>Get Started</template>
        <template #secMainTtl>ご利用までのながれ</template>
      </TopAtomsSecTtl>
      <div class="grid gap-8 md:grid-cols-4">
        <div
          v-for="flowItem in flowItems"
          :key="flowItem.id"
          class="text-center"
        >
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 text-2xl font-bold text-white"
          >
            {{ flowItem.id }}
          </div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900">
            {{ flowItem.ttl }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ flowItem.desc }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type FlowItem = {
  id: number;
  ttl: string;
  desc: string;
};

const flowItems = ref<FlowItem[]>([
  {
    id: 1,
    ttl: "アカウント作成",
    desc: "基本情報を入力してアカウントを作成",
  },
  {
    id: 2,
    ttl: "審査・承認",
    desc: "事業者情報の審査（1-2営業日）",
  },
  {
    id: 3,
    ttl: "システム導入",
    desc: "配送管理システムの設定",
  },
  {
    id: 4,
    ttl: "配送開始",
    desc: "すぐに配送サービスを開始",
  },
]);
</script>
