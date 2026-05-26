<template>
  <div>
    <!-- 保存しない確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showDiscardConfirm"
      title="確認"
      message="入力中の内容を破棄しますか？"
      confirm-label="破棄する"
      cancel-label="キャンセル"
      @confirm="doDiscard"
    />

    <!-- 一時保存を破棄確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showDiscardDraftConfirm"
      title="確認"
      message="一時保存を破棄して、反映されている設定の状態に戻しますか？"
      confirm-label="一時保存を破棄"
      cancel-label="キャンセル"
      @confirm="doDiscardDraft"
    />

    <!-- ページ離脱確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showLeaveConfirm"
      title="確認"
      message="変更が保存されていません。ページを離れますか？"
      confirm-label="離れる"
      cancel-label="キャンセル"
      @confirm="confirmLeave"
    />

    <!-- 保存 / 一時保存 / 保存しないボタン -->
    <div
      class="mb-6 flex items-center justify-end gap-3 border-y border-gray-200 px-8 py-3"
    >
      <button
        type="button"
        class="w-44 rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        :disabled="!canSave || isSaving"
        @click="handleSave"
      >
        <CommonAtomsLoadingAnimation
          v-if="isSaving"
          size="xs"
        />
        <span v-else>保存（設定を反映）</span>
      </button>
      <button
        type="button"
        class="w-60 rounded-md bg-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-300"
        :disabled="!isDirty || isSavingDraft"
        @click="handleSaveDraft"
      >
        <CommonAtomsLoadingAnimation
          v-if="isSavingDraft"
          size="xs"
        />
        <span v-else>一時保存（設定を反映しない）</span>
      </button>
      <button
        type="button"
        class="rounded-md border-2 border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        :disabled="!hasDraftSaveSinceLastRealSave || isDiscardingDraft"
        @click="handleDiscardDraftClick"
      >
        <CommonAtomsLoadingAnimation
          v-if="isDiscardingDraft"
          size="xs"
        />
        <span v-else>一時保存を破棄</span>
      </button>
      <button
        type="button"
        class="rounded-md border-2 border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        :disabled="!isDirty"
        @click="handleDiscardClick"
      >
        保存しない
      </button>
    </div>

    <div class="mx-auto max-w-5xl px-4">
      <!-- 保存エラー -->
      <div
        v-if="saveErr"
        class="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ saveErr }}
      </div>

      <!-- 配達可能な荷物（チェックした荷物だけ料金入力欄を表示） -->
      <section class="mb-10">
        <h2 class="mb-4 text-lg font-bold text-gray-800">
          配達可能な荷物
        </h2>
        <p class="mb-3 text-sm text-gray-600">
          配達可能な荷物タイプにチェックを入れてください
        </p>
        <div
          class="flex flex-wrap gap-6 rounded-md border border-gray-200 bg-gray-50 p-4"
        >
          <label
            v-for="luggageType in luggageTypes"
            :key="luggageType.key"
            class="flex cursor-pointer items-center gap-2"
          >
            <input
              type="checkbox"
              :checked="enabledLuggageTypes[luggageType.key]"
              class="h-4 w-4 rounded border-gray-300 accent-green-600"
              @change="toggleLuggageType(luggageType.key)"
            >
            <span class="text-sm font-medium text-gray-800">{{
              getLuggageTypeLabel(luggageType.key)
            }}</span>
          </label>
        </div>
      </section>

      <!-- 集荷地域 -->
      <section class="mb-10">
        <h2 class="mb-4 text-lg font-bold text-gray-800">
          集荷地域
        </h2>
        <div
          class="relative"
          data-departure-dropdown
        >
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3 text-sm transition-colors hover:border-gray-400"
            @click="showDepartureDropdown = !showDepartureDropdown"
          >
            <span
              :class="
                departurePrefectures.length === 0
                  ? 'text-gray-400'
                  : 'text-gray-800'
              "
            >
              {{
                departurePrefectures.length === 0
                  ? "都道府県を選択してください"
                  : selectedDepartureLabel
              }}
            </span>
            <svg
              class="h-4 w-4 text-gray-500 transition-transform"
              :class="{ 'rotate-180': showDepartureDropdown }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            v-if="showDepartureDropdown"
            class="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
          >
            <label
              v-for="pref in allPrefectures"
              :key="pref.code"
              class="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-gray-50"
            >
              <input
                type="checkbox"
                :checked="departurePrefectures.includes(pref.code)"
                class="mr-3 h-4 w-4 rounded border-gray-300 accent-green-600"
                @change="toggleDeparturePref(pref.code)"
              >
              <span class="text-gray-800">{{ pref.name }}</span>
            </label>
          </div>
        </div>
      </section>

      <!-- 配達地域 -->
      <section>
        <h2 class="mb-4 text-lg font-bold text-gray-800">
          配達地域
        </h2>

        <div class="space-y-4">
          <div
            v-for="region in regions"
            :key="region.key"
            class="overflow-hidden rounded-lg border border-gray-200"
          >
            <!-- 地方ヘッダー -->
            <div class="bg-gray-50 px-5 py-3">
              <span class="font-semibold text-gray-800">{{
                region.label
              }}</span>
            </div>

            <!-- 都道府県ごとに配達可トグル + 料金入力 -->
            <div class="divide-y divide-gray-100 bg-white">
              <div
                v-for="pref in region.prefectures"
                :key="pref.code"
                class="px-5 py-4"
              >
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold text-gray-700">
                    {{ pref.name }}
                  </h4>
                  <button
                    type="button"
                    class="rounded-md px-4 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    :class="
                      deliveryEnabled[pref.code]
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'border border-gray-300 bg-white text-gray-600 disabled:hover:bg-white'
                    "
                    :disabled="visibleLuggageTypes.length === 0"
                    @click="togglePrefecture(pref.code)"
                  >
                    配達可
                  </button>
                </div>

                <div
                  v-if="deliveryEnabled[pref.code]"
                  class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"
                >
                  <div
                    v-for="luggageType in visibleLuggageTypes"
                    :key="luggageType.key"
                  >
                    <label class="mb-1 block text-xs text-gray-500">{{
                      luggageType.label
                    }}</label>
                    <div class="flex items-center">
                      <input
                        type="text"
                        inputmode="numeric"
                        class="w-full rounded-l-md border border-r-0 border-gray-300 px-3 py-2 text-sm"
                        :value="
                          formatPrice(
                            prefecturePricing[pref.code]?.[luggageType.key],
                          )
                        "
                        @input="
                          handlePriceInput(pref.code, luggageType.key, $event)
                        "
                      >
                      <span
                        class="rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                      >
                        円
                      </span>
                    </div>
                    <p
                      v-if="validationErrs[`${pref.code}_${luggageType.key}`]"
                      class="mt-1 text-xs text-red-600"
                    >
                      {{ validationErrs[`${pref.code}_${luggageType.key}`] }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave } from "vue-router";
