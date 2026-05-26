<template>
  <div class="space-y-8">
    <!-- 荷物の個数を選択 -->
    <fieldset>
      <legend class="mb-6 font-semibold text-gray-800">
        荷物の個数を選択<span class="ml-[0.2em] text-red-600">*</span>
      </legend>

      <CommonAtomsLoadingAnimation
        v-if="luggageItemsLoading"
        size="md"
        message="荷物情報を読み込み中..."
      />
      <div
        v-else-if="luggageItemsError"
        class="py-4 text-center text-red-600"
      >
        <p>{{ luggageItemsError }}</p>
      </div>
      <div
        v-else
        class="flex flex-col justify-center gap-x-20 gap-y-10 sm:flex-row"
      >
        <div
          v-for="luggageItem in luggageItems"
          :key="luggageItem.id"
          class="flex w-full min-w-0 items-center justify-center gap-x-10 gap-y-3 text-center sm:w-fit sm:flex-col"
        >
          <div class="flex flex-col items-center justify-center">
            <figure class="mb-4 h-20 w-20">
              <img
                class="h-full w-full object-contain"
                :src="getImageUrl(luggageItem.image_src)"
                alt=""
              >
            </figure>
            <p
              class="mb-1 whitespace-pre-line text-sm font-semibold text-gray-700"
            >
              {{ luggageItem.name.replace("（", "\n（") }}
            </p>
            <span class="block text-sm text-gray-700">
              ¥{{ luggageItem.price.toLocaleString() }} / 個
            </span>
          </div>
          <div class="inline-flex items-center">
            <button
              type="button"
              class="h-10 w-10 select-none rounded-full bg-gray-800 text-lg font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="luggageItem.count <= 0"
              :aria-label="`${luggageItem.name}の個数を一つ減らす`"
              @click="decrement(luggageItem.key)"
            >
              −
            </button>
            <div
              class="flex min-w-[3rem] items-center justify-center px-3 py-2 text-lg font-semibold text-gray-900"
            >
              {{ luggageItem.count }}
            </div>
            <button
              type="button"
              class="h-10 w-10 select-none rounded-full bg-gray-800 text-lg font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="luggageItem.count >= MAX_COUNT"
              :aria-label="`${luggageItem.name}の個数を一つ増やす`"
              @click="increment(luggageItem.key)"
            >
              ＋
            </button>
          </div>
          <div
            v-if="errors?.[luggageItem.key]"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors?.[luggageItem.key] }}
          </div>
        </div>
      </div>
    </fieldset>

    <!-- 下向き矢印 -->
    <span class="mx-auto block w-fit">
      <span
        class="block h-6 w-6 bg-black [clip-path:polygon(50%_100%,0_0,100%_0)]"
      />
    </span>

    <!-- 金額 -->
    <div>
      <h2 class="mb-4 font-semibold text-gray-800">
        金額<small>（税込）</small>
      </h2>
      <div class="rounded-md border-2 border-gray-300 p-4 text-center">
        <span class="text-2xl font-bold text-gray-800">¥{{ totalAmount.toLocaleString() }}</span>
      </div>
    </div>

    <!-- 注意事項 -->
    <div class="rounded-md border border-pink-200 bg-pink-50 p-6">
      <h3 class="mb-4 font-semibold text-red-600">
        注意事項
      </h3>

      <div class="space-y-6 text-sm text-gray-700">
        <div>
          <h4
            class="mb-2 border-l-4 border-red-500 pl-2 font-semibold text-red-600"
          >
            配送荷物のお手続きについて
          </h4>
          <p class="ml-3">
            配送当日の午前9時までに、ホテルや旅館のフロント、もしくは駅や空港のカウンターにお荷物をお預けください。
          </p>
        </div>

        <div>
          <h4
            class="mb-2 border-l-4 border-red-500 pl-2 font-semibold text-red-600"
          >
            お届け時間について
          </h4>
          <p class="ml-3">
            配送当日の20時までに、お荷物をお届けいたします。
          </p>
        </div>

        <div>
          <h4
            class="mb-2 border-l-4 border-red-500 pl-2 font-semibold text-red-600"
          >
            お取り扱いできないお荷物
          </h4>
          <ul class="mb-2 ml-8 list-disc space-y-2">
            <li
              v-for="prohibitedItem in prohibitedItems"
              :key="prohibitedItem.id"
            >
              <h5 class="mb-1 font-semibold">
                {{ prohibitedItem.type }}
              </h5>
              <p v-if="prohibitedItem.items">
                {{ prohibitedItem.items }}
              </p>
            </li>
          </ul>
        </div>

        <hr class="border-gray-300">

        <div>
          <p class="mb-2">
            上記以外で不明な点がございましたらお気軽にお問い合わせください
          </p>
          <div
            v-if="props.supportEmail"
            class="font-semibold"
          >
            <p>
              メールアドレス：<a
                class="underline"
                :href="`mailto:${props.supportEmail}`"
              >{{ props.supportEmail }}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Step2FormData, LuggageItemData } from "../../types/booking";

