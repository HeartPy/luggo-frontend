<template>
  <div class="space-y-6">
    <!-- 集荷場所の名称 -->
    <div>
      <label
        for="pickupLocationName"
        class="mb-2 block font-semibold text-gray-800"
      >
        {{ $t("booking.step1.pickupNameLabel") }}<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <div class="relative">
        <input
          id="pickupLocationName"
          v-model="searchQueries.pickup"
          type="text"
          name="pickupLocationName"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.pickup_location_name }"
          :placeholder="$t('booking.step1.namePlaceholder')"
          required
          aria-required="true"
          aria-describedby="pickup_location_name-error"
          @input="handleSearchInput($event, 'pickup')"
          @focus="showSuggestions.pickup = true"
          @blur="handleBlur('pickup')"
        >

        <!-- サジェストドロップダウン -->
        <div
          v-if="showSuggestions.pickup && filteredSuggestions.pickup.length > 0"
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
        >
          <div
            v-for="suggestion in filteredSuggestions.pickup"
            :key="suggestion.place_id"
            class="cursor-pointer border-b border-gray-100 px-3 py-2 last:border-b-0 hover:bg-gray-100"
            @mousedown.prevent
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
                    ⭐ {{ suggestion.rating }}{{ $t("placeTypes.ratingCount", { count: suggestion.user_ratings_total }) }}
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

      <p class="mt-1 text-xs text-gray-500">
        {{ $t("booking.step1.selectSuggestionHint") }}
      </p>
      <div
        v-if="errors.pickup_location_name"
        id="pickup_location_name-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.pickup_location_name }}
      </div>
    </div>

    <!-- 集荷場所の郵便番号 -->
    <div>
      <label
        for="pickupPostalCode"
        class="mb-2 block font-semibold text-gray-800"
      >
        {{ $t("booking.step1.pickupPostalLabel") }}<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <input
        id="pickupPostalCode"
        :value="formData.pickup_postal_code"
        type="text"
        inputmode="numeric"
        name="pickupPostalCode"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.pickup_postal_code }"
        :placeholder="$t('booking.step1.postalPlaceholder')"
        maxlength="7"
        required
        aria-required="true"
        aria-describedby="pickup_postal_code-error"
        @input="handlePickupPostalCode($event)"
      >
      <p class="mt-1 text-xs text-gray-500">
        {{ $t("booking.step1.postalHint") }}
      </p>
      <div
        v-if="errors.pickup_postal_code"
        id="pickup_postal_code-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.pickup_postal_code }}
      </div>
    </div>

    <!-- 集荷場所の住所 -->
    <div>
      <label
        for="pickupLocationAddress"
        class="mb-2 block font-semibold text-gray-800"
      >
        {{ $t("booking.step1.pickupAddressLabel") }}<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <textarea
        id="pickupLocationAddress"
        :value="formData.pickup_location_address"
        name="pickupLocationAddress"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.pickup_location_address }"
        :placeholder="$t('booking.step1.addressPlaceholder')"
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
        {{ $t("booking.step1.pickupDateLabel") }}<span class="ml-[0.2em] text-red-600">*</span>
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
          :min="minPickupDate"
          :max="maxBookingDate"
          @input="handleInput('pickup_date', $event)"
        >
        <img
          class="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2"
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

    <!-- 配達場所の名称 -->
    <div>
      <label
        for="deliveryLocationName"
        class="mb-2 block font-semibold text-gray-800"
      >
        {{ $t("booking.step1.deliveryNameLabel") }}<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <div class="relative">
        <input
          id="deliveryLocationName"
          v-model="searchQueries.delivery"
          type="text"
          name="deliveryLocationName"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.delivery_location_name }"
          :placeholder="$t('booking.step1.namePlaceholder')"
          required
          aria-required="true"
          aria-describedby="delivery_location_name-error"
          @input="handleSearchInput($event, 'delivery')"
          @focus="showSuggestions.delivery = true"
          @blur="handleBlur('delivery')"
        >

        <!-- サジェストドロップダウン -->
        <div
          v-if="
            showSuggestions.delivery && filteredSuggestions.delivery.length > 0
          "
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
        >
          <div
            v-for="suggestion in filteredSuggestions.delivery"
            :key="suggestion.place_id"
            class="cursor-pointer border-b border-gray-100 px-3 py-2 last:border-b-0 hover:bg-gray-100"
            @mousedown.prevent
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
                    ⭐ {{ suggestion.rating }}{{ $t("placeTypes.ratingCount", { count: suggestion.user_ratings_total }) }}
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

      <p class="mt-1 text-xs text-gray-500">
        {{ $t("booking.step1.selectSuggestionHint") }}
      </p>
      <div
        v-if="errors.delivery_location_name"
        id="delivery_location_name-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.delivery_location_name }}
      </div>
    </div>

    <!-- 配達場所の郵便番号 -->
    <div>
      <label
        for="deliveryPostalCode"
        class="mb-2 block font-semibold text-gray-800"
      >
        {{ $t("booking.step1.deliveryPostalLabel") }}<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <input
        id="deliveryPostalCode"
        :value="formData.delivery_postal_code"
        type="text"
        inputmode="numeric"
        name="deliveryPostalCode"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.delivery_postal_code }"
        :placeholder="$t('booking.step1.postalPlaceholder')"
        maxlength="7"
        required
        aria-required="true"
        aria-describedby="delivery_postal_code-error"
        @input="handleDeliveryPostalCode($event)"
      >
      <p class="mt-1 text-xs text-gray-500">
        {{ $t("booking.step1.postalHint") }}
      </p>
      <div
        v-if="errors.delivery_postal_code"
        id="delivery_postal_code-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.delivery_postal_code }}
      </div>
    </div>

    <!-- 配達場所の住所 -->
    <div>
      <label
        for="deliveryLocationAddress"
        class="mb-2 block font-semibold text-gray-800"
      >
        {{ $t("booking.step1.deliveryAddressLabel") }}<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <textarea
        id="deliveryLocationAddress"
        :value="formData.delivery_location_address"
        name="deliveryLocationAddress"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.delivery_location_address }"
        :placeholder="$t('booking.step1.addressPlaceholder')"
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

    <!-- 配達日 -->
    <div>
      <label
        for="deliveryDate"
        class="mb-2 block font-semibold text-gray-800"
      >
        {{ $t("booking.step1.deliveryDateLabel") }}<span class="ml-[0.2em] text-red-600">*</span>
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
          :max="maxBookingDate"
          @input="handleInput('delivery_date', $event)"
        >
        <img
          class="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2"
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
        {{ $t("booking.step1.notesLabel") }}
      </label>
      <textarea
        id="notes"
        :value="formData.notes"
        name="notes"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :placeholder="$t('booking.step1.notesPlaceholder')"
        rows="5"
        @input="handleInput('notes', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useAppLocale } from "~/composables/useLocale";