import {
  usePricingSettings,
  REGIONS,
  ALL_PREFECTURES,
  LUGGAGE_TYPES,
  type LuggageTypeKey,
} from "~/composables/usePricingSettings";
import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useBeforeUnload } from "~/composables/useBeforeUnload";

const {
  departurePrefectures,
  deliveryEnabled,
  prefecturePricing,
  enabledLuggageTypes,
  visibleLuggageTypes,
  validationErrs,
  isDirty,
  canSave,
  isSaving,
  isSavingDraft,
  isDiscardingDraft,
  saveErr,
  hasDraftSaveSinceLastRealSave,
  togglePrefecture,
  toggleLuggageType,
  setPrice,
  save,
  discard,
  saveDraft,
  discardDraft,
  initFromProfile,
  takeSnapshot,
  loadDraftFromServer,
} = usePricingSettings();

const { businessProfile, fetchBusinessProfile } = useBusinessProfile();

const regions = REGIONS;
const allPrefectures = ALL_PREFECTURES;
const luggageTypes = LUGGAGE_TYPES;

const LUGGAGE_TYPE_LABELS: Record<string, string> = {
  cabin: "機内持ち込みサイズ（3辺計：〜120cm）",
  checked: "受託手荷物サイズ（3辺計：〜160cm）",
  oversize: "規格外サイズ（3辺計：〜180cm）",
};

const getLuggageTypeLabel = (key: string) => LUGGAGE_TYPE_LABELS[key] ?? key;

const showDepartureDropdown = ref(false);

// 集荷選択地域の表示用文字列を生成
const selectedDepartureLabel = computed(() => {
  if (departurePrefectures.value.length === 0) return "";
  const names = departurePrefectures.value.map((code) => {
    const pref = allPrefectures.find(p => p.code === code);
    return pref?.name ?? code;
  });
  if (names.length <= 5) return names.join("、");
  return `${names.slice(0, 5).join("、")} 他${names.length - 5}件`;
});

// 集荷エリアの都道府県コードを departurePrefectures に追加／既にあれば削除
const toggleDeparturePref = (code: string) => {
  const idx = departurePrefectures.value.indexOf(code);
  if (idx >= 0) {
    departurePrefectures.value.splice(idx, 1);
  }
  else {
    departurePrefectures.value.push(code);
  }
};