type Props = {
  formData: Step2FormData;
  errors: Partial<Record<string, string>>;
  luggageItemsData: LuggageItemData[];
  luggageItemsLoading?: boolean;
  luggageItemsError?: string;
  supportEmail?: string;
};

const props = withDefaults(defineProps<Props>(), {
  luggageItemsLoading: false,
  luggageItemsError: "",
  supportEmail: "",
});

type Emits = {
  "update:form-data": [formData: Step2FormData];
};

const emit = defineEmits<Emits>();

type LuggageItem = LuggageItemData & {
  count: number;
};

// 取得したデータとformDataを組み合わせてluggageItemsを生成
const luggageItems = computed<LuggageItem[]>(() => {
  if (props.luggageItemsData.length === 0) {
    return [];
  }

  return props.luggageItemsData.map(item => ({
    ...item,
    count: props.formData[item.key] ?? 0,
  }));
});

const getImageUrl = (src: string) => {
  return `/img/${src}`;
};

// 金額計算
const totalAmount = computed(() => {
  return luggageItems.value.reduce((acc, item) => {
    return acc + item.price * item.count;
  }, 0);
});

const MAX_COUNT = 20;
const clampCount = (n: number) => Math.max(0, Math.min(MAX_COUNT, n));

const setCount = (key: string, value: number) => {
  const updatedData = { ...props.formData, [key]: clampCount(value) };
  emit("update:form-data", updatedData);
};

const increment = (key: string) => {
  setCount(key, (props.formData[key] ?? 0) + 1);
};

const decrement = (key: string) => {
  setCount(key, (props.formData[key] ?? 0) - 1);
};

type ProhibitedItem = {
  id: number;
  type: string;
  items?: string;
};

const prohibitedItems = ref<ProhibitedItem[]>([
  {
    id: 1,
    type: "危険物",
    items:
      "ガスボンベ・スプレー缶、可燃性液体（ガソリン・灯油）、火薬・花火、バッテリー（大容量リチウム電池など）、",
  },
  {
    id: 2,
    type: "高価品・貴重品",
    items: "現金、クレジットカード、宝石・貴金属、高級時計、美術品",
  },
  {
    id: 3,
    type: "個人情報・重要書類",
    items: "パスポート、契約書、チケット類",
  },
  {
    id: 4,
    type: "食品・生もの",
    items: "生鮮食品、冷蔵・冷凍が必要なもの、匂いが強いもの",
  },
  {
    id: 5,
    type: "壊れやすいもの",
    items: "ガラス製品、精密機器",
  },
  {
    id: 6,
    type: "法律的に問題があるもの",
    items: "違法薬物、武器（ナイフ・銃など）、偽ブランド品",
  },
  {
    id: 7,
    type: "漏れる可能性のある液体類",
  },
  {
    id: 8,
    type: "1個あたり、30kgを超えるお荷物",
  },
]);
</script>
