<template>
  <div aria-labelledby="drivers-list-heading">
    <h1
      id="drivers-list-heading"
      class="sr-only"
    >
      配達者一覧
    </h1>

    <!-- 配達者削除の確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showDeleteConfirm"
      title="配達者の削除"
      :message="deleteDialogMessage"
      confirm-label="削除する"
      cancel-label="キャンセル"
      @confirm="doDelete"
    />

    <!-- 配達者詳細・追加ポップアップ -->
    <BusinessOwnerDashboardDriverDetailDialog
      v-model="showDetail"
      :driver-id="detailDriverId"
      @saved="onDetailSaved"
      @request-delete="onRequestDelete"
    />

    <!-- 検索 -->
    <div
      class="flex flex-wrap items-end gap-3 px-8 pb-4"
      role="search"
      aria-label="配達者の検索"
    >
      <!-- 名前・会社名・出発地点での検索 -->
      <div class="w-56">
        <label
          for="drivers-keyword"
          class="sr-only"
        >名前・会社名・出発地点で検索</label>
        <input
          id="drivers-keyword"
          v-model="keywordInput"
          type="text"
          placeholder="名前・会社名・出発地点で検索"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @keydown.enter="handleSearch"
        >
      </div>

      <div class="relative">
        <label
          for="drivers-sort"
          class="sr-only"
        >並び替え</label>
        <select
          id="drivers-sort"
          v-model="sortInput"
          class="cursor-pointer appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSortChange"
        >
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <img
          class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
          src="/img/down-arrow.svg"
          alt=""
          aria-hidden="true"
        >
      </div>

      <button
        type="button"
        :disabled="isLoading"
        :aria-busy="isLoading"
        class="rounded-md bg-gray-800 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleSearch"
      >
        検索
      </button>

      <button
        type="button"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        @click="clearSearch"
      >
        初期状態に戻す
      </button>
    </div>

    <!-- 操作ボタン -->
    <div class="flex flex-wrap items-center justify-end gap-3 border-y border-gray-200 px-8 py-3">
      <button
        type="button"
        class="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        @click="openCreate"
      >
        追加
      </button>
    </div>

    <div class="pt-4">
      <!-- 成功メッセージ -->
      <div
        v-if="successMsg"
        class="mx-4 mb-4 w-fit rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        role="status"
      >
        {{ successMsg }}
      </div>

      <!-- エラー -->
      <div
        v-if="listErr"
        class="mx-4 mb-4 w-fit rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ listErr }}
      </div>

      <!-- 読み込み中 -->
      <div
        v-if="isLoading"
        class="py-12"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="配達者一覧を読み込み中"
      >
        <CommonAtomsLoadingAnimation size="md" />
      </div>

      <template v-else>
        <!-- 配達者なし -->
        <p
          v-if="drivers.length === 0"
          class="py-12 text-center text-sm text-gray-400"
          role="status"
        >
          表示できる配達者がいません。
        </p>

        <!-- 配達者テーブル -->
        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full min-w-[900px] border-collapse text-sm">
            <caption class="sr-only">
              配達者一覧
            </caption>
            <thead>
              <tr class="border-b border-gray-200 text-left text-xs text-gray-500">
                <th
                  scope="col"
                  class="px-3 py-3 font-medium"
                >
                  配達者
                </th>
                <th
                  scope="col"
                  class="px-3 py-3 font-medium"
                >
                  出発地点
                </th>
                <th
                  scope="col"
                  class="px-3 py-3 font-medium"
                >
                  メールアドレス
                </th>
                <th
                  scope="col"
                  class="whitespace-nowrap px-3 py-3 font-medium"
                >
                  直近の配達予定
                </th>
                <th
                  scope="col"
                  class="whitespace-nowrap px-3 py-3 text-center font-medium"
                >
                  今月の集荷・配達件数
                </th>
                <th
                  scope="col"
                  class="whitespace-nowrap px-3 py-3 text-center font-medium"
                >
                  今月の売上
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="driver in drivers"
                :key="driver.id"
                class="cursor-pointer border-b border-gray-100 transition hover:brightness-95"
                tabindex="0"
                :aria-label="`${driver.name}の詳細を開く`"
                @click="openDetail(driver)"
                @keydown.enter.prevent="openDetail(driver)"
                @keydown.space.prevent="openDetail(driver)"
              >
                <td class="whitespace-nowrap px-3 py-3 align-middle">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="driver.profile_picture_url"
                      :src="driver.profile_picture_url"
                      :alt="`${driver.name}のプロフィール画像`"
                      class="h-8 w-8 rounded-full border border-gray-200 object-cover"
                    >
                    <div
                      v-else
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-500"
                      aria-hidden="true"
                    >
                      {{ driver.name.charAt(0) }}
                    </div>
                    <div class="flex flex-col">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-gray-800">{{ driver.name }}</span>
                        <span
                          v-if="isLicenseExpired(driver.license_expiry)"
                          class="whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                          title="免許証の有効期限が切れています。自動割当の対象外になります。"
                        >
                          免許期限切れ
                        </span>
                      </div>
                      <span
                        v-if="driver.company_name"
                        class="text-xs text-gray-500"
                      >{{ driver.company_name }}</span>
                    </div>
                  </div>
                </td>
                <td class="max-w-[16rem] px-3 py-3 align-middle">
                  <span
                    v-if="driver.departure_label"
                    class="line-clamp-2"
                    :title="driver.departure_label"
                  >{{ driver.departure_label }}</span>
                  <span
                    v-else
                    class="text-gray-400"
                  >—</span>
                </td>
                <td class="px-3 py-3 align-middle">
                  {{ driver.email }}
                </td>
                <td class="whitespace-nowrap px-3 py-3 align-middle">
                  <span v-if="driver.next_delivery_date">
                    {{ formatDate(driver.next_delivery_date) }}
                  </span>
                  <span
                    v-else
                    class="text-gray-400"
                  >—</span>
                </td>
                <td class="whitespace-nowrap px-3 py-3 text-center align-middle">
                  {{ driver.month_delivery_count }} 件
                </td>
                <td class="whitespace-nowrap px-3 py-3 text-center align-middle">
                  ¥{{ driver.month_sales.toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ページネーション -->
        <nav
          v-if="totalPages > 1"
          class="flex items-center justify-center gap-2 py-6"
          aria-label="ページネーション"
        >
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page <= 1"
            aria-label="前のページ"
            @click="goToPage(page - 1)"
          >
            ‹
          </button>
          <template
            v-for="(displayedPage, idx) in displayedPages"
            :key="`${displayedPage}-${idx}`"
          >
            <span
              v-if="displayedPage === '...'"
              class="px-1 text-gray-400"
              aria-hidden="true"
            > … </span>
            <button
              v-else
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors"
              :class="
                displayedPage === page
                  ? 'border-gray-800 bg-gray-800 text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              "
              :aria-label="`${displayedPage}ページ目`"
              :aria-current="displayedPage === page ? 'page' : undefined"
              @click="goToPage(displayedPage as number)"
            >
              {{ displayedPage }}
            </button>
          </template>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page >= totalPages"
            aria-label="次のページ"
            @click="goToPage(page + 1)"
          >
            ›
          </button>
        </nav>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCsrf } from "~/composables/useCsrf";
import type { OwnerDriverRow } from "~/types/driver";

type ListResponse = {
  results: OwnerDriverRow[];
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  sort?: DriverSort;
};

type DriverSort = "created" | "sales" | "count";

const sortOptions: Array<{ value: DriverSort; label: string }> = [
  { value: "created", label: "登録順（新しい順）" },
  { value: "sales", label: "今月の売上が多い順" },
  { value: "count", label: "今月の集荷・配達件数が多い順" },
];

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const { ensureCsrf, getCsrf } = useCsrf();

const keywordInput = ref("");
const sortInput = ref<DriverSort>("created");

// 実際に適用されている検索条件
const appliedKeyword = ref("");
const appliedSort = ref<DriverSort>("created");

const drivers = ref<OwnerDriverRow[]>([]);
const page = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);