import type { Step1FormData } from "~/types/booking";
import { usePostalCodeSearch } from "~/composables/usePostalCodeSearch";
import {
  getMinPickupDate,
  getMaxBookingDate,
} from "~/composables/useBookingValid";

// サジェストの型定義
// name_ja / address_ja は非日本語ロケールでの検索時のみ返却される日本語表記
type LocationSuggestion = {
  place_id: string;
  name: string;
  address: string;
  name_ja?: string;
  address_ja?: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  geometry: { lat: number; lng: number };
};

const { t } = useI18n();
const { googleLangCode, currentLocale } = useAppLocale();

type Props = {
  formData: Step1FormData;
  errors: Partial<Record<keyof Step1FormData, string>>;
  departurePrefectures?: string[];
  deliverablePrefectures?: string[];
};

const props = withDefaults(defineProps<Props>(), {
  departurePrefectures: () => [],
  deliverablePrefectures: () => [],
});

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

// 集荷日の最小値（前日23時締切）と最大値（半年先）
const minPickupDate = computed(() => getMinPickupDate());
const maxBookingDate = computed(() => getMaxBookingDate());

// 配達日の最小値（集荷日以降）
const minDeliveryDate = computed(() => {
  return props.formData.pickup_date || minPickupDate.value;
});

// 入力ハンドラー
const handleInput = (key: keyof Step1FormData, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const updatedData = { ...props.formData, [key]: target.value };
  if (key === "pickup_location_address") {
    updatedData.pickup_place_id = "";
    updatedData.pickup_latitude = null;
    updatedData.pickup_longitude = null;
  }
  if (key === "delivery_location_address") {
    updatedData.delivery_place_id = "";
    updatedData.delivery_latitude = null;
    updatedData.delivery_longitude = null;
  }
  emit("update:form-data", updatedData);
};

// --- 郵便番号検索 ---
const { searchAddress, handlePostalCode } = usePostalCodeSearch();

