<template>
  <div class="space-y-6">
    <!-- 集荷場所の名称 -->
    <div>
      <label
        for="pickupLocationName"
        class="mb-2 block font-semibold text-gray-800"
      >
        集荷場所の名称<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <div class="relative">
        <input
          id="pickupLocationName"
          v-model="searchQueries.pickup"
          type="text"
          name="pickupLocationName"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.pickup_location_name }"
          placeholder="ホテル・空港等の名称"
          required
          aria-required="true"
          aria-describedby="pickup_location_name-error"
          @input="handleSearchInput($event, 'pickup')"
          @focus="showSuggestions.pickup = true"
          @blur="handleBlur('pickup')"
        >

        <!-- サジェストドロップダウン -->
        <div
          v-if="showSuggestions.pickup && suggestions.pickup.length > 0"
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
        >
          <div
            v-for="suggestion in suggestions.pickup"
            :key="suggestion.place_id"
            class="cursor-pointer border-b border-gray-100 px-3 py-2 last:border-b-0 hover:bg-gray-100"
            @click="selectSuggestion(suggestion, 'pickup')"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-1">
                <div class="font-medium text-gray-900">
                  {{ suggestion.name }}
                </div>
                <div class="mt-1 text-sm text-gray-600">
                  {{ suggestion.address }}
                </div>
                <div class="mt-1 flex items-center space-x-2">
                  <span
                    v-if="suggestion.rating"
                    class="text-xs text-gray-500"
                  >
                    ⭐ {{ suggestion.rating }} ({{
                      suggestion.user_ratings_total
                    }}件)
                  </span>
                  <span
                    class="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600"
                  >
                    {{ getPlaceTypeLabel(suggestion.types) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="errors.pickup_location_name"
        id="pickup_location_name-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.pickup_location_name }}
      </div>
    </div>

    <!-- 集荷場所の住所 -->
    <div>
      <label
        for="pickupLocationAddress"
        class="mb-2 block font-semibold text-gray-800"
      >
        集荷場所の住所<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <textarea
        id="pickupLocationAddress"
        :value="formData.pickup_location_address"
        name="pickupLocationAddress"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.pickup_location_address }"
        placeholder="住所を詳しくご入力ください"
        rows="3"
        required
        aria-required="true"
        aria-describedby="pickup_location_address-error"
        @input="handleInput('pickup_location_address', $event)"
      />
      <div
        v-if="errors.pickup_location_address"
        id="pickup_location_address-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.pickup_location_address }}
      </div>
    </div>

    <!-- 集荷日 -->
    <div>
      <label
        for="pickupDate"
        class="mb-2 block font-semibold text-gray-800"
      >
        集荷日<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <div
        class="relative"
        @click="openNativeDatePicker(pickupDateInput)"
      >
        <input
          id="pickupDate"
          ref="pickupDateInput"
          :value="formData.pickup_date"
          type="date"
          name="pickupDate"
          class="w-full cursor-pointer appearance-none rounded-md border border-gray-300 px-3 py-2 pr-12 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
          :class="{ 'border-red-500': errors.pickup_date }"
          required
          aria-required="true"
          aria-describedby="pickup_date-error"
          :min="today"
          @input="handleInput('pickup_date', $event)"
        >
        <img
          class="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
          src="/img/calendar.svg"
          alt=""
        >
      </div>
      <div
        v-if="errors.pickup_date"
        id="pickup_date-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.pickup_date }}
      </div>
    </div>

    <!-- 配送場所の名称 -->
    <div>
      <label
        for="deliveryLocationName"
        class="mb-2 block font-semibold text-gray-800"
      >
        配送場所の名称<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <div class="relative">
        <input
          id="deliveryLocationName"
          v-model="searchQueries.delivery"
          type="text"
          name="deliveryLocationName"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.delivery_location_name }"
          placeholder="ホテル・空港等の名称"
          required
          aria-required="true"
          aria-describedby="delivery_location_name-error"
          @input="handleSearchInput($event, 'delivery')"
          @focus="showSuggestions.delivery = true"
          @blur="handleBlur('delivery')"
        >

        <!-- サジェストドロップダウン -->
        <div
          v-if="showSuggestions.delivery && suggestions.delivery.length > 0"
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
        >
          <div
            v-for="suggestion in suggestions.delivery"
            :key="suggestion.place_id"
            class="cursor-pointer border-b border-gray-100 px-3 py-2 last:border-b-0 hover:bg-gray-100"
            @click="selectSuggestion(suggestion, 'delivery')"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-1">
                <div class="font-medium text-gray-900">
                  {{ suggestion.name }}
                </div>
                <div class="mt-1 text-sm text-gray-600">
                  {{ suggestion.address }}
                </div>
                <div class="mt-1 flex items-center space-x-2">
                  <span
                    v-if="suggestion.rating"
                    class="text-xs text-gray-500"
                  >
                    ⭐ {{ suggestion.rating }} ({{
                      suggestion.user_ratings_total
                    }}件)
                  </span>
                  <span
                    class="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600"
                  >
                    {{ getPlaceTypeLabel(suggestion.types) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="errors.delivery_location_name"
        id="delivery_location_name-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.delivery_location_name }}
      </div>
    </div>

    <!-- 配送場所の住所 -->
    <div>
      <label
        for="deliveryLocationAddress"
        class="mb-2 block font-semibold text-gray-800"
      >
        配送場所の住所<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <textarea
        id="deliveryLocationAddress"
        :value="formData.delivery_location_address"
        name="deliveryLocationAddress"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.delivery_location_address }"
        placeholder="住所を詳しくご入力ください"
        rows="3"
        required
        aria-required="true"
        aria-describedby="delivery_location_address-error"
        @input="handleInput('delivery_location_address', $event)"
      />
      <div
        v-if="errors.delivery_location_address"
        id="delivery_location_address-error"
        aria-live="polite"
        class="mt-1 text-sm text-red-600"
      >
        {{ errors.delivery_location_address }}
      </div>
    </div>

    <!-- 配送日 -->
    <div>
      <label
        for="deliveryDate"
        class="mb-2 block font-semibold text-gray-800"
      >
        配送日<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <div
        class="relative"
        @click="openNativeDatePicker(deliveryDateInput)"
      >
        <input
          id="deliveryDate"
          ref="deliveryDateInput"
          :value="formData.delivery_date"
          type="date"
          name="deliveryDate"
          class="w-full cursor-pointer appearance-none rounded-md border border-gray-300 px-3 py-2 pr-12 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
          :class="{ 'border-red-500': errors.delivery_date }"
          required
          aria-required="true"
          aria-describedby="delivery_date-error"
          :min="minDeliveryDate"
          @input="handleInput('delivery_date', $event)"
        >
        <img
          class="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
          src="/img/calendar.svg"
        >
      </div>
      <div
        v-if="errors.delivery_date"
        id="delivery_date-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.delivery_date }}
      </div>
    </div>

    <!-- 備考 -->
    <div>
      <label
        for="notes"
        class="mb-2 block font-semibold text-gray-800"
      >
        備考
      </label>
      <textarea
        id="notes"
        :value="formData.notes"
        name="notes"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="追加のご要望やご質問がございましたらこちらにご記入ください"
        rows="5"
        @input="handleInput('notes', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Step1FormData } from "~/types/booking";

// サジェストの型定義
type LocationSuggestion = {
  place_id: string;
  name: string;
  address: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  geometry: { lat: number; lng: number };
};

type Props = {
  formData: Step1FormData;
  errors: Partial<Record<keyof Step1FormData, string>>;
};

const props = defineProps<Props>();

type Emits = {
  "update:form-data": [formData: Step1FormData];
};

const emit = defineEmits<Emits>();

// 日付入力フィールドへの参照
const pickupDateInput = ref<HTMLInputElement>();
const deliveryDateInput = ref<HTMLInputElement>();

const openNativeDatePicker = (el: HTMLInputElement | undefined) => {
  if (!el) return;
  el.focus();
  if (typeof el.showPicker === "function") {
    try {
      el.showPicker();
    }
    catch {
      // 意図的に無視（フォーカスのみにフォールバック）
    }
  }
};

// 今日の日付（最小値として使用）
const today = computed(() =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()),
);