const isLoading = ref(true);
const isDeleting = ref(false);
const listErr = ref<string | null>(null);
const successMsg = ref<string | null>(null);

// 配達者詳細・追加ポップアップ
const showDetail = ref(false);
// null のときは追加（新規作成）モード
const detailDriverId = ref<string | null>(null);

// 削除確認ダイアログ
const showDeleteConfirm = ref(false);
const pendingDeleteId = ref<string | null>(null);

const deleteDialogMessage = computed(() => {
  const driver = drivers.value.find(d => d.id === pendingDeleteId.value);
  const name = driver ? `「${driver.name}」` : "この配達者";
  return `${name}を削除します。この配達者が担当する集荷・配達は割り当て解除されます。よろしいですか？`;
});

function openDetail(driver: OwnerDriverRow) {
  detailDriverId.value = driver.id;
  showDetail.value = true;
}

function openCreate() {
  detailDriverId.value = null;
  showDetail.value = true;
}

// ポップアップで招待送信・保存・割り当てが成功した後、一覧を再取得
async function onDetailSaved(message?: string) {
  successMsg.value = message ?? null;
  await fetchDrivers(page.value);
}

// ポップアップの「配達者を削除」: 確認ダイアログを経由して削除
function onRequestDelete(id: string) {
  showDetail.value = false;
  pendingDeleteId.value = id;
  showDeleteConfirm.value = true;
}

