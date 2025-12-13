<template>
  <section class="bg-white px-4 py-20">
    <div class="mx-auto max-w-6xl">
      <TopAtomsSecTtl>
        <template #secSubTtl>
          Fee
        </template>
        <template #secMainTtl>
          料金
        </template>
      </TopAtomsSecTtl>
      <div
        class="flex flex-col items-center justify-start gap-8 md:flex-row md:items-end md:gap-10"
      >
        <div class="grid w-fit grid-cols-3 gap-4 p-0 sm:gap-8 md:p-8 md:pb-0">
          <div
            v-for="feeItem in feeItems"
            :key="feeItem.id"
            class="relative flex w-fit flex-col items-center justify-center gap-2 after:absolute after:-right-7 after:top-1/2 after:block after:-translate-y-1/2 after:text-3xl after:font-light after:text-gray-600 after:content-['+'] last:after:content-none sm:gap-4 sm:after:-right-8"
          >
            <p
              class="relative text-[5vw] font-semibold text-gray-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-gray-600 sm:text-xl"
              v-html="feeItem.ttl"
            />
            <div class="text-[12vw] font-bold text-gray-800 sm:text-7xl">
              {{ feeItem.fee
              }}<small class="ml-1 text-[0.5em] sm:text-[0.3em]"><span v-if="feeItem.id === 3">%</span><span v-else>円</span></small>
            </div>
          </div>
        </div>
        <div class="p-0 text-sm text-gray-600 md:p-8 md:pb-0">
          <p>※旅行客の決済金額(税込)に対する手数料率です。</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type FeeItem = {
  id: number;
  ttl: string;
  fee: number;
};

const feeItems = ref<FeeItem[]>([
  {
    id: 1,
    ttl: "初期費用",
    fee: 0,
  },
  {
    id: 2,
    ttl: "月額費用",
    fee: 0,
  },
  {
    id: 3,
    ttl: "決済手数料<sup class='absolute -top-3 -right-3 text-xs'>※</sup>",
    fee: 10,
  },
]);
</script>