// 入力欄表示用: 数値 → 文字列、未入力は ""
const formatPrice = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

// 荷物タイプの料金入力ハンドラ
const handlePriceInput = (
  prefCode: string,
  luggageType: LuggageTypeKey,
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  let raw = target.value;
  raw = raw.replace(/[０-９]/g, char =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0),
  );
  raw = raw.replace(/\D/g, "");
  target.value = raw;

  const value = raw === "" ? null : Number(raw);
  setPrice(prefCode, luggageType, value);
};

// 保存ボタンクリックハンドラ
const handleSave = async () => {
  const ok = await save();
  if (ok) {
    // ヘッダーの「サイトを表示」ボタンの有効性判定で参照する businessProfile を最新化
    await fetchBusinessProfile();
  }
  // 保存失敗かつログイン切れ時、直後のログイン遷移で未保存確認ダイアログを出さない
  if (!ok && saveErr.value?.includes("ログイン")) {
    isNavigatingAfterLeaveConfirm.value = true;
  }
};

// ページ側でタブ切り替え時の離脱確認に使うため、未保存状態を共有
const pricingCanSaveState = useState("pricingSettingsCanSave", () => false);
watch(
  isDirty,
  (value) => {
    pricingCanSaveState.value = value;
  },
  { immediate: true },
);

const showDiscardConfirm = ref(false);
const showLeaveConfirm = ref(false);
const pendingLeavePath = ref<string | null>(null);
const isNavigatingAfterLeaveConfirm = ref(false);

const handleDiscardClick = () => {
  showDiscardConfirm.value = true;
};

const doDiscard = () => {
  discard();
};

const showDiscardDraftConfirm = ref(false);

const handleDiscardDraftClick = () => {
  showDiscardDraftConfirm.value = true;
};

// 一時保存を破棄して、サーバー保存済みの状態（反映済み設定）に戻す
//   - サーバー上のドラフトを削除
//   - 最新のプロフィールを取得してフォームを再初期化
const doDiscardDraft = async () => {
  await fetchBusinessProfile();
  await discardDraft({
    service_areas: businessProfile.value?.service_areas,
    pricing_rules: businessProfile.value?.pricing_rules,
  });
};

// 未保存でページを離脱したとき、保留パスへ遷移
const confirmLeave = () => {
  const path = pendingLeavePath.value;
  pendingLeavePath.value = null;
  showLeaveConfirm.value = false;
  if (path) {
    isNavigatingAfterLeaveConfirm.value = true;
    discard();
    navigateTo(path);
  }
};

const handleSaveDraft = async () => {
  await saveDraft();
};

// 変更がある状態で別ページへ離脱しようとしたときに確認
// 一時保存後はダイアログを出さない
onBeforeRouteLeave((to, _from, next) => {
  if (isNavigatingAfterLeaveConfirm.value) {
    isNavigatingAfterLeaveConfirm.value = false;
    next();
    return;
  }
  if (isDirty.value) {
    next(false);
    pendingLeavePath.value = to.fullPath;
    showLeaveConfirm.value = true;
  }
  else {
    next();
  }
});

// タブを閉じる／リロード時もブラウザ標準の確認を表示
// 一時保存後は出さない
useBeforeUnload(isSaving, ref(false), isDirty);

// ドロップダウンの外側クリックで閉じる
const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest("[data-departure-dropdown]")) {
    showDepartureDropdown.value = false;
  }
};

onMounted(async () => {
  if (import.meta.client) {
    document.addEventListener("click", handleOutsideClick);
  }

  await fetchBusinessProfile();

  // DB にドラフト（≒一時保存）があれば復元
  if (await loadDraftFromServer()) {
    return;
  }

  // 一時保存はしたが、まだ本保存していない、DB ドラフトは無い場合
  // メモリ上には入力が残っている可能性があるので、snapshot 取り直す
  if (hasDraftSaveSinceLastRealSave.value) {
    takeSnapshot();
    return;
  }

  // 取得できたらサーバー値で初期化、ダメなら現状のフォームをスナップショットしておく
  if (businessProfile.value) {
    initFromProfile({
      service_areas: businessProfile.value.service_areas,
      pricing_rules: businessProfile.value.pricing_rules,
    });
  }
  else {
    takeSnapshot();
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener("click", handleOutsideClick);
  }

  pricingCanSaveState.value = false;

  // 未保存の変更(isDirty)がある場合のみ、直前のスナップショットに戻す
  if (isDirty.value) {
    discard();
  }
});
</script>