// "YYYY-MM-DD" → "YYYY/MM/DD"
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return iso.replace(/-/g, "/");
}

// 免許証の有効期限が切れているか（切れている場合、自動割当の対象外になる）
function isLicenseExpired(licenseExpiry?: string | null): boolean {
  if (!licenseExpiry) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(licenseExpiry);
  return expiry.getTime() < today.getTime();
}

// ページネーション表示
const displayedPages = computed<(number | "...")[]>(() => {
  const total = totalPages.value;
  const current = page.value;
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
});

// 401（ログイン切れ）ハンドリング
function is401(err: unknown): boolean {
  return (
    !!err
    && typeof err === "object"
    && "status" in err
    && (err as { status: number }).status === 401
  );
}
function redirectToLogin() {
  listErr.value = "ログインの有効期限が切れました。再ログインしてください。";
  navigateTo("/account/login");
}

// 配達者一覧を取得
async function fetchDrivers(targetPage: number) {
  isLoading.value = true;
  listErr.value = null;
  try {
    const query = new URLSearchParams();
    query.set("page", String(targetPage));
    if (appliedKeyword.value) query.set("keyword", appliedKeyword.value);
    if (appliedSort.value !== "created") query.set("sort", appliedSort.value);

    const data = await $fetch<ListResponse>(
      `${apiBase}/api/business/drivers/manage?${query.toString()}`,
      { method: "GET", credentials: "include" },
    );

    drivers.value = data.results;
    page.value = data.page;
    totalPages.value = data.total_pages;
    totalCount.value = data.total_count;
    if (
      data.sort === "created"
      || data.sort === "sales"
      || data.sort === "count"
    ) {
      appliedSort.value = data.sort;
      sortInput.value = data.sort;
    }
  }
  catch (err: unknown) {
    if (is401(err)) {
      redirectToLogin();
      return;
    }
    listErr.value = "配達者一覧の取得に失敗しました。";
  }
  finally {
    isLoading.value = false;
  }
}

function handleSearch() {
  appliedKeyword.value = keywordInput.value.trim();
  appliedSort.value = sortInput.value;
  fetchDrivers(1);
}

function handleSortChange() {
  appliedSort.value = sortInput.value;
  fetchDrivers(1);
}

// 「初期状態に戻す」: 検索条件をクリア
function clearSearch() {
  keywordInput.value = "";
  appliedKeyword.value = "";
  sortInput.value = "created";
  appliedSort.value = "created";
  fetchDrivers(1);
}

function goToPage(targetPage: number) {
  if (targetPage < 1 || targetPage > totalPages.value) return;
  if (targetPage === page.value) return;
  fetchDrivers(targetPage);
}

// 「削除する」: 配達者を削除
async function doDelete() {
  const id = pendingDeleteId.value;
  if (!id || isDeleting.value) return;
  isDeleting.value = true;
  listErr.value = null;
  try {
    await ensureCsrf(apiBase);
    await $fetch(`${apiBase}/api/business/drivers/manage/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
    });
    await fetchDrivers(page.value);
  }
  catch (err: unknown) {
    if (is401(err)) {
      redirectToLogin();
      return;
    }
    listErr.value = "配達者の削除に失敗しました。";
  }
  finally {
    isDeleting.value = false;
    pendingDeleteId.value = null;
  }
}

onMounted(() => {
  fetchDrivers(1);
});
</script>