// 配送日の最小値（集荷日以降）
const minDeliveryDate = computed(() => {
  return props.formData.pickup_date || today.value;
});

// 入力ハンドラー
const handleInput = (key: keyof Step1FormData, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const updatedData = { ...props.formData, [key]: target.value };
  emit("update:form-data", updatedData);
};

// ここからサジェスト関連のコード
const searchQueries = ref({
  pickup: props.formData.pickup_location_name || "",
  delivery: props.formData.delivery_location_name || "",
});

// formDataの変更を監視してsearchQueriesを更新
watch(
  () => props.formData.pickup_location_name,
  (newValue) => {
    if (newValue !== searchQueries.value.pickup) {
      searchQueries.value.pickup = newValue || "";
    }
  },
);

watch(
  () => props.formData.delivery_location_name,
  (newValue) => {
    if (newValue !== searchQueries.value.delivery) {
      searchQueries.value.delivery = newValue || "";
    }
  },
);

const suggestions = ref({
  pickup: [] as LocationSuggestion[],
  delivery: [] as LocationSuggestion[],
});

const showSuggestions = ref({
  pickup: false,
  delivery: false,
});

const searchTimeout = ref<NodeJS.Timeout | null>(null);

// 検索入力処理
const handleSearchInput = async (event: Event, type: "pickup" | "delivery") => {
  const target = event.target as HTMLInputElement;
  const query = target.value;

  // 入力ハンドラーを呼び出し
  const fieldName
    = type === "pickup" ? "pickup_location_name" : "delivery_location_name";
  handleInput(fieldName, event);

  // デバウンス処理
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  if (query.length >= 2) {
    searchTimeout.value = setTimeout(async () => {
      await fetchSuggestions(query, type);
    }, 300);
  }
  else {
    suggestions.value[type] = [];
  }
};

