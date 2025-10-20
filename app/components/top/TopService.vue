<template>
  <section class="bg-white px-4 py-20">
    <div class="mx-auto max-w-6xl">
      <TopAtomsSecTtl>
        <template #secSubTtl>Service</template>
        <template #secMainTtl>LugGoのご紹介</template>
      </TopAtomsSecTtl>
      <div class="grid gap-8 md:grid-cols-3">
        <div
          v-for="serviceItem in serviceItems"
          :key="serviceItem.id"
          class="rounded-xl bg-gray-200 p-8 shadow-lg"
        >
          <div class="flex flex-col items-center justify-between gap-4">
            <div class="w-full">
              <figure
                class="relative z-10 mx-auto h-40 w-40 before:absolute before:left-1/2 before:top-1/2 before:-z-[1] before:block before:h-[90%] before:w-[90%] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-white before:content-['']"
              >
                <img
                  class="h-full w-full object-contain"
                  :src="getImageUrl(serviceItem.img)"
                  aria-hidden="true"
                />
              </figure>
            </div>
            <h3
              class="text-center text-xl font-semibold text-gray-800"
              v-html="serviceItem.ttl"
            ></h3>
            <p class="font-medium leading-relaxed text-gray-700">
              {{ serviceItem.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type ServiceItem = {
  id: number;
  img: string;
  ttl: string;
  desc: string;
};

const serviceItems = ref<ServiceItem[]>([
  {
    id: 1,
    img: "service-fee",
    ttl: "<span class='inline-block'>0円で</span><span class='inline-block'>始められる</span>",
    desc: "初期費用・月額費用などの固定費が完全無料",
  },
  {
    id: 2,
    img: "service-management",
    ttl: "予約フォーム作成から<br />配送管理まで一括で行える",
    desc: "旅行客向けの手荷物配送予約フォームの作成、予約管理、配送管理、ドライバー管理、売上管理を一括で行えます",
  },
  {
    id: 3,
    img: "service-language",
    ttl: "<span class='inline-block'>英語・中国語にも</span><span class='inline-block'>対応</span>",
    desc: "英語・中文簡体字・中文繁体字に対応しているため、外国人旅行客にもご利用いただけます",
  },
]);

const getImageUrl = (name: string) => {
  return `/img/${name}.svg`;
};
</script>
