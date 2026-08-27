<template>
  <div class="space-y-8">
    <!-- 荷物の個数を選択 -->
    <fieldset>
      <legend class="mb-6 font-semibold text-gray-800">
        {{ $t("booking.step2.selectCountLabel") }}<span class="ml-[0.2em] text-red-600">*</span>
      </legend>

      <CommonAtomsLoadingAnimation
        v-if="luggageItemsLoading"
        size="md"
        :message="$t('booking.step2.loading')"
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
              {{ luggageItem.displayName }}
            </p>
            <span class="block text-sm text-gray-700">
              ¥{{ luggageItem.price.toLocaleString() }} {{ $t("common.perItem") }}
            </span>
          </div>
          <div class="inline-flex items-center">
            <button
              type="button"
              class="h-10 w-10 select-none rounded-full bg-gray-800 text-lg font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="luggageItem.count <= 0"
              :aria-label="$t('booking.step2.decrementAria', { name: luggageItem.displayName })"
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
              :aria-label="$t('booking.step2.incrementAria', { name: luggageItem.displayName })"
              :data-testid="`step2-increment-${luggageItem.key}`"
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
        {{ $t("booking.step2.amountTitle") }}<small>{{ $t("common.taxIncluded") }}</small>
      </h2>
      <div class="rounded-md border-2 border-gray-300 p-4 text-center">
        <span class="text-2xl font-bold text-gray-800">¥{{ totalAmount.toLocaleString() }}</span>
      </div>
    </div>

    <!-- 注意事項 -->
    <div class="rounded-md border border-pink-200 bg-pink-50 p-6">
      <h3 class="mb-4 font-semibold text-red-600">
        {{ $t("booking.step2.noticeTitle") }}
      </h3>

      <div class="space-y-6 text-sm text-gray-700">
        <div>
          <h4
            class="mb-2 border-l-4 border-red-500 pl-2 font-semibold text-red-600"
          >
            {{ $t("booking.step2.handlingTitle") }}
          </h4>
          <p class="ml-3">
            {{ $t("booking.step2.handlingText") }}
          </p>
        </div>

        <div>
          <h4
            class="mb-2 border-l-4 border-red-500 pl-2 font-semibold text-red-600"
          >
            {{ $t("booking.step2.deliveryTimeTitle") }}
          </h4>
          <p class="ml-3">
            {{ $t("booking.step2.deliveryTimeText") }}
          </p>
        </div>

        <div>
          <h4
            class="mb-2 border-l-4 border-red-500 pl-2 font-semibold text-red-600"
          >
            {{ $t("booking.step2.prohibitedTitle") }}
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
            {{ $t("booking.step2.contactNote") }}
          </p>
          <div
            v-if="props.supportEmail"
            class="font-semibold"
          >
            <p>
              {{ $t("booking.step2.emailLabel") }}<a
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
import { useI18n } from "vue-i18n";
import { computeTotalAmount } from "~/composables/useBookingForm";
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
  displayName: string;
};

const { t, te } = useI18n();

// 荷物タイプ名を現在のロケールで表示
const localizedLuggageName = (item: LuggageItemData): string => {
  const key = `luggageTypes.${item.key}`;
  const name = te(key) ? t(key) : item.name;
  return name.replace("（", "\n（").replace(" (", "\n(");
};

// 取得したデータとformDataを組み合わせてluggageItemsを生成
const luggageItems = computed<LuggageItem[]>(() => {
  if (props.luggageItemsData.length === 0) {
    return [];
  }

  return props.luggageItemsData.map(item => ({
    ...item,
    count: props.formData[item.key] ?? 0,
    displayName: localizedLuggageName(item),
  }));
});

const getImageUrl = (src: string) => {
  return `/img/${src}`;
};

// 金額計算
const totalAmount = computed(() =>
  computeTotalAmount(props.luggageItemsData, props.formData),
);

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

// お取り扱いできないお荷物
const prohibitedItems = computed<ProhibitedItem[]>(() =>
  [1, 2, 3, 4, 5, 6, 7, 8].map((id) => {
    const detail = t(`prohibited.i${id}.items`);
    return {
      id,
      type: t(`prohibited.i${id}.type`),
      ...(detail ? { items: detail } : {}),
    };
  }),
);
</script>