// サジェスト取得処理
const fetchSuggestions = async (query: string, type: "pickup" | "delivery") => {
  try {
    const config = useRuntimeConfig();
    const apiBaseUrl = config.public.apiBaseUrl;

    const { data, error } = await useFetch<{
      suggestions: LocationSuggestion[];
    }>(
      `${apiBaseUrl}/api/bookings/location-suggestions?q=${encodeURIComponent(query)}`,
    );

    if (error.value) {
      // Error fetching location suggestions
      return;
    }

    if (data.value) {
      suggestions.value[type] = data.value.suggestions || [];
    }
  }
  catch {
    // Error fetching location suggestions
  }
};

// サジェスト選択処理
const selectSuggestion = (
  suggestion: LocationSuggestion,
  type: "pickup" | "delivery",
) => {
  searchQueries.value[type] = suggestion.name;

  // フォームデータを更新
  const fieldName
    = type === "pickup" ? "pickup_location_name" : "delivery_location_name";
  const addressFieldName
    = type === "pickup" ? "pickup_location_address" : "delivery_location_address";

  const updatedData = {
    ...props.formData,
    [fieldName]: suggestion.name,
    [addressFieldName]: suggestion.address,
  };

  emit("update:form-data", updatedData);
  showSuggestions.value[type] = false;
};

// フォーカスアウト処理
const handleBlur = (type: "pickup" | "delivery") => {
  setTimeout(() => {
    showSuggestions.value[type] = false;
  }, 200);
};

// 場所タイプのラベル取得
const getPlaceTypeLabel = (placeTypes: string[]) => {
  const typeLabels: Record<string, string> = {
    lodging: "宿泊施設",
    airport: "空港",
    train_station: "駅",
    subway_station: "地下鉄駅",
  };

  for (const placeType of placeTypes) {
    if (typeLabels[placeType]) {
      return typeLabels[placeType];
    }
  }
  return "その他";
};
</script>