const PREFECTURE_FULL_NAMES: Record<string, string> = {
  "01": "北海道",
  "02": "青森県",
  "03": "岩手県",
  "04": "宮城県",
  "05": "秋田県",
  "06": "山形県",
  "07": "福島県",
  "08": "茨城県",
  "09": "栃木県",
  "10": "群馬県",
  "11": "埼玉県",
  "12": "千葉県",
  "13": "東京都",
  "14": "神奈川県",
  "15": "新潟県",
  "16": "富山県",
  "17": "石川県",
  "18": "福井県",
  "19": "山梨県",
  "20": "長野県",
  "21": "岐阜県",
  "22": "静岡県",
  "23": "愛知県",
  "24": "三重県",
  "25": "滋賀県",
  "26": "京都府",
  "27": "大阪府",
  "28": "兵庫県",
  "29": "奈良県",
  "30": "和歌山県",
  "31": "鳥取県",
  "32": "島根県",
  "33": "岡山県",
  "34": "広島県",
  "35": "山口県",
  "36": "徳島県",
  "37": "香川県",
  "38": "愛媛県",
  "39": "高知県",
  "40": "福岡県",
  "41": "佐賀県",
  "42": "長崎県",
  "43": "熊本県",
  "44": "大分県",
  "45": "宮崎県",
  "46": "鹿児島県",
  "47": "沖縄県",
};

const handlePickupPostalCode = (event: Event) => {
  handlePostalCode(event, {
    onPostalCodeUpdate: (value) => {
      emit("update:form-data", {
        ...props.formData,
        pickup_postal_code: value,
        pickup_place_id: "",
        pickup_latitude: null,
        pickup_longitude: null,
      });
    },
    onSearch: async (postalCode) => {
      const result = await searchAddress(postalCode);
      if (!result) {
        return;
      }
      const address = `${result.state}${result.city}${result.town}`;
      emit("update:form-data", {
        ...props.formData,
        pickup_postal_code: postalCode,
        pickup_location_address: address,
        pickup_place_id: "",
        pickup_latitude: null,
        pickup_longitude: null,
      });
    },
  });
};

const handleDeliveryPostalCode = (event: Event) => {
  handlePostalCode(event, {
    onPostalCodeUpdate: (value) => {
      emit("update:form-data", {
        ...props.formData,
        delivery_postal_code: value,
        delivery_place_id: "",
        delivery_latitude: null,
        delivery_longitude: null,
      });
    },
    onSearch: async (postalCode) => {
      const result = await searchAddress(postalCode);
      if (!result) {
        return;
      }
      const address = `${result.state}${result.city}${result.town}`;
      emit("update:form-data", {
        ...props.formData,
        delivery_postal_code: postalCode,
        delivery_location_address: address,
        delivery_place_id: "",
        delivery_latitude: null,
        delivery_longitude: null,
      });
    },
  });
};

// --- ここからはサジェスト関連の処理 ---
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

  const fieldName
    = type === "pickup" ? "pickup_location_name" : "delivery_location_name";
  const nameJaField
    = type === "pickup" ? "pickup_location_name_ja" : "delivery_location_name_ja";
  const addressJaField
    = type === "pickup"
      ? "pickup_location_address_ja"
      : "delivery_location_address_ja";
  const placeIdField
    = type === "pickup" ? "pickup_place_id" : "delivery_place_id";
  const latitudeField
    = type === "pickup" ? "pickup_latitude" : "delivery_latitude";
  const longitudeField
    = type === "pickup" ? "pickup_longitude" : "delivery_longitude";

  // 手入力された場合は、サジェスト由来の日本語表記が実態と乖離するためクリアする
  emit("update:form-data", {
    ...props.formData,
    [fieldName]: target.value,
    [nameJaField]: "",
    [addressJaField]: "",
    [placeIdField]: "",
    [latitudeField]: null,
    [longitudeField]: null,
  });

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

    // 集荷は出発地域、配達は配達可能地域でサーバー側を絞り込む
    const prefCodes
      = type === "pickup"
        ? props.departurePrefectures
        : props.deliverablePrefectures;
    const prefParam
      = prefCodes.length > 0
        ? `&prefectures=${encodeURIComponent(prefCodes.join(","))}`
        : "";

    const data = await $fetch<{
      suggestions: LocationSuggestion[];
    }>(
      `${apiBaseUrl}/api/bookings/location-suggestions?q=${encodeURIComponent(query)}${prefParam}&lang=${encodeURIComponent(googleLangCode.value)}`,
    );

    if (data) {
      suggestions.value[type] = data.suggestions || [];
    }
  }
  catch {
    // サジェスト取得失敗は静かに無視
  }
};

// 住所から都道府県コードを抽出
// 都道府県名の照合は日本語表記で行うため、非日本語ロケールでは address_ja を優先する
function extractPrefCodeFromAddress(suggestion: LocationSuggestion): string | null {
  const address = suggestion.address_ja || suggestion.address;
  for (const [code, name] of Object.entries(PREFECTURE_FULL_NAMES)) {
    if (address.includes(name)) return code;
  }
  return null;
}

