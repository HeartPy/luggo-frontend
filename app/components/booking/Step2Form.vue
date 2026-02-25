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
        class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3"
      >
        <div
          v-for="luggageItem in luggageItems"
          :key="luggageItem.id"
          class="flex items-center justify-center gap-x-10 gap-y-3 text-center sm:flex-col"
        >
          <div class="flex flex-col items-center justify-center">
            <figure class="mb-4 h-20 w-20">
              <img
                class="h-full w-full object-contain"
                :src="getImageUrl(luggageItem.image_src)"
                alt=""
              >
            </figure>
            <p class="mb-1 text-sm font-semibold text-gray-700">
              {{ luggageItem.name }}
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

      <div class="space-y-4 text-sm text-gray-700">
        <div>
          <h4
            class="mb-1 border-l-4 border-red-500 pl-2 font-semibold text-red-600"
          >
            当日配送について
          </h4>
          <p class="ml-3">
            荷物の配送は翌日の午前10:00までにお渡しいたします。
          </p>
        </div>

        <div>
          <h4
            class="mb-1 border-l-4 border-red-500 pl-2 font-semibold text-red-600"
          >
            取り扱い可能な荷物
          </h4>
          <ul class="mb-2 ml-8 list-disc space-y-1">
            <li
              v-for="item in props.luggageItemsData"
              :key="item.id"
            >
              {{ item.name }}
            </li>
          </ul>
          <div class="ml-3 text-xs text-gray-600">
            <p>※サイズは3辺の合計が160cm</p>
            <p>※重量は30kgまで</p>
          </div>
        </div>

        <hr class="border-gray-300">

        <div>
          <p>上記以外で不明な点がございましたらお気軽にお問い合わせください</p>
          <p class="font-semibold">
            電話番号：<a
              class="underline"
              href="tel:#"
            >000-000-0000</a>
          </p>
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
};

const props = withDefaults(defineProps<Props>(), {
  luggageItemsLoading: false,
  luggageItemsError: "",
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
</script>