// 出発地域/配達可能地域でフィルタリングされたサジェスト
const filteredSuggestions = computed(() => {
  const pickup = suggestions.value.pickup.filter((suggestion) => {
    if (props.departurePrefectures.length === 0) return true;
    const code = extractPrefCodeFromAddress(suggestion);
    return code !== null && props.departurePrefectures.includes(code);
  });

  const delivery = suggestions.value.delivery.filter((suggestion) => {
    if (props.deliverablePrefectures.length === 0) return true;
    const code = extractPrefCodeFromAddress(suggestion);
    return code !== null && props.deliverablePrefectures.includes(code);
  });

  return { pickup, delivery };
});

// 住所文字列から郵便番号7桁を抽出（〒・ハイフン除去）
const extractPostalCode = (address: string): string | null => {
  const match = address.match(/〒?(\d{3})-?(\d{4})/);
  if (match && match[1] && match[2]) {
    return `${match[1]}${match[2]}`;
  }
  return null;
};

// 住所文字列から郵便番号を除去
// 住所欄には郵便番号は必要ないため
const stripPostalCode = (address: string): string =>
  address.replace(/〒?\d{3}-?\d{4}\s*/, "").trim();

// サジェスト選択処理
const selectSuggestion = (
  suggestion: LocationSuggestion,
  type: "pickup" | "delivery",
) => {
  // 前の検索予約をキャンセル
  // 古いキーワードで検索しないため
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
    searchTimeout.value = null;
  }

  searchQueries.value[type] = suggestion.name;

  // フォームデータを更新
  const fieldName
    = type === "pickup" ? "pickup_location_name" : "delivery_location_name";
  const addressFieldName
    = type === "pickup" ? "pickup_location_address" : "delivery_location_address";
  const postalCodeField
    = type === "pickup" ? "pickup_postal_code" : "delivery_postal_code";
  const nameJaField
    = type === "pickup" ? "pickup_location_name_ja" : "delivery_location_name_ja";
  const addressJaField
    = type === "pickup"
      ? "pickup_location_address_ja"
      : "delivery_location_address_ja";
  const placeIdField
    = type === "pickup" ? "pickup_place_id" : "delivery_place_id";
  const latitudeField
    = type === "pickup" ? "pickup_latitude" : "delivery_latitude";
  const longitudeField
    = type === "pickup" ? "pickup_longitude" : "delivery_longitude";

  const extractedPostalCode
    = extractPostalCode(suggestion.address)
      ?? (suggestion.address_ja ? extractPostalCode(suggestion.address_ja) : null);

  // 事業者の予約一覧用に日本語表記も保持する（日本語ロケール時は不要）
  const nameJa
    = currentLocale.value === "ja" ? "" : (suggestion.name_ja ?? "");
  const addressJa
    = currentLocale.value === "ja"
      ? ""
      : suggestion.address_ja
        ? stripPostalCode(suggestion.address_ja)
        : "";

  const updatedData = {
    ...props.formData,
    [fieldName]: suggestion.name,
    [addressFieldName]: stripPostalCode(suggestion.address),
    [nameJaField]: nameJa,
    [addressJaField]: addressJa,
    [placeIdField]: suggestion.place_id,
    [latitudeField]: suggestion.geometry.lat != null
      ? Math.round(suggestion.geometry.lat * 1e6) / 1e6
      : null,
    [longitudeField]: suggestion.geometry.lng != null
      ? Math.round(suggestion.geometry.lng * 1e6) / 1e6
      : null,
    // 住所に郵便番号が含まれる場合のみ上書き
    // :value バインドのため @input は発火せず住所検索は走らない
    ...(extractedPostalCode !== null
      ? { [postalCodeField]: extractedPostalCode }
      : {}),
  };

  emit("update:form-data", updatedData);
  showSuggestions.value[type] = false;
  suggestions.value[type] = [];
};

// フォーカスアウト処理
const handleBlur = (type: "pickup" | "delivery") => {
  setTimeout(() => {
    showSuggestions.value[type] = false;
  }, 200);
};

// 場所タイプのラベル取得
const getPlaceTypeLabel = (placeTypes: string[]) => {
  const typeLabelKeys: Record<string, string> = {
    lodging: "placeTypes.lodging",
    hotel: "placeTypes.lodging",
    airport: "placeTypes.airport",
    train_station: "placeTypes.trainStation",
    subway_station: "placeTypes.subwayStation",
    transit_station: "placeTypes.transitStation",
  };

  for (const placeType of placeTypes) {
    const key = typeLabelKeys[placeType];
    if (key) {
      return t(key);
    }
  }
  return t("placeTypes.other");
};
</script>
